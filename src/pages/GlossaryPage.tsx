import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MathFormula } from '@/components/MathFormula';
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogTitle,
  GlassDialogDescription,
} from '@/components/ui/glass-dialog';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.04 } } };

interface GlossaryEntry {
  term: string;
  definition: string;
  category: string;
  formula?: string;
}

const entries: GlossaryEntry[] = [
  // Русский алфавит
  { term: 'Альтернативная гипотеза (H₁)', definition: 'Гипотеза о наличии эффекта или различий. Принимается при отвержении H₀.', category: 'Вывод' },
  { term: 'Асимметрия (skewness)', definition: 'Мера несимметричности распределения. Положительная — хвост вправо, отрицательная — влево.', category: 'Описательная' },
  { term: 'Биномиальное распределение', definition: 'Распределение числа успехов в n независимых испытаниях Бернулли с вероятностью успеха p.', category: 'Распределения' },
  { term: 'Выборка', definition: 'Подмножество генеральной совокупности, отобранное для исследования.', category: 'Основы' },
  { term: 'Генеральная совокупность', definition: 'Полная совокупность всех объектов, которые являются предметом исследования.', category: 'Основы' },
  { term: 'Дисперсия', definition: 'Среднее квадратов отклонений значений от среднего. Мера разброса данных.', category: 'Описательная', formula: 'S^2 = \\frac{\\sum (x_i - M)^2}{n-1}' },
  { term: 'Доверительный интервал', definition: 'Диапазон значений, который с заданной вероятностью содержит истинный параметр популяции.', category: 'Вывод', formula: 'CI = M \\pm z \\cdot SE' },
  { term: 'Коэффициент детерминации (R²)', definition: 'Доля дисперсии зависимой переменной, объяснённая моделью. R² = r².', category: 'Регрессия', formula: 'R^2 = r^2' },
  { term: 'Коэффициент Коэна d', definition: 'Размер эффекта для сравнения двух средних. Малый: 0.2, средний: 0.5, большой: 0.8.', category: 'Размер эффекта', formula: 'd = \\frac{M_1 - M_2}{SD_{pooled}}' },
  { term: 'Коэффициент корреляции Пирсона', definition: 'Мера линейной связи между двумя количественными переменными. Диапазон от −1 до +1.', category: 'Корреляция', formula: 'r = \\frac{\\sum (x_i - M_x)(y_i - M_y)}{\\sqrt{\\sum (x_i - M_x)^2 \\cdot \\sum (y_i - M_y)^2}}' },
  { term: 'Коэффициент Спирмена', definition: 'Ранговая корреляция. Измеряет монотонную (не обязательно линейную) связь между переменными.', category: 'Корреляция' },
  { term: 'Медиана', definition: 'Значение, делящее упорядоченный ряд данных пополам. Устойчива к выбросам.', category: 'Описательная' },
  { term: 'Мода', definition: 'Наиболее часто встречающееся значение в наборе данных.', category: 'Описательная' },
  { term: 'Мощность теста', definition: 'Вероятность обнаружить реальный эффект (1 − β). Рекомендуемый минимум: 0.80.', category: 'Вывод' },
  { term: 'Нормальное распределение', definition: 'Симметричное колоколообразное распределение, определяемое средним (μ) и стандартным отклонением (σ).', category: 'Распределения' },
  { term: 'Нулевая гипотеза (H₀)', definition: 'Гипотеза об отсутствии эффекта или различий. Предполагается верной, пока не доказано обратное.', category: 'Вывод' },
  { term: 'Объяснённая дисперсия', definition: 'Часть общего разброса данных, которую удаётся объяснить с помощью модели. Доля объяснённой дисперсии = объяснённая дисперсия / общая дисперсия. Выражается через R² (коэффициент детерминации). Например, R² = 0.36 означает, что модель объясняет 36 % разброса.', category: 'Регрессия', formula: 'R^2 = \\frac{SS_{reg}}{SS_{total}}' },
  { term: 'Остатки (residuals)', definition: 'Разность между наблюдаемым и предсказанным значением: eᵢ = yᵢ − ŷᵢ.', category: 'Регрессия', formula: 'e_i = y_i - \\hat{y}_i' },
  { term: 'Ошибка I рода (α)', definition: 'Вероятность отвергнуть верную нулевую гипотезу (ложноположительный результат).', category: 'Вывод' },
  { term: 'Ошибка II рода (β)', definition: 'Вероятность не отвергнуть ложную нулевую гипотезу (ложноотрицательный результат).', category: 'Вывод' },
  { term: 'Регрессионный коэффициент (β)', definition: 'Показывает, на сколько единиц изменится Y при увеличении X на 1 единицу.', category: 'Регрессия' },
  { term: 'Среднее арифметическое', definition: 'Сумма всех значений, делённая на их количество.', category: 'Описательная', formula: 'M = \\frac{\\sum x_i}{n}' },
  { term: 'Стандартная ошибка', definition: 'Стандартное отклонение выборочного распределения статистики. Показывает точность оценки.', category: 'Вывод', formula: 'SE = \\frac{SD}{\\sqrt{n}}' },
  { term: 'Стандартное отклонение', definition: 'Корень из дисперсии. Показывает типичное отклонение от среднего в единицах измерения.', category: 'Описательная', formula: 'SD = \\sqrt{S^2}' },
  { term: 'Хи-квадрат (χ²)', definition: 'Критерий для анализа категориальных данных. Сравнивает наблюдаемые и ожидаемые частоты.', category: 'Критерии' },
  { term: 'Центральная предельная теорема', definition: 'При достаточно большом n распределение выборочных средних приближается к нормальному, независимо от формы исходного распределения.', category: 'Распределения' },
  { term: 'Эксцесс (kurtosis)', definition: 'Мера «тяжести хвостов» распределения. Нормальное распределение имеет эксцесс = 0 (excess kurtosis).', category: 'Описательная' },
  // Английский алфавит / латиница
  { term: 'ANOVA', definition: 'Дисперсионный анализ для сравнения средних трёх и более групп. Использует F-статистику.', category: 'Критерии' },
  { term: 'Cramér\'s V', definition: 'Размер эффекта для хи-квадрат. Диапазон от 0 до 1.', category: 'Размер эффекта', formula: 'V = \\sqrt{\\frac{\\chi^2}{n(\\min(r,c) - 1)}}' },
  { term: 'p-value', definition: 'Вероятность получить наблюдаемый или более экстремальный результат при условии, что нулевая гипотеза верна.', category: 'Вывод' },
  { term: 't-тест Стьюдента', definition: 'Критерий для сравнения средних. Одновыборочный, для зависимых и независимых выборок.', category: 'Критерии' },
  { term: 'η² (эта-квадрат)', definition: 'Размер эффекта в ANOVA. Доля общей дисперсии, объяснённая фактором.', category: 'Размер эффекта', formula: '\\eta^2 = \\frac{SS_{between}}{SS_{total}}' },
];

