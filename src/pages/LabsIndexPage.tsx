import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBadge } from '@/components/ProgressIndicators';
import { getLabProgress, getTotalProgress } from '@/lib/progress';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  BarChart3, 
  Beaker, 
  FlaskConical, 
  TrendingUp,
  ArrowRight,
  Play,
  Sigma,
  ScatterChart,
  Layers,
  Shuffle,
  Trophy
} from 'lucide-react';

interface Lab {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
  status: 'available' | 'coming-soon';
}

const labs: Lab[] = [
  {
    id: 'clt',
    title: 'Центральная предельная теорема',
    description: 'Почему результаты тестов IQ распределены нормально? Наблюдайте, как распределение выборочных средних сходится к нормальному — это объясняет, почему многие психологические переменные имеют колоколообразную форму.',
    icon: LineChart,
    path: '/labs/clt',
    difficulty: 'beginner',
    concepts: ['Выборочное распределение', 'Нормальное распределение', 'Закон больших чисел'],
    status: 'available',
  },
  {
    id: 'sampling',
    title: 'Выборочные статистики',
    description: 'Сколько участников нужно для исследования тревожности? Генерируйте выборки и изучайте, как размер группы влияет на точность оценки среднего балла по шкале.',
    icon: BarChart3,
    path: '/labs/sampling',
    difficulty: 'beginner',
    concepts: ['Выборочное среднее', 'Стандартная ошибка', 'Смещение оценок'],
    status: 'available',
  },
  {
    id: 'confidence',
    title: 'Доверительные интервалы',
    description: 'Как интерпретировать «среднее 45±3 балла по шкале депрессии»? Визуализируйте, что означает 95% доверительный интервал через повторные выборки из популяции.',
    icon: Beaker,
    path: '/labs/confidence',
    difficulty: 'intermediate',
    concepts: ['Уровень доверия', 'Покрытие', 'Ширина интервала'],
    status: 'available',
  },
  {
    id: 'hypothesis',
    title: 'Проверка гипотез',
    description: 'Работает ли когнитивно-поведенческая терапия? Исследуйте p-value и мощность теста — ключевые понятия для оценки эффективности психологических интервенций.',
    icon: FlaskConical,
    path: '/labs/hypothesis',
    difficulty: 'intermediate',
    concepts: ['P-value', 'Ошибки I и II рода', 'Мощность теста'],
    status: 'available',
  },
  {
    id: 'regression',
    title: 'Линейная регрессия',
    description: 'Предсказывает ли уровень стресса академическую успеваемость? Стройте регрессионные модели и анализируйте силу связи между психологическими переменными.',
    icon: TrendingUp,
    path: '/labs/regression',
    difficulty: 'advanced',
    concepts: ['Метод наименьших квадратов', 'R²', 'Остатки'],
    status: 'available',
  },
  {
    id: 'correlation',
    title: 'Корреляция и ковариация',
    description: 'Связаны ли тревожность и успеваемость? Генерируйте данные с заданной корреляцией, добавляйте выбросы и наблюдайте их влияние на коэффициент Пирсона.',
    icon: ScatterChart,
    path: '/labs/correlation',
    difficulty: 'beginner',
    concepts: ['Корреляция Пирсона', 'Ковариация', 'Выбросы'],
    status: 'available',
  },
  {
    id: 'ttest',
    title: 't-тесты',
    description: 'Работает ли терапия? Сравните уровень депрессии до и после лечения с помощью одновыборочного, независимого и парного t-тестов.',
    icon: Sigma,
    path: '/labs/ttest',
    difficulty: 'intermediate',
    concepts: ['t-статистика', 'd Коэна', 'Степени свободы'],
    status: 'available',
  },
  {
    id: 'anova',
    title: 'ANOVA (Дисперсионный анализ)',
    description: 'Какой метод терапии эффективнее? Сравните средние трёх и более групп, изучите F-статистику, таблицу ANOVA и размер эффекта η².',
    icon: Layers,
    path: '/labs/anova',
    difficulty: 'advanced',
    concepts: ['F-статистика', 'η² (eta-квадрат)', 'Post-hoc тесты'],
    status: 'available',
  },
  {
    id: 'nonparametric',
    title: 'Непараметрические тесты',
    description: 'Что делать, если данные не нормальны? Сравните результаты параметрических и непараметрических тестов на данных шкал Лайкерта.',
    icon: Shuffle,
    path: '/labs/nonparametric',
    difficulty: 'intermediate',
    concepts: ['Манна-Уитни', 'Вилкоксон', 'Спирмен'],
    status: 'available',
  },
  {
    id: 'binomial',
    title: 'Биномиальное распределение',
    description: 'Какова вероятность, что 15 из 20 пациентов покажут улучшение? Визуализируйте биномиальное распределение и его нормальное приближение.',
    icon: BarChart3,
    path: '/labs/binomial',
    difficulty: 'beginner',
    concepts: ['Биномиальное распределение', 'Нормальное приближение', 'z-тест для доли'],
    status: 'available',
  },
  {
    id: 'chisquare',
    title: 'Хи-квадрат (χ²)',
    description: 'Зависит ли выбор терапии от пола? Создавайте таблицы сопряжённости и проверяйте связь между категориальными переменными.',
    icon: Layers,
    path: '/labs/chisquare',
    difficulty: 'intermediate',
    concepts: ['Тест независимости', 'Ожидаемые частоты', 'V Крамера'],
    status: 'available',
  },
];

const difficultyColors = {
  beginner: 'bg-success/10 text-success border-success/20',
  intermediate: 'bg-warning/10 text-warning border-warning/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

const difficultyLabels = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

const LabsIndexPage = () => {
  const totalProgress = getTotalProgress();
  const completedCount = labs.filter(l => getLabProgress(l.id)).length;
  const progressPercent = labs.length > 0 ? Math.round((completedCount / labs.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Beaker className="w-4 h-4" />
            <span>Интерактивные эксперименты</span>
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Статистические <span className="gradient-text">лаборатории</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Исследуйте статистические концепции через интерактивные симуляции. 
            Меняйте параметры и наблюдайте закономерности в реальном времени.
          </p>
        </div>

        {/* Progress Summary */}
        {completedCount > 0 && (
          <div className="mb-8 p-6 rounded-xl border bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold">Ваш прогресс</span>
              <span className="text-sm text-muted-foreground ml-auto">{completedCount} из {labs.length} лабораторий</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Labs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {labs.map((lab) => (
            <Card 
              key={lab.id} 
              className={`group transition-all duration-300 hover:shadow-lg ${
                lab.status === 'coming-soon' ? 'opacity-60' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <lab.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getLabProgress(lab.id) && <ProgressBadge completed={true} />}
                    <Badge variant="outline" className={difficultyColors[lab.difficulty]}>
                      {difficultyLabels[lab.difficulty]}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl">{lab.title}</CardTitle>
                <CardDescription className="text-base">{lab.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {lab.concepts.map((concept) => (
                    <Badge key={concept} variant="secondary" className="text-xs">
                      {concept}
                    </Badge>
                  ))}
                </div>
                
                {lab.status === 'available' ? (
                  <Link to={lab.path}>
                    <Button className="w-full gap-2">
                      <Play className="w-4 h-4" />
                      Запустить лабораторию
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full gap-2">
                    Скоро
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LabsIndexPage;
