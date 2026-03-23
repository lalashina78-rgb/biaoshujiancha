import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductHero } from '../components/Dashboard/ProductHero';
import { ProjectList } from '../components/Dashboard/ProjectList';
import { RiskOverview } from '../components/Dashboard/RiskOverview';
import { useStore } from '../store/useStore';

export const TenderCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setIsCreateModalOpen } = useStore();

  return (
    <>
      {/* 1. Product Hero (Intro & Main Action) */}
      <ProductHero onCreateClick={() => setIsCreateModalOpen(true)} />

      {/* Content Grid */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* 2. Project Workbench (Main Area) */}
        <div className="flex-1 min-w-0">
          <ProjectList 
            projects={projects} 
            onCreateClick={() => setIsCreateModalOpen(true)} 
            onProjectClick={(project) => navigate(`/projects/${project.id}`)}
            viewMode="grid"
            showCheckStatus={true}
          />
        </div>

        {/* 3. Risk & Result Overview (Side Area) */}
        <div className="xl:w-[320px] shrink-0 hidden lg:block">
          <RiskOverview projects={projects} />
        </div>
      </div>
    </>
  );
};
