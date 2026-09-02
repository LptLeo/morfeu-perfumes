import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { navigate } from '../router';
import { getSiteTexts, saveSiteTexts, type SiteTexts } from '../textsService';
import { getFirebaseAuth } from '@/lib/firebase';
import { fillMessageTemplate, type WhatsAppMessageFills } from '@/utils/whatsapp';
import { FocusEditor } from './FocusEditor';
import styles from './AdminTexts.module.scss';

interface SectionConfig {
  /** Identificador único da seção (usado como key do React). */
  key: string;
  /** Onde os dados vivem dentro de SiteTexts. Default: o próprio section.key. */
  dataKey?: keyof SiteTexts;
  label: string;
  icon: React.ReactNode;
  fields: Array<{
    path: string;
    label: string;
    type: 'text' | 'textarea' | 'array' | 'image' | 'headerLogo';
    arrayItemFields?: Array<{ key: string; label: string; type: 'text' | 'textarea' }>;
    /** Se true, o input mantém apenas dígitos (ex.: número de WhatsApp). */
    sanitizeDigits?: boolean;
    /** Se true, o input aplica máscara progressiva de telefone brasileiro (ex.: WhatsApp). */
    phoneMask?: boolean;
    /** Dica exibida abaixo do campo. */
    hint?: string;
  }>;
}

interface ImageWithFocus {
  url: string | null;
  focus?: { x: number; y: number; zoom: number } | null;
}

interface ImageUploadWithFocusProps {
  imageUrl: string | null | undefined;
  focus?: { x: number; y: number; zoom: number } | null;
  onChange: (value: ImageWithFocus) => void;
  aspectRatio?: string;
}

