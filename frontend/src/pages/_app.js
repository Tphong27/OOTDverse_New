import "@/styles/globals.css";
// import Script from "next/script"; // (Nếu bạn chưa dùng thì cứ comment)
import { WardrobeProvider } from "@/context/WardrobeContext";
import { SettingProvider } from "@/context/SettingContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
// 1. Import AuthProvider
import { AuthProvider } from "@/context/AuthContext";

export default function App({ Component, pageProps }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {/* 2. Bọc AuthProvider ở đây, bên ngoài các Provider khác */}
      <AuthProvider>
        <SettingProvider>
          <WardrobeProvider>
            <Component {...pageProps} />
          </WardrobeProvider>
        </SettingProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
