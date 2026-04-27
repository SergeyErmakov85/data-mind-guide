import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download, ShieldCheck } from 'lucide-react';

interface Certificate {
  hash: string;
  display_name: string;
  score: number;
  total_questions: number;
  issued_at: string;
}

export default function CertificatePage() {
  const { hash } = useParams<{ hash: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const certRef = useRef<HTMLDivElement>(null);

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

      if (data) {
        const verifyUrl = `${window.location.origin}/verify/${data.hash}`;
        const url = await QRCode.toDataURL(verifyUrl, { width: 220, margin: 1 });
        setQrDataUrl(url);
      }
    })();
  }, [hash]);

  async function handleDownload() {
    if (!certRef.current || !cert) return;
    const dataUrl = await toPng(certRef.current, { pixelRatio: 2, cacheBust: true });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const img = new Image();
    img.src = dataUrl;
    await new Promise((r) => { img.onload = r; });
    const ratio = img.width / img.height;
    let w = pageWidth - 20;
    let h = w / ratio;
    if (h > pageHeight - 20) { h = pageHeight - 20; w = h * ratio; }
    pdf.addImage(dataUrl, 'PNG', (pageWidth - w) / 2, (pageHeight - h) / 2, w, h);
    pdf.save(`certificate-${cert.hash.slice(0, 12)}.pdf`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <div className="container py-20 text-center text-muted-foreground">Загрузка сертификата…</div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-background flex flex-col"><Header />
        <main className="container max-w-2xl py-20 flex-1 text-center">
          <h1 className="font-serif text-3xl mb-4">Сертификат не найден</h1>
          <Button asChild variant="outline"><Link to="/assessment">К аттестации</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const dateFmt = new Date(cert.issued_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container max-w-5xl py-10 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-serif text-3xl">Сертификат</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/verify/${cert.hash}`}><ShieldCheck className="w-4 h-4 mr-2"/>Проверить</Link>
            </Button>
            <Button onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>Скачать PDF</Button>
          </div>
        </div>

        <div ref={certRef} className="bg-background border-[6px] border-foreground p-12 aspect-[1.414/1] flex flex-col">
          <div className="border border-foreground p-10 flex-1 flex flex-col justify-between relative">
            <div className="text-center">
              <div className="text-xs tracking-[0.4em] uppercase mb-2">Statistics for Psychology</div>
              <div className="font-serif text-5xl mt-6 mb-2">Сертификат</div>
              <div className="text-sm tracking-widest uppercase text-muted-foreground">о прохождении финальной аттестации</div>
            </div>

            <div className="text-center">
              <div className="text-sm uppercase tracking-wider text-muted-foreground mb-3">выдан</div>
              <div className="font-serif text-4xl border-b-2 border-foreground inline-block px-12 pb-2">
                {cert.display_name}
              </div>
              <div className="mt-8 max-w-2xl mx-auto text-sm leading-relaxed">
                За успешное прохождение курса по статистическим методам в психологии
                с результатом <span className="font-bold">{cert.score}%</span> ({Math.round((cert.score / 100) * cert.total_questions)} из {cert.total_questions} вопросов).
              </div>
            </div>

            <div className="flex justify-between items-end text-xs">
              <div>
                <div className="text-muted-foreground uppercase tracking-wider mb-1">Дата</div>
                <div className="font-mono text-sm">{dateFmt}</div>
              </div>
              <div className="text-center">
                {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-24 h-24 mx-auto mb-1" />}
                <div className="text-muted-foreground">Verify</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground uppercase tracking-wider mb-1">Код</div>
                <div className="font-mono text-[10px] break-all max-w-[200px]">{cert.hash}</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Подлинность можно проверить по QR-коду или ссылке /verify/{cert.hash.slice(0, 12)}…
        </p>
      </main>
      <Footer />
    </div>
  );
}
