import { Header } from '@/components/Header';
import { EffectSizeLab } from '@/components/labs/EffectSizeLab';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EffectSizeLabPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
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
            Размер эффекта
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Исследуйте d Коэна, η² и r Пирсона — ключевые метрики практической 
            значимости в психологических исследованиях. Визуализируйте, как параметры 
            групп влияют на размер эффекта.
          </p>
        </div>

        <EffectSizeLab />
      </main>
    </div>
  );
};

export default EffectSizeLabPage;
