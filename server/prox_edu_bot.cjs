// server/prox_edu_bot.js

const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Bot token va MongoDB URI
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8038376421:AAFtbldLbquVurnRlc6mf08k_bx6xEwcc1I';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prox';

// 2. User model (minimal)
const userSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  password: String,
  telegramCode: String,
  telegramChatId: String,
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 3. MongoDB connect
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// 4. Bot instance
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// 5. /start <code> komandasi - yangilangan versiya
bot.onText(/\/start ([A-Z0-9]{8})/, async (msg, match) => {
  const chatId = msg.chat.id;
  const code = match[1];
  const userName = msg.from.first_name || 'Foydalanuvchi';
  
  console.log(`📨 Yangi kod qabul qilindi: ${code} (Chat ID: ${chatId})`);
  
  if (!code) {
    bot.sendMessage(chatId, '❌ Kod topilmadi. Iltimos, sayt orqali ro\'yxatdan o\'ting.');
    return;
  }
  
  try {
    const axios = require('axios');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    console.log(`🔄 Backend'ga so'rov yuborilmoqda: ${backendUrl}/api/auth/telegram/verify`);
    
    // Yangi telegram auth endpoint ishlatamiz
    const resp = await axios.post(`${backendUrl}/api/auth/telegram/verify`, { 
      code, 
      chatId 
    });
    
    console.log('📥 Backend javobi:', resp.data);
    
    if (resp.data && resp.data.success) {
      if (resp.data.token) {
        // Muvaffaqiyatli ro'yxatdan o'tish
        const loginLink = `https://prox.uz/#login`;

        const welcomeMessage = `🎉 Xush kelibsiz, ${userName}!
\n` +
          `✅ Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!\n\n` +
          `Endi siz barcha kurslarga kirish huquqiga egasiz!\n` +
          `💬 Bu bot orqali muhim bildirishnomalarni olasiz.\n\n` +
          `Saytga kirish uchun quyidagi tugmani bosing:`;

        // Inline keyboard bilan yuborish
        bot.sendMessage(chatId, welcomeMessage, {
          reply_markup: {
            inline_keyboard: [[
              { text: "Saytga kirish", url: loginLink }
            ]]
          }
        });
      } else {
        bot.sendMessage(chatId, '✅ Kod tasdiqlandi! Endi saytga qaytib ro\'yxatdan o\'tishni yakunlang.');
      }
    } else {
      const errorMsg = resp.data.message || 'Kod noto\'g\'ri yoki muddati tugagan.';
      bot.sendMessage(chatId, `❌ ${errorMsg}\n\n💡 Yangi kod olish uchun saytga qaytib, qaytadan ro'yxatdan o'ting.`);
    }
  } catch (err) {
    console.error('Bot verification error:', err);
    bot.sendMessage(chatId, '❌ Server bilan bog\'lanishda xatolik yuz berdi.\n\n🔄 Iltimos, biroz kutib qaytadan urinib ko\'ring.');
  }
});

// Eski 6 raqamli kodlar uchun ham qo'llab-quvvatlash
bot.onText(/\/start (\d{6})/, async (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '⚠️ Eski kod formati. Iltimos, saytdan yangi kod oling va qaytadan urinib ko\'ring.');
});

// Har qanday /start komandasi uchun umumiy handler
bot.onText(/\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Foydalanuvchi';
  
  const welcomeMessage = `👋 Salom, ${userName}!\n\n` +
    `🎓 ProX Education platformasiga xush kelibsiz!\n\n` +
    `📝 Ro'yxatdan o'tish uchun:\n` +
    `1. Saytga o'ting\n` +
    `2. Ro'yxatdan o'tish formasini to'ldiring\n` +
    `3. Telegram orqali tasdiqlash kodini oling\n\n` +
    `💡 Agar sizda kod bo'lsa, /start KODINGIZ formatida yuboring`;
  
  bot.sendMessage(chatId, welcomeMessage);
});

// 6. Bildirishnoma yuborish uchun funksiya
async function sendNotificationToUser(userId, message) {
  const user = await User.findById(userId);
  if (user && user.telegramChatId) {
    await bot.sendMessage(user.telegramChatId, message);
  }
}

// 7. Test uchun: /notify <matn> komandasi (faqat admin uchun!)
bot.onText(/\/notify (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  // Faqat admin chatId uchun (o'zgartiring!)
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  if (ADMIN_CHAT_ID && chatId.toString() !== ADMIN_CHAT_ID) {
    bot.sendMessage(chatId, 'Sizda ruxsat yo\'q.');
    return;
  }
  // Barcha foydalanuvchilarga yuborish
  const users = await User.find({ telegramChatId: { $ne: null } });
  for (const user of users) {
    await bot.sendMessage(user.telegramChatId, text);
  }
  bot.sendMessage(chatId, 'Bildirishnoma barcha foydalanuvchilarga yuborildi.');
});

console.log('ProX Telegram bot ishga tushdi!');

module.exports = { bot, sendNotificationToUser }; 