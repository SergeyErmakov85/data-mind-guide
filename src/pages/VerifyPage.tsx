import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Certificate {
  hash: string;
  display_name: string;
  score: number;
  total_questions: number;
  issued_at: string;
}

export default function VerifyPage() {
  const { hash } = useParams<{ hash: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hash) return;
    (async () => {
      const { data } = await supabase
        .from('certificates')
        .select('hash, display_name, score, total_questions, issued_at')
        .eq('hash', hash)
        .maybeSingle();
      setCert(data);
      setLoading(false);
    })();
  }, [hash]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container max-w-2xl py-16 flex-1">
        <h1 className="font-serif text-4xl mb-2">Проверка сертификата</h1>
        <p className="text-muted-foreground text-sm font-mono mb-8 break-all">{hash}</p>

        {loading ? (
          <div className="text-muted-foreground">Проверяем…</div>
        ) : cert ? (
          <Card className="p-8 border-2">
            <div className="flex items-center gap-3 mb-6 text-green-600">
              <CheckCircle2 className="w-8 h-8" />
              <div className="text-2xl font-serif">Подлинный</div>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Владелец</dt>
                <dd className="font-medium">{cert.display_name}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Балл</dt>
                <dd className="font-mono">{cert.score}% ({Math.round((cert.score / 100) * cert.total_questions)}/{cert.total_questions})</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Дата выдачи</dt>
                <dd className="font-mono">{new Date(cert.issued_at).toLocaleDateString('ru-RU')}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to={`/certificate/${cert.hash}`}>Открыть сертификат</Link>
            </Button>
          </Card>
        ) : (
          <Card className="p-8 border-2">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <XCircle className="w-8 h-8" />
              <div className="text-2xl font-serif">Не найден</div>
            </div>
            <p className="text-muted-foreground">Сертификат с таким кодом не существует или код введён с ошибкой.</p>
          </Card>
        )}
      </main>
      
    </div>
  );
}
