import "@/styles/globals.css";
// import Script from "next/script"; // (Chưa dùng đến thì bỏ dòng này)
import { WardrobeProvider } from "@/context/WardrobeContext";
import { SettingProvider } from "@/context/SettingContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import { OutfitProvider } from "@/context/OutfitContext";

export default function App({ Component, pageProps }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <SettingProvider>
          <WardrobeProvider>
            <OutfitProvider>
              <Component {...pageProps} />
            </OutfitProvider>
          </WardrobeProvider>
        </SettingProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
