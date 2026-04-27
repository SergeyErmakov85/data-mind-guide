import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { getLabProgress } from '@/lib/progress';
import {
  LineChart,
  BarChart3,
  Beaker,
  FlaskConical,
  TrendingUp,
  Sigma,
  ScatterChart,
  Layers,
  Shuffle,
  Trophy,
  Ruler,
} from 'lucide-react';
import {
  BentoTile,
  DifficultyFilter,
  sortByDifficulty,
  tileGridMotion,
  type Difficulty,
} from '@/components/BentoTile';

interface Lab {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  difficulty: Difficulty;
  concepts: string[];
  status: 'available' | 'coming-soon';
  indexLabel: string;
}

const labs: Lab[] = [
  { id: 'effect-size', title: 'Размер эффекта', description: 'p-value значим — но насколько велик эффект? Сравнивайте d Коэна, η² и r Пирсона. Визуализируйте перекрытие распределений и учитесь отличать статистическую значимость от практической.', icon: Ruler, path: '/labs/effect-size', difficulty: 'beginner', concepts: ['d Коэна', 'η² (eta-квадрат)', 'r Пирсона'], status: 'available', indexLabel: 'EFFECT' },
  { id: 'clt', title: 'Центральная предельная теорема', description: 'Почему результаты тестов IQ распределены нормально? Наблюдайте, как распределение выборочных средних сходится к нормальному — это объясняет, почему многие психологические переменные имеют колоколообразную форму.', icon: LineChart, path: '/labs/clt', difficulty: 'beginner', concepts: ['Выборочное распределение', 'Нормальное распределение', 'Закон больших чисел'], status: 'available', indexLabel: 'CLT' },
  { id: 'sampling', title: 'Выборочные статистики', description: 'Сколько участников нужно для исследования тревожности? Генерируйте выборки и изучайте, как размер группы влияет на точность оценки среднего балла по шкале.', icon: BarChart3, path: '/labs/sampling', difficulty: 'beginner', concepts: ['Выборочное среднее', 'Стандартная ошибка', 'Смещение оценок'], status: 'available', indexLabel: 'SAMPLING' },
  { id: 'confidence', title: 'Доверительные интервалы', description: 'Как интерпретировать «среднее 45±3 балла по шкале депрессии»? Визуализируйте, что означает 95% доверительный интервал через повторные выборки из популяции.', icon: Beaker, path: '/labs/confidence', difficulty: 'intermediate', concepts: ['Уровень доверия', 'Покрытие', 'Ширина интервала'], status: 'available', indexLabel: 'CONFIDENCE' },
  { id: 'hypothesis', title: 'Проверка гипотез', description: 'Работает ли когнитивно-поведенческая терапия? Исследуйте p-value и мощность теста — ключевые понятия для оценки эффективности психологических интервенций.', icon: FlaskConical, path: '/labs/hypothesis', difficulty: 'intermediate', concepts: ['P-value', 'Ошибки I и II рода', 'Мощность теста'], status: 'available', indexLabel: 'HYPOTHESIS' },
  { id: 'regression', title: 'Линейная регрессия', description: 'Предсказывает ли уровень стресса академическую успеваемость? Стройте регрессионные модели и анализируйте силу связи между психологическими переменными.', icon: TrendingUp, path: '/labs/regression', difficulty: 'advanced', concepts: ['Метод наименьших квадратов', 'R²', 'Остатки'], status: 'available', indexLabel: 'REGRESSION' },
  { id: 'correlation', title: 'Корреляция и ковариация', description: 'Связаны ли тревожность и успеваемость? Генерируйте данные с заданной корреляцией, добавляйте выбросы и наблюдайте их влияние на коэффициент Пирсона.', icon: ScatterChart, path: '/labs/correlation', difficulty: 'beginner', concepts: ['Корреляция Пирсона', 'Ковариация', 'Выбросы'], status: 'available', indexLabel: 'KORRELATION' },
  { id: 'ttest', title: 't-тесты', description: 'Работает ли терапия? Сравните уровень депрессии до и после лечения с помощью одновыборочного, независимого и парного t-тестов.', icon: Sigma, path: '/labs/ttest', difficulty: 'intermediate', concepts: ['t-статистика', 'd Коэна', 'Степени свободы'], status: 'available', indexLabel: 'T-TEST' },
  { id: 'anova', title: 'ANOVA (Дисперсионный анализ)', description: 'Какой метод терапии эффективнее? Сравните средние трёх и более групп, изучите F-статистику, таблицу ANOVA и размер эффекта η².', icon: Layers, path: '/labs/anova', difficulty: 'advanced', concepts: ['F-статистика', 'η² (eta-квадрат)', 'Post-hoc тесты'], status: 'available', indexLabel: 'ANOVA' },
  { id: 'nonparametric', title: 'Непараметрические тесты', description: 'Что делать, если данные не нормальны? Сравните результаты параметрических и непараметрических тестов на данных шкал Лайкерта.', icon: Shuffle, path: '/labs/nonparametric', difficulty: 'intermediate', concepts: ['Манна-Уитни', 'Вилкоксон', 'Спирмен'], status: 'available', indexLabel: 'NONPARAM' },
  { id: 'binomial', title: 'Биномиальное распределение', description: 'Какова вероятность, что 15 из 20 пациентов покажут улучшение? Визуализируйте биномиальное распределение и его нормальное приближение.', icon: BarChart3, path: '/labs/binomial', difficulty: 'beginner', concepts: ['Биномиальное распределение', 'Нормальное приближение', 'z-тест для доли'], status: 'available', indexLabel: 'BINOMIAL' },
  { id: 'chisquare', title: 'Хи-квадрат (χ²)', description: 'Зависит ли выбор терапии от пола? Создавайте таблицы сопряжённости и проверяйте связь между категориальными переменными.', icon: Layers, path: '/labs/chisquare', difficulty: 'intermediate', concepts: ['Тест независимости', 'Ожидаемые частоты', 'V Крамера'], status: 'available', indexLabel: 'CHI-SQUARE' },
];

