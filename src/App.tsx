import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardPage from "./pages/DashboardPage";
import ReservationsPage from "./pages/ReservationsPage";
import AllReservationsPage from "./pages/AllReservationsPage";
import BookQuotePage from "./pages/BookQuotePage";
import QuotesPage from "./pages/QuotesPage";
import { QuoteDetailPage } from "./pages/QuoteDetailPage";
import { SharedQuotePage } from "./pages/SharedQuotePage";
import CustomersPage from "./pages/CustomersPage";
import FinancialPage from "./pages/FinancialPage";
import SalesCommissionsPage from "./pages/SalesCommissionsPage";
import ServicesPage from "./pages/ServicesPage";
import LogisticsPage from "./pages/LogisticsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                <SidebarTrigger className="mr-4" />
                <img 
                  src="/logo1.png" 
                  alt="Zenith Travel Ops" 
                  className="w-10 h-10 object-contain"
                />
              </header>
              <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/reservations" element={<ReservationsPage />} />
                  <Route path="/all-reservations" element={<AllReservationsPage />} />
                  <Route path="/quotes" element={<BookQuotePage />} />
                  <Route path="/my-quotes" element={<QuotesPage />} />
                  <Route path="/quotes/:quoteId" element={<QuoteDetailPage />} />
                  <Route path="/quotes/share/:shareId" element={<SharedQuotePage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/financial" element={<FinancialPage />} />
                  <Route path="/sales-commissions" element={<SalesCommissionsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/tours" element={<ServicesPage />} />
                  <Route path="/logistics" element={<LogisticsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/support" element={<SettingsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