const categories = Array.from(new Set(entries.map(e => e.category)));

const GlossaryPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(null);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = !search || e.term.toLowerCase().includes(search.toLowerCase()) || e.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !selectedCategory || e.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Глоссарий
          </h1>
          <p className="text-muted-foreground text-lg">
            Основные термины математической статистики для психологов
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск термина..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Все ({entries.length})
            </Badge>
            {categories.map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <motion.div className="grid gap-3" initial="hidden" animate="visible" variants={stagger} key={search + selectedCategory}>
          {filtered.map((entry, i) => (
            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.3 }}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setActiveEntry(entry)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveEntry(entry);
                }
              }}
              className="cursor-pointer transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal-sm"
            >
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{entry.term}</h3>
                      <Badge variant="secondary" className="text-xs">{entry.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.definition}</p>
                  </div>
                  {entry.formula && (
                    <div className="flex items-center justify-end">
                      <MathFormula formula={entry.formula} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Ничего не найдено</p>
          )}
        </motion.div>

        <GlassDialog
          open={activeEntry !== null}
          onOpenChange={(open) => {
            if (!open) setActiveEntry(null);
          }}
        >
          <GlassDialogContent dialogId={`TERM / ${activeEntry?.category?.toUpperCase() ?? ''}`}>
            {activeEntry && (
              <div className="space-y-4">
                <GlassDialogTitle>{activeEntry.term}</GlassDialogTitle>
                <GlassDialogDescription className="text-base text-foreground/80">
                  {activeEntry.definition}
                </GlassDialogDescription>
                {activeEntry.formula && (
                  <div className="border-3 border-foreground p-4 bg-background">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      // FORMULA
                    </p>
                    <MathFormula formula={activeEntry.formula} display />
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Категория:
                  </span>
                  <Badge variant="outline">{activeEntry.category}</Badge>
                </div>
              </div>
            )}
          </GlassDialogContent>
        </GlassDialog>
      </main>
    </div>
  );
};

export default GlossaryPage;