const ImageUploadWithFocus: React.FC<ImageUploadWithFocusProps> = ({ imageUrl, focus, onChange, aspectRatio = '4/5' }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);
  const [currentFocus, setCurrentFocus] = useState(focus ?? { x: 0.5, y: 0.5, zoom: 1 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);
    try {
      // Token de autenticação para a Netlify Function
      const token = (await getFirebaseAuth().currentUser?.getIdToken()) ?? null;
      if (!token) throw new Error('Sessão expirada — faça login novamente');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no upload');
      }

      const data = await response.json();
      const newUrl = data.url;

      setPreviewUrl(newUrl);
      onChange({ url: newUrl, focus: { x: 0.5, y: 0.5, zoom: 1 } });
      setCurrentFocus({ x: 0.5, y: 0.5, zoom: 1 });
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onChange({ url: null, focus: { x: 0.5, y: 0.5, zoom: 1 } });
    setCurrentFocus({ x: 0.5, y: 0.5, zoom: 1 });
  };

  const handleFocusChange = (newFocus: { x: number; y: number; zoom: number }) => {
    setCurrentFocus(newFocus);
    onChange({ url: previewUrl, focus: newFocus });
  };

  const showFocusEditor = previewUrl && !previewUrl.startsWith('data:') && previewUrl !== '/favicon.svg';

  return (
    <div className={styles.imageUpload}>
      <div className={styles.imagePreviewWrapper}>
        {previewUrl ? (
          <div className={styles.imagePreview}>
            <img src={previewUrl} alt="Preview" draggable={false} />
            {showFocusEditor && (
              <FocusEditor
                imageUrl={previewUrl}
                value={currentFocus}
                onChange={handleFocusChange}
                aspectRatio={aspectRatio}
              />
            )}
          </div>
        ) : (
          <div className={`${styles.imagePreview} ${styles.empty}`} style={{ aspectRatio }}>
            <span>Nenhuma imagem</span>
          </div>
        )}
      </div>

      <div className={styles.imageActions}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className={styles.fileInput}
        />
        <button
          type="button"
          className={`${styles.uploadBtn} ${uploading ? styles.uploading : ''}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Enviando…' : previewUrl ? 'Trocar imagem' : 'Carregar imagem'}
        </button>
        {previewUrl && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            Remover
          </button>
        )}
      </div>

      {showFocusEditor && (
        <p className={styles.focusHint}>Arraste a imagem para escolher o enquadramento. Use o slider para zoom.</p>
      )}
    </div>
  );
};

const SECTIONS: SectionConfig[] = [
  {
    key: 'storeInfo',
    label: 'Header',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    fields: [
      { path: 'name', label: 'Nome da loja (exibido no header)', type: 'text' },
      { path: 'tagline', label: 'Tagline do header', type: 'text' },
      { path: 'logo', label: 'Foto/Logo do Header', type: 'headerLogo' },
    ],
  },
  {
    key: 'contato',
    dataKey: 'storeInfo',
    label: 'Contato',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    fields: [
      { path: 'sellerName', label: 'Nome do(a) atendente', type: 'text' },
      { path: 'whatsapp.number', label: 'Número do WhatsApp (máscara brasileira; DDI 55 é salvo automaticamente)', type: 'text', phoneMask: true },
      { path: 'whatsapp.defaultMessage', label: 'Mensagem padrão dos botões', type: 'textarea' },
      { path: 'whatsapp.suggestionMessage', label: 'Mensagem de sugestão de perfume', type: 'textarea' },
      {
        path: 'whatsapp.productMessage',
        label: 'Mensagem ao encomendar (template)',
        type: 'textarea',
        hint: 'Use os marcadores {Qtde em ml}, {Produto}, {Marca} e {Preço}. Vazio = mensagem padrão. Ex.: "Olá! Quero pedir um decant de {Produto}{Marca} com {Qtde em ml}."',
      },
    ],
  },
  {
    key: 'hero',
    label: 'Hero (Início)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
    fields: [
      { path: 'eyebrow', label: 'Eyebrow (rótulo superior)', type: 'text' },
      { path: 'title', label: 'Título principal', type: 'text' },
      { path: 'titleEmphasis', label: 'Palavra em destaque no título', type: 'text' },
      { path: 'description', label: 'Descrição', type: 'textarea' },
      { path: 'primaryCta', label: 'Botão primário (CTA)', type: 'text' },
      { path: 'secondaryCta', label: 'Botão secundário', type: 'text' },
      { path: 'image', label: 'Imagem de fundo do Hero', type: 'image' },
      { path: 'logoImage', label: 'Logo do Hero (alternativa à imagem)', type: 'image' },
      { path: 'trustBadges', label: 'Selos de confiança', type: 'array', arrayItemFields: [{ key: '', label: 'Texto do selo', type: 'text' }] },
    ],
  },
  {
    key: 'whyDecants',
    label: 'Por que decants',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    fields: [
      { path: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { path: 'title', label: 'Título', type: 'text' },
      { path: 'description', label: 'Descrição', type: 'textarea' },
      { path: 'items', label: 'Cards de benefícios', type: 'array', arrayItemFields: [
        { key: 'icon', label: 'Ícone (flask/layers/pocket/sparkles)', type: 'text' },
        { key: 'title', label: 'Título do card', type: 'text' },
        { key: 'description', label: 'Texto do card', type: 'textarea' },
      ]},
    ],
  },
  {
    key: 'catalog',
    label: 'Catálogo (topo)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    fields: [
      { path: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { path: 'title', label: 'Título', type: 'text' },
      { path: 'description', label: 'Descrição', type: 'textarea' },
    ],
  },
  {
    key: 'howItWorks',
    label: 'Como funciona',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    fields: [
      { path: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { path: 'title', label: 'Título', type: 'text' },
      { path: 'description', label: 'Descrição (opcional)', type: 'textarea' },
      { path: 'steps', label: 'Passos', type: 'array', arrayItemFields: [
        { key: 'step', label: 'Número', type: 'text' },
        { key: 'title', label: 'Título do passo', type: 'text' },
        { key: 'text', label: 'Texto do passo', type: 'textarea' },
      ]},
      { path: 'trustItems', label: 'Itens de confiança', type: 'array', arrayItemFields: [
        { key: 'icon', label: 'Ícone (shield/award)', type: 'text' },
        { key: 'title', label: 'Título', type: 'text' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
      ]},
    ],
  },
  {
    key: 'faq',
    label: 'Dúvidas (FAQ)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    fields: [
      { path: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { path: 'title', label: 'Título', type: 'text' },
      { path: 'items', label: 'Perguntas/Respostas', type: 'array', arrayItemFields: [
        { key: 'question', label: 'Pergunta', type: 'text' },
        { key: 'answer', label: 'Resposta', type: 'textarea' },
      ]},
    ],
  },
  {
    key: 'footer',
    label: 'Rodapé',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
    fields: [
      { path: 'brand', label: 'Marca', type: 'text' },
      { path: 'description', label: 'Descrição', type: 'textarea' },
      { path: 'buttonText', label: 'Texto do botão', type: 'text' },
      { path: 'bottomTextLeft', label: 'Texto inferior esquerdo', type: 'text' },
      { path: 'bottomTextRight', label: 'Texto inferior direito', type: 'text' },
    ],
  },
];

/**
 * Converte o valor do campo de telefone (E.164 salvo ou sequência local digitada)
 * para os dígitos locais (sem DDI 55), prontos para a máscara.
 */
function localPhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    return digits.slice(2);
  }
  return digits.slice(0, 11);
}

/**
 * Aplica máscara brasileira progressiva de telefone/celular,
 * ex.: "" → "(D" → "(DD)" → "(DD) N..." → "(DD) 9XXXX-XXXX".
 */
function maskPhone(raw: string): string {
  const d = localPhoneDigits(raw);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Exemplos usados no exemplificador (preview) da mensagem ao encomendar. */
const EXAMPLE_FILLS: WhatsAppMessageFills = {
  'Qtde em ml': '3ml',
  Produto: 'Le Male Elixir',
  Marca: ' (Jean Paul Gaultier)',
  Preço: 'R$ 40,00',
};

/**
 * Renderiza o texto preenchido destacando os placeholders não reconhecidos
 * (ex.: digitação errada de {qdte em ml}) em âmbar.
 */
function renderTemplatePreview(template: string): React.ReactNode[] {
  const parts = template.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (!part) return null;
    const m = part.match(/^\{([^}]+)\}$/);
    if (m) {
      const key = m[1];
      const filled = EXAMPLE_FILLS[key];
      if (filled !== undefined) {
        return <React.Fragment key={i}>{filled}</React.Fragment>;
      }
      return (
        <span key={i} className={styles.tokenUnknown}>
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

const PRODUCT_MSG_SCENARIOS: Array<{ id: string; label: string; sizes: { size: string; priceCents: number }[] }> = [
  { id: 'one', label: '1 tamanho selecionado', sizes: [{ size: '3ml', priceCents: 4000 }] },
  {
    id: 'many',
    label: 'Vários tamanhos',
    sizes: [
      { size: '3ml', priceCents: 4000 },
      { size: '5ml', priceCents: 6000 },
      { size: '10ml', priceCents: 10000 },
    ],
  },
  { id: 'none', label: 'Sem tamanho / sob consulta', sizes: [] },
];

/** Preenche o template com os valores de exemplo de um cenário. */
function fillProductPreview(template: string, sizes: { size: string; priceCents: number }[]): string {
  const brand = ' (Jean Paul Gaultier)';
  const sizeList = sizes.map((s) => s.size);
  const priceList = sizes.map((s) =>
    typeof s.priceCents === 'number' ? formatPreviewPrice(s.priceCents) : 'sob consulta'
  );
  return fillMessageTemplate(template, {
    'Qtde em ml': sizeList.length > 0 ? sizeList.join(', ') : 'sob consulta',
    Produto: 'Le Male Elixir',
    Marca: brand,
    Preço: priceList.length > 0 ? priceList.join(', ') : 'sob consulta',
  });
}

function formatPreviewPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Exemplificador (preview em tempo real) da mensagem ao encomendar. */
const ProductMessagePreview: React.FC<{ template: string }> = ({ template }) => {
  const isEmpty = !template || !template.trim();
  return (
    <div className={styles.templatePreview}>
      <span className={styles.templatePreviewTitle}>Exemplo de como a mensagem chega ao cliente:</span>
      {isEmpty ? (
        <div className={styles.templatePreviewEmpty}>
          Campo vazio — será usada a mensagem padrão do site.
        </div>
      ) : (
        PRODUCT_MSG_SCENARIOS.map((scenario) => (
          <div key={scenario.id} className={styles.templatePreviewRow}>
            <span className={styles.templatePreviewTag}>{scenario.label}</span>
            <p className={styles.templatePreviewText}>
              {renderTemplatePreview(fillProductPreview(template, scenario.sizes))}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export const AdminTexts: React.FC = () => {
  const [texts, setTexts] = useState<SiteTexts | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getSiteTexts()
      .then((data) => {
        setTexts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setMessage({ type: 'error', text: 'Erro ao carregar textos' });
      });
  }, []);

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  };

  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const newObj = JSON.parse(JSON.stringify(obj));
    let current = newObj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) current[key] = {};
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return newObj;
  };

  const handleChange = (sectionKey: keyof SiteTexts, fieldPath: string, value: any, sanitizeDigits?: boolean, phoneMask?: boolean) => {
    if (!texts) return;
    let nextValue = value;
    if (sanitizeDigits) nextValue = String(value).replace(/\D/g, '');
    if (phoneMask) nextValue = localPhoneDigits(String(value));
    const newTexts = setNestedValue(texts, `${sectionKey}.${fieldPath}`, nextValue);
    setTexts(newTexts);
  };

  const handleArrayChange = (sectionKey: keyof SiteTexts, fieldPath: string, index: number, itemKey: string, value: any) => {
    if (!texts) return;
    const currentArray = getNestedValue(texts, `${sectionKey}.${fieldPath}`);
    const newArray = [...currentArray];
    // Arrays de strings simples (ex.: selos de confiança) substituem o item direto
    if (typeof newArray[index] === 'string' || itemKey === '') {
      newArray[index] = value;
    } else {
      newArray[index] = { ...newArray[index], [itemKey]: value };
    }
    const newTexts = setNestedValue(texts, `${sectionKey}.${fieldPath}`, newArray);
    setTexts(newTexts);
  };

  const handleArrayAdd = (sectionKey: keyof SiteTexts, fieldPath: string, template: any) => {
    if (!texts) return;
    const currentArray = getNestedValue(texts, `${sectionKey}.${fieldPath}`);
    const newTexts = setNestedValue(texts, `${sectionKey}.${fieldPath}`, [...currentArray, template]);
    setTexts(newTexts);
  };

  const handleArrayRemove = (sectionKey: keyof SiteTexts, fieldPath: string, index: number) => {
    if (!texts) return;
    const currentArray = getNestedValue(texts, `${sectionKey}.${fieldPath}`);
    const newArray = currentArray.filter((_item: unknown, i: number) => i !== index);
    const newTexts = setNestedValue(texts, `${sectionKey}.${fieldPath}`, newArray);
    setTexts(newTexts);
  };

  const handleSave = async () => {
    if (!texts) return;
    setSaving(true);
    setMessage(null);
    try {
      // Garante que o número do WhatsApp seja salvo em E.164 (DDI 55 + número local),
      // que é o formato esperado pelo buildWhatsAppUrl (wa.me).
      let toSave = texts;
      const number = getNestedValue(toSave, 'storeInfo.whatsapp.number');
      if (typeof number === 'string') {
        const local = localPhoneDigits(number);
        toSave = setNestedValue(toSave, 'storeInfo.whatsapp.number', local ? `55${local}` : '');
      }
      await saveSiteTexts(toSave);
      setMessage({ type: 'success', text: 'Textos salvos com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar textos' });
    }
    setSaving(false);
  };

  const handleImageChange = (sectionKey: keyof SiteTexts, fieldPath: string, newImage: ImageWithFocus) => {
    if (!texts) return;
    const newTexts = setNestedValue(texts, `${sectionKey}.${fieldPath}`, newImage);
    setTexts(newTexts);
  };

  const handleBack = () => navigate('/admin');

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Carregando textos…</div>
      </div>
    );
  }

  if (!texts) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Erro ao carregar textos</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          ← Voltar
        </button>
        <h1>Gerenciar textos do site</h1>
      </header>

      {message && (
        <div className={`${styles.banner} ${styles[message.type]}`} role="alert">
          {message.text}
        </div>
      )}

      <main className={styles.content}>
        {SECTIONS.map((section) => {
          const dataKey = section.dataKey ?? (section.key as keyof SiteTexts);
          const sectionData = texts[dataKey];
          return (
            <section key={section.key} className={styles.section}>
              <header className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <h2>{section.label}</h2>
              </header>

              <div className={styles.fields}>
                {section.fields.map((field) => {
                  const value = getNestedValue(sectionData, field.path);

                  if (field.type === 'array') {
                    const arrayValue = value as any[];
                    const isStringArray = arrayValue.length === 0 || arrayValue.every((i) => typeof i === 'string');
                    const baseTemplate: any = isStringArray ? '' : field.arrayItemFields?.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}) || {};
                    // Para arrays de objetos, injeta um id interno (não renderizado) para key do React
                    const template = isStringArray ? '' : { id: `${section.key}-${field.path}-${Date.now()}`, ...baseTemplate };

                    return (
                      <div key={field.path} className={styles.arrayField}>
                        <label className={styles.arrayLabel}>{field.label}</label>
                        <div className={styles.arrayItems}>
                          {arrayValue.map((item, idx) => (
                            <div key={idx} className={styles.arrayItem}>
                              {isStringArray ? (
                                <div className={styles.itemField}>
                                  <label className={styles.itemLabel}>{field.arrayItemFields?.[0]?.label ?? 'Texto'}</label>
                                  <input
                                    type="text"
                                    value={typeof item === 'string' ? item : ''}
                                    onChange={(e) => handleArrayChange(dataKey, field.path, idx, '', e.target.value)}
                                    className={styles.input}
                                  />
                                </div>
                              ) : (
                                field.arrayItemFields?.map((itemField) => (
                                  <div key={itemField.key} className={styles.itemField}>
                                    <label className={styles.itemLabel}>{itemField.label}</label>
                                    {itemField.type === 'textarea' ? (
                                      <textarea
                                        value={item[itemField.key] || ''}
                                        onChange={(e) => handleArrayChange(dataKey, field.path, idx, itemField.key, e.target.value)}
                                        rows={3}
                                        className={styles.input}
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        value={item[itemField.key] || ''}
                                        onChange={(e) => handleArrayChange(dataKey, field.path, idx, itemField.key, e.target.value)}
                                        className={styles.input}
                                      />
                                    )}
                                  </div>
                                ))
                              )}
                              <button
                                type="button"
                                className={styles.removeItemBtn}
                                onClick={() => handleArrayRemove(dataKey, field.path, idx)}
                                aria-label={`Remover item ${idx + 1}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          className={styles.addItemBtn}
                          onClick={() => handleArrayAdd(dataKey, field.path, template)}
                        >
                          + Adicionar item
                        </button>
                      </div>
                    );
                  }

                  if (field.type === 'image') {
                    const imageData = value as { url: string | null; focus: { x: number; y: number; zoom: number } | null };
                    return (
                      <div key={field.path} className={styles.field}>
                        <label className={styles.label}>{field.label}</label>
                        <ImageUploadWithFocus
                          imageUrl={imageData?.url ?? ''}
                          focus={imageData?.focus ?? { x: 0.5, y: 0.5, zoom: 1 }}
                          onChange={(newImage) => handleImageChange(dataKey, field.path, newImage)}
                          aspectRatio="4/5"
                        />
                      </div>
                    );
                  }

                  if (field.type === 'headerLogo') {
                    const logoData = (value as { url?: string | null; focus?: { x: number; y: number; zoom: number } | null }) ?? {};
                    return (
                      <div key={field.path} className={styles.field}>
                        <label className={styles.label}>{field.label}</label>
                        <ImageUploadWithFocus
                          imageUrl={logoData?.url ?? '/favicon.svg'}
                          focus={logoData?.focus ?? { x: 0.5, y: 0.5, zoom: 1 }}
                          onChange={(newImage) => handleImageChange(dataKey, field.path, newImage)}
                          aspectRatio="1/1"
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.path} className={styles.field}>
                      <label className={styles.label}>{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={value || ''}
                          onChange={(e) => handleChange(dataKey, field.path, e.target.value)}
                          rows={3}
                          className={styles.input}
                        />
                      ) : (
                        <input
                          type="text"
                          value={field.phoneMask ? maskPhone(value || '') : (value || '')}
                          onChange={(e) => handleChange(dataKey, field.path, e.target.value, field.sanitizeDigits, field.phoneMask)}
                          placeholder={field.phoneMask ? '(00) 00000-0000' : undefined}
                          className={styles.input}
                        />
                      )}
                      {field.hint && <div className={styles.fieldHint}>{field.hint}</div>}
                      {field.path === 'whatsapp.productMessage' && (
                        <ProductMessagePreview template={value || ''} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className={styles.actions}>
          <Button variant="outline" onClick={handleBack}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </main>
    </div>
  );
};