import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen } from 'lucide-react';
import { useState, useMemo } from 'react';

interface GlossaryEntry {
  term: string;
  definition: string;
  category: string;
  formula?: string;
}

const entries: GlossaryEntry[] = [
  { term: 'Генеральная совокупность', definition: 'Полная совокупность всех объектов, которые являются предметом исследования.', category: 'Основы' },
  { term: 'Выборка', definition: 'Подмножество генеральной совокупности, отобранное для исследования.', category: 'Основы' },
  { term: 'Среднее арифметическое', definition: 'Сумма всех значений, делённая на их количество.', category: 'Описательная', formula: 'M = Σxᵢ / n' },
  { term: 'Медиана', definition: 'Значение, делящее упорядоченный ряд данных пополам. Устойчива к выбросам.', category: 'Описательная' },
  { term: 'Мода', definition: 'Наиболее часто встречающееся значение в наборе данных.', category: 'Описательная' },
  { term: 'Дисперсия', definition: 'Среднее квадратов отклонений значений от среднего. Мера разброса данных.', category: 'Описательная', formula: 'S² = Σ(xᵢ - M)² / (n-1)' },
  { term: 'Стандартное отклонение', definition: 'Корень из дисперсии. Показывает типичное отклонение от среднего в единицах измерения.', category: 'Описательная', formula: 'SD = √S²' },
  { term: 'Стандартная ошибка', definition: 'Стандартное отклонение выборочного распределения статистики. Показывает точность оценки.', category: 'Вывод', formula: 'SE = SD / √n' },
  { term: 'Доверительный интервал', definition: 'Диапазон значений, который с заданной вероятностью содержит истинный параметр популяции.', category: 'Вывод', formula: 'CI = M ± z·SE' },
  { term: 'p-value', definition: 'Вероятность получить наблюдаемый или более экстремальный результат при условии, что нулевая гипотеза верна.', category: 'Вывод' },
  { term: 'Нулевая гипотеза (H₀)', definition: 'Гипотеза об отсутствии эффекта или различий. Предполагается верной, пока не доказано обратное.', category: 'Вывод' },
  { term: 'Альтернативная гипотеза (H₁)', definition: 'Гипотеза о наличии эффекта или различий. Принимается при отвержении H₀.', category: 'Вывод' },
  { term: 'Ошибка I рода (α)', definition: 'Вероятность отвергнуть верную нулевую гипотезу (ложноположительный результат).', category: 'Вывод' },
  { term: 'Ошибка II рода (β)', definition: 'Вероятность не отвергнуть ложную нулевую гипотезу (ложноотрицательный результат).', category: 'Вывод' },
  { term: 'Мощность теста', definition: 'Вероятность обнаружить реальный эффект (1 − β). Рекомендуемый минимум: 0.80.', category: 'Вывод' },
  { term: 'Коэффициент корреляции Пирсона', definition: 'Мера линейной связи между двумя количественными переменными. Диапазон от −1 до +1.', category: 'Корреляция', formula: 'r = Σ(xᵢ−M_x)(yᵢ−M_y) / √[Σ(xᵢ−M_x)²·Σ(yᵢ−M_y)²]' },
  { term: 'Коэффициент Спирмена', definition: 'Ранговая корреляция. Измеряет монотонную (не обязательно линейную) связь между переменными.', category: 'Корреляция' },
  { term: 'Коэффициент детерминации (R²)', definition: 'Доля дисперсии зависимой переменной, объяснённая моделью. R² = r².', category: 'Регрессия' },
  { term: 'Регрессионный коэффициент (β)', definition: 'Показывает, на сколько единиц изменится Y при увеличении X на 1 единицу.', category: 'Регрессия' },
  { term: 'Остатки (residuals)', definition: 'Разность между наблюдаемым и предсказанным значением: eᵢ = yᵢ − ŷᵢ.', category: 'Регрессия' },
  { term: 't-тест Стьюдента', definition: 'Критерий для сравнения средних. Одновыборочный, для зависимых и независимых выборок.', category: 'Критерии' },
  { term: 'ANOVA', definition: 'Дисперсионный анализ для сравнения средних трёх и более групп. Использует F-статистику.', category: 'Критерии' },
  { term: 'Хи-квадрат (χ²)', definition: 'Критерий для анализа категориальных данных. Сравнивает наблюдаемые и ожидаемые частоты.', category: 'Критерии' },
  { term: 'Коэффициент Коэна d', definition: 'Размер эффекта для сравнения двух средних. Малый: 0.2, средний: 0.5, большой: 0.8.', category: 'Размер эффекта', formula: 'd = (M₁ − M₂) / SD_pooled' },
  { term: 'η² (эта-квадрат)', definition: 'Размер эффекта в ANOVA. Доля общей дисперсии, объяснённая фактором.', category: 'Размер эффекта', formula: 'η² = SS_between / SS_total' },
  { term: 'Cramér\'s V', definition: 'Размер эффекта для хи-квадрат. Диапазон от 0 до 1.', category: 'Размер эффекта', formula: 'V = √(χ² / (n·(min(r,c)−1)))' },
  { term: 'Нормальное распределение', definition: 'Симметричное колоколообразное распределение, определяемое средним (μ) и стандартным отклонением (σ).', category: 'Распределения' },
  { term: 'Центральная предельная теорема', definition: 'При достаточно большом n распределение выборочных средних приближается к нормальному, независимо от формы исходного распределения.', category: 'Распределения' },
  { term: 'Биномиальное распределение', definition: 'Распределение числа успехов в n независимых испытаниях Бернулли с вероятностью успеха p.', category: 'Распределения' },
  { term: 'Асимметрия (skewness)', definition: 'Мера несимметричности распределения. Положительная — хвост вправо, отрицательная — влево.', category: 'Описательная' },
  { term: 'Эксцесс (kurtosis)', definition: 'Мера «тяжести хвостов» распределения. Нормальное распределение имеет эксцесс = 0 (excess kurtosis).', category: 'Описательная' },
];

const categories = Array.from(new Set(entries.map(e => e.category)));

const GlossaryPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Глоссарий
          </h1>
          <p className="text-muted-foreground text-lg">
            Основные термины математической статистики для психологов
          </p>
        </div>

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

        <div className="grid gap-3">
          {filtered.map((entry, i) => (
            <Card key={i}>
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
                    <code className="text-xs bg-muted px-3 py-1.5 rounded font-mono whitespace-nowrap">
                      {entry.formula}
                    </code>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Ничего не найдено</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default GlossaryPage;
