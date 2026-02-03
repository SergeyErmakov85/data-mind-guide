import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  BarChart3, 
  Beaker, 
  FlaskConical, 
  TrendingUp,
  ArrowRight,
  Play
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
    description: 'Наблюдайте, как распределение выборочных средних сходится к нормальному независимо от исходного распределения. Изменяйте тип распределения и размер выборки.',
    icon: LineChart,
    path: '/labs/clt',
    difficulty: 'beginner',
    concepts: ['Выборочное распределение', 'Нормальное распределение', 'Закон больших чисел'],
    status: 'available',
  },
  {
    id: 'sampling',
    title: 'Выборочные статистики',
    description: 'Генерируйте случайные выборки и наблюдайте поведение статистик: среднего, дисперсии, стандартной ошибки. Изучите влияние размера выборки.',
    icon: BarChart3,
    path: '/labs/sampling',
    difficulty: 'beginner',
    concepts: ['Выборочное среднее', 'Стандартная ошибка', 'Смещение оценок'],
    status: 'available',
  },
  {
    id: 'confidence',
    title: 'Доверительные интервалы',
    description: 'Визуализируйте повторную выборку и построение доверительных интервалов. Следите за долей интервалов, покрывающих истинное значение параметра.',
    icon: Beaker,
    path: '/labs/confidence',
    difficulty: 'intermediate',
    concepts: ['Уровень доверия', 'Покрытие', 'Ширина интервала'],
    status: 'available',
  },
  {
    id: 'hypothesis',
    title: 'Проверка гипотез',
    description: 'Исследуйте концепции p-value и мощности теста. Наблюдайте влияние размера эффекта и размера выборки на статистическую значимость.',
    icon: FlaskConical,
    path: '/labs/hypothesis',
    difficulty: 'intermediate',
    concepts: ['P-value', 'Ошибки I и II рода', 'Мощность теста'],
    status: 'available',
  },
  {
    id: 'regression',
    title: 'Линейная регрессия',
    description: 'Создавайте данные с контролируемым уровнем шума и наблюдайте подгонку регрессионной линии. Исследуйте доверительные полосы и остатки.',
    icon: TrendingUp,
    path: '/labs/regression',
    difficulty: 'advanced',
    concepts: ['Метод наименьших квадратов', 'R²', 'Остатки'],
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
                  <Badge variant="outline" className={difficultyColors[lab.difficulty]}>
                    {difficultyLabels[lab.difficulty]}
                  </Badge>
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
