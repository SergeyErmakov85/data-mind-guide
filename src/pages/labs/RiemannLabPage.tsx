import { Header } from '@/components/Header';
import RiemannIntegralLab from '@/components/labs/RiemannIntegralLab';
import RiemannProblems from '@/components/labs/RiemannProblems';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RiemannLabPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/labs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Все лаборатории
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 uppercase tracking-tight">
            Интеграл Римана в психологии
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Интерактивная визуализация интегрального исчисления через задачи психологии и статистики.
            Изучите, как накопленные процессы (тревога, стресс, восстановление) описываются через понятие площади под кривой.
          </p>
        </div>

        {/* Theory & Visualizations */}
        <RiemannIntegralLab />

        {/* Problems */}
        <div className="mt-8">
          <RiemannProblems />
        </div>
      </main>
    </div>
  );
};

export default RiemannLabPage;
