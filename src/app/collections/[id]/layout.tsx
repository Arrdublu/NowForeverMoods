import { Metadata } from 'next';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../../../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const docRef = doc(db, 'packages', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return {
      title: 'Collection Not Found | NowForeverMoods',
    };
  }

  const pkg = docSnap.data();
  // Based on the prompt, we use thumbnailUrl or fallback to media.poster, then fallback to default og-image.jpg
  const imageUrl = pkg.thumbnailUrl || (pkg.media && pkg.media.poster) || '/og-image.jpg';

  return {
    title: `${pkg.name} | NowForeverMoods`,
    description: pkg.description || `View the ${pkg.name} collection by NowForeverMoods.`,
    openGraph: {
      title: `${pkg.name} | NowForeverMoods`,
      description: pkg.description || `View the ${pkg.name} collection by NowForeverMoods.`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pkg.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
