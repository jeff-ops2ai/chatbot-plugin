import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { testSupabase } from './lib/supabase-test';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ChatbotList from './pages/chatbot/ChatbotList';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Run Supabase test on app load
    testSupabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chatbots" element={<ChatbotList />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}