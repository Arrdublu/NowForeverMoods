import { Metadata } from 'next';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../../../../firebase-applet-config.json';
import { BoutiqueClientDetail } from './BoutiqueClientDetail';
import { notFound } from 'next/navigation';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const docRef = doc(db, 'products', params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return { title: 'Product Not Found - NFM' };
    }
    const data = docSnap.data();
    
    return {
        title: `${data.name} | NowForeverMoods`,
        description: data.description || `Purchase ${data.name} from the NowForeverMoods boutique.`,
        openGraph: {
            title: `${data.name} | NowForeverMoods`,
            description: data.description || `Purchase ${data.name} from the NowForeverMoods boutique.`,
            images: data.imageUrl ? [{ url: data.imageUrl, width: 1200, height: 630 }] : [],
            type: 'website'
        }
    };
}

export default async function Page({ params }: { params: { id: string } }) {
    const docRef = doc(db, 'products', params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        notFound();
    }
    const data = docSnap.data();
    const product = {
       id: docSnap.id,
       name: typeof data.name === 'string' ? data.name : "",
       description: typeof data.description === 'string' ? data.description : "",
       price: Number(data.price) || 0,
       currency: typeof data.currency === 'string' ? data.currency : "USD",
       imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : "",
       inStock: Number(data.inStock) || 0,
       isDigital: Boolean(data.isDigital),
       isActive: Boolean(data.isActive)
    };
    
    return <BoutiqueClientDetail product={product as any} />;
}
