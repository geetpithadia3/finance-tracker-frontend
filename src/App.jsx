// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

// Import your components
import TransactionsList from './components/transactions/components/TransactionsList';
import Dashboard from './components/dashboard/components/Dashboard';
import Configuration from './components/configuration/Configuration';
import { BudgetDashboard } from './components/budget/components/BudgetDashboard';
import Avvvatars from 'avvvatars-react'
import SmartAllocation from './components/allocation/SmartAllocation';
import HowItWorks from './components/HowItWorks';
import Welcome from './components/Welcome';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import GoalDashboard from './components/budget/components/GoalDashboard';

import { 
  Menu,
  LayoutDashboard, 
  ListOrdered,
  LogOut,
  Settings,
  PiggyBank,
  Calculator,
  HelpCircle,
  Moon,
  Sun,
  Target,
} from 'lucide-react';

// Import the API client to use the theme functions
import { apiClient } from './api/client';

const MainNav = ({ collapsed, className, onNavClick, ...props }) => {
  const NavItem = ({ icon: Icon, children, to }) => {
    const content = (
      <>
        <Icon className="h-4 w-4" />
        {!collapsed && <span className="text-sm sm:text-base">{children}</span>}
      </>
    );

    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "text-sm sm:text-base",
          collapsed && "justify-center px-2"
        )}
        onClick={onNavClick}
      >
        {onNavClick ? (
          <SheetClose className="flex w-full items-center gap-2">
            {content}
          </SheetClose>
        ) : (
          content
        )}
      </Link>
    );
  };

  return (
    <nav className={cn("flex flex-col gap-1", className)} {...props}>
      <NavItem icon={LayoutDashboard} to="/">Dashboard</NavItem>
      <NavItem icon={ListOrdered} to="/transactions">Transactions</NavItem>
      <NavItem icon={PiggyBank} to="/budget">Budget</NavItem>
      <NavItem icon={Target} to="/goals">Goals</NavItem>
      <NavItem icon={Calculator} to="/allocation">Smart Allocation</NavItem>
    </nav>
  );
};

const UserNav = ({ onLogout, username }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative p-0 h-8 w-8 rounded-full overflow-hidden cursor-pointer">
          <Avvvatars value={username} style="shape" size={32} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem asChild>
          <Link to="/configuration">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuration</span>
          </Link>
        </DropdownMenuItem>
        {/* Keep logout for UI consistency, but it just reloads the page */}
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Sidebar = ({ collapsed, className, onNavClick, showHeader = true }) => {
  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {showHeader && (
        <div className="flex h-14 items-center border-b px-3 justify-center">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-sm sm:text-lg">Sumi</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="flex items-center justify-center">
              <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Link>
          )}
        </div>
      )}
      <ScrollArea className="flex-1 p-2 sm:p-3">
        <MainNav collapsed={collapsed} onNavClick={onNavClick} />
      </ScrollArea>
    </div>
  );
};

const AppContent = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState(user?.username || 'User');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 1023;
      setIsMobile(newIsMobile);
      if (window.innerWidth <= 1280 && window.innerWidth > 1023) {
        setCollapsed(true);
      } else if (window.innerWidth > 1280) {
        setCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const newTheme = apiClient.toggleTheme();
    setTheme(newTheme);
  };

  const handleLogout = () => {
    logout();
  };

  const MainLayout = ({ children }) => (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar - only visible on lg screens and above */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen z-30" style={{ width: collapsed ? '64px' : '256px' }}>
        <Sidebar collapsed={collapsed} className="h-full" />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full" 
           style={{ marginLeft: isMobile ? '0' : (collapsed ? '64px' : '256px') }}>
        {/* Header */}
        <header className="h-14 border-b bg-background px-4 flex items-center justify-between fixed z-20 w-full"
               style={{ 
                 left: isMobile ? '0' : (collapsed ? '64px' : '256px'),
                 width: isMobile ? '100%' : `calc(100% - ${collapsed ? '64px' : '256px'})`
               }}>
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[260px] sm:w-[300px]">
                  <SheetHeader className="h-14 px-3 sm:px-4 border-b flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <SheetTitle className="text-left text-sm sm:text-base">Sumi Finance</SheetTitle>
                    </div>
                  </SheetHeader>
                  <div className="h-[calc(100vh-3.5rem)]">
                    <Sidebar 
                      collapsed={false} 
                      onNavClick={() => setIsSheetOpen(false)}
                      showHeader={false}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <div className="lg:hidden flex items-center gap-2">
              <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="font-semibold text-sm sm:text-base">Sumi</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="How It Works"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <HowItWorks />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mr-2"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <UserNav onLogout={handleLogout} username={username} />
          </div>
        </header>

        {/* Main Content Area - add padding top to account for fixed header */}
        <main className="flex-1 pt-14">
          <div className="container mx-auto p-4 sm:p-6 max-w-full xl:max-w-[1280px] 2xl:max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute>
            <MainLayout>
              <TransactionsList />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/configuration" element={
          <PrivateRoute>
            <MainLayout>
              <Configuration />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/budget" element={
          <PrivateRoute>
            <MainLayout>
              <BudgetDashboard />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/allocation" element={
          <PrivateRoute>
            <MainLayout>
              <SmartAllocation />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/how-it-works" element={
          <PrivateRoute>
            <MainLayout>
              <HowItWorks />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/welcome" element={
          <PrivateRoute>
            <MainLayout>
              <Welcome />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/goals" element={
          <PrivateRoute>
            <MainLayout>
              <GoalDashboard />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  );
};

export default App; 