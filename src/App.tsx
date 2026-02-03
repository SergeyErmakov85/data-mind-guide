import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TheoryPage from "./pages/TheoryPage";
import AboutPage from "./pages/AboutPage";
import LabsIndexPage from "./pages/LabsIndexPage";
import CLTLabPage from "./pages/labs/CLTLabPage";
import SamplingLabPage from "./pages/labs/SamplingLabPage";
import ConfidenceLabPage from "./pages/labs/ConfidenceLabPage";
import HypothesisLabPage from "./pages/labs/HypothesisLabPage";
import DescriptiveStatsPage from "./pages/DescriptiveStatsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Labs */}
          <Route path="/labs" element={<LabsIndexPage />} />
          <Route path="/labs/clt" element={<CLTLabPage />} />
          <Route path="/labs/sampling" element={<SamplingLabPage />} />
          <Route path="/labs/confidence" element={<ConfidenceLabPage />} />
          <Route path="/labs/hypothesis" element={<HypothesisLabPage />} />
          
          {/* Courses (redirect to descriptive for now) */}
          <Route path="/courses/descriptive" element={<DescriptiveStatsPage />} />
          <Route path="/courses/probability" element={<TheoryPage />} />
          <Route path="/courses/inference" element={<TheoryPage />} />
          
          {/* Legacy routes - redirect */}
          <Route path="/descriptive" element={<DescriptiveStatsPage />} />
          <Route path="/hypothesis" element={<HypothesisLabPage />} />
          <Route path="/practice" element={<DescriptiveStatsPage />} />
          <Route path="/trainer" element={<LabsIndexPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
