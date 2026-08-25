# Deployment Guide

> Deploy para produção: Firebase Hosting, variáveis, troubleshooting.

---

## ☁️ Firebase Hosting (Recomendado)

### Pré-requisitos

```bash
# 1. Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar (se primeira vez)
firebase init hosting
# - Selecionar projeto existente
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No
```

### Configuração `firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, must-revalidate"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

> **Importante**: `rewrites` é obrigatório para o roteador History API funcionar (`/admin/*`, etc.)

---

## 🔧 Variáveis de Ambiente (Produção)

### No Firebase Hosting

```bash
# Opção 1: Via CLI (apenas para preview)
firebase hosting:channel:deploy preview --expires 7d

# Opção 2: GitHub Actions (recomendado para produção)
# Variáveis configuradas nos Secrets do repositório
```

### Secrets Necessários (GitHub / CI)

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | `projeto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `meu-projeto` |
| `VITE_FIREBASE_APP_ID` | Web App ID | `1:123456789:web:abcdef` |
| `VITE_ADMIN_EMAILS` | Emails admin (csv) | `admin@exemplo.com,outro@exemplo.com` |

> ⚠️ **Nunca** commite `.env.local` ou `.env.production` no git.

---

## 🚀 Deploy Automatizado (GitHub Actions)

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_ADMIN_EMAILS: ${{ secrets.VITE_ADMIN_EMAILS }}

      - name: Deploy to Firebase Hosting
        if: github.ref == 'refs/heads/main'
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ env.FIREBASE_PROJECT_ID }}
          channelId: live
```

### Service Account (para deploy automático)

```bash
# 1. Criar service account no Google Cloud Console
# 2. Papéis: Firebase Hosting Admin, Firestore Admin
# 3. Baixar JSON → adicionar como secret FIREBASE_SERVICE_ACCOUNT
```

---

## 🏗️ Build de Produção

```bash
# Local (teste)
npm run build
npm run preview  # http://localhost:4173

# Verificar output
ls -la dist/
# index.html + assets/ (js, css, images)
```

### Otimizações Automáticas (Vite)

- **Code splitting**: Chunks por rota (admin separado)
- **Minification**: esbuild (JS) + CSSnano (CSS)
- **Tree shaking**: Imports não usados removidos
- **Hash nos filenames**: `index-CoOQxCyu.css` (cache busting)
- **Compressão**: gzip/brotil via hosting headers

---

## 🔥 Firestore - Deploy de Rules e Indexes

```bash
# Rules
firebase deploy --only firestore:rules

# Indexes
firebase deploy --only firestore:indexes

# Tudo
firebase deploy
```

### `firestore.rules` (Produção)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null 
        && request.auth.token.email_verified == true
        && request.auth.token.email in [
          'admin1@exemplo.com',
          'admin2@exemplo.com'
        ];
    }

    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /site_texts/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 🌐 Domínio Personalizado

### Firebase Console

