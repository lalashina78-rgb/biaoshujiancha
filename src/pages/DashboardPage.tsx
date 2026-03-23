import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { ProjectList } from '../components/Dashboard/ProjectList';
import { TenderCalendar } from '../components/Calendar/TenderCalendar';
import { useStore } from '../store/useStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setIsCreateModalOpen } = useStore();

  return (
    <>
      {/* 3. Quick Actions */}
      <QuickActions onCreateClick={() => setIsCreateModalOpen(true)} />

      {/* Content Grid */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* 4. Project List (Main Area) */}
        <div className="flex-1 xl:w-2/3 min-w-0">
          <div className="bg-transparent rounded-lg">
            <ProjectList 
              projects={projects} 
              onCreateClick={() => setIsCreateModalOpen(true)} 
              onProjectClick={(project) => navigate(`/projects/${project.id}`)}
              viewMode="grid"
            />
          </div>
        </div>

        {/* 5. Tender Calendar (Side Area) */}
        <div className="xl:w-[360px] shrink-0 hidden lg:block">
          <div className="sticky top-0 h-full">
            <TenderCalendar />
          </div>
        </div>
      </div>
    </>
  );
};
