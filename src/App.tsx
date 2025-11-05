import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { queryClient } from "@/lib/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, ChevronDown, User, LogOut, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser, useSignOut } from "@/lib/hooks/useAuth";
import authService from "@/services/authService";
import DashboardPage from "./pages/DashboardPage";
import ReservationsPage from "./pages/ReservationsPage";
import AllReservationsPage from "./pages/AllReservationsPage";
import ReservationEditPage from "./pages/ReservationEditPage";
import BookQuotePage from "./pages/BookQuotePage";
import QuotesPage from "./pages/QuotesPage";
import QuoteEditFormPage from "./pages/QuoteEditFormPage";
import { SharedQuotePage } from "./pages/SharedQuotePage";
import CustomersPage from "./pages/CustomersPage";
import FinancialPage from "./pages/FinancialPage";
import SalesCommissionsPage from "./pages/SalesCommissionsPage";
import ServicesPage from "./pages/ServicesPage";
import ToursPage from "./pages/ToursPage";
import LogisticsPage from "./pages/LogisticsPage";
import LogisticsOperationsPage from "./pages/LogisticsOperationsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import { isUserPendingApproval } from "./lib/utils/userApproval";

const MainLayout = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Get current user from localStorage and auth hooks
  const { data: currentUser } = useCurrentUser();
  const { signOut, isPending: isSigningOut } = useSignOut();
  
  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  // Redirect to pending approval page if user is not approved
  useEffect(() => {
    if (currentUser && isUserPendingApproval(currentUser)) {
      navigate('/pending-approval');
      return;
    }
  }, [currentUser, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isLanguageOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageOpen, isUserMenuOpen]);

  // Show loading or redirect if no user data (after all hooks)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render main layout if user is pending approval
  if (isUserPendingApproval(currentUser)) {
    return null;
  }

  const languages = [
    { code: 'es', name: 'Español', country: 'Spain', flag: '/flags/spain.jpg' },
    { code: 'pt', name: 'Português', country: 'Brazil', flag: '/flags/brazil.jpg' },
    { code: 'en', name: 'English', country: 'United States', flag: '/flags/us.jpg' }
  ];

  const selectedLanguage = languages.find(lang => lang.code === language) || languages[2];

  return (
      <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="sticky top-0 h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 z-50">
                  <div className="flex items-center">
                    <SidebarTrigger className="mr-4" />
                    <img 
                      src="/logo1.png" 
                      alt="Zenith Travel Ops" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">{t('navbar.currency')}</span>
                    
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                      >
                        <img 
                          src={selectedLanguage.flag} 
                          alt={selectedLanguage.country}
                          className="w-6 h-4 object-cover rounded-sm"
                        />
                        <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isLanguageOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border z-[99999]" style={{ zIndex: 99999 }}>
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code as 'en' | 'es' | 'pt');
                                setIsLanguageOpen(false);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                            >
                              <img 
                                src={lang.flag} 
                                alt={lang.country}
                                className="w-7 h-5 object-cover rounded-sm"
                              />
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{lang.country}</span>
                                <span className="text-xs text-muted-foreground">{lang.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button className="relative p-2 rounded-md hover:bg-accent transition-colors">
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                      >
                        {currentUser.avatar ? (
                          <img 
                            src={currentUser.avatar} 
                            alt={currentUser.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="text-left hidden md:block">
                          <p className="text-sm font-medium">{currentUser.fullName}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border z-[99999]" style={{ zIndex: 99999 }}>
                          <div className="p-3 border-b">
                            <p className="text-sm font-medium">{currentUser.fullName}</p>
                            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                            {!currentUser.isVerified && (
                              <p className="text-xs text-yellow-600 mt-1">Email not verified</p>
                            )}
                          </div>
                          <div className="p-1">
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors rounded-md"
                            >
                              <UserCircle className="h-4 w-4" />
                              <span>{t('navbar.profile')}</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                signOut();
                              }}
                              disabled={isSigningOut}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors rounded-md text-destructive disabled:opacity-50"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>{isSigningOut ? 'Logging out...' : t('navbar.logout')}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </header>
              <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/reservation-calendar" element={<ReservationsPage />} />
                  <Route path="/all-reservations" element={<AllReservationsPage />} />
                  <Route path="/reservations/:reservationId/edit" element={<ReservationEditPage />} />
                  <Route path="/quotes" element={<BookQuotePage />} />
                  <Route path="/my-quotes" element={<QuotesPage />} />
                  <Route path="/quotes/:quoteId/edit" element={<QuoteEditFormPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/financial" element={<FinancialPage />} />
                  <Route path="/sales-commissions" element={<SalesCommissionsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/tours" element={<ToursPage />} />
                  <Route path="/logistics" element={<LogisticsOperationsPage />} />
                  <Route path="/logistics-old" element={<LogisticsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/quotes/share/:shareId" element={<SharedQuotePage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
