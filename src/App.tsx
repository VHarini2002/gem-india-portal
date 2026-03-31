import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Suspense, lazy } from "react";
import Loader, { FullScreenLoader } from "@/components/ui/loader";
import ChatWidget from "./components/ChatWidget";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EngineDetail = lazy(() => import("./pages/EngineDetail"));
const Help = lazy(() => import("./pages/Help"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PublicPartsCatalog = lazy(() => import("./pages/PublicPartsCatalog"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Loader />
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/gem-india-portal/">
            <Suspense fallback={<FullScreenLoader />}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/engine/:id" element={<EngineDetail />} />
                <Route path="/help" element={<Help />} />
                <Route path="/catalog" element={<PublicPartsCatalog />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ChatWidget />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
