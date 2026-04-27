import { Header } from '@/components/Header';
import ChiSquareLab from '@/components/labs/ChiSquareLab';

const ChiSquareLabPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main id="main-content" className="container py-8">
      <div className="max-w-5xl mx-auto">
        <ChiSquareLab />
      </div>
    </main>
  </div>
);

export default ChiSquareLabPage;
