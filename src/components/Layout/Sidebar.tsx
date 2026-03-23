import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  PenTool, 
  ClipboardCheck, 
  Bell, 
  Folder, 
  Database, 
  Layers, 
  Building2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { id: 'home', icon: Home, label: '首页', path: '/' },
    { id: 'ai-bid', icon: PenTool, label: 'AI编标', path: '/ai-bid' },
    { id: 'check', icon: ClipboardCheck, label: '标书检查', path: '/check' },
    { id: 'news', icon: Bell, label: '标讯', path: '/news' },
    { id: 'projects', icon: Folder, label: '项目管理', path: '/projects' },
    { id: 'certificates', icon: Database, label: '电子证照库', path: '/certificates' },
    { id: 'assets', icon: Layers, label: '我的素材', path: '/assets' },
    { id: 'company', icon: Building2, label: '企业信息', path: '/company' },
  ];

  const isPathActive = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    
    // If we are in a project sub-page (e.g., /projects/p1)
    const isProjectSubPage = location.pathname.startsWith('/projects/');

    // Special handling for project sub-pages to highlight "标书检查"
    if (itemPath === '/check' && isProjectSubPage) {
      return true;
    }

    // Do not highlight "项目管理" if we are in a project sub-page
    if (itemPath === '/projects' && isProjectSubPage) {
      return false;
    }

    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className={`bg-white h-full border-r border-gray-200 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && <span className="font-bold text-xl text-brand">TenderCheck</span>}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-3 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className={isActive ? 'text-brand' : 'text-gray-500'} />
              {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

