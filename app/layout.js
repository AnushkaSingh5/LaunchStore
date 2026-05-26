import { StoreProvider } from '@/context/StoreContext';
import { AuthProvider } from '@/context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "Luxe Modern | Premium Home Essentials",
  description: "Experience the pinnacle of minimalist design and premium quality with Luxe Modern.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
