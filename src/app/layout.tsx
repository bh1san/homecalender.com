import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'HomeCalender.com - Your Global Calendar and Date Converter',
  description: 'A utility app replicating the core functions of a local calendar and date converter for any country. Features include Nepali calendar, date conversion (AD to BS), and global festival tracking.',
  keywords: ['Nepali Calendar', 'Date Converter', 'AD to BS', 'BS to AD', 'Festivals', 'Calendar App', 'HomeCalender'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
