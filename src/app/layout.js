import './globals.css';
import './variables.css';
import './glassmorphism.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SkillSync: The Career Accelerator',
  description: 'Don\'t just watch tutorials; build a portfolio and get hired.',
};

import Providers from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <div className="pt-24">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
