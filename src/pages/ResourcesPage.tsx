import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Video, Globe, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

interface Resource {
  title: string;
  description: string;
  url: string;
  type: 'book' | 'video' | 'website' | 'article';
  language: 'ru' | 'en';
  level: 'начальный' | 'средний' | 'продвинутый';
}

const resources: Resource[] = [
  { title: 'Наглядная математическая статистика', description: 'Учебное пособие М.Б. Лагутин — классический учебник для гуманитариев с наглядными примерами.', url: '#', type: 'book', language: 'ru', level: 'начальный' },
  { title: 'Статистика и котики', description: 'Популярная книга В. Савельева — весёлое и доступное введение в статистику.', url: '#', type: 'book', language: 'ru', level: 'начальный' },
  { title: 'Discovering Statistics Using IBM SPSS', description: 'Andy Field — один из лучших учебников по статистике для психологов. Юмор и глубина.', url: '#', type: 'book', language: 'en', level: 'средний' },
  { title: 'Statistics for Psychology', description: 'Aron, Coups & Aron — систематическое изложение статистических методов для психологов.', url: '#', type: 'book', language: 'en', level: 'средний' },
  { title: 'StatQuest with Josh Starmer', description: 'YouTube-канал с понятными визуальными объяснениями статистических концепций.', url: 'https://youtube.com/@statquest', type: 'video', language: 'en', level: 'начальный' },
  { title: 'Khan Academy: Statistics', description: 'Бесплатный курс статистики с интерактивными упражнениями.', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'website', language: 'en', level: 'начальный' },
  { title: 'Seeing Theory', description: 'Интерактивная визуализация основных концепций теории вероятностей и статистики.', url: 'https://seeing-theory.brown.edu/', type: 'website', language: 'en', level: 'начальный' },
  { title: 'JASP — бесплатная альтернатива SPSS', description: 'Программа с GUI для статистического анализа. Поддерживает байесовскую и частотную статистику.', url: 'https://jasp-stats.org/', type: 'website', language: 'en', level: 'средний' },
  { title: 'R для анализа данных в психологии', description: 'Современный подход: R + tidyverse для обработки и визуализации психологических данных.', url: '#', type: 'article', language: 'ru', level: 'продвинутый' },
  { title: 'Effect Size Calculator', description: 'Онлайн-калькулятор размеров эффекта для различных статистических тестов.', url: '#', type: 'website', language: 'en', level: 'средний' },
  { title: 'Психометрика: введение', description: 'Основы создания и валидации психологических тестов. Надёжность, валидность, факторный анализ.', url: '#', type: 'book', language: 'ru', level: 'продвинутый' },
  { title: 'APA Publication Manual (7th ed.)', description: 'Стандарт оформления статистических результатов в психологических публикациях.', url: '#', type: 'article', language: 'en', level: 'средний' },
];

const typeIcons = { book: BookOpen, video: Video, website: Globe, article: FileText };
const typeLabels = { book: 'Книга', video: 'Видео', website: 'Сайт', article: 'Статья' };
const levelColors: Record<string, string> = { 'начальный': 'bg-green-500/10 text-green-700', 'средний': 'bg-yellow-500/10 text-yellow-700', 'продвинутый': 'bg-red-500/10 text-red-700' };

const ResourcesPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container py-8">
      <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="font-heading text-3xl font-bold mb-2">📚 Ресурсы</h1>
        <p className="text-muted-foreground text-lg">
          Учебники, видео и инструменты для углублённого изучения статистики
        </p>
      </motion.div>

      <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" animate="visible" variants={stagger}>
        {resources.map((res, i) => {
          const Icon = typeIcons[res.type];
          return (
            <motion.div key={i} variants={fadeUp}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-tight flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    {res.title}
                  </CardTitle>
                  {res.url !== '#' && (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{res.description}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{typeLabels[res.type]}</Badge>
                  <Badge variant="outline" className="text-xs">{res.language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}</Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[res.level]}`}>{res.level}</span>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </main>
  </div>
);

export default ResourcesPage;
