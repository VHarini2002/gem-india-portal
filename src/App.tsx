import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EngineDetail from "./pages/EngineDetail";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/engine/:id" element={<EngineDetail />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
