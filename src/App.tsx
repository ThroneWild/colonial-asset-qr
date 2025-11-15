import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Labels from "./pages/Labels";
import AssetView from "./pages/AssetView";
import Auth from "./pages/Auth";
import AllAssets from "./pages/AllAssets";
import Dashboard from "./pages/Dashboard";
import AuditLogs from "./pages/AuditLogs";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import MaintenanceCalendar from "./pages/MaintenanceCalendar";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="maintenance" element={<MaintenanceDashboard />} />
              <Route path="maintenance/calendar" element={<MaintenanceCalendar />} />
              <Route path="assets" element={<AllAssets />} />
              <Route path="auditoria" element={<AuditLogs />} />
              <Route path="labels" element={<Labels />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="asset/:id" element={<AssetView />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
