import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bookmark,
  Calculator,
  GraduationCap,
  History,
  User as UserIcon,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

/* --------------------------------------------------------------------------
 * Types — mirror DB rows. We don't depend on generated types so the page
 * keeps working immediately after the migration even if `types.ts` lags.
 * -------------------------------------------------------------------------- */
type Profile = {
  display_name: string | null;
  specialization: string | null;
};
type Progress = {
  module_id: string;
  percent: number;
  updated_at: string;
  completed_at: string | null;
};
type SavedCalc = {
  id: string;
  type: string;
  created_at: string;
  note: string | null;
};
type Bookmark = { term_id: string };
type QuizAttempt = {
  id: string;
  quiz_id: string;
  score: number;
  created_at: string;
};

/* --------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */
const initials = (name: string | null | undefined, email: string | null | undefined): string => {
  const src = (name && name.trim()) || (email ? email.split('@')[0] : 'U');
  return src
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const moduleHref = (id: string): string => {
  if (id.startsWith('lab:')) return `/labs/${id.slice(4)}`;
  if (id.startsWith('course:')) return `/courses/${id.slice(7)}`;
  if (id.startsWith('theory:')) return `/theory#${id.slice(7)}`;
  return '/learning-path';
};

const moduleTitle = (id: string): string =>
  id.replace(/^(lab|course|theory):/, '').replace(/-/g, ' ');

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */
const DashboardPage = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const profileQ = useQuery({
    enabled: !!userId,
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, specialization')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const progressQ = useQuery({
    enabled: !!userId,
    queryKey: ['user_progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('module_id, percent, updated_at, completed_at')
        .eq('user_id', userId!)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Progress[];
    },
  });

  const calcQ = useQuery({
    enabled: !!userId,
    queryKey: ['saved_calculations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_calculations')
        .select('id, type, created_at, note')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as SavedCalc[];
    },
  });

  const bookmarksQ = useQuery({
    enabled: !!userId,
    queryKey: ['bookmarks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('term_id')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Bookmark[];
    },
  });

  const quizQ = useQuery({
    enabled: !!userId,
    queryKey: ['quiz_attempts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id, quiz_id, score, created_at')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as QuizAttempt[];
    },
  });

  const lastModule = progressQ.data?.[0];
  const completedCount = progressQ.data?.filter((p) => p.completed_at).length ?? 0;
  const inProgressCount = progressQ.data?.filter((p) => !p.completed_at && p.percent > 0).length ?? 0;

  const profile = profileQ.data;
  const display = profile?.display_name || (user?.email ? user.email.split('@')[0] : 'Гость');

  useEffect(() => {
    document.title = `${display} — Личный кабинет`;
  }, [display]);

  return (
    <main id="main-content" className="container py-10 sm:py-14 max-w-6xl">
      <header className="mb-8">
        <p className="kicker">DASHBOARD</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-2">Привет, {display}</h1>
        <p className="text-sm text-muted-foreground mt-2 prose-cap">
          Здесь собран ваш прогресс по курсам, сохранённые расчёты и закладки.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-min">
        {/* --- Profile --- */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-start gap-4">
            <div
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading text-lg font-bold"
            >
              {initials(profile?.display_name, user?.email)}
            </div>
            <div className="min-w-0">
              <p className="kicker">PROFILE</p>
              <h2 className="font-heading text-lg font-semibold truncate">{display}</h2>
              {profile?.specialization && (
                <p className="text-sm text-muted-foreground truncate">{profile.specialization}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* --- Continue CTA --- */}
        <Card className="p-6 lg:col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <p className="kicker">CONTINUE</p>
          <h2 className="font-heading text-xl font-semibold mt-2">
            {lastModule ? 'Продолжить с того места, где остановились' : 'Начните с плана обучения'}
          </h2>
          {lastModule ? (
            <>
              <p className="text-sm text-muted-foreground mt-1 capitalize">{moduleTitle(lastModule.module_id)}</p>
              <div className="mt-3 max-w-sm">
                <Progress value={lastModule.percent} aria-label={`Прогресс: ${lastModule.percent}%`} />
                <p className="text-xs text-muted-foreground mt-1">{lastModule.percent}% завершено</p>
              </div>
              <Button asChild className="mt-4">
                <Link to={moduleHref(lastModule.module_id)}>
                  Продолжить <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mt-1">
                Пока нет начатых модулей. Загляните в план обучения.
              </p>
              <Button asChild className="mt-4">
                <Link to="/learning-path">
                  Открыть план <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </Card>

        {/* --- Progress --- */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="kicker">MODULES</p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-3xl font-bold">{completedCount}</span>
            <span className="text-sm text-muted-foreground">завершено</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {inProgressCount} в процессе · всего {progressQ.data?.length ?? 0}
          </p>
          <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
            {(progressQ.data ?? []).slice(0, 5).map((p) => (
              <li key={p.module_id} className="text-sm">
                <Link to={moduleHref(p.module_id)} className="flex items-center justify-between hover:text-primary">
                  <span className="truncate capitalize">{moduleTitle(p.module_id)}</span>
                  <Badge variant={p.completed_at ? 'default' : 'secondary'}>{p.percent}%</Badge>
                </Link>
              </li>
            ))}
            {progressQ.data?.length === 0 && (
              <li className="text-sm text-muted-foreground">Прогресс появится после первого модуля.</li>
            )}
          </ul>
        </Card>

        {/* --- Saved calculations --- */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="kicker">CALCULATIONS</p>
          </div>
          <p className="font-heading text-3xl font-bold">{calcQ.data?.length ?? 0}</p>
          <p className="text-sm text-muted-foreground">сохранённых расчётов</p>
          <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
            {(calcQ.data ?? []).slice(0, 5).map((c) => (
              <li key={c.id} className="text-sm">
                <span className="font-mono text-xs uppercase text-muted-foreground">{c.type}</span>
                <span className="ml-2">{c.note ?? '—'}</span>
              </li>
            ))}
            {calcQ.data?.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Сохраняйте результаты прямо из <Link to="/calculators" className="underline">калькуляторов</Link>.
              </li>
            )}
          </ul>
        </Card>

        {/* --- Bookmarks --- */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="kicker">BOOKMARKS</p>
          </div>
          <p className="font-heading text-3xl font-bold">{bookmarksQ.data?.length ?? 0}</p>
          <p className="text-sm text-muted-foreground">закладок в глоссарии</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(bookmarksQ.data ?? []).slice(0, 12).map((b) => (
              <Link
                key={b.term_id}
                to={`/glossary#${b.term_id}`}
                className="text-xs rounded border border-border px-2 py-1 hover:bg-muted"
              >
                {b.term_id}
              </Link>
            ))}
            {bookmarksQ.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Откройте <Link to="/glossary" className="underline">глоссарий</Link> и добавьте термины.
              </p>
            )}
          </div>
        </Card>

        {/* --- Quiz history --- */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="kicker">QUIZ HISTORY</p>
          </div>
          <ul className="divide-y divide-border">
            {(quizQ.data ?? []).map((q) => (
              <li key={q.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-mono text-xs uppercase text-muted-foreground">{q.quiz_id}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(q.created_at).toLocaleDateString('ru-RU')}
                </span>
                <Badge variant={q.score >= 70 ? 'default' : 'secondary'}>{Number(q.score).toFixed(0)}%</Badge>
              </li>
            ))}
            {quizQ.data?.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">
                Пройдите <Link to="/learning-path" className="underline">первый квиз</Link>, и попытка появится здесь.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </main>
  );
};

// keep `UserIcon` referenced so eslint stays happy if used in future header tweak
void UserIcon;

export default DashboardPage;
