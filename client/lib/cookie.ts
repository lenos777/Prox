/**
 * Cookie bilan ishlash uchun utility funksiyalar
 */

/**
 * Cookie saqlash
 * @param name Cookie nomi
 * @param value Cookie qiymati
 * @param days Cookie muddati (kunlarda)
 * @returns Saqlash muvaffaqiyatli bo'lsa true
 */
export function setCookie(name: string, value: string, days: number): boolean {
  try {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
    
    // Saqlanganligi tekshirish
    return !!getCookie(name);
  } catch (err) {
    console.error("Cookie saqlashda xatolik:", err);
    return false;
  }
}

/**
 * Cookie ni o'qish
 * @param name Cookie nomi
 * @returns Cookie qiymati yoki null
 */
export function getCookie(name: string): string | null {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  } catch (err) {
    console.error("Cookie o'qishda xatolik:", err);
    return null;
  }
}

/**
 * Cookie ni o'chirish
 * @param name Cookie nomi
 */
export function deleteCookie(name: string): void {
  try {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  } catch (err) {
    console.error("Cookie o'chirishda xatolik:", err);
  }
}

/**
 * JWT token saqlash
 * @param token JWT token
 * @returns Saqlash muvaffaqiyatli bo'lsa true
 */
export function saveJwtToken(token: string): boolean {
  // Cookie ga saqlash
  const cookieSaved = setCookie("jwt", token, 7);
  
  // Agar cookie saqlash ishlamasa, localStorage ga saqlash
  if (!cookieSaved) {
    try {
      localStorage.setItem("jwt_token", token);
      return true;
    } catch (err) {
      console.error("LocalStorage ga saqlashda xatolik:", err);
      return false;
    }
  }
  
  return cookieSaved;
}

/**
 * JWT token olish
 * @returns JWT token yoki null
 */
export function getJwtToken(): string | null {
  // Avval cookie dan olish
  const token = getCookie("jwt");
  
  // Agar cookie da bo'lmasa, localStorage dan olish
  if (!token) {
    try {
      return localStorage.getItem("jwt_token");
    } catch (err) {
      console.error("LocalStorage dan o'qishda xatolik:", err);
      return null;
    }
  }
  
  return token;
}

/**
 * JWT token o'chirish
 */
export function removeJwtToken(): void {
  // Cookie dan o'chirish
  deleteCookie("jwt");
  
  // LocalStorage dan o'chirish
  try {
    localStorage.removeItem("jwt_token");
  } catch (err) {
    console.error("LocalStorage dan o'chirishda xatolik:", err);
  }
}