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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Import your components
import TransactionsList from './components/TransactionsList';
// import GoalsList from './components/GoalsList';
import ManageAccounts from './components/ManageAccounts';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Configuration from './components/configuration/Configuration';
import { Toaster } from "@/components/ui/toaster"
import Budget from './components/Budget';
import BudgetConfiguration from './components/configuration/BudgetConfiguration';

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

const MainNav = ({ collapsed, className, ...props }) => {
  const NavItem = ({ icon: Icon, children, to }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && <span>{children}</span>}
    </Link>
  );

  return (
    <nav className={cn("flex flex-col gap-1", className)} {...props}>
      <NavItem icon={LayoutDashboard} to="/">Dashboard</NavItem>
      <NavItem icon={Wallet} to="/accounts">Accounts</NavItem>
      <NavItem icon={ListOrdered} to="/transactions">Transactions</NavItem>
      {/* <NavItem icon={Target} to="/goals">Goals</NavItem> */}
      <NavItem icon={PiggyBank} to="/budget">Budget</NavItem>
    </nav>
  );
};

const UserNav = ({ onLogout }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
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

const Sidebar = ({ collapsed, className }) => {
  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 font-semibold">
            CashCorner
          </Link>
        )}
      </div>
      <ScrollArea className="flex-1 p-3">
        <MainNav collapsed={collapsed} />
      </ScrollArea>
    </div>
  );
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      <div className="flex h-screen">
      
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className={cn("hidden lg:block", collapsed ? "w-16" : "w-64")}>
            <Sidebar collapsed={collapsed} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
            <UserNav onLogout={handleLogout} />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionsList />} />
                {/* <Route path="/goals" element={<GoalsList />} /> */}
                <Route path="/accounts" element={<ManageAccounts />} />
                <Route path="/profile" element={<Profile />} />
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