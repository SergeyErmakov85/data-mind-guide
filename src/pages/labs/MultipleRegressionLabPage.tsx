import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MultipleRegressionLab from '@/components/labs/MultipleRegressionLab';
import RegressionInspector from '@/components/visualizations/RegressionInspector';

const MultipleRegressionLabPage = () => (
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
        <h1 className="font-heading text-3xl font-bold mb-2">Множественная регрессия</h1>
        <p className="text-muted-foreground text-lg">
          Исследуйте влияние нескольких предикторов одновременно: коэффициенты, R² adjusted, 
          F-тест и мультиколлинеарность (VIF).
        </p>
      </div>
      <section className="mb-12">
        <h2 className="font-heading text-2xl font-semibold mb-4">Инспектор регрессии</h2>
        <p className="text-muted-foreground mb-6">
          Загрузите CSV или выберите датасет — получите коэффициенты, R²/F, диагностические графики
          и опционально HC3 робастные SE.
        </p>
        <RegressionInspector />
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold mb-4">Симуляция: множественные предикторы</h2>
        <MultipleRegressionLab />
      </section>
    </main>
  </div>
);

export default MultipleRegressionLabPage;
