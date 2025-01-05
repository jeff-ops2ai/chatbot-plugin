import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Home, Settings, MessageSquare } from 'lucide-react';

export default function DashboardLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Chatbots', href: '/chatbots', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-semibold text-gray-900">Voice Chat</span>
              </div>
              <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          location.pathname === item.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}