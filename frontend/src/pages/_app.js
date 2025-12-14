import "@/styles/globals.css";
import { WardrobeProvider } from "@/context/WardrobeContext";
import { SettingProvider } from "@/context/SettingContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import { OutfitProvider } from "@/context/OutfitContext";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { OrderProvider } from "@/context/OrderContext";
import { SwapProvider } from "@/context/SwapContext";

export default function App({ Component, pageProps }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <SettingProvider>
          <WardrobeProvider>
            <OutfitProvider>
              <MarketplaceProvider>
                <OrderProvider>
                  <SwapProvider>
                    <Component {...pageProps} />
                  </SwapProvider>
                </OrderProvider>
              </MarketplaceProvider>
            </OutfitProvider>
          </WardrobeProvider>
        </SettingProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}