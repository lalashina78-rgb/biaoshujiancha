import React, { useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Dashboard/Header';
import { CreateProjectModal } from './components/Modals/CreateProjectModal';
import { DashboardPage } from './pages/DashboardPage';
import { TenderCheckPage } from './pages/TenderCheckPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CheckProgressPage } from './pages/CheckProgressPage';
import { CheckResultPage } from './pages/CheckResultPage';
import { CheckpointsPage } from './pages/CheckpointsPage';
import { ScoringPointDetailPage } from './pages/ScoringPointDetailPage';
import { ProjectManagementPage } from './pages/ProjectManagementPage';
import { useStore } from './store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AppContent: React.FC = () => {
  const { 
    isSidebarCollapsed, 
    setIsSidebarCollapsed,
    isCreateModalOpen,
    setIsCreateModalOpen,
    addProject
  } = useStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when route changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  const handleCreateProject = (newProjectData: any) => {
    const newProject = addProject(newProjectData);
    setIsCreateModalOpen(false);
    navigate(`/projects/${newProject.id}`);
  };

  const isDashboard = location.pathname === '/';
  const currentPath = location.pathname.startsWith('/projects') ? 'projects' : 'home';

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] text-[#1A1C24] overflow-hidden selection:bg-brand-light selection:text-brand-dark font-sans">
      {/* 1. Global Navigation */}
      <Sidebar 
        currentPath={currentPath} 
        collapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* 2. User Status & Header */}
        <Header />

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef} 
          className={cn(
            "flex-1 overflow-y-auto scroll-smooth",
            location.pathname.includes('/check-progress') || 
            location.pathname.includes('/check-result') || 
            location.pathname.includes('/checkpoints')
              ? "p-0" 
              : "px-4 py-4"
          )}
        >
          <div className={cn(
            "mx-auto space-y-6 h-full",
            location.pathname.includes('/check-progress') || 
            location.pathname.includes('/check-result') || 
            location.pathname.includes('/checkpoints')
              ? "max-w-none space-y-0" 
              : "max-w-[1400px]"
          )}>
            
            <Routes>
              <Route 
                path="/" 
                element={<DashboardPage />} 
              />
              <Route 
                path="/check" 
                element={<TenderCheckPage />} 
              />
              <Route 
                path="/projects" 
                element={<ProjectManagementPage />} 
              />
              <Route 
                path="/projects/:id" 
                element={<ProjectDetailPage />} 
              />
              <Route 
                path="/projects/:id/check-progress" 
                element={<CheckProgressPage />} 
              />
              <Route 
                path="/projects/:id/check-result" 
                element={<CheckResultPage />} 
              />
              <Route 
                path="/projects/:id/checkpoints" 
                element={<CheckpointsPage />} 
              />
              <Route 
                path="/projects/:id/check-result/:pointId" 
                element={<ScoringPointDetailPage />} 
              />
              <Route 
                path="*" 
                element={
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">🚧</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">功能开发中</h2>
                    <p className="text-gray-500">该模块正在建设中，敬请期待...</p>
                  </div>
                } 
              />
            </Routes>
            
          </div>
          
          {/* Footer Padding */}
          <div className="h-10"></div>
        </div>
      </main>

      {/* Modals */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;