import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveJwtToken } from "@/lib/cookie";

export default function AutoLogin() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const saved = saveJwtToken(token);
      if (saved) {
        // Muvaffaqiyatli saqlansa, profilga yo'naltiramiz
        navigate("/", { replace: true });
      } else {
        setError("Tokenni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      }
    } else {
      setError("Token topilmadi. Havola noto'g'ri yoki eskirgan bo'lishi mumkin.");
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow max-w-md w-full text-center">
          <div className="font-bold mb-2">Auto-login xatoligi</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Yuborilayotganini ko'rsatish uchun loading
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-lg font-semibold mb-2">Kirish amalga oshirilmoqda...</div>
      <div className="text-muted-foreground">Iltimos, kuting yoki sahifa avtomatik yangilanadi.</div>
    </div>
  );
} 