1. **Hosting** → **Add custom domain**
2. Digite domínio (ex: `elixirn7.com.br`)
3. **Verificação**: Adicionar registros TXT no DNS
4. **SSL**: Provisionado automaticamente (Let's Encrypt)
5. **Apex/www**: Configurar ambos

### Registros DNS (exemplo)

| Tipo | Host | Valor |
|------|------|-------|
| A | @ | 151.101.1.195 (Fastly) |
| A | @ | 151.101.65.195 |
| CNAME | www | seu-projeto.web.app |

---

## ✅ Checklist Pré-Deploy

### Código

- [ ] `npm run build` passa sem erros
- [ ] `npx tsc --noEmit` sem erros
- [ ] Console limpo (dev server)
- [ ] Admin panel funcional (login, CRUD)
- [ ] Landing carrega textos reais (Firestore)
- [ ] Produtos aparecem no catálogo
- [ ] WhatsApp links funcionam
- [ ] Imagens carregam (focus/zoom)
- [ ] Responsivo: mobile, tablet, desktop

### Firebase

- [ ] Projeto Firebase criado
- [ ] Authentication → Email/Password + Google habilitados
- [ ] Authorized domains: `seudominio.com`, `seu-projeto.web.app`
- [ ] Firestore criado (Native mode)
- [ ] Rules deployadas
- [ ] Indexes deployadas
- [ ] Storage bucket criado (para imagens)

### Variáveis

- [ ] `.env.local` configurado localmente
- [ ] Secrets no CI/CD (GitHub Actions / outro)
- [ ] `VITE_ADMIN_EMAILS` inclui emails de produção

### Domínio/SSL

- [ ] Domínio apontando para Firebase Hosting
- [ ] SSL ativo (cadeado verde)
- [ ] Redirecionamento www → apex (ou vice-versa)

---

## 🐛 Troubleshooting Comum

### Build Falha

| Erro | Causa | Solução |
|------|-------|---------|
| `Firebase não configurado` | Env vars missing | Verificar secrets no CI / `.env.local` |
| `Module not found @/...` | Alias não resolve | Verificar `vite.config.ts` + `tsconfig.json` |
| `Out of memory` | Build pesado | `NODE_OPTIONS="--max-old-space-size=4096" npm run build` |
| `Chunk too large` | Bundle > 500kb | Code splitting dinâmico (`import()`) |

### Runtime (Produção)

| Problema | Causa | Solução |
|----------|-------|---------|
| Página branca / erros JS | Cache do service worker / index.html antigo | `firebase hosting:channel:deploy` limpa cache; headers `no-cache` no HTML |
| Rotas `/admin/*` dão 404 | Rewrites missing | Verificar `firebase.json` → `rewrites` |
| Login Google falha | Domínio não autorizado | Firebase Console → Auth → Settings → Authorized domains |
| "Permission denied" | Rules / email não verificado | Verificar `firestore.rules` + `email_verified` |
| Textos não atualizam | Listener falhou | Verificar console → `onSnapshot` errors |
| Imagens não carregam | Storage rules / CORS | Storage rules: `allow read: if true`; CORS configurado |

### Logs Úteis

```bash
# Firebase Hosting logs
firebase hosting:channel:list
firebase hosting:releases:list

# Firestore logs (Console > Logs)
# Filtrar: "firestore.googleapis.com"

# Auth logs (Console > Authentication > Users)
# Ver último login, email_verified status
```

---

## 📊 Monitoramento Pós-Deploy

### Métricas Básicas

- **Firebase Console > Hosting**: Requisições, largura de banda, erros 4xx/5xx
- **Firestore > Usage**: Leituras/escritas/diárias (gratuito: 50k reads, 20k writes/dia)
- **Auth > Users**: Contas ativas, provedores

### Alertas Recomendados

```bash
# Via Google Cloud Monitoring (opcional)
# - Firestore reads > 40k/dia (80% do free tier)
# - Hosting 5xx errors > 1%
# - Auth sign-in failures > 10/min
```

---

## 🔄 Rollback

```bash
# Firebase Hosting - listar releases
firebase hosting:releases:list

# Rollback para versão anterior
firebase hosting:clone SITE_ID:RELEASE_ID live

# Ou no Console: Hosting > Release history > "Rollback"
```

---

## 💰 Custos Estimados (Firebase Spark Plan - Gratuito)

| Recurso | Limite Gratuito | Excedente |
|---------|-----------------|-----------|
| Hosting | 10 GB storage, 360 MB/dia transferência | $0.15/GB |
| Firestore | 50k reads, 20k writes, 20k deletes/dia | $0.06/100k reads, $0.18/100k writes |
| Auth | 50k MAU (email/password), 10k MAU (social) | $0.01/MAU |
| Storage | 5 GB | $0.026/GB |

> Para e-commerce pequeno/médio, **Spark Plan costuma cobrir** todo o tráfego.

---

## 📞 Suporte e Escala

### Quando Migrar para Blaze (Pay-as-you-go)

- Tráfego > 360 MB/dia hosting
- Firestore ops > limites free tier
- Precisa de Cloud Functions / Cloud Run
- Suporte SLA empresarial

### Recursos Avançados (Futuro)

| Feature | Implementação |
|---------|---------------|
| Cloud Functions | Webhooks WhatsApp Business API, emails transacionais |
| Cloud Run | API própria, SSR/Next.js migration |
| Performance Monitoring | Web Vitals, tracing |
| A/B Testing | Remote Config + Analytics |
| CDN Global | Já incluso no Firebase Hosting |

---

## 📋 Deploy Checklist Final

```
☐ 1. Código revisado e testado localmente
☐ 2. Build de produção passa (npm run build)
☐ 3. Variáveis de produção configuradas no CI/CD
☐ 4. Firestore rules + indexes deployadas
☐ 5. Firebase Auth providers configurados
☐ 6. Domínio personalizado + SSL ativo
☐ 7. Deploy executado (GitHub Actions ou firebase deploy)
☐ 8. Smoke test em produção:
    ☐ Landing carrega
    ☐ Admin login funciona
    ☐ CRUD produtos funciona
    ☐ CRUD textos funciona (real-time)
    ☐ WhatsApp links abrem
    ☐ Imagens carregam
    ☐ Mobile responsivo
☐ 9. Monitoramento ativo (logs, alerts)
☐ 10. Rollback plan documentado
```