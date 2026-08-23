import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// O painel administrativo entra em chunk separado (React.lazy): o bundle
// da landing page — servida a tráfego pago — nunca inclui código de admin.
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

const isAdminRoute = window.location.pathname.startsWith('/admin');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      {isAdminRoute ? <AdminApp /> : <App />}
    </Suspense>
  </React.StrictMode>
);
