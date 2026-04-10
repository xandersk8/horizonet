import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SettingsProvider } from '@/context/SettingsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Horizonet - Rastreador de Viagens',
  description: 'Acompanhe suas viagens em tempo real.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
