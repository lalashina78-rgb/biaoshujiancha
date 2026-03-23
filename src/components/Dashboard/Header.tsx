import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User as UserIcon, Plus, UserCircle, LogOut, Building2, Check, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../../constants';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead,
    setIsSidebarCollapsed,
    isSidebarCollapsed,
    setIsCreateModalOpen,
    currentUser,
    setCurrentUser
  } = useStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showIdentitySubmenu, setShowIdentitySubmenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowIdentitySubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleSwitchIdentity = (user: any) => {
    setCurrentUser(user);
    setShowProfileMenu(false);
    setShowIdentitySubmenu(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-40">
      <div className="flex items-center flex-1 gap-4">
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 -ml-2 mr-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        {/* Product Name */}
        <div className="flex items-center gap-2 mr-8">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">
            <span className="text-lg">T</span>
          </div>
          <span className="text-lg font-bold text-gray-900 hidden md:block">标书检查</span>
        </div>

        {/* Global Search */}
        <div className="max-w-md w-full hidden md:flex items-center relative">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索项目、标书或关键字..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-gray-100 relative text-gray-600 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">消息通知</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-brand hover:text-brand-dark"
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-brand-light/30' : ''}`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.projectId) {
                          handleViewDetails(notification.projectId);
                          setShowNotifications(false);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {notification.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{notification.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    暂无通知
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileMenuRef}>
          <div 
            className="flex items-center space-x-3 pl-2 cursor-pointer group"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowIdentitySubmenu(false);
            }}
          >
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900 group-hover:text-brand transition-colors">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate max-w-[120px]">{currentUser.company}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-light text-brand flex items-center justify-center overflow-hidden border border-brand/20 group-hover:ring-2 group-hover:ring-brand/20 transition-all">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} />
              )}
            </div>
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email || 'user@example.com'}</p>
              </div>
              
              <div 
                className="relative"
                onMouseEnter={() => setShowIdentitySubmenu(true)}
                onMouseLeave={() => setShowIdentitySubmenu(false)}
              >
                <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    <span>切换身份</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </button>

                {/* Identity Submenu */}
                {showIdentitySubmenu && (
                   <div 
                    className="absolute right-full top-0 pr-1 w-48"
                    onMouseEnter={() => setShowIdentitySubmenu(true)}
                  >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1">
                      {MOCK_USERS.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSwitchIdentity(user)}
                          className={cn(
                            "w-full px-4 py-2.5 text-sm flex items-center justify-between transition-colors",
                            user.id === currentUser.id ? "bg-brand/5 text-brand" : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {user.type === 'personal' ? (
                              <UserCircle size={14} className={user.id === currentUser.id ? "text-brand" : "text-gray-400"} />
                            ) : (
                              <Building2 size={14} className={user.id === currentUser.id ? "text-brand" : "text-gray-400"} />
                            )}
                            <span className="truncate max-w-[90px] text-left">{user.name}</span>
                          </div>
                          {user.id === currentUser.id && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand/10 text-brand">当前</span>
                          )}
                        </button>
                      ))}
                      {/* Add a mock "reviewing" identity to match design */}
                      <div className="px-4 py-2.5 text-sm flex items-center justify-between opacity-60 cursor-not-allowed border-t border-gray-50 mt-1">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-gray-400" />
                          <span className="truncate max-w-[90px] text-left">中建三局</span>
                        </div>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 flex items-center gap-1">
                          <Clock size={10} />
                          审核中
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <UserCircle size={16} className="text-gray-400" />
                <span>个人中心</span>
              </button>
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              <button className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                <LogOut size={16} className="text-red-400" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

