import { useState, useEffect } from 'react';

interface User {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  balance: number;
  enrolledCourses: string[];
  createdAt: string;
  step: number;
  todayScores: Record<string, any>;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = document.cookie
        .split(';')
        .find(row => row.trim().startsWith('jwt='))
        ?.split('=')[1];

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        setError(data.message || 'Foydalanuvchi ma\'lumotlarini yuklashda xatolik');
        setUser(null);
      }
    } catch (err) {
      setError('Foydalanuvchi ma\'lumotlarini yuklashda xatolik');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  };
}