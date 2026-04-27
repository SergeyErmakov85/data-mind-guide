import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import LinearRegressionLab from '@/components/labs/LinearRegressionLab';
import RegressionInspector from '@/components/visualizations/RegressionInspector';

const RegressionLabPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container py-8">
        <div className="mb-6">
          <Link to="/labs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к лабораториям
            </Button>
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            Линейная регрессия
          </h1>
          <p className="text-muted-foreground text-lg">
            Исследуйте метод наименьших квадратов: генерируйте данные с контролируемым шумом, 
            наблюдайте подгонку линии и анализируйте остатки.
          </p>
        </div>
        
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-semibold mb-4">Инспектор регрессии</h2>
          <p className="text-muted-foreground mb-6">
            Полная диагностика на ваших данных: confidence band, остатки, Q-Q plot, Cook's distance,
            робастные SE (HC3).
          </p>
          <RegressionInspector />
        </section>

        <section>
          <h2 className="font-heading text-2xl font-semibold mb-4">Симуляция: МНК с нуля</h2>
          <LinearRegressionLab />
        </section>
      </main>
    </div>
  );
};

export default RegressionLabPage;
