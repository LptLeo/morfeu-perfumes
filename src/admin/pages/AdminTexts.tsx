import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { navigate } from '../router';
import { getSiteTexts, saveSiteTexts, type SiteTexts } from '../textsService';
import styles from './AdminTexts.module.scss';

interface SectionConfig {
  key: keyof SiteTexts;
  label: string;
  icon: React.ReactNode;
  fields: Array<{
    path: string;
    label: string;
    type: 'text' | 'textarea' | 'array';
    arrayItemFields?: Array<{ key: string; label: string; type: 'text' | 'textarea' }>;
  }>;
}

const SECTIONS: SectionConfig[] = [
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
        { key: 'id', label: 'ID (único)', type: 'text' },
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
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'step', label: 'Número', type: 'text' },
        { key: 'title', label: 'Título do passo', type: 'text' },
        { key: 'text', label: 'Texto do passo', type: 'textarea' },
      ]},
      { path: 'trustItems', label: 'Itens de confiança', type: 'array', arrayItemFields: [
        { key: 'id', label: 'ID', type: 'text' },
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
        { key: 'id', label: 'ID', type: 'text' },
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

  const handleChange = (sectionKey: keyof SiteTexts, fieldPath: string, value: any) => {
    if (!texts) return;
    const newTexts = setNestedValue(texts, `${sectionKey}.${fieldPath}`, value);
    setTexts(newTexts);
  };

  const handleArrayChange = (sectionKey: keyof SiteTexts, fieldPath: string, index: number, itemKey: string, value: any) => {
    if (!texts) return;
    const currentArray = getNestedValue(texts, `${sectionKey}.${fieldPath}`);
    const newArray = [...currentArray];
    newArray[index] = { ...newArray[index], [itemKey]: value };
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
      await saveSiteTexts(texts);
      setMessage({ type: 'success', text: 'Textos salvos com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar textos' });
    }
    setSaving(false);
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
          const sectionData = texts[section.key];
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
                    const template = field.arrayItemFields?.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}) || {};

                    return (
                      <div key={field.path} className={styles.arrayField}>
                        <label className={styles.arrayLabel}>{field.label}</label>
                        <div className={styles.arrayItems}>
                          {arrayValue.map((item, idx) => (
                            <div key={idx} className={styles.arrayItem}>
                              {field.arrayItemFields?.map((itemField) => (
                                <div key={itemField.key} className={styles.itemField}>
                                  <label className={styles.itemLabel}>{itemField.label}</label>
                                  {itemField.type === 'textarea' ? (
                                    <textarea
                                      value={item[itemField.key] || ''}
                                      onChange={(e) => handleArrayChange(section.key, field.path, idx, itemField.key, e.target.value)}
                                      rows={3}
                                      className={styles.input}
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={item[itemField.key] || ''}
                                      onChange={(e) => handleArrayChange(section.key, field.path, idx, itemField.key, e.target.value)}
                                      className={styles.input}
                                    />
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                className={styles.removeItemBtn}
                                onClick={() => handleArrayRemove(section.key, field.path, idx)}
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
                          onClick={() => handleArrayAdd(section.key, field.path, template)}
                        >
                          + Adicionar item
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={field.path} className={styles.field}>
                      <label className={styles.label}>{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={value || ''}
                          onChange={(e) => handleChange(section.key, field.path, e.target.value)}
                          rows={3}
                          className={styles.input}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => handleChange(section.key, field.path, e.target.value)}
                          className={styles.input}
                        />
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