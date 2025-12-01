// frontend/src/pages/_app.js
import "@/styles/globals.css"; // <--- QUAN TRỌNG: Thêm dòng này!
import Script from "next/script";
import { WardrobeProvider } from "@/context/WardrobeContext";
import { SettingProvider } from "@/context/SettingContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App({ Component, pageProps }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return (
    // --- BẮT ĐẦU SỬA: Bọc toàn bộ app bằng GoogleOAuthProvider ---
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
    // --- KẾT THÚC SỬA ---
  );
}
