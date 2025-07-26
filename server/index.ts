import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleDemo } from "./routes/demo";
import telegramAuthRoutes from "./routes/telegram-auth";
import { WebSocketServer } from 'ws';
import { AdminNotification, NotificationEvent } from '../shared/api';
import http from 'http';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const coursesUploadsDir = path.join(uploadsDir, 'courses');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(coursesUploadsDir)) {
  fs.mkdirSync(coursesUploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coursesUploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `course-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari yuklash mumkin'));
    }
  }
});

let wsServer: WebSocketServer | null = null;
const wsClients = new Set<WebSocket>();

function broadcastNotification(event: NotificationEvent) {
  const data = JSON.stringify(event);
  wsClients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // MongoDB connection with fallback
  let isMongoConnected = false;
  mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/prox")
    .then(() => {
      console.log("MongoDB connected");
      isMongoConnected = true;
    })
    .catch(err => {
      console.error("MongoDB connection error:", err);
      console.log("Using mock data for testing");
      isMongoConnected = false;
    });

  // User Schema - Check if model already exists
  let User;
  try {
    User = mongoose.model("User");
  } catch {
    User = mongoose.model("User", new mongoose.Schema({
      fullName: { type: String, required: true },
      phone: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, required: true, enum: ['admin', 'student', 'student_offline'], default: 'student' },
      balance: { type: Number, default: 0 },
      enrolledCourses: { type: [String], default: [] },
      createdAt: { type: Date, default: Date.now },
      step: { type: Number, default: 1 },
      todayScores: {
        type: [
          {
            date: { type: String, default: '' },
            score: { type: Number, default: 0 }
          }
        ],
        default: [{ date: '', score: 0 }]
      },
      telegramCode: { type: String, default: '' },
      telegramCodeExpiry: { type: Date, default: null },
      telegramChatId: { type: Number, default: null },
    }));

    // --- MIGRATION FUNCTION ---
    async function migrateUsers() {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/prox");
      const users = await User.find({});
      for (const user of users) {
        let updated = false;
        if (user.step === undefined) {
          user.step = 1;
          updated = true;
        }
        if (user.todayScores === undefined) {
          user.todayScores = [{ date: '', score: 0 }];
          updated = true;
        }
        if (updated) {
          await user.save();
          console.log(`Updated user: ${user._id}`);
        }
      }
      console.log("Migration complete.");
      process.exit(0);
    }
    // migrateUsers(); // Faqat bir marta ishga tushiring!
  }

  // Payment Schema - Check if model already exists
  let Payment;
  try {
    Payment = mongoose.model("Payment");
  } catch {
    const paymentSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      paymentMethod: { type: String, required: true, enum: ['card', 'cash', 'transfer', 'click', 'payme'] },
      description: { type: String },
      status: { type: String, default: 'completed', enum: ['pending', 'completed', 'failed'] },
      transactionId: { type: String, unique: true },
      createdAt: { type: Date, default: Date.now }
    });
    Payment = mongoose.model("Payment", paymentSchema);
  }

  // Course Schema - Check if model already exists
  let Course;
  try {
    Course = mongoose.model("Course");
  } catch {
    const courseSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      instructor: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      duration: { type: String, required: true },
      level: { type: String, required: true, enum: ['Boshlang\'ich', 'O\'rta', 'Yuqori'] },
      status: { type: String, default: 'draft', enum: ['draft', 'active', 'inactive'] },
      enrolledStudents: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0 },
      imageUrl: { type: String },
      category: { type: String },
      tags: { type: [String], default: [] },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    Course = mongoose.model("Course", courseSchema);
  }

  // Message Schema - Check if model already exists
  let Message;
  try {
    Message = mongoose.model("Message");
  } catch {
    const messageSchema = new mongoose.Schema({
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      status: { type: String, enum: ['read', 'unread'], default: 'unread' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    Message = mongoose.model("Message", messageSchema);
  }

  let Module;
  try {
    Module = mongoose.model("Module");
  } catch {
    const moduleSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, default: "" },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
      order: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    Module = mongoose.model("Module", moduleSchema);
  }

  let Lesson;
  try {
    Lesson = mongoose.model("Lesson");
  } catch {
    const lessonSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, default: "" },
      videoUrl: { type: String, default: "" },
      codeSourceUrl: { type: String, default: "" },
      order: { type: Number, default: 0 },
      moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    Lesson = mongoose.model("Lesson", lessonSchema);
  }

  // Routes
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong" });
  });

  app.get("/api/demo", handleDemo);

  // Telegram authentication routes
  app.use("/api/auth/telegram", telegramAuthRoutes);

  // Public courses endpoint for main site
  app.get("/api/courses", async (req, res) => {
    try {
      // Get all courses for public view (including draft for testing)
      const courses = await Course.find({}).sort({ createdAt: -1 });
      
      console.log('Found courses in database:', courses.length);
      console.log('Courses:', courses);

      res.json({
        success: true,
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          duration: course.duration,
          level: course.level,
          status: course.status,
          enrolledStudents: course.enrolledStudents,
          rating: course.rating,
          totalRatings: course.totalRatings,
          imageUrl: course.imageUrl,
          category: course.category,
          tags: course.tags,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }))
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Initialize demo courses endpoint
  app.post("/api/init-demo-courses", async (req, res) => {
    try {
      // Check if courses already exist
      const existingCourses = await Course.countDocuments();
      if (existingCourses > 0) {
        return res.json({ 
          success: true, 
          message: "Demo kurslar allaqachon mavjud" 
        });
      }

      const demoCourses = [
        {
          title: "JavaScript asoslari",
          description: "Zamonaviy JavaScript dasturlash asoslari. ES6+ xususiyatlari, DOM manipulyatsiyasi va asosiy dasturlash tushunchalari.",
          instructor: "Aziz Karimov",
          price: 500000,
          duration: "8 hafta",
          level: "Boshlang'ich",
          status: "active",
          enrolledStudents: 45,
          rating: 4.8,
          totalRatings: 23,
          category: "Dasturlash",
          tags: ["JavaScript", "Web", "Frontend"]
        },
        {
          title: "React.js to'liq kursi",
          description: "React.js framework bo'yicha to'liq kurs. Hooks, Context API, Redux va real loyihalar orqali o'rganish.",
          instructor: "Malika Yusupova",
          price: 800000,
          duration: "12 hafta",
          level: "O'rta",
          status: "active",
          enrolledStudents: 32,
          rating: 4.9,
          totalRatings: 18,
          category: "Frontend",
          tags: ["React", "JavaScript", "Frontend"]
        },
        {
          title: "Node.js va Express.js",
          description: "Backend dasturlash asoslari. Node.js, Express.js, MongoDB va REST API yaratish.",
          instructor: "Jasur Toshmatov",
          price: 700000,
          duration: "10 hafta",
          level: "O'rta",
          status: "active",
          enrolledStudents: 28,
          rating: 4.7,
          totalRatings: 15,
          category: "Backend",
          tags: ["Node.js", "Express", "MongoDB"]
        },
        {
          title: "Python dasturlash",
          description: "Python dasturlash tili asoslari. Ma'lumotlar tuzilmalari, OOP va amaliy loyihalar.",
          instructor: "Dilfuza Rahimova",
          price: 600000,
          duration: "10 hafta",
          level: "Boshlang'ich",
          status: "active",
          enrolledStudents: 38,
          rating: 4.6,
          totalRatings: 20,
          category: "Dasturlash",
          tags: ["Python", "OOP", "Algoritmlar"]
        },
        {
          title: "Vue.js 3 va Composition API",
          description: "Vue.js 3 framework va Composition API bo'yicha zamonaviy frontend dasturlash.",
          instructor: "Shahzod Mirzaev",
          price: 750000,
          duration: "10 hafta",
          level: "O'rta",
          status: "active",
          enrolledStudents: 25,
          rating: 4.8,
          totalRatings: 12,
          category: "Frontend",
          tags: ["Vue.js", "JavaScript", "Frontend"]
        },
        {
          title: "TypeScript to'liq kursi",
          description: "TypeScript dasturlash tili. Type safety, interfaces, generics va enterprise dasturlash.",
          instructor: "Aziz Karimov",
          price: 650000,
          duration: "8 hafta",
          level: "Yuqori",
          status: "active",
          enrolledStudents: 20,
          rating: 4.9,
          totalRatings: 10,
          category: "Dasturlash",
          tags: ["TypeScript", "JavaScript", "Enterprise"]
        }
      ];

      // Insert demo courses
      const insertedCourses = await Course.insertMany(demoCourses);

      res.json({
        success: true,
        message: `${insertedCourses.length} ta demo kurs qo'shildi`,
        courses: insertedCourses
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // 1. Telegram kodni tekshiruvchi endpoint
  app.post("/api/auth/verify-telegram-code", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ success: false, message: "Kod kiritilmagan" });
      const user = await User.findOne({ telegramCode: code });
      if (!user || !user.telegramChatId) {
        return res.status(400).json({ success: false, message: "Kod noto'g'ri yoki Telegramda tasdiqlanmagan" });
      }
      return res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // 2. Register endpointni kod va chatId tekshiruv bilan yangilash
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, phone, password, role = 'student', telegramCode } = req.body;
      let formattedPhone = phone.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+998')) {
        formattedPhone = '+998' + formattedPhone.replace(/^\+/, '');
      }
      const existingUser = await User.findOne({ phone: formattedPhone });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });
      }
      if (role !== 'admin' && role !== 'student' && role !== 'student_offline') {
        return res.status(400).json({ success: false, message: "Noto'g'ri role tanlandi" });
      }
      // --- TELEGRAM KOD VA CHATID TEKSHIRUV ---
      if (!telegramCode) {
        return res.status(400).json({ success: false, message: "Telegramdan olingan kod kiritilmagan" });
      }
      const telegramUser = await User.findOne({ telegramCode });
      if (!telegramUser || !telegramUser.telegramChatId) {
        return res.status(400).json({ success: false, message: "Kod noto'g'ri yoki Telegramda tasdiqlanmagan" });
      }
      // --- END TELEGRAM KOD VA CHATID TEKSHIRUV ---
      const hashedPassword = await bcrypt.hash(password, 12);
      const userData = {
        fullName,
        phone: formattedPhone,
        password: hashedPassword,
        role,
        balance: 0,
        enrolledCourses: [],
        createdAt: new Date(),
        step: 1,
        todayScores: [{ date: '', score: 0 }],
        telegramCode: '', // kod ishlatilgach tozalanadi
        telegramChatId: telegramUser.telegramChatId,
      };
      const user = new User(userData);
      await user.save();
      // Kod ishlatilgach, telegramUser telegramCode ni tozalash
      telegramUser.telegramCode = '';
      await telegramUser.save();
      const token = jwt.sign(
        { userId: user._id, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.status(201).json({
        success: true,
        message: "Ro'yxatdan o'tish muvaffaqiyatli",
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          enrolledCourses: user.enrolledCourses,
          createdAt: user.createdAt,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        },
        token
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Pending register endpoint: creates a user with telegramCode, no telegramChatId
  app.post("/api/auth/pending-register", async (req, res) => {
    try {
      const { fullName, phone, password, role = 'student', telegramCode } = req.body;
      let formattedPhone = phone.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+998')) {
        formattedPhone = '+998' + formattedPhone.replace(/^\+/, '');
      }
      const existingUser = await User.findOne({ phone: formattedPhone });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });
      }
      if (!telegramCode) {
        return res.status(400).json({ success: false, message: "Telegramdan olingan kod kiritilmagan" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const userData = {
        fullName,
        phone: formattedPhone,
        password: hashedPassword,
        role,
        balance: 0,
        enrolledCourses: [],
        createdAt: new Date(),
        step: 1,
        todayScores: [{ date: '', score: 0 }],
        telegramCode,
        telegramChatId: null,
      };
      const user = new User(userData);
      await user.save();
      res.status(201).json({ success: true, message: "Kod generatsiya qilindi va user DBga saqlandi" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;

      // Format phone number: remove spaces and ensure it starts with +998
      let formattedPhone = phone.replace(/\s/g, ''); // Remove all spaces
      if (!formattedPhone.startsWith('+998')) {
        formattedPhone = '+998' + formattedPhone.replace(/^\+/, ''); // Ensure it starts with +998
      }

      // Find user
      const user = await User.findOne({ phone: formattedPhone });
      
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: "Telefon raqam yoki parol noto'g'ri" 
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Telefon raqam yoki parol noto'g'ri" 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: "Tizimga kirish muvaffaqiyatli",
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          enrolledCourses: user.enrolledCourses,
          createdAt: user.createdAt,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        },
        token
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Server xatosi" 
      });
    }
  });

  // Get user profile (protected route)
  app.get("/api/user/profile", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: "Token topilmadi" 
        });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Foydalanuvchi topilmadi" 
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          enrolledCourses: user.enrolledCourses,
          createdAt: user.createdAt,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        }
      });

    } catch (error) {
      console.error("❌ Profile error:", error);
      res.status(401).json({ 
        success: false, 
        message: "Noto'g'ri token" 
      });
    }
  });

  // List all users (for debugging - remove in production)
  app.get("/api/debug/users", async (req, res) => {
    try {
      const users = await User.find({}, { password: 0 }); // Exclude passwords
      res.json({
        success: true,
        users: users.map(user => ({
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          enrolledCourses: user.enrolledCourses,
          createdAt: user.createdAt,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Server xatosi" 
      });
    }
  });

  // Change password (protected route)
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: "Token topilmadi" 
        });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Foydalanuvchi topilmadi" 
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Validate current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Joriy parol noto'g'ri" 
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      user.password = hashedNewPassword;
      await user.save();
      res.json({
        success: true,
        message: "Parol muvaffaqiyatli o'zgartirildi"
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Server xatosi" 
      });
    }
  });

  // Create payment
  app.post("/api/payments/create", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      }

      const { amount, paymentMethod, description } = req.body;
      
      if (!amount || amount < 1000) {
        return res.status(400).json({ success: false, message: "To'lov miqdori kamida 1000 so'm bo'lishi kerak" });
      }

      // Generate transaction ID
      const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);

      // Create payment record
      const payment = new Payment({
        userId: user._id,
        amount: amount,
        paymentMethod: paymentMethod,
        description: description || 'To\'lov',
        transactionId: transactionId,
        status: 'completed'
      });

      await payment.save();

      // Update user balance
      user.balance = (user.balance || 0) + amount;
      await user.save();

      res.json({
        success: true,
        message: "To'lov muvaffaqiyatli amalga oshirildi",
        payment: {
          id: payment._id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          description: payment.description,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt
        },
        newBalance: user.balance
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Get payment history
  app.get("/api/payments/history", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      }

      const payments = await Payment.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        success: true,
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          description: payment.description,
          status: payment.status,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt
        }))
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Get payment statistics
  app.get("/api/payments/stats", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Total payments
      const totalPayments = await Payment.aggregate([
        { $match: { userId: user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Monthly payments
      const monthlyPayments = await Payment.aggregate([
        { 
          $match: { 
            userId: user._id, 
            status: 'completed',
            createdAt: { $gte: startOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      res.json({
        success: true,
        stats: {
          totalPayments: totalPayments[0]?.total || 0,
          monthlyPayments: monthlyPayments[0]?.total || 0,
          currentBalance: user.balance || 0
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

      res.json({
        success: true,
        users: users.map(user => ({
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          enrolledCourses: user.enrolledCourses,
          createdAt: user.createdAt,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        }))
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Total users
      const totalUsers = await User.countDocuments();

      // Total courses
      const totalCourses = await Course.countDocuments();

      // Total payments
      const totalPayments = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Monthly revenue
      const monthlyRevenue = await Payment.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: startOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Recent activity - Get latest users, payments, and courses
      const recentUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName createdAt');

      const recentPayments = await Payment.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'fullName');

      const recentCourses = await Course.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title instructor createdAt');

      // Format recent activity
      const recentActivity = [];

      // Add recent users
      recentUsers.forEach(user => {
        recentActivity.push({
          type: 'user_registration',
          title: 'Yangi foydalanuvchi qo\'shildi',
          description: user.fullName,
          timestamp: user.createdAt,
          icon: 'user',
          color: 'green'
        });
      });

      // Add recent payments
      recentPayments.forEach(payment => {
        recentActivity.push({
          type: 'payment',
          title: 'To\'lov amalga oshirildi',
          description: `${(payment.amount as number).toLocaleString()} so'm - ${payment.paymentMethod}`,
          timestamp: payment.createdAt,
          icon: 'payment',
          color: 'blue',
          user: payment.userId?.fullName
        });
      });

      // Add recent courses
      recentCourses.forEach(course => {
        recentActivity.push({
          type: 'course_created',
          title: 'Yangi kurs qo\'shildi',
          description: `${course.title} - ${course.instructor}`,
          timestamp: course.createdAt,
          icon: 'course',
          color: 'orange'
        });
      });

      // Sort by timestamp and take latest 10
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const latestActivity = recentActivity.slice(0, 10);

      res.json({
        success: true,
        stats: {
          totalUsers: totalUsers,
          totalPayments: totalPayments[0]?.total || 0,
          totalCourses: totalCourses,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          recentActivity: latestActivity
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Course management endpoints
  app.get("/api/admin/courses", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const courses = await Course.find({}).sort({ createdAt: -1 });
      // Har bir kurs uchun modulesCount ni hisoblash
      const coursesWithModulesCount = await Promise.all(
        courses.map(async (course) => {
          const modulesCount = await Module.countDocuments({ courseId: course._id });
          return {
            id: course._id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            price: course.price,
            duration: course.duration,
            level: course.level,
            status: course.status,
            enrolledStudents: course.enrolledStudents,
            rating: course.rating,
            totalRatings: course.totalRatings,
            imageUrl: course.imageUrl,
            category: course.category,
            tags: course.tags,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            modulesCount // yangi maydon
          };
        })
      );

      res.json({
        success: true,
        courses: coursesWithModulesCount
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.post("/api/admin/courses", upload.single('image'), async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const { title, description, instructor, price, duration, level, category, tags } = req.body;

      // Validate required fields
      if (!title || !description || !instructor || !price || !duration || !level) {
        return res.status(400).json({ 
          success: false, 
          message: "Barcha majburiy maydonlarni to'ldiring" 
        });
      }

      // Validate price
      if (price < 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Narx manfiy bo'lishi mumkin emas" 
        });
      }

      // Validate level
      const validLevels = ['Boshlang\'ich', 'O\'rta', 'Yuqori'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({ 
          success: false, 
          message: "Noto'g'ri daraja tanlandi" 
        });
      }

      // Handle image upload
      let imageUrl = '';
      if (req.file) {
        imageUrl = `/uploads/courses/${req.file.filename}`;
      }

      const course = new Course({
        title,
        description,
        instructor,
        price: parseInt(price),
        duration,
        level,
        category: category || '',
        tags: tags || [],
        imageUrl,
        status: 'draft'
      });

      await course.save();

      res.status(201).json({
        success: true,
        message: "Kurs muvaffaqiyatli qo'shildi",
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          duration: course.duration,
          level: course.level,
          status: course.status,
          enrolledStudents: course.enrolledStudents,
          rating: course.rating,
          totalRatings: course.totalRatings,
          imageUrl: course.imageUrl,
          category: course.category,
          tags: course.tags,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.put("/api/admin/courses/:id", upload.single('image'), async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const { id } = req.params;
      const { title, description, instructor, price, duration, level, category, tags } = req.body;

      // Validate required fields
      if (!title || !description || !instructor || !price || !duration || !level) {
        return res.status(400).json({ 
          success: false, 
          message: "Barcha majburiy maydonlarni to'ldiring" 
        });
      }

      // Validate price
      if (price < 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Narx manfiy bo'lishi mumkin emas" 
        });
      }

      // Validate level
      const validLevels = ['Boshlang\'ich', 'O\'rta', 'Yuqori'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({ 
          success: false, 
          message: "Noto'g'ri daraja tanlandi" 
        });
      }

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Kurs topilmadi" });
      }

      // Handle image upload
      if (req.file) {
        // Delete old image if exists
        if (course.imageUrl) {
          const oldImagePath = path.join(process.cwd(), course.imageUrl.substring(1));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        course.imageUrl = `/uploads/courses/${req.file.filename}`;
      }

      course.title = title;
      course.description = description;
      course.instructor = instructor;
      course.price = parseInt(price);
      course.duration = duration;
      course.level = level;
      course.category = category || course.category;
      course.tags = tags || course.tags;
      course.updatedAt = new Date();

      await course.save();

      res.json({
        success: true,
        message: "Kurs muvaffaqiyatli yangilandi",
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          duration: course.duration,
          level: course.level,
          status: course.status,
          enrolledStudents: course.enrolledStudents,
          rating: course.rating,
          totalRatings: course.totalRatings,
          imageUrl: course.imageUrl,
          category: course.category,
          tags: course.tags,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.delete("/api/admin/courses/:id", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const { id } = req.params;
      const course = await Course.findById(id);
      
      if (!course) {
        return res.status(404).json({ success: false, message: "Kurs topilmadi" });
      }

      // Delete associated image file if exists
      if (course.imageUrl) {
        const imagePath = path.join(process.cwd(), course.imageUrl.substring(1));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Course.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "Kurs muvaffaqiyatli o'chirildi"
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.patch("/api/admin/courses/:id/status", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['draft', 'active', 'inactive'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: "Noto'g'ri holat tanlandi" 
        });
      }

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Kurs topilmadi" });
      }

      course.status = status;
      course.updatedAt = new Date();
      await course.save();

      res.json({
        success: true,
        message: "Kurs holati muvaffaqiyatli o'zgartirildi",
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          duration: course.duration,
          level: course.level,
          status: course.status,
          enrolledStudents: course.enrolledStudents,
          rating: course.rating,
          totalRatings: course.totalRatings,
          imageUrl: course.imageUrl,
          category: course.category,
          tags: course.tags,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Kurs tafsilotlari (details) endpointi
  app.get("/api/admin/courses/:id/details", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Kurs topilmadi" });
      }
      res.json({
        success: true,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          duration: course.duration,
          level: course.level,
          status: course.status,
          enrolledStudents: course.enrolledStudents,
          rating: course.rating,
          totalRatings: course.totalRatings,
          imageUrl: course.imageUrl,
          category: course.category,
          tags: course.tags,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Course enrollment endpoint
  app.post("/api/courses/:courseId/enroll", async (req, res) => {
    try {
      // Check MongoDB connection
      if (!isMongoConnected) {
        return res.status(503).json({ 
          success: false, 
          message: "Ma'lumotlar bazasi bilan bog'lanishda muammo. Iltimos, keyinroq urinib ko'ring." 
        });
      }

      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      }

      const { courseId } = req.params;
      const course = await Course.findById(courseId);
      
      if (!course) {
        return res.status(404).json({ success: false, message: "Kurs topilmadi" });
      }

      if (course.status !== 'active') {
        return res.status(400).json({ success: false, message: "Bu kurs hozircha mavjud emas" });
      }

      // Check if user is already enrolled
      if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
        return res.status(400).json({ success: false, message: "Siz allaqachon bu kursga a'zo bo'lgansiz" });
      }

      // Check user balance
      if (user.balance < course.price) {
        return res.status(400).json({ 
          success: false, 
          message: "Mablag' yetarli emas", 
          required: course.price,
          current: user.balance
        });
      }

      // Process payment
      user.balance -= course.price;
      
      // Add course to user's enrolled courses
      if (!user.enrolledCourses) {
        user.enrolledCourses = [];
      }
      user.enrolledCourses.push(courseId);
      
      await user.save();

      // Update course enrolled students count
      course.enrolledStudents += 1;
      await course.save();

      // Create payment record
      const payment = new Payment({
        userId: user._id,
        amount: course.price,
        paymentMethod: 'transfer', // Using 'transfer' for course enrollment
        description: `${course.title} kursiga a'zo bo'lish`,
        transactionId: 'ENROLL' + Date.now() + Math.random().toString(36).substr(2, 9),
        status: 'completed'
      });
      await payment.save();

      res.json({
        success: true,
        message: "Kursga muvaffaqiyatli a'zo bo'ldingiz",
        course: {
          id: course._id,
          title: course.title,
          price: course.price,
          progress: 0 // Default progress
        },
        newBalance: user.balance,
        payment: {
          id: payment._id,
          amount: payment.amount,
          description: payment.description,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt
        }
      });

    } catch (error) {
      // Check if it's a MongoDB connection error
      if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
        return res.status(503).json({ 
          success: false, 
          message: "Ma'lumotlar bazasi bilan bog'lanishda muammo. Iltimos, keyinroq urinib ko'ring." 
        });
      }
      
      // Check if it's a validation error
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false, 
          message: "Ma'lumotlar noto'g'ri. Iltimos, qayta urinib ko'ring." 
        });
      }
      
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Get user's enrolled courses
  app.get("/api/user/enrolled-courses", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId).populate('enrolledCourses');
      
      if (!user) {
        return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      }

      const enrolledCourses = await Course.find({
        _id: { $in: user.enrolledCourses || [] }
      }).select('title description instructor price duration level imageUrl');

      res.json({
        success: true,
        courses: enrolledCourses.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          duration: course.duration,
          level: course.level,
          imageUrl: course.imageUrl,
          progress: 0 // Default progress for now
        }))
      });

    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Admin: Get all payments
  app.get("/api/admin/payments", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      // Get all payments, join user info (even if user is deleted, show null)
      const payments = await Payment.find({})
        .sort({ createdAt: -1 })
        .populate({ path: 'userId', select: 'fullName phone', model: 'User', options: { lean: true } });

      res.json({
        success: true,
        payments: payments.map(payment => ({
          _id: payment._id,
          userId: payment.userId?._id || payment.userId,
          user: payment.userId && payment.userId.fullName ? {
            fullName: payment.userId.fullName,
            phone: payment.userId.phone
          } : null,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          description: payment.description,
          status: payment.status,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt
        }))
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Admin: Update user info
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const admin = await User.findById(decoded.userId);
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const { id } = req.params;
      const { fullName, phone, role, balance, step, todayScore } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      }

      if (fullName !== undefined) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (role !== undefined) user.role = role;
      if (balance !== undefined) user.balance = balance;
      if (user.role === 'student_offline') {
        if (step !== undefined) user.step = step;
        if (user.todayScores === undefined) user.todayScores = [{ date: '', score: 0 }];
        if (Array.isArray(req.body.weekScores)) {
          for (const ws of req.body.weekScores) {
            // Remove any existing entry for this date
            user.todayScores = user.todayScores.filter(s => s.date !== ws.date);
            user.todayScores.push({ date: ws.date, score: ws.score });
          }
        }
        if (todayScore !== undefined) {
          const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
          const d = new Date();
          const day = d.getDate();
          const month = months[d.getMonth()];
          const uzDate = `${day}-${month}`;
          // Remove any existing entry for today
          user.todayScores = user.todayScores.filter(s => s.date !== uzDate);
          user.todayScores.push({ date: uzDate, score: todayScore });
        }
      } else {
        // If user was previously student_offline, keep step/todayScores but do not update
      }
      // If user is being converted from student to student_offline, add step/todayScores if missing
      if (role === 'student_offline') {
        if (user.step === undefined) user.step = 1;
        if (user.todayScores === undefined) user.todayScores = [{ date: '', score: 0 }];
      }

      await user.save();

      res.json({
        success: true,
        message: "Foydalanuvchi ma'lumotlari yangilandi",
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Admin: Add new user
  app.post("/api/admin/users", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "Token topilmadi" });
      }
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const admin = await User.findById(decoded.userId);
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin huquqlari kerak" });
      }

      const { fullName, phone, password, role, balance } = req.body;
      if (!fullName || !phone || !password || !role) {
        return res.status(400).json({ success: false, message: "Barcha maydonlar to'ldirilishi shart" });
      }
      if (!['admin', 'student', 'student_offline'].includes(role)) {
        return res.status(400).json({ success: false, message: "Noto'g'ri rol" });
      }
      const existing = await User.findOne({ phone });
      if (existing) {
        return res.status(400).json({ success: false, message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        fullName,
        phone,
        password: hashedPassword,
        role,
        balance: typeof balance === 'number' ? balance : 0,
        enrolledCourses: [],
        createdAt: new Date(),
        step: 1,
        todayScores: [{ date: '', score: 0 }]
      };
      const user = new User(userData);
      await user.save();
      res.json({
        success: true,
        message: "Foydalanuvchi muvaffaqiyatli qo'shildi",
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // --- ADMIN DELETE USER ENDPOINT ---
  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const deleted = await User.findByIdAndDelete(userId);
      if (deleted) {
        res.json({ success: true, message: "Foydalanuvchi o'chirildi" });
      } else {
        res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: "Server xatosi", error: err.message });
    }
  });

  // Public: Get all offline students
  app.get("/api/offline-students", async (req, res) => {
    try {
      const users = await User.find({ role: 'student_offline' }, { password: 0 }).sort({ createdAt: -1 });
      res.json({
        success: true,
        users: users.map(user => ({
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          enrolledCourses: user.enrolledCourses,
          createdAt: user.createdAt,
          step: user.step ?? 1,
          todayScores: user.todayScores ?? {}
        }))
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Middleware: Only allow admin
  function requireAdmin(req, res, next) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ success: false, message: "Token topilmadi" });
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: "Faqat admin uchun" });
      req.admin = decoded;
      next();
    } catch {
      return res.status(401).json({ success: false, message: "Token xato yoki eskirgan" });
    }
  }

  // CRUD endpoints for messages
  app.get("/api/admin/messages", requireAdmin, async (req, res) => {
    try {
      const messages = await Message.find().populate('sender', 'fullName').populate('receiver', 'fullName').sort({ createdAt: -1 });
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.post("/api/admin/messages", requireAdmin, async (req, res) => {
    try {
      const { sender, receiver, content } = req.body;
      if (!sender || !receiver || !content) return res.status(400).json({ success: false, message: "Barcha maydonlar to'ldirilishi shart" });
      const message = new Message({ sender, receiver, content });
      await message.save();
      res.status(201).json({ success: true, message: "Xabar yuborildi", data: message });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.patch("/api/admin/messages/:id/read", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const message = await Message.findByIdAndUpdate(id, { status: 'read', updatedAt: Date.now() }, { new: true });
      if (!message) return res.status(404).json({ success: false, message: "Xabar topilmadi" });
      res.json({ success: true, message: "Xabar o'qildi", data: message });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  app.delete("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const message = await Message.findByIdAndDelete(id);
      if (!message) return res.status(404).json({ success: false, message: "Xabar topilmadi" });
      res.json({ success: true, message: "Xabar o'chirildi" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Example: send notification when a new course is created
  app.post('/api/admin/notifications/test', (req, res) => {
    const notification: AdminNotification = {
      id: Date.now().toString(),
      title: 'Test xabarnoma',
      body: 'Bu test xabarnoma',
      createdAt: new Date().toISOString(),
      read: false,
    };
    broadcastNotification({ type: 'notification:new', notification });
    res.json({ success: true });
  });

  // Get modules for a course
  app.get("/api/admin/courses/:courseId/modules", async (req, res) => {
    try {
      const { courseId } = req.params;
      const modules = await Module.find({ courseId }).sort({ order: 1, createdAt: 1 });
      res.json({ success: true, modules });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Add a module to a course
  app.post("/api/admin/courses/:courseId/modules", async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title, description = "", order = 0 } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
      }
      const module = await Module.create({
        title,
        description,
        order,
        courseId,
      });
      res.status(201).json({ success: true, module });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Update a module for a course
  app.put("/api/admin/courses/:courseId/modules/:moduleId", async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const { title, description, order } = req.body;
      const module = await Module.findOne({ _id: moduleId, courseId });
      if (!module) {
        return res.status(404).json({ success: false, message: "Modul topilmadi" });
      }
      if (title !== undefined) module.title = title;
      if (description !== undefined) module.description = description;
      if (order !== undefined) module.order = order;
      module.updatedAt = new Date();
      await module.save();
      res.json({ success: true, module });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Delete a module for a course
  app.delete("/api/admin/courses/:courseId/modules/:moduleId", async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const module = await Module.findOneAndDelete({ _id: moduleId, courseId });
      if (!module) {
        return res.status(404).json({ success: false, message: "Modul topilmadi" });
      }
      res.json({ success: true, message: "Modul o'chirildi" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Get lessons for a module
  app.get("/api/admin/modules/:moduleId/lessons", async (req, res) => {
    try {
      const { moduleId } = req.params;
      const lessons = await Lesson.find({ moduleId }).sort({ order: 1, createdAt: 1 });
      res.json({ success: true, lessons });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Add a lesson to a module
  app.post("/api/admin/modules/:moduleId/lessons", async (req, res) => {
    try {
      const { moduleId } = req.params;
      const { title, description = "", videoUrl = "", codeSourceUrl = "", order = 0 } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
      }
      const lesson = await Lesson.create({
        title,
        description,
        videoUrl,
        codeSourceUrl,
        order,
        moduleId,
      });
      res.status(201).json({ success: true, lesson });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Update a lesson
  app.put("/api/admin/modules/:moduleId/lessons/:lessonId", async (req, res) => {
    try {
      const { moduleId, lessonId } = req.params;
      const { title, description, videoUrl, codeSourceUrl, order } = req.body;
      const lesson = await Lesson.findOne({ _id: lessonId, moduleId });
      if (!lesson) {
        return res.status(404).json({ success: false, message: "Dars topilmadi" });
      }
      if (title !== undefined) lesson.title = title;
      if (description !== undefined) lesson.description = description;
      if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
      if (codeSourceUrl !== undefined) lesson.codeSourceUrl = codeSourceUrl;
      if (order !== undefined) lesson.order = order;
      lesson.updatedAt = new Date();
      await lesson.save();
      res.json({ success: true, lesson });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Delete a lesson
  app.delete("/api/admin/modules/:moduleId/lessons/:lessonId", async (req, res) => {
    try {
      const { moduleId, lessonId } = req.params;
      const lesson = await Lesson.findOneAndDelete({ _id: lessonId, moduleId });
      if (!lesson) {
        return res.status(404).json({ success: false, message: "Dars topilmadi" });
      }
      res.json({ success: true, message: "Dars o'chirildi" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  // Telegram deep-link auto verify endpoint
  app.post("/api/auth/telegram-auto-verify", async (req, res) => {
    try {
      const { code, chatId } = req.body;
      if (!code || !chatId) {
        return res.status(400).json({ success: false, message: "Kod va chatId kerak" });
      }
      const user = await User.findOne({ telegramCode: code });
      if (!user) {
        return res.status(400).json({ success: false, message: "Kod noto'g'ri yoki eskirgan" });
      }
      user.telegramChatId = chatId;
      user.telegramCode = '';
      await user.save();
      const token = jwt.sign(
        { userId: user._id, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ success: true, token });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server xatosi" });
    }
  });

  const server = http.createServer(app);

  // WebSocket server for admin notifications
  wsServer = new WebSocketServer({ server, path: '/ws/admin-notifications' });
  wsServer.on('connection', (ws) => {
    wsClients.add(ws);
    ws.on('close', () => wsClients.delete(ws));
  });

  return server;
}

export { broadcastNotification };
