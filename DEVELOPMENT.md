# Development Guide

> Guia para desenvolvedores: comandos, convenções, debugging, adicionando features.

---

## 🛠️ Comandos Principais

```bash
# Desenvolvimento
npm run dev              # Vite dev server (HMR)
npm run build            # TypeScript check + Vite build (produção)
npm run preview          # Preview local do build de produção

# Type checking (strict mode)
npx tsc --noEmit         # Verifica tipos sem emitir JS

# Linting / Formatting (se configurado)
# npm run lint           # ESLint (não configurado por padrão)
# npm run format         # Prettier (não configurado por padrão)
```

---

## 📐 Convenções de Código

### TypeScript (Strict Mode)

```json
// tsconfig.json - regras ativas
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true
```

- **Sem `any`** — use tipos explícitos ou `unknown`
- **Imports absolutos** via `@/*` → `src/*` (configurado em `tsconfig.json`)
- **Interfaces** para objetos/props, `type` para unions/primitives
- **Nomes**: PascalCase (componentes, interfaces), camelCase (variáveis, funções), UPPER_SNAKE_CASE (constantes)

### React

- **Function Components** + hooks (sem class components)
- **Props interface** nomeada como `ComponentNameProps`
- **Export default** no final do arquivo
- **CSS Modules** para estilos (`.module.scss`)
- **Context** para estado global (ex: `SiteTextsContext`)

### Estrutura de Componente

```tsx
// MeuComponente.tsx
import React from 'react';
import { TipoExterno } from '@/types/store';
import { utilFunction } from '@/utils/whatsapp';
import styles from './MeuComponente.module.scss';

interface MeuComponenteProps {
  propObrigatoria: string;
  propOpcional?: number;
}

export const MeuComponente: React.FC<MeuComponenteProps> = ({
  propObrigatoria,
  propOpcional = 0,
}) => {
  // Hooks no topo
  const [state, setState] = useState<SomeType>(initialValue);

  // Handlers
  const handleClick = () => { /* ... */ };

  // Render
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{propObrigatoria}</h2>
    </div>
  );
};

export default MeuComponente;
```

### SCSS Modules

```scss
// MeuComponente.module.scss
@use 'src/styles/variables' as *;
@use 'src/styles/mixins' as *;

.container {
  padding: $space-m;
  border-radius: $radius-m;
  background: var(--parchment);

  @include media-mobile {
    padding: $space-s;
  }
}

.title {
  font-family: $font-serif;
  font-size: $text-lg;
  color: $text-ink;
}
```

**Design Tokens** (`src/styles/_variables.scss`):

```scss
// Cores
$ink: #07090D;
$parchment: #F1F2F5;
$gold: #6C93C7;
$gold-soft: #AFC6E8;
$sand: #D2D7DF;
$text-ink: #171A21;
$text-muted: #5A616E;

// Espaçamento
$space-xs: 4px;
$space-s: 8px;
$space-m: 16px;
$space-l: 24px;
$space-xl: 40px;

// Border Radius
$radius-s: 6px;
$radius-m: 14px;
$radius-l: 28px;
$radius-full: 999px;

// Tipografia
$font-sans: 'Inter', system-ui, sans-serif;
$font-serif: 'Fraunces', Georgia, serif;
$text-sm: 13px;
$text-base: 15px;
$text-lg: 18px;
$text-xl: 24px;

// Breakpoints
$bp-sm: 640px;
$bp-md: 1000px;
$bp-lg: 1280px;
```

**Mixins** (`src/styles/_mixins.scss`):

```scss
@mixin card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-1;
  }
}

@mixin media-mobile {
  @media (max-width: #{$bp-sm - 1px}) { @content; }
}

@mixin media-tablet {
  @media (min-width: #{$bp-sm}) and (max-width: #{$bp-md - 1px}) { @content; }
}

@mixin media-desktop {
  @media (min-width: #{$bp-md}) { @content; }
}
```

