import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartSheet } from '@/components/cart/CartSheet';
import { Toaster } from '@/components/ui/sonner';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSheet />
      <Toaster richColors position="top-right" />
    </div>
  );
}
