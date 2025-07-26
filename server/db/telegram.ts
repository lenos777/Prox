// Telegram kod va chatId bilan ishlash uchun mock DB funksiyalari
import mongoose from 'mongoose';

// Foydalanuvchi modelini import qilish (User)
const User = mongoose.models.User || mongoose.model('User');

// Kod bo'yicha foydalanuvchini topish
export async function findUserByTelegramCode(code: string) {
  return await User.findOne({ telegramCode: code });
}

// Foydalanuvchiga telegram chatId ni saqlash
export async function saveTelegramUser(userId: string, chatId: number) {
  return await User.findByIdAndUpdate(userId, { telegramChatId: chatId }, { new: true });
} 