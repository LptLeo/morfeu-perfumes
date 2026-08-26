import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  listAdminProducts,
  deleteProduct,
  importCatalog,
  type AdminProduct,
} from '../productsService';
import { logout } from '../auth';
import { navigate } from '../router';
import seedData from '@/data/storeData.json';
import styles from './AdminProducts.module.scss';

interface AdminProductsProps {
  onEdit: (product: AdminProduct) => void;
  onCreate: () => void;
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; products: AdminProduct[] };

export const AdminProducts: React.FC<AdminProductsProps> = ({ onEdit, onCreate }) => {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const products = await listAdminProducts();
      setState(products.length === 0 ? { status: 'empty' } : { status: 'ready', products });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Falha ao carregar produtos.',
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir definitivamente "${name}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Falha ao excluir.');
    } finally {
      setDeleting(null);
    }
  };

  /** Botão temporário: importa o dataset embutido quando a coleção está vazia. */
  const handleImport = async () => {
    if (
      !window.confirm(
        `Importar ${seedData.products.length} produtos do catálogo inicial para o Firestore?`
      )
    )
      return;
    setImporting(true);
    try {
      const items = (seedData.products as Array<{
        id: string; name: string; brand: string; category: string;
        genero: 'masculino' | 'feminino' | 'unissex';
        sizes: { size: string; priceCents: number }[];
        description: string | null; imageUrl: string | null;
      }>).map((p) => ({
        seedId: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        genero: p.genero,
        sizes: p.sizes.map((s) => ({ size: s.size, priceCents: s.priceCents })),
        description: p.description,
        imageUrl: p.imageUrl,
        imageFocus: null,
      }));
      const count = await importCatalog(items);
      window.alert(`${count} produtos importados com sucesso.`);
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Falha na importação.');
    } finally {
      setImporting(false);
    }
  };

  if (state.status === 'loading') {
    return (
      <div className={styles.page}>
        <ListHeader onCreate={onCreate} search={null} />
        <p className={styles.loading}>Carregando produtos…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.page}>
        <ListHeader onCreate={onCreate} search={null} />
        <div className={styles.errorBox}>
          <p>{state.message}</p>
          <Button variant="outline" onClick={load}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (state.status === 'empty') {
    return (
      <div className={styles.page}>
        <ListHeader onCreate={onCreate} search={null} />
        <div className={styles.emptyBox}>
          <h2>Coleção vazia</h2>
          <p>
            Nenhum produto no Firestore ainda. Importe o catálogo inicial (24 produtos já
            migrados para a imgbb) ou cadastre o primeiro manualmente.
          </p>
          <div className={styles.emptyActions}>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importando…' : 'Importar catálogo inicial'}
            </Button>
            <Button variant="outline" onClick={onCreate}>
              Cadastrar manualmente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ready
  const q = search.trim().toLowerCase();
  const filtered = state.products.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );

  return (
    <div className={styles.page}>
      <ListHeader
        onCreate={onCreate}
        search={
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, marca ou categoria…"
            aria-label="Buscar produtos"
          />
        }
      />

      {filtered.length === 0 ? (
        <p className={styles.noResults}>Nenhum produto encontrado para “{search}”.</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((p) => (
            <li key={p.id} className={styles.row}>
              <span className={styles.thumb}>
{p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      style={{
                        objectFit:
                          p.imageFocus?.zoom && p.imageFocus.zoom < 1
                            ? 'contain'
                            : p.imageFocus?.fitMode ?? 'contain',
                        objectPosition: p.imageFocus
                          ? `${p.imageFocus.x * 100}% ${p.imageFocus.y * 100}%`
                          : 'center',
                        transform: p.imageFocus?.zoom ? `scale(${p.imageFocus.zoom})` : undefined,
                      }}
                    />
                ) : (
                  <span aria-hidden="true">—</span>
                )}
              </span>

              <span className={styles.info}>
                <strong>{p.name}</strong>
                <small>
                  {p.brand} · {p.category} ·{' '}
                  {p.genero.charAt(0).toUpperCase() + p.genero.slice(1)}
                </small>
                <small className={styles.sizesLine}>
                  {p.sizes.map((s) => `${s.size} ${centsLabel(s.priceCents)}`).join(' · ')}
                </small>
              </span>

              <span className={styles.rowActions}>
                <button type="button" onClick={() => onEdit(p)} className={styles.editBtn}>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  disabled={deleting === p.id}
                  className={styles.deleteBtn}
                >
                  {deleting === p.id ? 'Excluindo…' : 'Excluir'}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function centsLabel(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function ListHeader({
  onCreate,
  search,
}: {
  onCreate: () => void;
  search: React.ReactNode;
}) {
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', true);
  };
  return (
    <header className={styles.header}>
      <h1>Produtos</h1>
      {search}
      <Button onClick={onCreate}>+ Novo produto</Button>
      <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
        Sair
      </button>
    </header>
  );
}
