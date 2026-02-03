import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { 
  BookOpen, 
  BarChart3, 
  FlaskConical, 
  GraduationCap,
  ArrowRight,
  Beaker,
  LineChart,
  TrendingUp,
  Lightbulb,
  PlayCircle,
  Library
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LabPreview {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  path: string;
  color: string;
}

const featuredLabs: LabPreview[] = [
  {
    icon: LineChart,
    title: 'Центральная предельная теорема',
    description: 'Наблюдайте сходимость к нормальному распределению в реальном времени',
    path: '/labs/clt',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BarChart3,
    title: 'Выборочные статистики',
    description: 'Генерируйте выборки и изучайте поведение статистик',
    path: '/labs/sampling',
    color: 'bg-info/10 text-info',
  },
  {
    icon: Beaker,
    title: 'Доверительные интервалы',
    description: 'Визуализация покрытия и интерпретация ДИ',
    path: '/labs/confidence',
    color: 'bg-success/10 text-success',
  },
  {
    icon: FlaskConical,
    title: 'Проверка гипотез',
    description: 'P-value, мощность теста и размер эффекта',
    path: '/labs/hypothesis',
    color: 'bg-warning/10 text-warning',
  },
];

const features = [
  {
    icon: PlayCircle,
    title: 'Интерактивные эксперименты',
    description: 'Каждая концепция сопровождается симуляцией, которую вы контролируете',
  },
  {
    icon: Lightbulb,
    title: 'Интуиция важнее формул',
    description: 'Сначала понимание через визуализацию, затем формализация',
  },
  {
    icon: Library,
    title: 'Структурированные курсы',
    description: 'От базовых концепций к продвинутым методам анализа',
  },
];

const Index = () => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleCards((prev) => new Set(prev).add(index));
                observer.disconnect();
              }
            });
          },
          { threshold: 0.1, rootMargin: '50px' }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Beaker className="w-4 h-4" />
              <span>Интерактивная образовательная платформа</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Статистика через
              <span className="block gradient-text">эксперименты</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Понимайте статистические концепции не через формулы, а через интерактивные 
              симуляции. Меняйте параметры — наблюдайте закономерности.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/labs">
                <Button size="lg" className="btn-primary gap-2">
                  <Beaker className="w-4 h-4" />
                  Открыть лаборатории
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/theory">
                <Button size="lg" variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Справочник теории
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Labs */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Лаборатории</Badge>
          <h2 className="font-heading text-3xl font-bold mb-4">Интерактивные эксперименты</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Каждая лаборатория — это симуляция статистического явления с полным контролем параметров
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredLabs.map((lab, index) => (
            <div
              key={lab.path}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`transition-all duration-500 ${
                visibleCards.has(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link 
                to={lab.path}
                className="module-card group block h-full"
              >
                <div className={`w-12 h-12 rounded-lg ${lab.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <lab.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {lab.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {lab.description}
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Запустить</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/labs">
            <Button variant="outline" size="lg" className="gap-2">
              Все лаборатории
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Почему это работает</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Наш подход основан на принципах активного обучения и визуализации
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-transparent shadow-none">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Курсы</CardTitle>
                  <CardDescription>Структурированное обучение</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Последовательное изучение статистики: от описательных методов 
                до продвинутого анализа данных.
              </p>
              <Link to="/courses/descriptive">
                <Button variant="outline" className="gap-2">
                  Начать курс
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle>Справочник</CardTitle>
                  <CardDescription>Теория и формулы</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Краткий справочник по основным концепциям, формулам 
                и интерпретации результатов.
              </p>
              <Link to="/theory">
                <Button variant="outline" className="gap-2">
                  Открыть справочник
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Математическая статистика для психологов — Интерактивная образовательная платформа</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
