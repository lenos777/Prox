import { useState } from 'react';
import { TelegramAuthRequest, TelegramAuthResponse, TelegramVerificationResponse } from '@shared/api';

export interface UseTelegramAuthReturn {
  isLoading: boolean;
  error: string | null;
  telegramData: {
    code: string;
    botUrl: string;
    expiresAt: string;
  } | null;
  startTelegramAuth: (authData: TelegramAuthRequest) => Promise<boolean>;
  checkVerification: (code: string) => Promise<TelegramVerificationResponse | null>;
  clearError: () => void;
}

export function useTelegramAuth(): UseTelegramAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramData, setTelegramData] = useState<{
    code: string;
    botUrl: string;
    expiresAt: string;
  } | null>(null);

  const startTelegramAuth = async (authData: TelegramAuthRequest): Promise<boolean> => {
    console.log('🚀 Starting Telegram auth with data:', authData);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📡 Sending request to /api/auth/telegram/register');
      const response = await fetch('/api/auth/telegram/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      console.log('📥 Response status:', response.status);
      const data: TelegramAuthResponse = await response.json();
      console.log('📥 Response data:', data);

      if (data.success && data.telegramCode && data.botUrl && data.expiresAt) {
        console.log('✅ Setting telegram data:', {
          code: data.telegramCode,
          botUrl: data.botUrl,
          expiresAt: data.expiresAt,
        });
        setTelegramData({
          code: data.telegramCode,
          botUrl: data.botUrl,
          expiresAt: data.expiresAt,
        });
        return true;
      } else {
        console.log('❌ Auth failed:', data.message);
        setError(data.message || 'Xatolik yuz berdi');
        return false;
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Server bilan bog\'lanishda xatolik');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkVerification = async (code: string): Promise<TelegramVerificationResponse | null> => {
    try {
      const response = await fetch('/api/auth/telegram/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data: TelegramVerificationResponse = await response.json();
      return data;
    } catch (err) {
      console.error('Verification check error:', err);
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    telegramData,
    startTelegramAuth,
    checkVerification,
    clearError,
  };
}