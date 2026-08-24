import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { AdminProduct } from '../productsService';
import { createProduct, updateProduct, slugify } from '../productsService';
import { maskPriceInput } from '../priceMask';
import { getFirebaseAuth } from '@/lib/firebase';
import { listCategories } from '@/lib/productsRepository';
import { FocusEditor, type FocusValue } from './FocusEditor';
import styles from './ProductForm.module.scss';

interface ProductFormProps {
  /** Presente = edição; ausente = criação */
  product?: AdminProduct;
  /** Sugestões de categoria; carregadas do Firestore se omitidas */
  categories?: string[];
  onDone: () => void;
  onCancel: () => void;
}

interface SizeRow {
  size: string;
  digits: string; // dígitos brutos da máscara
}

type SaveState = 'idle' | 'saving' | 'uploading' | 'error';

export const ProductForm: React.FC<ProductFormProps> = ({ product, categories: categoriesProp, onDone, onCancel }) => {
  const editing = Boolean(product);

  // Categorias existentes para o datalist (carrega do Firestore se não veio por prop)
  const [loadedCategories, setLoadedCategories] = useState<string[]>([]);
  useEffect(() => {
    if (categoriesProp && categoriesProp.length > 0) return;
    listCategories()
      .then((cats) => setLoadedCategories(cats))
      .catch(() => setLoadedCategories([]));
  }, [categoriesProp]);
  const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : loadedCategories;

  const [name, setName] = useState(product?.name ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [genero, setGenero] = useState<AdminProduct['genero']>(product?.genero ?? 'unissex');
  const [description, setDescription] = useState(product?.description ?? '');
  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.sizes?.length
      ? product.sizes.map((s) => ({
          size: s.size,
          digits: String(s.priceCents),
        }))
      : [{ size: '', digits: '' }]
  );

  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);
  const [imageFocus, setImageFocus] = useState<FocusValue | null>(product?.imageFocus ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const categoryOptions = useMemo(
    () => Array.from(new Set(categories.filter((c) => c && c !== 'Todos'))),
    [categories]
  );

  // ── imagem ────────────────────────────────────────────────────────────
  const handleFilePicked = (file: File | null) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Formato não suportado. Use JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Imagem acima de 8 MB.');
      return;
    }
    setErrorMsg(null);
    setPendingFile(file);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    setImageFocus(null); // nova foto → enquadramento zerado
  };

  const removeImage = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
    setImageFocus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** Sobe arquivo pendente ao Cloudinary pela function; retorna URL final. */
  const uploadIfPending = async (): Promise<string | null> => {
    if (!pendingFile) return imageUrl;
    setSaveState('uploading');
    const token = (await getFirebaseAuth().currentUser?.getIdToken()) ?? null;
    if (!token) throw new Error('Sessão expirada — faça login novamente.');
    const form = new FormData();
    // publicId determinístico pelo nome → permite apagar o arquivo depois
    form.append('publicId', slugify(name.trim() || 'produto'));
    form.append('file', pendingFile);
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.url) {
      throw new Error(json?.error ?? `Falha no upload da imagem (${res.status}).`);
    }
    return json.url as string;
  };

  // ── validação / save ────────────────────────────────────────────────
  // Linhas totalmente vazias (sobras do auto-add) não contam para validação.
  const filledSizes = sizes.filter((s) => s.size.trim() !== '' || s.digits !== '');
  const sizesValid =
    filledSizes.length > 0 &&
    filledSizes.every((s) => s.size.trim() !== '' && s.digits !== '');

  const nameError = touched && name.trim() === '' ? 'Informe o nome.' : null;
  const brandError = touched && brand.trim() === '' ? 'Informe a marca.' : null;
  const sizesError = touched && !sizesValid ? 'Cada opção precisa de tamanho e preço.' : null;

  const handleSizeChange = (idx: number, patch: Partial<SizeRow>) => {
    setSizes((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addSizeRow = () => setSizes((rows) => [...rows, { size: '', digits: '' }]);
  const removeSizeRow = (idx: number) =>
    setSizes((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows));

  const sizesFieldsetRef = useRef<HTMLFieldSetElement>(null);

  /** Foca o input de tamanho da linha dada (após criar a próxima). */
  const focusRow = (idx: number) => {
    requestAnimationFrame(() => {
      sizesFieldsetRef.current
        ?.querySelector<HTMLInputElement>(`input[data-row="${idx}"][data-field="size"]`)
        ?.focus();
    });
  };

  /**
   * Enter dentro das opções cria a PRÓXIMA linha em vez de submeter o form.
   * Fluxo tipo planilha: "10ml" → tab/enter → preço → enter → nova linha.
   */
  const handleSizeKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    setSizes((rows) => {
      const isLast = idx === rows.length - 1;
      // linha atual vazia e é a última? nada a fazer (evita empilhar vazias)
      if (isLast && rows[idx].size.trim() === '' && rows[idx].digits === '') return rows;
      const next = isLast ? [...rows, { size: '', digits: '' }] : rows;
      focusRow(idx + 1);
      return next;
    });
  };

  /** Última linha completa → prepara automaticamente uma nova vazia abaixo. */
  useEffect(() => {
    const last = sizes[sizes.length - 1];
    if (last && last.size.trim() !== '' && last.digits !== '') {
      setSizes((rows) =>
        rows.length === sizes.length ? [...rows, { size: '', digits: '' }] : rows
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setErrorMsg(null);
    if (!name.trim() || !brand.trim() || !sizesValid) return;

    try {
      let finalUrl: string | null;
      try {
        finalUrl = await uploadIfPending();
      } catch (err) {
        setSaveState('error');
        setErrorMsg(err instanceof Error ? err.message : 'Erro no upload.');
        return;
      }

      setSaveState('saving');
      const doc = {
        name: name.trim(),
        brand: brand.trim(),
        category: category.trim() || 'Importado',
        genero,
        sizes: filledSizes.map((s) => ({
          size: s.size.trim(),
          priceCents: maskPriceInput(s.digits).cents,
        })),
        description: description.trim() ? description.trim() : null,
        imageUrl: finalUrl,
        imageFocus: finalUrl ? imageFocus : null,
      };

      if (editing && product) {
        await updateProduct(product.id, doc);
      } else {
        await createProduct(doc);
      }
      onDone();
    } catch (err) {
      setSaveState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado ao salvar.');
    }
  };

  const busy = saveState === 'saving' || saveState === 'uploading';

  return (
    <div className={styles.page}>
      <header className={styles.formHeader}>
        <button type="button" className={styles.backBtn} onClick={onCancel} disabled={busy}>
          &larr; Voltar
        </button>
        <h1>{editing ? 'Editar produto' : 'Novo produto'}</h1>
      </header>

      {errorMsg && (
        <p className={styles.errorBanner} role="alert" aria-live="assertive">
          {errorMsg}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.card}>
          <h2>Dados do produto</h2>

          <div className={styles.fieldRow}>
            <label className={`${styles.field} ${nameError ? styles.invalid : ''}`}>
              Nome *
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Le Male Elixir"
                disabled={busy}
                required
              />
              {nameError && <span className={styles.fieldError}>{nameError}</span>}
            </label>

            <label className={`${styles.field} ${brandError ? styles.invalid : ''}`}>
              Marca *
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex.: Jean Paul Gaultier"
                disabled={busy}
                required
              />
              {brandError && <span className={styles.fieldError}>{brandError}</span>}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              Categoria (texto livre — cria filtro na loja)
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-options"
                placeholder="Ex.: Importado"
                disabled={busy}
              />
              <datalist id="category-options">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <label className={styles.field}>
              Gênero *
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value as AdminProduct['genero'])}
                disabled={busy}
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="unissex">Unissex</option>
              </select>
            </label>
          </div>

          {/* Opções de compra: cada linha é uma oferta tamanho × preço */}
          <fieldset className={styles.sizesFieldset} ref={sizesFieldsetRef}>
            <legend>
              Opções de compra *{' '}
              <small>
                uma oferta por linha (ex.: 10ml por R$ 10,00; 20ml por R$ 18,90). Enter cria a
                próxima.
              </small>
            </legend>
            {sizesError && <p className={styles.fieldError}>{sizesError}</p>}
            {sizes.map((row, idx) => {
              const masked = maskPriceInput(row.digits);
              return (
                <div key={idx} className={styles.sizeRow}>
                  <input
                    className={styles.sizeName}
                    value={row.size}
                    onChange={(e) => handleSizeChange(idx, { size: e.target.value })}
                    onKeyDown={(e) => handleSizeKeyDown(idx, e)}
                    list="size-suggestions"
                    placeholder="10ml"
                    aria-label={`Tamanho da opção ${idx + 1}`}
                    data-row={idx}
                    data-field="size"
                    data-size-input="true"
                    disabled={busy}
                  />
                  <input
                    className={styles.sizePrice}
                    inputMode="numeric"
                    // campo vazio enquanto não há dígito (Intl usa NBSP; nunca compare strings formatadas)
                    value={row.digits === '' ? '' : masked.display}
                    onChange={(e) =>
                      handleSizeChange(idx, { digits: e.target.value.replace(/\D/g, '').slice(0, 9) })
                    }
                    onKeyDown={(e) => handleSizeKeyDown(idx, e)}
                    placeholder="R$ 0,00"
                    aria-label={`Preço da opção ${idx + 1}`}
                    data-price-input="true"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className={styles.removeSizeBtn}
                    onClick={() => removeSizeRow(idx)}
                    disabled={busy || sizes.length === 1}
                    aria-label={`Remover opção ${idx + 1}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
            <datalist id="size-suggestions">
              <option value="3ml" />
              <option value="5ml" />
              <option value="10ml" />
            </datalist>
            <Button variant="outline" isCompact onClick={addSizeRow} disabled={busy}>
              + Adicionar opção
            </Button>
          </fieldset>

          <label className={styles.field}>
            Descrição (opcional)
            <textarea
              rows={3}
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas olfativas, família olfativa…"
              disabled={busy}
            />
          </label>
        </section>

        <section className={styles.card}>
          <h2>Foto (opcional)</h2>
          {!previewUrl && !imageUrl ? (
            <label className={styles.dropzone}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFilePicked(e.target.files?.[0] ?? null)}
                disabled={busy}
              />
              <span>Clique para escolher uma foto (JPEG/PNG/WebP até 8 MB)</span>
            </label>
          ) : (
            <>
              <div className={styles.photoActions}>
                <Button variant="outline" isCompact onClick={() => fileInputRef.current?.click()} disabled={busy}>
                  Trocar foto
                </Button>
                <button type="button" className={styles.removePhotoBtn} onClick={removeImage} disabled={busy}>
                  Remover foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFilePicked(e.target.files?.[0] ?? null)}
                />
              </div>
              <FocusEditor
                imageUrl={previewUrl ?? imageUrl!}
                value={imageFocus}
                onChange={setImageFocus}
              />
            </>
          )}
        </section>

        <div className={styles.actions}>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {saveState === 'uploading'
              ? 'Enviando foto…'
              : saveState === 'saving'
                ? 'Salvando…'
                : editing
                  ? 'Salvar alterações'
                  : 'Criar produto'}
          </Button>
        </div>
      </form>
    </div>
  );
};
