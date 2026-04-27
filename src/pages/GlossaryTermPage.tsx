import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Bookmark, BookmarkCheck, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MathFormula } from '@/components/MathFormula';

import {
  GLOSSARY_BY_ID,
  CATEGORY_LABEL,
  type GlossaryTerm,
} from '@/data/glossary';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const buildJsonLd = (term: GlossaryTerm) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  '@id': `${typeof window !== 'undefined' ? window.location.origin : ''}/glossary/${term.id}`,
  name: term.term,
  description: term.long,
  inDefinedTermSet: 'Глоссарий статистики для психологов',
  termCode: term.id,
});

const TermDetail = ({ term }: { term: GlossaryTerm }) => {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);

  // Check bookmark state
  useEffect(() => {
    if (!user) {
      setBookmarked(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('term_id', term.id)
        .maybeSingle();
      if (!cancelled) setBookmarked(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, term.id]);

  const toggleBookmark = async () => {
    if (!user) {
      toast.info('Войдите, чтобы сохранять закладки', {
        action: { label: 'Войти', onClick: () => navigate('/auth') },
      });
      return;
    }
    setBusy(true);
    if (bookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('term_id', term.id);
      if (error) toast.error(error.message);
      else {
        setBookmarked(false);
        toast.success('Закладка удалена');
      }
    } else {
      const { error } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        term_id: term.id,
      });
      if (error) toast.error(error.message);
      else {
        setBookmarked(true);
        toast.success('Добавлено в закладки');
      }
    }
    setBusy(false);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/glossary/${term.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Ссылка скопирована');
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  const related = (term.related ?? [])
    .map((id) => GLOSSARY_BY_ID[id])
    .filter(Boolean);

  const fade = reduced
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(term)) }}
      />
      <main id="main-content" className="container mx-auto px-4 py-10 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/glossary">
            <ArrowLeft className="w-4 h-4 mr-1" /> К глоссарию
          </Link>
        </Button>

        <motion.article {...fade} className="space-y-8">
          <header className="space-y-3">
            <Badge variant="secondary" className="rounded-none">
              {CATEGORY_LABEL[term.category]}
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">{term.term}</h1>
            {term.aliases && term.aliases.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Также: {term.aliases.join(', ')}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant={bookmarked ? 'default' : 'outline'} onClick={toggleBookmark} disabled={busy}>
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-1" /> В закладках
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-1" /> В закладки
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={copyLink}>
                <LinkIcon className="w-4 h-4 mr-1" /> Скопировать ссылку
              </Button>
            </div>
          </header>

          <Card>
            <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground">{term.long}</p>
            </CardContent>
          </Card>

          {term.formula && (
            <section aria-labelledby="formula-heading">
              <h2 id="formula-heading" className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                // FORMULA
              </h2>
              <div className="border-2 border-foreground p-6 bg-card">
                <MathFormula formula={term.formula} display />
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="font-serif text-2xl font-bold mb-4">
                Связанные термины
              </h2>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/glossary/${r.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm border border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    {r.term}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {term.occurrences && term.occurrences.length > 0 && (
            <section aria-labelledby="occurrences-heading">
              <h2 id="occurrences-heading" className="font-serif text-2xl font-bold mb-4">
                Где встречается
              </h2>
              <ul className="space-y-2">
                {term.occurrences.map((o) => (
                  <li key={o.to}>
                    <Link
                      to={o.to}
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {o.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </motion.article>
      </main>
    </div>
  );
};

const TermDetailRoute = () => {
  const { id } = useParams<{ id: string }>();
  const term = id ? GLOSSARY_BY_ID[id] : undefined;

  if (!term) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Термин не найден</h1>
          <Button asChild>
            <Link to="/glossary">К глоссарию</Link>
          </Button>
        </main>
      </div>
    );
  }

  return <TermDetail term={term} />;
};

export default TermDetailRoute;
