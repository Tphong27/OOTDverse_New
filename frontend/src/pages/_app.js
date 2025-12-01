// frontend/src/pages/_app.js
import "@/styles/globals.css";
import Script from "next/script";
import { WardrobeProvider } from "@/context/WardrobeContext";
import { SettingProvider } from "@/context/SettingContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App({ Component, pageProps }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // --- KIỂM TRA DEBUG ---
  // Mở Console trình duyệt (F12) xem dòng này có in ra mã ID không
  if (typeof window !== "undefined") {
    console.log("Google Client ID:", clientId);
    if (!clientId) {
      console.error(
        "LỖI: Chưa đọc được NEXT_PUBLIC_GOOGLE_CLIENT_ID. Hãy kiểm tra file .env.local và khởi động lại server!"
      );
    }
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <SettingProvider>
        <WardrobeProvider>
          {/* <Script
            src="https://cdn.banuba.com/webar-sdk/v1.12.0/webar-sdk.min.js"
            strategy="beforeInteractive"
          /> */}
          <Component {...pageProps} />
        </WardrobeProvider>
      </SettingProvider>
    </GoogleOAuthProvider>
  );
}
