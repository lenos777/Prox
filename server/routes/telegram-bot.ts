// Telegram bot route va logika (Node.js, node-telegram-bot-api)
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { saveTelegramUser, findUserByTelegramCode } from '../db/telegram';

const router = express.Router();

// Bot token (env yoki configdan olingan bo'lishi kerak)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// /start <code> komandasi
bot.onText(/\/start (\d{6})/, async (msg, match) => {
  const chatId = msg.chat.id;
  const code = match[1];
  // Kodni DB da qidirish va bog'lash
  const user = await findUserByTelegramCode(code);
  if (user) {
    // Foydalanuvchini telegram chat id bilan yangilash
    await saveTelegramUser(user.id, chatId);
    bot.sendMessage(chatId, `✅ Kod tasdiqlandi! Endi saytga qaytib kodni kiriting. Sizga bildirishnomalar shu bot orqali yuboriladi.`);
  } else {
    bot.sendMessage(chatId, `❌ Kod topilmadi yoki noto'g'ri. Iltimos, sayt orqali ro'yhatdan o'ting.`);
  }
});

// Keyinchalik bildirishnoma yuborish uchun funksiya
export async function sendTelegramNotification(chatId, message) {
  await bot.sendMessage(chatId, message);
}

export default router; 