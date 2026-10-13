import React from 'react';
import { Sparkles, Database, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/accidents': 'Accident Records Management',
  '/eda': 'Exploratory Data Analysis (EDA)',
  '/training': 'Model Training Pipeline',
  '/evaluation': 'Model Performance & Diagnostics',
  '/prediction': 'Accident Severity Prediction',
  '/explainability': 'Explainable AI (SHAP Interpretability)',
  '/geographic': 'Geographic Accident Hotspots & Map',
  '/insights': 'Road Safety Risk Analytics',
  '/experiments': 'Research Experiments Manager',
  '/reports': 'Reports & IEEE Paper Export',
  '/settings': 'Platform & Model Configuration',
  '/login': 'User Authentication',
};

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const currentTitle = PAGE_TITLES[location.pathname] || 'Road Safety Analytics';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">
            {currentTitle}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500">
            UK DfT STATS19 Highway Safety Analytics & Decision Support (MySQL 8.0)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dataset Status */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <Database className="h-3.5 w-3.5 text-emerald-600" />
          <span>5,000 Verified Records</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Quick Predict Action */}
        <Link
          to="/prediction"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Run Prediction</span>
          <span className="xs:hidden">Predict</span>
        </Link>
      </div>
    </header>
  );
};