const LabsIndexPage = () => {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const sorted = useMemo(() => sortByDifficulty(labs), []);
  const visible = useMemo(
    () => (filter === 'all' ? sorted : sorted.filter((l) => l.difficulty === filter)),
    [sorted, filter],
  );

  const counts = {
    all: labs.length,
    beginner: labs.filter((l) => l.difficulty === 'beginner').length,
    intermediate: labs.filter((l) => l.difficulty === 'intermediate').length,
    advanced: labs.filter((l) => l.difficulty === 'advanced').length,
  };

  const completedCount = labs.filter((l) => getLabProgress(l.id)).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container py-12">
        {/* Hero */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
              # Labs · Интерактивные эксперименты
            </p>
            <h1 className="font-heading uppercase tracking-tight font-bold text-4xl md:text-6xl leading-[0.95]">
              Статистические
              <br />
              <span className="text-primary">лаборатории</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest">
            <Trophy className="w-5 h-5 text-primary" />
            <span>
              {completedCount}/{labs.length} пройдено
            </span>
          </div>
        </div>

        {/* Filter */}
        <DifficultyFilter value={filter} onChange={setFilter} counts={counts} />

        {/* Bento grid */}
        <motion.div
          key={filter}
          className="grid grid-cols-1 md:grid-cols-12 auto-rows-fr gap-5"
          initial="hidden"
          animate="visible"
          variants={tileGridMotion}
        >
          {visible.map((lab, i) => (
            <BentoTile
              key={lab.id}
              index={i}
              to={lab.status === 'available' ? lab.path : undefined}
              disabled={lab.status === 'coming-soon'}
              difficulty={lab.difficulty}
              badges={lab.concepts.slice(0, 2)}
              title={lab.title}
              description={lab.description}
              indexLabel={lab.indexLabel}
              icon={lab.icon}
            />
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default LabsIndexPage;
