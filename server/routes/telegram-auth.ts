import express from 'express';
import mongoose from 'mongoose';
import { 
  createPendingRegistration, 
  verifyTelegramCode, 
  checkTelegramCode,
  cleanupExpiredCodes 
} from '../auth/telegram-auth';
import { TelegramAuthRequest, TelegramAuthResponse, TelegramVerificationRequest, TelegramVerificationResponse } from '../../shared/api';

const router = express.Router();

// Get User model (will be available when this route is used)
const getUser = () => mongoose.models.User || mongoose.model('User');

/**
 * POST /api/auth/telegram/register
 * Create pending registration and return Telegram bot URL with code
 */
router.post('/register', async (req, res) => {
  try {
    const authData: TelegramAuthRequest = req.body;
    
    // Validate required fields
    if (!authData.fullName || !authData.phone || !authData.password) {
      return res.status(400).json({
        success: false,
        message: "Barcha maydonlarni to'ldiring"
      } as TelegramAuthResponse);
    }
    
    // Create pending registration
    const User = getUser();
    const { code, expiresAt, botUrl } = await createPendingRegistration(authData, User);
    
    res.json({
      success: true,
      message: "Telegram botga o'ting va kodni tasdiqlang",
      telegramCode: code,
      botUrl,
      expiresAt: expiresAt.toISOString()
    } as TelegramAuthResponse);
    
  } catch (error) {
    console.error('Telegram registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || "Server xatosi"
    } as TelegramAuthResponse);
  }
});

/**
 * POST /api/auth/telegram/verify
 * Verify Telegram code (called by bot)
 */
router.post('/verify', async (req, res) => {
  try {
    const { code, chatId } = req.body;
    
    if (!code || !chatId) {
      return res.status(400).json({
        success: false,
        message: "Kod va chat ID kerak"
      } as TelegramVerificationResponse);
    }
    
    const User = getUser();
    const result = await verifyTelegramCode(code, chatId, User);
    
    res.json(result as TelegramVerificationResponse);
    
  } catch (error) {
    console.error('Telegram verification error:', error);
    res.status(500).json({
      success: false,
      message: "Server xatosi"
    } as TelegramVerificationResponse);
  }
});

/**
 * POST /api/auth/telegram/check
 * Check if code is verified (called by frontend)
 */
router.post('/check', async (req, res) => {
  try {
    const { code }: TelegramVerificationRequest = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Kod kiritilmagan"
      });
    }
    
    const User = getUser();
    const result = await checkTelegramCode(code, User);
    res.json(result);
    
  } catch (error) {
    console.error('Code check error:', error);
    res.status(500).json({
      success: false,
      message: "Server xatosi"
    });
  }
});

/**
 * POST /api/auth/telegram/cleanup
 * Clean up expired codes (admin only)
 */
router.post('/cleanup', async (req, res) => {
  try {
    const User = getUser();
    await cleanupExpiredCodes(User);
    res.json({
      success: true,
      message: "Eski kodlar tozalandi"
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: "Server xatosi"
    });
  }
});

export default router;