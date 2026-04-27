import { Header } from '@/components/Header';
import { NonParametricLab } from '@/components/labs/NonParametricLab';

const NonParametricLabPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main id="main-content" className="container py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Лаборатория: Непараметрические тесты
          </h1>
          <p className="text-muted-foreground text-lg">
            Сравните параметрические и непараметрические методы на данных с разной формой распределения
          </p>
        </div>
        <NonParametricLab />
      </div>
    </main>
  </div>
);

export default NonParametricLabPage;
