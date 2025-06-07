import React from 'react';
import { Users, Receipt, Calculator } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'travelers' | 'expenses' | 'summary';
  onTabChange: (tab: 'travelers' | 'expenses' | 'summary') => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const tabs = [
    { id: 'travelers' as const, label: 'مسافران', icon: Users },
    { id: 'expenses' as const, label: 'هزینه‌ها', icon: Receipt },
    { id: 'summary' as const, label: 'تسویه حساب', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            مدیریت هزینه‌های سفر گروهی
          </h1>
          <p className="text-gray-600">
            هزینه‌هایتان را ثبت کنید و تسویه حساب را ساده کنید
          </p>
        </header>

        <nav className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}