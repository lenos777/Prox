import { useState, useEffect } from 'react';
import { X, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramData: {
    code: string;
    botUrl: string;
    expiresAt: string;
  };
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
}

export default function TelegramAuthModal({
  isOpen,
  onClose,
  telegramData,
  onSuccess,
  onError,
}: TelegramAuthModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Calculate time left
  useEffect(() => {
    if (!isOpen || !telegramData.expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(telegramData.expiresAt).getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setTimeLeft(0);
        if (checkInterval) {
          clearInterval(checkInterval);
          setCheckInterval(null);
        }
        onError('Kod muddati tugadi. Iltimos, qaytadan urinib ko\'ring.');
        return;
      }
      
      setTimeLeft(Math.floor(diff / 1000));
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isOpen, telegramData.expiresAt, checkInterval, onError]);

  // Auto-check for verification
  useEffect(() => {
    if (!isOpen) return;

    const checkVerification = async () => {
      try {
        const response = await fetch('/api/auth/telegram/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: telegramData.code }),
        });

        const data = await response.json();
        
        if (data.success && data.token) {
          // Verification successful
          if (checkInterval) {
            clearInterval(checkInterval);
            setCheckInterval(null);
          }
          onSuccess(data.token, data.user);
        }
      } catch (err) {
        console.error('Auto-check error:', err);
      }
    };

    // Start checking every 3 seconds
    const interval = setInterval(checkVerification, 3000);
    setCheckInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, telegramData.code, onSuccess]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/auth/telegram/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: telegramData.code }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        onSuccess(data.token, data.user);
      } else {
        onError(data.message || 'Hali tasdiqlanmagan');
      }
    } catch (err) {
      onError('Server bilan bog\'lanishda xatolik');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-border relative" onClick={e => e.stopPropagation()}>
        <button 
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" 
          onClick={onClose}
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Telegram orqali tasdiqlash</h3>
          <p className="text-sm text-muted-foreground">
            Ro'yxatdan o'tishni yakunlash uchun Telegram botga o'ting
          </p>
        </div>

        {/* Bot Link - faqat tugma */}
        <div className="flex flex-col items-center justify-center mb-2">
          <button
            type="button"
            className="flex items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors w-full max-w-xs font-medium text-center"
            onClick={() => {
              window.open(telegramData.botUrl, '_blank');
              setTimeout(() => {
                window.location.replace('https://prox.uz/#login');
              }, 100);
            }}
          >
            Telegram botga o'tish
          </button>
        </div>
      </div>
    </div>
  );
}