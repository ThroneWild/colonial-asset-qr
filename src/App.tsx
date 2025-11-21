import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import { UpdateNotification } from "@/components/UpdateNotification";
import Index from "./pages/Index";
import Labels from "./pages/Labels";
import AssetView from "./pages/AssetView";
import Auth from "./pages/Auth";
import AllAssets from "./pages/AllAssets";
import Dashboard from "./pages/Dashboard";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import AuditLogs from "./pages/AuditLogs";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import MaintenanceCalendar from "./pages/MaintenanceCalendar";
import ApartmentReport from "./pages/ApartmentReport";
import Download from "./pages/Download";
import DownloadThanks from "./pages/DownloadThanks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UpdateNotification />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AppLayout><Index /></AppLayout>} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/maintenance" element={<AppLayout><MaintenanceDashboard /></AppLayout>} />
            <Route path="/maintenance/calendar" element={<AppLayout><MaintenanceCalendar /></AppLayout>} />
            <Route path="/assets" element={<AppLayout><AllAssets /></AppLayout>} />
            <Route path="/auditoria" element={<AppLayout><AuditLogs /></AppLayout>} />
            <Route path="/labels" element={<AppLayout><Labels /></AppLayout>} />
            <Route path="/users" element={<AppLayout><UserManagement /></AppLayout>} />
            <Route path="/apartamentos" element={<AppLayout><ApartmentReport /></AppLayout>} />
            <Route path="/asset/:id" element={<AssetView />} />
            <Route path="/download" element={<Download />} />
            <Route path="/download/thanks" element={<DownloadThanks />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