---

## 🐛 Debugging

### React DevTools

```bash
# Instalar extensão do navegador
# Chrome: "React Developer Tools"
# Firefox: "React Developer Tools"
```

### Console Logs Úteis

```typescript
// Em qualquer componente
console.log('🔍 Debug:', { product, selectedSizes, state });

// No SiteTextsContext - ver updates real-time
useEffect(() => {
  const unsubscribe = onSnapshot(ref, (snap) => {
    console.log('📡 Firestore update:', snap.data());
  });
  return unsubscribe;
}, []);
```

### Network Tab

- **Firestore requests**: `firestore.googleapis.com` → `RunQuery`, `Write`
- **Auth requests**: `identitytoolkit.googleapis.com` → `signInWithPassword`, `getAccountInfo`
- **Storage**: `firebasestorage.googleapis.com` (uploads de imagem)

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Firebase não configurado` | `.env.local` ausente | `cp .env.example .env.local` |
| `Permission denied` | Firestore Rules | Verificar `isAdmin()` e `email_verified` |
| `Module not found @/...` | Path alias | Verificar `tsconfig.json` paths + `vite.config.ts` |
| `Hydration mismatch` | SSR vs Client | Não há SSR (Vite SPA) — verificar `useEffect` com DOM |

---

## ➕ Adicionando Nova Seção na Landing

### 1. Criar Componente

```
src/components/NovaSecao/
├── index.ts              # export { NovaSecao } from './NovaSecao';
├── NovaSecao.tsx         # Componente principal
├── NovaSecao.module.scss # Estilos
```

### 2. Adicionar Tipos (se necessário)

```typescript
// src/types/store.ts
interface NovaSecaoData {
  eyebrow: string;
  title: string;
  items: NovaSecaoItem[];
}
interface NovaSecaoItem {
  id: string;
  title: string;
  description: string;
}
```

### 3. Atualizar `StoreData` e `SiteTexts`

```typescript
// src/types/store.ts (em StoreData)
novaSecao: NovaSecaoData;

// src/admin/textsService.ts (em defaultSiteTexts)
novaSecao: {
  eyebrow: 'Nova Seção',
  title: 'Título padrão',
  items: [
    { id: '1', title: 'Item 1', description: 'Descrição' }
  ],
}
```

### 4. Adicionar no Admin (`AdminTexts.tsx`)

```tsx
// Nova seção no formulário
<fieldset>
  <legend>Nova Seção</legend>
  {/* campos + lista editável */}
</fieldset>
```

### 5. Compor no `App.tsx`

```tsx
// src/App.tsx
import { NovaSecao } from '@/components/NovaSecao';
import { useSiteTexts } from '@/context/SiteTextsContext';

export const App = () => {
  const { texts } = useSiteTexts();
  
  return (
    <>
      <Header ... />
      <Hero ... />
      {/* ... */}
      {texts?.novaSecao && <NovaSecao data={texts.novaSecao} />}
      <Footer ... />
    </>
  );
};
```

---

## ➕ Adicionando Novo Campo em Produto

### 1. Atualizar Tipos

```typescript
// src/types/store.ts
export interface Product {
  // ... campos existentes
  novoCampo?: string; // opcional
}
```

### 2. Atualizar `ProductDoc` (Firestore)

```typescript
// src/admin/productsService.ts
export interface ProductDoc {
  // ... campos existentes
  novoCampo?: string | null;
}
```

### 3. Atualizar `mapDoc` / `mapAdmin`

```typescript
// productsRepository.ts
function mapDoc(id: string, data: DocumentData): Product {
  return {
    // ...
    novoCampo: data.novoCampo ?? null,
  };
}

