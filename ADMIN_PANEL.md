# Admin Panel Documentation

> Guia completo do painel administrativo: rotas, autenticação, CRUD, validações e fluxos.

---

## 🗺️ Rotas do Painel

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/admin/login` | `LoginPage` | Login email/senha + Google |
| `/admin` | `AdminDashboard` | Dashboard inicial |
| `/admin/textos` | `AdminTexts` | Gerenciamento de textos do site |
| `/admin/produtos` | `AdminProducts` | Listagem de produtos |
| `/admin/produtos/novo` | `ProductForm` | Criar novo produto |
| `/admin/produtos/:id` | `ProductForm` (via `ProductEditLoader`) | Editar produto existente |

---

## 🔐 Autenticação e Autorização

### Camadas de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (UX)                                              │
│  VITE_ADMIN_EMAILS allowlist → rejeita rápido contas fora  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (REAL) — Firestore Security Rules                  │
│  isAdmin() = request.auth.token.email in allowed list       │
│  Requer: request.auth != null && email_verified == true     │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Login

1. **Email/Password**: `signInWithEmailAndPassword` → valida credenciais
2. **Google OAuth**: `signInWithPopup(GoogleAuthProvider)` → verifica allowlist
3. **Allowlist check**: `isAllowedAdmin(user)` → se falhar, `signOut()` imediato
4. **Email verification**: Obrigatório para escritas (`email_verified == true`)

### Estados de Sessão

| Estado | Comportamento |
|--------|---------------|
| `checking` | `onAuthStateChanged` resolvendo — mostra "Carregando…" |
| `!authed + !loginRoute` | Redirect → `/admin/login` (replaceState) |
| `authed + loginRoute` | Redirect → `/admin` (replaceState) |
| `authed + !emailVerified` | Tela de bloqueio com botões "Reenviar" / "Já confirmei" |
| `authed + emailVerified` | Acesso total ao painel |

### Logout

```typescript
// Auth context mantido via browserLocalPersistence
await logout(); // signOut() + navigate('/admin/login', true)
```

---

## 📝 Gerenciamento de Textos (`/admin/textos`)

### Funcionalidades

- **Edição inline** de todos os textos da landing
- **Listas dinâmicas** com add/remove/reorder:
  - Selos de confiança (trustBadges)
  - Cards "Por que decants" (whyItems)
  - Passos "Como funciona" (steps)
  - Perguntas FAQ (faqs)
  - Trust items (howItWorks.trustItems)
- **Upload de imagens** com editor de enquadramento (focus + zoom)
- **Salvamento atômico** no Firestore (`site_texts/content`)

### Estrutura do Formulário

```typescript
// Seções do AdminTexts
interface AdminTextsForm {
  // Header
  storeName: string;
  tagline: string;
  headerLogo: ImageWithFocus;

