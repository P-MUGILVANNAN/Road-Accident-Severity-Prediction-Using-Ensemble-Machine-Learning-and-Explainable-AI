import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Cpu,
  Target,
  Sparkles,
  HelpCircle,
  MapPin,
  ShieldAlert,
  FlaskConical,
  FileText,
  Settings,
  LogOut,
  Car,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_GROUPS = [
  {
    title: 'Core Analytics',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Accident Records', path: '/accidents', icon: FileSpreadsheet },
      { name: 'Exploratory EDA', path: '/eda', icon: BarChart3 },
    ],
  },
  {
    title: 'Machine Learning & XAI',
    items: [
      { name: 'Model Training', path: '/training', icon: Cpu },
      { name: 'Model Evaluation', path: '/evaluation', icon: Target },
      { name: 'Severity Prediction', path: '/prediction', icon: Sparkles },
      { name: 'Explainable AI (SHAP)', path: '/explainability', icon: HelpCircle },
    ],
  },
  {
    title: 'Spatial & Risk Insights',
    items: [
      { name: 'Geographic Map', path: '/geographic', icon: MapPin },
      { name: 'Safety Risk Analytics', path: '/insights', icon: ShieldAlert },
    ],
  },
  {
    title: 'Research & Reporting',
    items: [
      { name: 'Research Experiments', path: '/experiments', icon: FlaskConical },
      { name: 'Reports & Export', path: '/reports', icon: FileText },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0B1528] text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">RoadAccident AI</h1>
              <p className="text-[11px] font-medium text-blue-400">Ensemble & Explainable XAI</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </h2>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => {
                        // Close sidebar on mobile after clicking
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs font-semibold'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Research Compliance Badge */}
        <div className="border-t border-slate-800 bg-slate-900/40 p-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300">Database</span>
              <span className="text-[10px] font-bold text-blue-400">MySQL 8.0</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              DfT STATS19 verified. Research & decision support.
            </p>
          </div>
        </div>

        {/* User profile footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-950 font-semibold text-blue-300 border border-blue-700/50 text-xs">
              AT
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-white">Dr. Alan Turing</p>
              <p className="truncate text-[10px] text-slate-400">Lead AI Researcher</p>
            </div>
          </div>
          <NavLink
            to="/login"
            title="Sign out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};
