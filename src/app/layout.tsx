import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MY CLINIQUE — La gestion intelligente de votre clinique',
  description: 'Application web de gestion médicale hospitalière, dossiers patients, consultations, ordonnances, pharmacie et facturation.',
  icons: {
    icon: '/logo/favicon.svg',
    shortcut: '/logo/favicon.svg',
    apple: '/logo/my-clinique-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-[#F5F8FC] text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
