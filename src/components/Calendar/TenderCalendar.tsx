import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, CheckSquare, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { CalendarDay } from './CalendarDay';
import { MOCK_EVENTS } from '../../constants';
import { EventType, ProjectStatus } from '../../types';
import { useStore } from '../../store/useStore';

export const TenderCalendar: React.FC = () => {
  const { projects, customEvents, addCustomEvent } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week'>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Form state
  const [newEventName, setNewEventName] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventProjectId, setNewEventProjectId] = useState('');

  const allEvents = [...MOCK_EVENTS, ...customEvents];

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) {
      showToast('事项名称不能为空', 'error');
      return;
    }
    if (!newEventTime) {
      showToast('请选择时间', 'error');
      return;
    }

    const [hours, minutes] = newEventTime.split(':');
    const eventDate = new Date(selectedDate);
    eventDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    addCustomEvent({
      id: `evt_${Date.now()}`,
      projectId: newEventProjectId,
      projectName: newEventName,
      date: eventDate,
      type: EventType.REMINDER,
      completed: false,
      timeStr: newEventTime
    });

    setAddEventModalOpen(false);
    setNewEventName('');
    setNewEventTime('');
    setNewEventProjectId('');
    showToast('添加成功', 'success');
  };

  // Normalize date to remove time for comparison
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  // Generate days for grid
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    if (view === 'month') {
      const firstDayOfMonth = new Date(year, month, 1);
      const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Start Mon
      
      // Previous month days
      const prevMonth = new Date(year, month, 0);
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({ 
          date: new Date(year, month - 1, prevMonth.getDate() - i), 
          isCurrentMonth: false 
        });
      }

      // Current month days
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= lastDayOfMonth; i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
      }

      // Next month days to fill 42 cells (6 rows)
      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    } else {
      // Week View
      const currentDay = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1; // 0=Mon
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDay);
      
      for(let i=0; i<7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({ date: d, isCurrentMonth: d.getMonth() === month });
      }
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const norm = normalizeDate(date).getTime();
    return allEvents.filter(e => normalizeDate(e.date).getTime() === norm && !e.completed);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const navigate = (dir: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (dir === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (dir === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const today = new Date();
  const selectedEvents = getEventsForDate(selectedDate);
  const isSelectedToday = normalizeDate(selectedDate).getTime() === normalizeDate(today).getTime();
  const todoHeader = isSelectedToday ? '今日待办' : `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 待办`;

  // Todo List Data (Selected Date)
  const todoList = allEvents.filter(e => {
    return normalizeDate(e.date).getTime() === normalizeDate(selectedDate).getTime() && !e.completed;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] px-6 py-4 flex flex-col h-full overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-200 ${
          toastMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toastMessage.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 h-10">
        <h2 className="text-lg font-bold text-text-primary">投标日历</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-[#E5E7EB] rounded-lg p-0.5 h-8">
            <button 
              onClick={() => setView('month')}
              className={`px-3 h-full text-xs font-medium rounded-md transition-all ${
                view === 'month' ? 'bg-brand/10 text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              月
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 h-full text-xs font-medium rounded-md transition-all ${
                view === 'week' ? 'bg-brand/10 text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              周
            </button>
          </div>
          <button 
            onClick={() => setAddEventModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
            title="手动添加事项"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex flex-col flex-1 -mx-6 -mb-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-1 mt-2">
        <button 
          onClick={() => navigate('prev')} 
          className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-brand transition-colors"
        >
          <ChevronLeft size={16}/>
        </button>
        <span className="text-sm font-bold text-text-primary font-mono tracking-wide">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </span>
        <button 
          onClick={() => navigate('next')} 
          className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-brand transition-colors"
        >
          <ChevronRight size={16}/>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="px-3 pb-2">
        {/* Week Headers */}
        <div className="grid grid-cols-7 mb-1">
          {['一', '二', '三', '四', '五', '六', '日'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{d}</div>
          ))}
        </div>
        
        {/* Days Grid - No borders, just gap */}
        <div className="grid grid-cols-7 gap-0">
          {getCalendarDays().map((item, idx) => (
            <CalendarDay 
              key={idx}
              date={item.date}
              isCurrentMonth={item.isCurrentMonth}
              isToday={normalizeDate(item.date).getTime() === normalizeDate(today).getTime()}
              isSelected={normalizeDate(item.date).getTime() === normalizeDate(selectedDate).getTime()}
              events={getEventsForDate(item.date)}
              onClick={handleDateClick}
              view={view}
            />
          ))}
        </div>
      </div>

      {/* Legend - Minimalist */}
      <div className="px-5 pb-2 flex gap-4 justify-center border-b border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="text-[10px] text-text-tertiary">人工提醒</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          <span className="text-[10px] text-text-tertiary">其他提醒</span>
        </div>
      </div>

      {/* Todo List Area */}
      <div className="flex-1 bg-gray-50/50 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
           <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">{todoHeader}</h4>
           <button 
             onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
             className="text-[10px] text-brand hover:underline"
           >
             回到今天
           </button>
        </div>
        
        <div className="space-y-2.5">
          {todoList.length > 0 ? (
            todoList.map(event => (
              <div 
                key={event.id} 
                onClick={() => setModalOpen(true)}
                className="group bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  event.type === EventType.REMINDER ? 'bg-brand' : 'bg-orange-400'
                }`} />
                <div className="pl-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-text-primary">
                      {event.date.getMonth()+1}月{event.date.getDate()}日 <span className="text-gray-400 font-normal ml-1">{event.timeStr}</span>
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate group-hover:text-brand transition-colors" title={event.projectName}>
                    {event.projectName}
                  </p>
                </div>
              </div>
            ))
          ) : (
             <div className="flex flex-col items-center justify-center py-6 text-gray-400">
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                 <CheckSquare size={14} className="opacity-50" />
               </div>
               <span className="text-xs">近期无待办事项</span>
             </div>
          )}
        </div>
      </div>
    </div>

      {/* Add Event Modal */}
      {addEventModalOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-text-primary text-sm">手动添加事项</h3>
              <button onClick={() => setAddEventModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">事项名称 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="例如：准备资质文件"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">时间 <span className="text-red-500">*</span></label>
                <input 
                  type="time" 
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">关联项目 (可选)</label>
                <select 
                  value={newEventProjectId}
                  onChange={(e) => setNewEventProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                >
                  <option value="">不关联项目</option>
                  {projects.filter(p => p.status !== ProjectStatus.WON && p.status !== ProjectStatus.LOST).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setAddEventModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-sm"
                >
                  保存事项
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Events Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-text-primary text-sm">
                {selectedDate.getMonth()+1}月{selectedDate.getDate()}日 事项
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto space-y-3">
              {selectedEvents.map(event => (
                <div key={event.id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      event.type === EventType.REMINDER ? 'bg-brand' : 'bg-orange-400'
                    }`} />
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-text-primary leading-snug mb-1">{event.projectName}</h5>
                      <p className="text-xs text-text-tertiary mb-2">时间: {event.timeStr}</p>
                      <button className="text-xs flex items-center justify-center w-full py-1.5 gap-1 text-brand bg-brand/5 hover:bg-brand/10 rounded font-medium transition-colors">
                        <CheckSquare size={12} /> 标记完成
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};