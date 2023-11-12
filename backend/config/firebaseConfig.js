// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAKUn0BbUJIrRRxH0PXGIutWrMpMWNJYoM',
	authDomain: 'ciddt-web.firebaseapp.com',
	projectId: 'ciddt-web',
	storageBucket: 'ciddt-web.appspot.com',
	messagingSenderId: '87610119358',
	appId: '1:87610119358:web:3a9daa1cdf5853fce43aef',
	measurementId: 'G-5YYX60PBX1',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
