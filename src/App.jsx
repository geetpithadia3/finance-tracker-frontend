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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

// Import your components
import TransactionsList from './components/TransactionsList';
// import GoalsList from './components/GoalsList';
import ManageAccounts from './components/account/ManageAccounts';
import Login from './components/login/components/Login';
import Register from './components/register/components/Register';
import Dashboard from './components/dashboard/components/Dashboard';
import Configuration from './components/configuration/Configuration';
import { Toaster } from "@/components/ui/toaster"
import Budget from './components/budget/components/Budget';
import BudgetConfiguration from './components/budget/components/BudgetConfiguration';
import Avvvatars from 'avvvatars-react'

import { 
  Menu,
  LayoutDashboard, 
  Wallet,
  ListOrdered,
  Target,
  LogOut,
  Settings,
  PiggyBank,
} from 'lucide-react';

import moment from 'moment';
import { sessionManager } from '@/utils/session';

const MainNav = ({ collapsed, className, onNavClick, ...props }) => {
  const NavItem = ({ icon: Icon, children, to }) => {
    const content = (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          collapsed && "justify-center px-2"
        )}
        onClick={onNavClick}
      >
        <Icon className="h-4 w-4" />
        {!collapsed && <span>{children}</span>}
      </Link>
    );

    // Only wrap in SheetClose if onNavClick is provided (mobile view)
    return onNavClick ? (
      <SheetClose asChild>
        {content}
      </SheetClose>
    ) : content;
  };

  return (
    <nav className={cn("flex flex-col gap-1", className)} {...props}>
      <NavItem icon={LayoutDashboard} to="/">Dashboard</NavItem>
      <NavItem icon={Wallet} to="/accounts">Accounts</NavItem>
      <NavItem icon={ListOrdered} to="/transactions">Transactions</NavItem>
      <NavItem icon={PiggyBank} to="/budget">Budget</NavItem>
    </nav>
  );
};

const UserNav = ({ onLogout, username }) => {
  return (
    <DropdownMenu>
<DropdownMenuTrigger asChild>
  <div className="relative p-0 h-8 w-8 rounded-full overflow-hidden">
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
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Sidebar = ({ collapsed, className, onNavClick }) => {
  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-3 justify-center">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 font-semibold">
            Cove
          </Link>
        )}
      </div>
      <ScrollArea className="flex-1 p-3">
        <MainNav collapsed={collapsed} onNavClick={onNavClick} />
      </ScrollArea>
    </div>
  );
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionManager.getToken();
      setIsAuthenticated(!!token);
    };

    // Check initial auth state
    checkAuth();

    // Set up activity listeners
    const handleActivity = () => {
      if (isAuthenticated) {
        sessionManager.updateLastActivity();
      }
    };

    // Listen for session expiration
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
    };

    // Add event listeners
    window.addEventListener('sessionExpired', handleSessionExpired);
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Check auth status periodically
    const authCheck = setInterval(checkAuth, 60000); // Check every minute

    // Clean up
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(authCheck);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    sessionManager.clearSession();
    sessionStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex">
        {/* Desktop Sidebar */}
        <div className={cn("hidden lg:block", collapsed ? "w-16" : "w-64")}>
          <Sidebar collapsed={collapsed} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-14 border-b bg-background px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <Sidebar collapsed={false} />
                  </SheetContent>
                </Sheet>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              )}
            </div>
            <UserNav onLogout={handleLogout} username={username} />
          </header>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="container mx-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionsList />} />
                <Route path="/accounts" element={<ManageAccounts />} />
                <Route path="/configuration" element={<Configuration />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/budget/configure" element={<BudgetConfiguration selectedDate={moment()} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </Router>
  );
};

export default App;