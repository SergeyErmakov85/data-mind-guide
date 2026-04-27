import { Header } from '@/components/Header';
import { TTestLab } from '@/components/labs/TTestLab';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TTestLabPage = () => {
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
            t-тесты
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Сравнивайте средние значения между группами: одновыборочный, независимый 
            и парный t-тесты. Пример: сравнение уровня депрессии до и после 
            когнитивно-поведенческой терапии.
          </p>
        </div>

        <TTestLab />
      </main>
    </div>
  );
};

export default TTestLabPage;