// productsService.ts
function mapAdmin(id: string, data: Record<string, unknown>): AdminProduct {
  return {
    // ...
    novoCampo: (data.novoCampo as string | null) ?? null,
  };
}
```

### 4. Adicionar no `ProductForm.tsx`

```tsx
<div className={styles.field}>
  <label htmlFor="novoCampo">Novo Campo</label>
  <input
    id="novoCampo"
    type="text"
    value={formData.novoCampo ?? ''}
    onChange={(e) => setFormData({ ...formData, novoCampo: e.target.value })}
  />
</div>
```

### 5. Exibir no `ProductCard.tsx` (se necessário)

```tsx
{product.novoCampo && (
  <span className={styles.novoCampo}>{product.novoCampo}</span>
)}
```

---

## 🔧 Firebase - Regras Úteis

### `firestore.rules` (referência)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: verifica se é admin
    function isAdmin() {
      return request.auth != null 
        && request.auth.token.email_verified == true
        && request.auth.token.email in ['admin1@exemplo.com', 'admin2@exemplo.com'];
    }

    // Produtos - leitura pública, escrita só admin
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Textos do site - leitura pública, escrita só admin
    match /site_texts/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### Deploy das Rules

```bash
# Via Firebase CLI
firebase deploy --only firestore:rules

# Ou no console: Firebase Console > Firestore > Rules
```

---

## 📦 Firebase - Índices Necessários

| Coleção | Query | Índice Necessário |
|---------|-------|-------------------|
| `products` | `orderBy('createdAt', 'desc')` | `createdAt DESC` |
| `products` | `orderBy('name')` | `name ASC` |
| `products` | `where('category', '==', X)` | `category ASC` |

> Vite build falha se índices faltando → link no erro para criar no console.

---

## 🎨 Design System - Referência Rápida

### Cores (CSS Variables)

```css
:root {
  --ink: #07090D;
  --parchment: #F1F2F5;
  --parchment-2: #E8EAEF;
  --gold: #6C93C7;
  --gold-soft: #AFC6E8;
  --gold-deep: #44689C;
  --sand: #D2D7DF;
  --text-ink: #171A21;
  --text-muted: #5A616E;
}
```

### Botões (`.btn` via `Button.tsx`)

| Variant | Uso |
|---------|-----|
| `primary` | Ações principais (CTAs) — gradiente gold |
| `outline` | Ações secundárias — borda sand |
| `ghost` | Ações terciárias — sem bg, texto gold |
| `danger` | Exclusões — vermelho |

### Grid do Catálogo

```scss
.productGrid {
  display: grid;
  grid-template-columns: 1fr;                    // mobile
  @media (min-width: 640px)  { grid-template-columns: 1fr 1fr; }     // tablet
  @media (min-width: 1000px) { grid-template-columns: repeat(3, 1fr); } // desktop
  gap: 26px;
}
```

---

## 🧪 Testes Manuais Checklist

### Pré-commit

- [ ] `npm run build` passa sem erros
- [ ] `npx tsc --noEmit` sem erros de tipo
- [ ] Dev server roda (`npm run dev`)
- [ ] Landing carrega sem erros no console
- [ ] Admin panel acessível (`/admin/login`)

### Pós-deploy

- [ ] Landing pública carrega
- [ ] Textos do admin refletem na landing (real-time)
- [ ] Produtos aparecem no catálogo
- [ ] Filtros funcionam
- [ ] WhatsApp links abrem corretamente
- [ ] Imagens carregam (focus/zoom)
- [ ] Responsividade mobile/tablet/desktop

---

## 📝 Git Workflow Sugerido

```bash
# Feature branch
git checkout -b feat/nova-secao-why-decants

# Commits semânticos
git commit -m "feat(catalog): adicionar seleção múltipla de tamanhos"
git commit -m "fix(whatsapp): encoding de emojis na mensagem"
git commit -m "docs: atualizar README com variáveis de ambiente"

# PR → review → merge to main
# Deploy automático via Firebase Hosting (GitHub Actions)
```

---

## 🔗 Links Úteis

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [SCSS Documentation](https://sass-lang.com/documentation)