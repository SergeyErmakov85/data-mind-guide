import { Header } from '@/components/Header';
import { CorrelationLab } from '@/components/labs/CorrelationLab';
import { CorrelationExplorer } from '@/components/visualizations/CorrelationExplorer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatasetHandoffBanner } from '@/components/DatasetHandoffBanner';

const CorrelationLabPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container py-8">
        <div className="mb-6">
          <Link to="/labs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Все лаборатории
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            Корреляция и ковариация
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Исследуйте связь между переменными: генерируйте данные с заданной корреляцией, 
            добавляйте выбросы и наблюдайте их влияние на коэффициент Пирсона. 
            Пример: связь тревожности и академической успеваемости.
          </p>
        </div>

        <DatasetHandoffBanner />

        <section className="mb-12">
          <h2 className="font-serif text-2xl mb-4">Интерактивный исследователь корреляций</h2>
          <CorrelationExplorer />
        </section>

        <CorrelationLab />
      </main>
    </div>
  );
};

export default CorrelationLabPage;
