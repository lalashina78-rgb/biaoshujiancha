import { create } from 'zustand';
import { Project, Notification, ProjectStatus, ProjectType, CalendarEvent, User } from '../types';
import { MOCK_PROJECTS, MOCK_NOTIFICATIONS, CURRENT_USER } from '../constants';

interface AppState {
  // User
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Projects
  projects: Project[];
  addProject: (projectData: Partial<Project>) => Project;
  updateProject: (id: string, projectData: Partial<Project>) => void;
  
  // Notifications
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  
  // Custom Events
  customEvents: CalendarEvent[];
  addCustomEvent: (event: CalendarEvent) => void;
  
  // UI State
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // User
  currentUser: CURRENT_USER,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Projects
  projects: MOCK_PROJECTS,
  addProject: (projectData) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: projectData.name || '未命名项目',
      status: projectData.status || ProjectStatus.CREATED,
      type: projectData.type || ProjectType.ENGINEERING,
      lastUpdated: new Date(),
      deadline: projectData.deadline,
      openingDate: projectData.openingDate,
      region: projectData.region,
      projectNumber: projectData.projectNumber,
      tenderer: projectData.tenderer,
      contactPerson: projectData.contactPerson,
      contactPhone: projectData.contactPhone,
      manager: projectData.manager,
      progress: { credit: 'pending', technical: 'pending', economic: 'pending' }
    };
    
    set((state) => ({
      projects: [newProject, ...state.projects]
    }));
    
    return newProject;
  },

  updateProject: (id, projectData) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...projectData, lastUpdated: new Date() } : p
    )
  })),

  // Notifications
  notifications: MOCK_NOTIFICATIONS,
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),

  // Custom Events
  customEvents: [],
  addCustomEvent: (event) => set((state) => ({
    customEvents: [...state.customEvents, event]
  })),

  // UI State
  isCreateModalOpen: false,
  setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (isCollapsed) => set({ isSidebarCollapsed: isCollapsed }),
}));
