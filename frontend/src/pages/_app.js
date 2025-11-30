// frontend/src/pages/_app.js
import "@/styles/globals.css"; // <--- QUAN TRỌNG: Thêm dòng này!
import Script from "next/script";
import { WardrobeProvider } from "@/context/WardrobeContext";
import { SettingProvider } from "@/context/SettingContext";

export default function App({ Component, pageProps }) {
  return (
    <SettingProvider>
      <WardrobeProvider>
        {/* <Script
          src="https://cdn.banuba.com/webar-sdk/v1.12.0/webar-sdk.min.js"
          strategy="beforeInteractive"
        /> */}
        <Component {...pageProps} />
      </WardrobeProvider>
    </SettingProvider>
  );
}
