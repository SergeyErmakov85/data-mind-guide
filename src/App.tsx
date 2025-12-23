import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TheoryPage from "./pages/TheoryPage";
import DescriptiveStatsPage from "./pages/DescriptiveStatsPage";
import HypothesisTestingPage from "./pages/HypothesisTestingPage";
import PracticePage from "./pages/PracticePage";
import TrainerPage from "./pages/TrainerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/descriptive" element={<DescriptiveStatsPage />} />
          <Route path="/hypothesis" element={<HypothesisTestingPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/trainer" element={<TrainerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
