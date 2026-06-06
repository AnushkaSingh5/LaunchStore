import { StoreProvider } from '@/context/StoreContext';
import { AuthProvider } from '@/context/AuthContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { LoadingBarProvider } from '@/components/TopLoader';
import "./globals.css";

export const metadata = {
  title: "Luxe Modern | Premium Home Essentials",
  description: "Experience the pinnacle of minimalist design and premium quality with Luxe Modern.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoadingBarProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <StoreProvider>
                {children}
              </StoreProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </LoadingBarProvider>
      </body>
    </html>
  );
}
