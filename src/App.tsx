import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import TheoryPage from "./pages/TheoryPage";
import AboutPage from "./pages/AboutPage";
import LabsIndexPage from "./pages/LabsIndexPage";
import CoursesIndexPage from "./pages/CoursesIndexPage";
import CLTLabPage from "./pages/labs/CLTLabPage";
import SamplingLabPage from "./pages/labs/SamplingLabPage";
import ConfidenceLabPage from "./pages/labs/ConfidenceLabPage";
import HypothesisLabPage from "./pages/labs/HypothesisLabPage";
import RegressionLabPage from "./pages/labs/RegressionLabPage";
import CorrelationLabPage from "./pages/labs/CorrelationLabPage";
import TTestLabPage from "./pages/labs/TTestLabPage";
import ANOVALabPage from "./pages/labs/ANOVALabPage";
import NonParametricLabPage from "./pages/labs/NonParametricLabPage";
import BinomialLabPage from "./pages/labs/BinomialLabPage";
import ChiSquareLabPage from "./pages/labs/ChiSquareLabPage";
import MultipleRegressionLabPage from "./pages/labs/MultipleRegressionLabPage";
import EffectSizeLabPage from "./pages/labs/EffectSizeLabPage";
import DescriptiveStatsPage from "./pages/DescriptiveStatsPage";
import CalculatorsPage from "./pages/CalculatorsPage";
import SampleSizePage from "./pages/SampleSizePage";
import GlossaryPage from "./pages/GlossaryPage";
import GlossaryTermPage from "./pages/GlossaryTermPage";
import ResourcesPage from "./pages/ResourcesPage";
import FAQPage from "./pages/FAQPage";
import VisualizationLibraryPage from "./pages/VisualizationLibraryPage";
import DescriptiveStatsCourse from "./pages/courses/DescriptiveStatsCourse";
import ChiSquareCourse from "./pages/courses/ChiSquareCourse";
import ProbabilityTheoryPage from "./pages/ProbabilityTheoryPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/probability" element={<ProbabilityTheoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Labs */}
          <Route path="/labs" element={<LabsIndexPage />} />
          <Route path="/labs/clt" element={<CLTLabPage />} />
          <Route path="/labs/sampling" element={<SamplingLabPage />} />
          <Route path="/labs/confidence" element={<ConfidenceLabPage />} />
          <Route path="/labs/hypothesis" element={<HypothesisLabPage />} />
          <Route path="/labs/regression" element={<RegressionLabPage />} />
          <Route path="/labs/correlation" element={<CorrelationLabPage />} />
          <Route path="/labs/ttest" element={<TTestLabPage />} />
          <Route path="/labs/anova" element={<ANOVALabPage />} />
          <Route path="/labs/nonparametric" element={<NonParametricLabPage />} />
          <Route path="/labs/binomial" element={<BinomialLabPage />} />
          <Route path="/labs/chisquare" element={<ChiSquareLabPage />} />
          <Route path="/labs/multiple-regression" element={<MultipleRegressionLabPage />} />
          <Route path="/labs/effect-size" element={<EffectSizeLabPage />} />
          
          {/* Courses */}
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/sample-size" element={<SampleSizePage />} />
          <Route path="/courses" element={<CoursesIndexPage />} />
          <Route path="/courses/descriptive" element={<DescriptiveStatsCourse />} />
          <Route path="/courses/chisquare" element={<ChiSquareCourse />} />
          <Route path="/courses/probability" element={<TheoryPage />} />
          <Route path="/courses/inference" element={<TheoryPage />} />
          
          {/* Visual library */}
          <Route path="/visualizations" element={<VisualizationLibraryPage />} />
          
          {/* Info pages */}
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/glossary/:id" element={<GlossaryTermPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          
          {/* Auth & Dashboard */}
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />

          {/* Legacy routes — permanent client-side redirects (replace ⇒ no history entry) */}
          <Route path="/descriptive" element={<DescriptiveStatsPage />} />
          <Route path="/hypothesis" element={<Navigate to="/labs/hypothesis" replace />} />
          <Route path="/practice" element={<Navigate to="/descriptive" replace />} />
          <Route path="/trainer" element={<Navigate to="/labs" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
