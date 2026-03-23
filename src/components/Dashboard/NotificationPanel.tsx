import React from 'react';
import { Bell, CheckCheck, X, ChevronRight, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Notification, NotificationType } from '../../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewDetails: (projectId: string) => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewDetails,
  onClose
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Helper for formatting time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[500px]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-text-primary text-sm">通知中心</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-brand text-white text-[10px] rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onMarkAllAsRead}
              className="text-xs text-brand hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} /> 全部已读
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.isRead ? 'bg-brand-light/20' : ''}`}
                onClick={() => {
                  onMarkAsRead(notification.id);
                  if (notification.projectId) onViewDetails(notification.projectId);
                }}
              >
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    notification.type === NotificationType.SYSTEM ? 'bg-blue-50 text-brand' :
                    notification.type === NotificationType.WARNING ? 'bg-orange-50 text-orange-600' :
                    'bg-green-50 text-functional-success'
                  }`}>
                    {notification.type === NotificationType.SYSTEM ? <Info size={16} /> :
                     notification.type === NotificationType.WARNING ? <AlertTriangle size={16} /> :
                     <CheckCircle size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-xs font-bold truncate pr-4 ${!notification.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed mb-2">
                      {notification.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-brand bg-brand/5 px-1.5 py-0.5 rounded">
                        {notification.projectId ? '项目通知' : '系统消息'}
                      </span>
                      <ChevronRight size={12} className="text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Bell size={32} className="opacity-20 mb-3" />
              <p className="text-xs">暂无新通知</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
          <button className="text-xs text-text-tertiary hover:text-brand font-medium transition-colors">
            查看全部通知历史
          </button>
        </div>
      </div>
    </>
  );
};