  // Hero
  hero: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    backgroundImage: ImageWithFocus;
    logoImage: ImageWithFocus;
    trustBadges: string[];        // lista editável
  };

  // WhyDecants
  whyDecants: {
    eyebrow: string;
    title: string;
    description: string;
    items: WhyItem[];             // lista editável
  };

  // Catalog
  catalog: {
    eyebrow: string;
    title: string;
    description: string;
  };

  // HowItWorks
  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    steps: StepItemData[];        // lista editável
    trustItems: TrustItemData[];  // lista editável
  };

  // FAQ
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItemData[];         // lista editável
  };

  // Footer
  footer: {
    brand: string;
    description: string;
    buttonText: string;
    bottomTextLeft: string;
    bottomTextRight: string;
  };
}
```

### Persistência

- **Documento único**: `site_texts/content`
- **Merge strategy**: `setDoc(..., { merge: true })` — atualiza apenas campos enviados
- **Real-time**: `onSnapshot` no `SiteTextsContext` → landing atualiza sem reload
- **Fallback**: `defaultSiteTexts` (de `storeData.json`) se doc não existe

---

## 📦 Gerenciamento de Produtos (`/admin/produtos`)

### Listagem (`AdminProducts`)

- **Busca**: Filtro por nome/marca (client-side)
- **Ordenação**: Alfabética por nome (via `orderBy('name')`)
- **Ações por linha**: Editar | Excluir
- **Botão**: "+ Novo produto" → `/admin/produtos/novo`

### Formulário (`ProductForm`)

#### Campos Obrigatórios

| Campo | Tipo | Validação |
|-------|------|-----------|
| Nome | text | required, max 120 |
| Marca | text | required, max 80 |
| Categoria | combobox (livre) | required, sugestões: Importado, Árabe, Nacional |
| Gênero | select | required, enum: masculino/feminino/unissex |
| Tamanhos | array dinâmico | min 1 item |

#### Tamanhos/Preços (Array Dinâmico)

```
┌─────────────────────────────────────────────────────────┐
│ Opção 1: [3ml ▼] [R$ 30,00        ] [×]                │
│ Opção 2: [5ml ▼] [R$ 50,00        ] [×]                │
│ Opção 3: [10ml ▼] [R$ 90,00       ] [×]                │
│ Opção 4: [       ] [R$ 0,00         ] [×]  ← vazia     │
│                    [+ Adicionar opção]                   │
└─────────────────────────────────────────────────────────┘
```

- **Combobox** com datalist: `3ml`, `5ml`, `10ml` (aceita valores livres)
- **Máscara de preço**: `priceMask.ts` formata `1500` → `R$ 15,00` ao digitar
- **Enter** no último campo cria nova linha automaticamente
- **Remover**: desabilitado se só 1 opção

#### Campos Opcionais

| Campo | Tipo | Notas |
|-------|------|-------|
| Descrição | textarea | max 500 chars, placeholder "Notas olfativas, família olfativa…" |
| Foto | file upload | JPEG/PNG/WebP até 8MB, editor de focus/zoom |
| Image Focus | editor visual | Drag para reposicionar, slider para zoom |

### Criação de Produto

```typescript
// productsService.createProduct(data)
const id = slugify(data.name); // "Le Male Elixir" → "le-male-elixir"
await setDoc(doc(db, 'products', id), {
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
return id;
```

### Edição de Produto

1. Usuário clica "Editar" → `/admin/produtos/:id`
2. `ProductEditLoader` carrega produto via `listAdminProducts()`
3. `ProductForm` recebe `product` prop + preenche campos
4. Submit → `productsService.updateProduct(id, data)` com `{ merge: true }`

### Exclusão

```typescript
// Confirmação via modal nativo (window.confirm)
await deleteProduct(id); // deleteDoc(doc(db, 'products', id))
```

### Importação de Catálogo (Seed)

- **Disponível apenas** quando coleção `products` está vazia
- Botão "Importar catálogo inicial" no `AdminProducts`
- Usa `seedId` do `storeData.json` como document ID (preserva slugs)
- Some após sucesso

---

## 🖼️ Editor de Imagens (Focus + Zoom)

Componente compartilhado: `FocusEditor.tsx`

### Funcionalidades

- **Drag** para reposicionar ponto focal (x, y ∈ [0, 1])
- **Slider** de zoom (1.0 – 3.0)
- **Botão "Centralizar"** → reseta para `{ x: 0.5, y: 0.5, zoom: 1 }`
- **Preview** em tempo real

### Uso

```tsx
<FocusEditor
  imageUrl={product.imageUrl}
  focus={product.imageFocus}
  onChange={(newFocus) => setImageFocus(newFocus)}
/>
```

### Persistência

Salvo no Firestore como:
```json
{
  "imageUrl": "https://...",
  "imageFocus": { "x": 0.5, "y": 0.3, "zoom": 1.2 }
}
```

---

## 🛡️ Validações e Tratamento de Erros

### Login (`LoginPage`)

| Erro | Mensagem ao usuário |
|------|---------------------|
| `invalid-credential` / `wrong-password` | "Credenciais inválidas. Verifique e tente novamente." |
| `invalid-email` | "Informe um e-mail válido." |
| `too-many-requests` | "Muitas tentativas seguidas. Aguarde alguns minutos." |
| `network-request-failed` | "Falha de conexão. Verifique sua internet." |
| `popup-blocked` | "O navegador bloqueou a janela do Google. Permita popups." |
| `unauthorized-domain` | "Domínio não autorizado: adicione-o no console Firebase." |
| Conta fora da allowlist | "Esta conta não tem acesso ao painel administrativo." |

**Anti-enumeração**: `user-not-found` retorna mesma mensagem de `wrong-password`.

### Produtos (`ProductForm`)

- **Client-side**: HTML5 validation (`required`, `maxLength`, `min="1"`)
- **Server-side**: Firestore Rules rejeitam se não admin / email não verificado
- **Toast/Alert**: Erros de rede/permissão exibidos via `alert()` ou inline

### Textos (`AdminTexts`)

- Validação mínima (campos obrigatórios têm `required`)
- Salvamento assíncrono com loading state
- Sucesso: toast "Textos salvos com sucesso!"

---

## 🔧 Componentes Compartilhados do Admin

| Componente | Arquivo | Uso |
|------------|---------|-----|
| `FocusEditor` | `pages/FocusEditor.tsx` | Editor de imagem (focus + zoom) |
| `priceMask` | `priceMask.ts` | Máscara de moeda BRL para inputs |
| `slugify` | `productsService.ts` | Gera ID a partir do nome |

---

## 📱 Responsividade

- **Desktop**: Layout em grid, side-by-side forms
- **Tablet/Mobile**: Stack vertical, full-width inputs
- Breakpoints via CSS variables: `640px`, `1000px`

---

## ♿ Acessibilidade

- Labels associados (`htmlFor` / `aria-label`)
- `aria-pressed` em botões toggle (filtros, seleção de tamanho)
- `role="group"` + `aria-label` em toolbars
- Focus visible em todos os elementos interativos
- Contraste WCAG AA nas cores do design system

---

## 🔄 Fluxos Principais

### Criar Produto
```
1. /admin/produtos → "+ Novo produto"
2. Preenche formulário (validação client-side)
3. Submit → createProduct() → Firestore
4. Sucesso → navigate('/admin/produtos')
5. Lista atualizada (re-fetch automático)
```

### Editar Produto
```
1. /admin/produtos → "Editar" na linha
2. ProductEditLoader busca produto (loading state)
3. ProductForm pré-preenchido
4. Usuário altera → Submit → updateProduct()
5. Sucesso → navigate('/admin/produtos')
```

### Editar Textos
```
1. /admin/textos → edita campos inline
2. Listas: add/remove/reorder
3. Upload imagens → FocusEditor
4. "Salvar alterações" → saveSiteTexts() (merge)
5. Real-time listener atualiza landing instantaneamente
```

---

## 🐛 Troubleshooting Comum

| Problema | Causa | Solução |
|----------|-------|---------|
| "Firebase não configurado" | `.env.local` ausente/incompleto | Copiar `.env.example` → `.env.local` |
| Login Google falha | Domínio não autorizado | Adicionar domínio no Firebase Console → Auth → Settings |
| "Esta conta não tem acesso" | Email não está em `VITE_ADMIN_EMAILS` | Adicionar email na variável (separado por vírgula) |
| Escrita falha silenciosamente | `email_verified == false` | Clicar "Já confirmei — atualizar" ou reenviar email |
| Imagem não carrega | URL inválida / CORS | Verificar Firebase Storage rules / CDN |
| Categorias não aparecem no filtro | Produtos sem `category` | Preencher categoria em todos os produtos |