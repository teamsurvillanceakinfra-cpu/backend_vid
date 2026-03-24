import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'vid-snatcher-ai',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk@vidsnatcher.iam.gserviceaccount.com',
        // Carefully handle the format of multiline private key strings encoded in env variables
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed gracefully", error.message);
  }
}

export default admin;
