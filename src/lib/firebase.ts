import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';

/**
 * Inicialização do Firebase — apenas credenciais públicas do Web App.
 * (A apiKey do Firebase é pública por design; a proteção dos dados é feita
 * pelas Security Rules. Segredos reais NUNCA usam prefixo VITE_*.)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/**
 * Retorna a instância do Firebase App (singleton).
 * Útil para compartilhar a mesma instância entre Auth e Firestore.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase não configurado. Copie .env.example para .env.local e preencha as credenciais.'
    );
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Retorna a instância de Auth sob demanda (lazy), evitando erros quando
 * o .env.local ainda não foi preenchido.
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    auth = getAuth(firebaseApp);
    // Manter logado entre sessões (decisão do projeto).
    void setPersistence(auth, browserLocalPersistence);
  }
  return auth;
}
