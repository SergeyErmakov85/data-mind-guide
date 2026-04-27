/**
 * Баннер, появляющийся на целевой странице после клика
 * «Открыть в калькуляторе / лабе» на /datasets.
 * Читает session-handoff и показывает имя датасета + первые цифры превью.
 */
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Database, X } from 'lucide-react';
import Papa from 'papaparse';

import { Button } from '@/components/ui/button';
import { popDataset, DATASETS_BY_ID, type DatasetHandoff } from '@/data/datasets';

interface Props {
  /** Что делать с разобранными данными (например — pre-fill в калькулятор). */
  onApply?: (handoff: DatasetHandoff, parsed: { headers: string[]; rows: string[][] }) => void;
}

export const DatasetHandoffBanner = ({ onApply }: Props) => {
  const [params] = useSearchParams();
  const datasetId = params.get('dataset');
  const [handoff, setHandoff] = useState<DatasetHandoff | null>(null);
  const [parsed, setParsed] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  useEffect(() => {
    if (!datasetId) return;
    const h = popDataset(datasetId);
    if (!h) return;
    setHandoff(h);
    Papa.parse<string[]>(h.csv, {
      skipEmptyLines: true,
      complete: (res) => {
        const all = res.data;
        if (all.length === 0) return;
        const headers = all[0];
        const rows = all.slice(1, 11);
        const p = { headers, rows };
        setParsed(p);
        onApply?.(h, p);
      },
    });
    // onApply intentionally excluded — we only want to fire once per handoff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  if (!handoff || !parsed) return null;

  const meta = DATASETS_BY_ID[handoff.id];

  return (
    <div className="mb-6 border-2 border-foreground bg-card">
      <div className="flex items-start justify-between gap-3 px-5 py-3 border-b-2 border-foreground bg-muted/30">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Датасет загружен
            </div>
            <div className="font-serif text-lg font-bold leading-tight">
              {meta?.name ?? handoff.filename}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setHandoff(null);
            setParsed(null);
          }}
          aria-label="Закрыть превью"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {parsed.headers.map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                {parsed.headers.map((_, j) => (
                  <td key={j} className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">
                    {row[j] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2 text-xs text-muted-foreground border-t border-border flex items-center justify-between">
        <span>Первые {parsed.rows.length} строк из {meta?.n ?? '—'}</span>
        <Link to="/datasets" className="text-primary hover:underline">
          ← Все датасеты
        </Link>
      </div>
    </div>
  );
};
