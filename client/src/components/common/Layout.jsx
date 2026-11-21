import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Layout = ({ children, breadcrumbs = [], title, subtitle, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-appbg dark:bg-appbg-dark transition-colors flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Global Search Modal */}
        <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Breadcrumb & Header Bar */}
          {(breadcrumbs.length > 0 || title) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span>/</span>}
                        <span className={idx === breadcrumbs.length - 1 ? "text-primary-600 dark:text-primary-400 font-medium" : "hover:text-slate-600 dark:hover:text-slate-200"}>
                          {crumb}
                        </span>
                      </React.Fragment>
                    ))}
                  </nav>
                )}
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>

              {actions && (
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {actions}
                </div>
              )}
            </div>
          )}

          {/* Children views */}
          {children}
        </main>
      </div>
    </div>
  );
};
