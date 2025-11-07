// src/auth/AuthContext.tsx — Kimlik (authentication) bilgisini yönetmek için kullanılan global context

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Kullanıcı bilgisini temsil eden tip (backend’den dönenle uyumlu)
type User = {
  email: string;
  fullName: string | null;
};

// Context’in içinde taşınacak tüm değerlerin tipi
type AuthContextType = {
  user: User | null; // Şu anda giriş yapan kullanıcı bilgisi
  token: string | null; // JWT token (giriş sonrası gelen)
  userId: string | null; // JWT içinden çözülen user.Id (sub alanı)
  login: (token: string, user: User) => void; // Giriş fonksiyonu
  logout: () => void; // Çıkış fonksiyonu
  isAuthenticated: boolean;
};

// Context oluşturuluyor, başlangıç değeri undefined
// Provider dışında kullanılırsa hata fırlatmak için undefined tutuluyor.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtSub(token: string | null): string | null {
  try {
    if (!token) return null; // Token yoksa null döndür
    const payload = token.split(".")[1]; // JWT 3 parçadan oluşur: header.payload.signature

    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ); // Base64 URL decode

    // Eğer payload içinde "sub" alanı varsa string olarak döndür
    return typeof json?.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// AuthProvider: Uygulamanın en dışında kullanılır ve tüm alt bileşenlere
// user, token, login, logout gibi bilgileri sağlar.
// ----------------------------------------------------
export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // State’ler: token ve kullanıcı bilgisi
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 🔁 useEffect → sayfa yenilendiğinde localStorage’daki bilgileri yükle
  useEffect(() => {
    const t = localStorage.getItem("token"); // Önceden kaydedilen JWT
    const u = localStorage.getItem("user"); // Önceden kaydedilen kullanıcı

    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  // 🧠 userId: token değiştikçe JWT decode edilip yeniden hesaplanır
  const userId = useMemo(() => decodeJwtSub(token), [token]);

  // 🔐 login fonksiyonu → Giriş yapan kullanıcıyı kaydet
  const login = (t: string, u: User) => {
    setToken(t); // Token state’e yazılır
    setUser(u); // Kullanıcı bilgisi state’e yazılır
    localStorage.setItem("token", t); // Kalıcı olarak localStorage’a kaydedilir
    localStorage.setItem("user", JSON.stringify(u)); // Kullanıcı bilgisi de kaydedilir
  };

  // 🚪 logout fonksiyonu → Oturumu kapat
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Provider → Alt bileşenlere gerekli değerleri sağlar
  return (
    <AuthContext.Provider
      value={{ user, token, userId, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ----------------------------------------------------
// useAuth: Context’i kullanmak için özel hook
// Provider dışında çağrılırsa hata fırlatır
// ----------------------------------------------------
export const useAuth = () => {
  const ctx = useContext(AuthContext); // AuthContext'i kullan
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider"); // Context yoksa hata fırlat
  return ctx;
};
