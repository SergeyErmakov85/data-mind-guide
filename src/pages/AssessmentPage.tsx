import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FINAL_QUIZ, type FinalQuestion } from '@/data/quizzes/final';
import { getProgress } from '@/lib/progress';
import { toast } from 'sonner';
import { Clock, Lock, Award, AlertTriangle } from 'lucide-react';

const ATTEMPT_KEY = 'matstat-final-attempt';
const TIMER_SECONDS = 45 * 60;
const PASS_PERCENT = 70;

const REQUIRED = [
  { id: 'descriptive', label: 'Описательная статистика', href: '/courses/descriptive' },
  { id: 'hypothesis', label: 'Проверка гипотез', href: '/labs/hypothesis' },
  { id: 'effects', label: 'Размеры эффектов', href: '/labs/effect-size' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function moduleScore(id: string): number {
  const p = getProgress();
  // Combine quiz best score and topic completion as a rough proxy
  const quiz = p.completedQuizzes[id] ?? 0;
  const topics = p.completedCourseTopics[id]?.length ?? 0;
  // Treat any completion >= 1 topic as 80%; quizzes are direct percentages
  const topicScore = topics > 0 ? Math.min(100, topics * 25) : 0;
  return Math.max(quiz, topicScore);
}

export default function AssessmentPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const scores = useMemo(() => REQUIRED.map((r) => ({ ...r, score: moduleScore(r.id) })), []);
  const allow = scores.every((s) => s.score >= 80);

  const [questions] = useState<FinalQuestion[]>(() =>
    shuffle(FINAL_QUIZ).map((q) => ({ ...q, options: shuffle(q.options.map((o, i) => ({ o, i }))).map((x) => x.o), _origCorrect: q.correctIndex } as FinalQuestion)),
  );

  // To preserve correctness after option-shuffle, recompute mapping per question
  const prepared = useMemo(() => {
    return shuffle(FINAL_QUIZ).map((q) => {
      const indexed = q.options.map((text, idx) => ({ text, idx }));
      const shuffled = shuffle(indexed);
      const newCorrect = shuffled.findIndex((x) => x.idx === q.correctIndex);
      return { ...q, options: shuffled.map((x) => x.text), correctIndex: newCorrect };
    });
  }, []);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>(() => Array(prepared.length).fill(-1));
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!started || submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, submitted]);

  const lastAttempt = (() => {
    try {
      const raw = localStorage.getItem(ATTEMPT_KEY);
      return raw ? JSON.parse(raw) as { ts: string } : null;
    } catch { return null; }
  })();

  const cooldownRemainingMs = (() => {
    if (!lastAttempt) return 0;
    const diff = Date.now() - new Date(lastAttempt.ts).getTime();
    return Math.max(0, 24 * 60 * 60 * 1000 - diff);
  })();

  async function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const correct = prepared.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const percent = Math.round((correct / prepared.length) * 100);

    localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ ts: new Date().toISOString(), percent }));

    if (!user) {
      toast.error('Войдите, чтобы сохранить попытку');
      return;
    }

    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: 'final',
        score: percent,
        total_questions: prepared.length,
        duration_seconds: TIMER_SECONDS - secondsLeft,
      })
      .select('id')
      .single();

    if (error || !attempt) {
      toast.error('Не удалось сохранить попытку');
      return;
    }

    if (percent >= PASS_PERCENT) {
      // Get display name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const displayName = profile?.display_name || user.email?.split('@')[0] || 'Студент';

      const { data: cert, error: certErr } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          attempt_id: attempt.id,
          score: percent,
          total_questions: prepared.length,
          display_name: displayName,
        })
        .select('id, hash')
        .single();

      if (certErr || !cert) {
        toast.error('Тест пройден, но сертификат не выдан');
        return;
      }
      toast.success(`Поздравляем! ${percent}% — сертификат выдан`);
      navigate(`/certificate/${cert.hash}`);
    } else {
      toast.error(`Результат: ${percent}%. Минимум для сертификата — ${PASS_PERCENT}%`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center text-muted-foreground">Загрузка…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container max-w-3xl py-16 flex-1">
          <h1 className="font-serif text-4xl mb-4">Финальная аттестация</h1>
          <Card className="p-8 border-2">
            <Lock className="w-8 h-8 mb-4" />
            <p className="mb-6">Войдите в аккаунт, чтобы пройти финальный тест и получить сертификат.</p>
            <Button asChild><Link to="/auth">Войти</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!allow) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container max-w-3xl py-16 flex-1">
          <h1 className="font-serif text-4xl mb-2">Финальная аттестация</h1>
          <p className="text-muted-foreground mb-8">Сначала пройдите обязательные модули (≥ 80% по каждому).</p>
          <Card className="p-6 border-2 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Доступ закрыт</span>
            </div>
            <ul className="space-y-4">
              {scores.map((s) => (
                <li key={s.id}>
                  <div className="flex justify-between items-center mb-1">
                    <Link to={s.href} className="underline hover:no-underline">{s.label}</Link>
                    <span className="font-mono text-sm">{s.score}% / 80%</span>
                  </div>
                  <Progress value={s.score} className="h-1.5" />
                </li>
              ))}
            </ul>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (cooldownRemainingMs > 0 && !started) {
    const hours = Math.ceil(cooldownRemainingMs / (60 * 60 * 1000));
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container max-w-3xl py-16 flex-1">
          <h1 className="font-serif text-4xl mb-4">Попытка уже использована</h1>
          <Card className="p-6 border-2">
            <p>Следующая попытка будет доступна через ~{hours} ч.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/dashboard">К личному кабинету</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container max-w-3xl py-16 flex-1">
          <h1 className="font-serif text-4xl mb-2">Финальная аттестация</h1>
          <p className="text-muted-foreground mb-8">30 вопросов · 45 минут · одна попытка в сутки</p>
          <Card className="p-6 border-2 mb-6 space-y-3">
            <div className="flex items-center gap-3"><Clock className="w-5 h-5"/> Таймер: 45 минут</div>
            <div className="flex items-center gap-3"><Award className="w-5 h-5"/> Проходной балл: {PASS_PERCENT}%</div>
            <p className="text-sm text-muted-foreground pt-2">
              При успешном прохождении вы получите именной PDF-сертификат с уникальным кодом верификации.
            </p>
          </Card>
          <Button size="lg" onClick={() => setStarted(true)}>Начать тест</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const answered = answers.filter((a) => a >= 0).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container max-w-3xl py-10 flex-1">
        <div className="flex justify-between items-center mb-6 sticky top-16 bg-background/90 backdrop-blur z-10 py-3 border-b">
          <div className="font-mono text-sm">Отвечено: {answered} / {prepared.length}</div>
          <div className="font-mono text-lg flex items-center gap-2"><Clock className="w-4 h-4"/>{mm}:{ss}</div>
        </div>

        <ol className="space-y-8">
          {prepared.map((q, qi) => (
            <li key={q.id} className="border-2 border-border p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Вопрос {qi + 1} · {q.topic}</div>
              <p className="font-medium mb-4">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex items-start gap-3 p-3 border cursor-pointer hover:bg-muted/40 ${answers[qi] === oi ? 'bg-foreground text-background' : ''}`}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => setAnswers((prev) => prev.map((v, i) => i === qi ? oi : v))}
                      className="mt-1"
                      disabled={submitted}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={handleSubmit} disabled={submitted}>
            Сдать тест
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
