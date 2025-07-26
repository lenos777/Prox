import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "activlarBot";

// User model will be passed as parameter to avoid schema registration issues

export interface TelegramAuthData {
  fullName: string;
  phone: string;
  password: string;
  role?: 'student' | 'admin' | 'student_offline';
}

export interface TelegramCodeData {
  code: string;
  expiresAt: Date;
  botUrl: string;
}

/**
 * Generate a secure unique code for Telegram verification
 */
export function generateTelegramCode(): TelegramCodeData {
  // Generate a secure 8-character alphanumeric code
  const code = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  
  // Code expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  // Bot URL with the code
  const botUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`;
  
  return { code, expiresAt, botUrl };
}

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phone: string): string {
  let formattedPhone = phone.replace(/\s/g, '');
  if (!formattedPhone.startsWith('+998')) {
    formattedPhone = '+998' + formattedPhone.replace(/^\+/, '');
  }
  return formattedPhone;
}

/**
 * Create pending user registration with Telegram code
 */
export async function createPendingRegistration(authData: TelegramAuthData, User: any): Promise<TelegramCodeData> {
  const { fullName, phone, password, role = 'student' } = authData;
  
  // Format phone number
  const formattedPhone = formatPhoneNumber(phone);
  
  // Check if user already exists
  const existingUser = await User.findOne({ phone: formattedPhone });
  if (existingUser) {
    throw new Error("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
  }
  
  // Generate secure code
  const { code, expiresAt, botUrl } = generateTelegramCode();
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create pending user record
  const userData = {
    fullName,
    phone: formattedPhone,
    password: hashedPassword,
    role,
    balance: 0,
    enrolledCourses: [],
    step: 1,
    todayScores: [{ date: '', score: 0 }],
    telegramCode: code,
    telegramCodeExpiry: expiresAt,
    telegramChatId: null,
    createdAt: new Date()
  };
  
  // Remove any existing pending registration with same phone
  await User.deleteOne({ 
    phone: formattedPhone, 
    telegramChatId: null,
    telegramCode: { $ne: '' }
  });
  
  const user = new User(userData);
  await user.save();
  
  return { code, expiresAt, botUrl };
}

/**
 * Verify Telegram code and complete registration
 */
export async function verifyTelegramCode(code: string, chatId: number, User: any): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
  try {
    // Find user with the code
    const user = await User.findOne({ 
      telegramCode: code,
      telegramCodeExpiry: { $gt: new Date() } // Code not expired
    });
    
    if (!user) {
      return { 
        success: false, 
        message: "Kod noto'g'ri yoki muddati tugagan" 
      };
    }
    
    // Update user with Telegram chat ID and clear the code
    user.telegramChatId = chatId;
    user.telegramCode = '';
    user.telegramCodeExpiry = null;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    return {
      success: true,
      message: "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
        enrolledCourses: user.enrolledCourses,
        createdAt: user.createdAt,
        step: user.step,
        todayScores: user.todayScores
      }
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Telegram verification error:', error);
    }
    return { 
      success: false, 
      message: "Server xatosi" 
    };
  }
}

/**
 * Check if Telegram code is valid (for frontend verification)
 */
export async function checkTelegramCode(code: string, User: any): Promise<{ success: boolean; message: string }> {
  try {
    const user = await User.findOne({ 
      telegramCode: code,
      telegramCodeExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return { 
        success: false, 
        message: "Kod noto'g'ri yoki muddati tugagan" 
      };
    }
    
    if (!user.telegramChatId) {
      return { 
        success: false, 
        message: "Kod hali Telegramda tasdiqlanmagan" 
      };
    }
    
    return { 
      success: true, 
      message: "Kod tasdiqlangan" 
    };
  } catch (error) {
    console.error('Code check error:', error);
    return { 
      success: false, 
      message: "Server xatosi" 
    };
  }
}

/**
 * Clean up expired codes (should be run periodically)
 */
export async function cleanupExpiredCodes(User: any): Promise<void> {
  try {
    await User.deleteMany({
      telegramCode: { $ne: '' },
      telegramCodeExpiry: { $lt: new Date() },
      telegramChatId: null
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}