import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Database, Download, Calculator, Activity, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  DATASETS,
  DOMAIN_LABEL,
  fetchDatasetCsv,
  stashDataset,
  type Dataset,
  type DatasetDomain,
} from '@/data/datasets';

/* ─── Bento sizing by n ─── */
const tileSpan = (n: number): string => {
  if (n >= 180) return 'md:col-span-8';
  if (n >= 100) return 'md:col-span-6';
  return 'md:col-span-4';
};

const DOMAINS: DatasetDomain[] = ['personality', 'clinical', 'cognitive'];

/* ─── Preview state ─── */
interface PreviewData {
  headers: string[];
  rows: string[][];
}

const useCsvPreview = (file: string, enabled: boolean) => {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || data || loading) return;
    let cancelled = false;
    setLoading(true);
    fetchDatasetCsv(file)
      .then((csv) => {
        Papa.parse<string[]>(csv, {
          skipEmptyLines: true,
          complete: (res) => {
            if (cancelled) return;
            const all = res.data;
            if (all.length === 0) {
              setError('Пустой файл');
              return;
            }
            setData({ headers: all[0], rows: all.slice(1, 11) });
          },
        });
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [file, enabled, data, loading]);

  return { data, loading, error };
};

/* ─── Card ─── */
const DatasetCard = ({ ds, index }: { ds: Dataset; index: number }) => {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const preview = useCsvPreview(ds.file, expanded);

  const openInTarget = async (target: 'descriptive' | 'correlation') => {
    try {
      const csv = await fetchDatasetCsv(ds.file);
      stashDataset({ id: ds.id, filename: ds.file, csv });
      const path = target === 'descriptive' ? '/descriptive' : '/labs/correlation';
      navigate(`${path}?dataset=${ds.id}`);
    } catch (e) {
      toast.error('Не удалось загрузить датасет', {
        description: e instanceof Error ? e.message : 'unknown',
      });
    }
  };

  const downloadCsv = () => {
    const a = document.createElement('a');
    a.href = `/datasets/${ds.file}`;
    a.download = ds.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fade = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
        transition: { duration: 0.4, delay: Math.min(index * 0.05, 0.3) },
      };

  return (
    <motion.article
      {...fade}
      className={`col-span-1 ${tileSpan(ds.n)} flex flex-col border-2 border-foreground bg-card`}
    >
      <header className="px-5 pt-5 pb-3 border-b border-border">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-none">
              {DOMAIN_LABEL[ds.domain]}
            </Badge>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              n = {ds.n}
            </span>
          </div>
          <Database className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-xl font-bold leading-tight">{ds.name}</h2>
        <p className="text-sm text-muted-foreground mt-2">{ds.description}</p>
      </header>

      <section className="px-5 py-3 border-b border-border">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Переменные
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ds.variables.map((v) => (
            <span
              key={v.name}
              title={v.description}
              className={[
                'px-2 py-0.5 text-xs border font-mono',
                v.type === 'numeric'
                  ? 'border-primary/40 text-primary'
                  : v.type === 'categorical'
                  ? 'border-accent-foreground/40 text-accent-foreground'
                  : 'border-muted-foreground/30 text-muted-foreground',
              ].join(' ')}
            >
              {v.name}
            </span>
          ))}
        </div>
      </section>

      <section className="px-5 py-3 text-xs text-muted-foreground space-y-1">
        <div>
          <span className="font-semibold">Дизайн:</span> {ds.design}
        </div>
        <div>
          <span className="font-semibold">Источник:</span> {ds.source} ·{' '}
          <span className="font-mono">{ds.license}</span>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap gap-2 p-5 pt-2">
        <Button size="sm" onClick={() => openInTarget('descriptive')} className="gap-1.5">
          <Calculator className="w-3.5 h-3.5" />
          В калькулятор
        </Button>
        <Button size="sm" variant="outline" onClick={() => openInTarget('correlation')} className="gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          В лабу корреляций
        </Button>
        <Button size="sm" variant="outline" onClick={downloadCsv} className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          CSV
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpanded((v) => !v)}
          className="gap-1.5 ml-auto"
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Превью
        </Button>
      </div>

      {/* Preview */}
      {expanded && (
        <div className="border-t-2 border-foreground">
          {preview.loading && (
            <p className="p-4 text-xs text-muted-foreground font-mono">загрузка...</p>
          )}
          {preview.error && (
            <p className="p-4 text-xs text-destructive font-mono">{preview.error}</p>
          )}
          {preview.data && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {preview.data.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.data.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border/40">
                      {preview.data!.headers.map((_, j) => (
                        <td key={j} className="px-3 py-1 whitespace-nowrap text-muted-foreground">
                          {row[j] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-3 py-2 text-[10px] text-muted-foreground font-mono">
                первые {preview.data.rows.length} строк (papaparse, локально, без отправки)
              </p>
            </div>
          )}
        </div>
      )}
    </motion.article>
  );
};

/* ─── Page ─── */
const DatasetsPage = () => {
  const reduced = useReducedMotion();
  const [activeDomain, setActiveDomain] = useState<DatasetDomain | null>(null);

  const filtered = useMemo(
    () => (activeDomain ? DATASETS.filter((d) => d.domain === activeDomain) : DATASETS),
    [activeDomain],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-10 max-w-7xl">
        <header className="mb-8">
          <Badge variant="secondary" className="rounded-none mb-3">
            Локальная коллекция
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <Database className="w-9 h-9 text-primary" aria-hidden="true" />
            Датасеты для практики
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {DATASETS.length} наборов данных по личности, клинике и когнитивистике.
            Все CSV хранятся локально, никаких внешних API. Открывайте в калькуляторе,
            лабе корреляций или скачивайте для работы в Jamovi/R/Python.
          </p>
        </header>

        {/* Domain filter chips — brutal, rounded-none */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveDomain(null)}
            className={[
              'px-3 py-1.5 text-sm border border-foreground rounded-none transition-colors',
              activeDomain === null
                ? 'bg-foreground text-background'
                : 'bg-background text-foreground hover:bg-foreground/10',
            ].join(' ')}
            aria-pressed={activeDomain === null}
          >
            Все ({DATASETS.length})
          </button>
          {DOMAINS.map((d) => {
            const count = DATASETS.filter((x) => x.domain === d).length;
            const active = activeDomain === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDomain(active ? null : d)}
                className={[
                  'px-3 py-1.5 text-sm border border-foreground rounded-none transition-colors',
                  active
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-foreground/10',
                ].join(' ')}
                aria-pressed={active}
              >
                {DOMAIN_LABEL[d]} ({count})
              </button>
            );
          })}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-fr">
          {filtered.map((ds, i) => (
            <DatasetCard key={ds.id} ds={ds} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <aside className="mt-12 p-5 border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
          <p className="mb-2">
            <strong className="text-foreground">Как использовать:</strong> «В калькулятор» откроет
            страницу описательной статистики с предзаполненными числовыми колонками.
            «В лабу корреляций» переходит на /labs/correlation с превью датасета и подсказкой по парам переменных.
          </p>
          <p>
            Данные синтетические и предназначены исключительно для учебных целей —
            не используйте их в публикациях.{' '}
            <Link to="/glossary" className="text-primary hover:underline inline-flex items-center gap-1">
              Глоссарий терминов <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </aside>
      </main>
    </div>
  );
};

export default DatasetsPage;
