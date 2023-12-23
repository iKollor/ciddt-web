import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyAKUn0BbUJIrRRxH0PXGIutWrMpMWNJYoM',
	authDomain: 'ciddt-web.firebaseapp.com',
	projectId: 'ciddt-web',
	storageBucket: 'ciddt-web.appspot.com',
	messagingSenderId: '87610119358',
	appId: '1:87610119358:web:3a9daa1cdf5853fce43aef',
	measurementId: 'G-5YYX60PBX1',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
	experimentalForceLongPolling: true,
});
