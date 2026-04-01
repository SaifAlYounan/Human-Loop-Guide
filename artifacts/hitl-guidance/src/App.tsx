import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ChecklistPage from "@/pages/ChecklistPage";
import AnalysisPage from "@/pages/AnalysisPage";
import ReportPage from "@/pages/ReportPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/documents" component={DocumentsPage} />
            <Route path="/checklist" component={ChecklistPage} />
            <Route path="/analysis" component={AnalysisPage} />
            <Route path="/report" component={ReportPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster richColors position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
