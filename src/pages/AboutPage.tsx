import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Users, 
  Lightbulb, 
  Code,
  BookOpen,
  BarChart3,
  FlaskConical
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              О проекте <span className="gradient-text">DataMind</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Интерактивная образовательная платформа для изучения статистики 
              через эксперименты и визуализации
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Наша миссия
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Мы верим, что статистика — это не набор формул для заучивания, 
                а способ понимания мира через данные. Наша цель — сделать статистические 
                концепции интуитивно понятными через интерактивные эксперименты.
              </p>
              <p>
                Каждая лаборатория на нашей платформе позволяет вам самостоятельно 
                исследовать статистические закономерности, менять параметры и наблюдать 
                результаты в реальном времени.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <FlaskConical className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Интерактивные лаборатории</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Экспериментируйте с параметрами и наблюдайте статистические 
                закономерности в действии
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-2">
                  <BarChart3 className="w-6 h-6 text-success" />
                </div>
                <CardTitle className="text-lg">Визуализации</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Понимайте сложные концепции через наглядные графики 
                и анимации
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-warning" />
                </div>
                <CardTitle className="text-lg">Структурированные курсы</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Последовательное изучение от базовых концепций 
                к продвинутым методам
              </CardContent>
            </Card>
          </div>

          {/* Audience */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Для кого эта платформа
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Студенты психологии, социологии, экономики и других направлений</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Исследователи, которые хотят углубить понимание статистических методов</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Аналитики данных, развивающие статистическую интуицию</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Преподаватели, ищущие интерактивные материалы для занятий</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Philosophy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Принципы обучения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Визуализация важнее формул</h4>
                  <p className="text-muted-foreground text-sm">
                    Каждая концепция сначала показывается визуально, 
                    формулы добавляются для формализации понимания
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Эксперимент важнее чтения</h4>
                  <p className="text-muted-foreground text-sm">
                    Активное взаимодействие с данными создает более 
                    глубокое понимание, чем пассивное чтение
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Интуиция важнее механики</h4>
                  <p className="text-muted-foreground text-sm">
                    Мы фокусируемся на том, ПОЧЕМУ методы работают, 
                    а не только на том, КАК их применять
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Контекст важнее абстракции</h4>
                  <p className="text-muted-foreground text-sm">
                    Все примеры взяты из реальных исследований 
                    и практических задач
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Технологии
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Платформа построена на современном стеке: React, TypeScript, 
                Recharts для визуализаций, KaTeX для математических формул. 
                Все лаборатории работают прямо в браузере без необходимости 
                установки дополнительного ПО.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
