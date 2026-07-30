import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0526608866",
  appId: "1:676622630865:web:75f818d3d2fe107d1eaaf0",
  apiKey: "AIzaSyCqAvluU4psWnY0wIGnirZxWFygbS4Az8M",
  authDomain: "gen-lang-client-0526608866.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-carnaticswaradig-d7e6adc0-02e2-4573-8911-0ffb00bf4831");

export const saveUploadToFirestore = async (digitizedData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'swara_uploads'), {
      ...digitizedData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};
