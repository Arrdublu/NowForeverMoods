import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beauty Architecture | Ioka x NowForeverMoods',
  description: 'Standalone editorial beauty sessions by Ioka. Professional artistry and aesthetic alignment for the modern visionary.',
  openGraph: {
    title: 'Ioka Beauty Architecture',
    description: 'Secure your standalone beauty session at the NowForeverMoods studio.',
    url: 'https://nowforevermoods.com/beauty-architecture',
    images: [
      {
        url: '/og-beauty-standalone.jpg',
        width: 1200,
        height: 630,
        alt: 'Ioka Beauty Artistry',
      },
    ],
  },
};

export default function BeautyArchitectureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
