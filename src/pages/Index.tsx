import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  BarChart3, 
  FlaskConical, 
  TrendingUp, 
  Calculator, 
  GraduationCap,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

interface Module {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  path: string;
  color: string;
  external?: boolean;
}

const modules: Module[] = [
  {
    icon: GraduationCap,
    title: 'Теория',
    description: 'Интерактивные лекции с формулами и примерами из психологии',
    path: '/theory',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BarChart3,
    title: 'Описательная статистика',
    description: 'Среднее, медиана, дисперсия, визуализации данных',
    path: '/descriptive',
    color: 'bg-info/10 text-info',
  },
  {
    icon: FlaskConical,
    title: 'Проверка гипотез',
    description: 't-тест, ANOVA, χ², U-критерий Манна–Уитни',
    path: '/hypothesis',
    color: 'bg-success/10 text-success',
  },
  {
    icon: TrendingUp,
    title: 'Корреляция и регрессия',
    description: 'Пирсон, Спирмен, линейная регрессия',
    path: '/correlation',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: BarChart3,
    title: 'Однофакторный дисперсионный анализ',
    description: 'ANOVA — сравнение средних значений трёх и более групп',
    path: 'https://stats-anova-guide.lovable.app',
    color: 'bg-purple-500/10 text-purple-500',
    external: true,
  },
  {
    icon: Calculator,
    title: 'Практика',
    description: 'Загрузка данных и автоматический анализ',
    path: '/practice',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: FileText,
    title: 'Тренажёр',
    description: 'Задания с обратной связью и объяснением',
    path: '/trainer',
    color: 'bg-destructive/10 text-destructive',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Для бакалавриата и магистратуры</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Математическая статистика
              <span className="block gradient-text">для психологов</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Наглядное и практичное обучение статистическим методам с минимальным 
              формализмом и акцентом на интерпретацию результатов
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/theory">
                <Button size="lg" className="btn-primary gap-2">
                  Начать обучение
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/practice">
                <Button size="lg" variant="outline" className="gap-2">
                  <Calculator className="w-4 h-4" />
                  Перейти к практике
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">Учебные модули</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Последовательно изучайте статистику или выбирайте нужные темы
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const CardContent = (
              <>
                <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {module.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Перейти</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </>
            );

            return module.external ? (
              <a 
                key={module.path} 
                href={module.path}
                target="_blank"
                rel="noopener noreferrer"
                className="module-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {CardContent}
              </a>
            ) : (
              <Link 
                key={module.path} 
                to={module.path}
                className="module-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {CardContent}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Простой язык</h3>
              <p className="text-muted-foreground text-sm">
                Все концепции объясняются понятным языком с примерами из психологии
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Интерактивность</h3>
              <p className="text-muted-foreground text-sm">
                Визуализации, калькуляторы и моментальная обратная связь
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-warning" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Реальные кейсы</h3>
              <p className="text-muted-foreground text-sm">
                Анализ данных из реальных психологических исследований
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 СтатПси — Учебное приложение по статистике для психологов</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
