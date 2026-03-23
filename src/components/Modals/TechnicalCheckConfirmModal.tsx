import React, { useState } from 'react';
import { X, Info, CheckSquare, Square } from 'lucide-react';
import { Project, ProposalVersion } from '../../types';
import { Button } from '../UI/Button';

interface TechnicalCheckConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFileIds: string[]) => void;
  project: Project | null;
  versions: ProposalVersion[];
}

export const TechnicalCheckConfirmModal: React.FC<TechnicalCheckConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project,
  versions
}) => {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // Initialize selected versions when modal opens or versions change
  React.useEffect(() => {
    if (isOpen && versions.length > 0) {
      setSelectedVersions(versions.map(v => v.id));
    }
  }, [isOpen, versions]);

  if (!isOpen || !project) return null;

  const toggleVersion = (id: string) => {
    setSelectedVersions(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    // Collect all file IDs from selected versions
    const selectedFiles = versions
      .filter(v => selectedVersions.includes(v.id))
      .flatMap(v => v.files.map(f => f.id));
    
    onConfirm(selectedFiles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">确认检查文件</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Project Info Card */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">项目信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <div className="flex items-start gap-2">
                <span className="text-sm text-gray-500 shrink-0">项目名称:</span>
                <span className="text-sm font-medium text-gray-900">{project.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 shrink-0">招标编号:</span>
                <span className="text-sm font-medium text-gray-900">{project.id.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 shrink-0">招标人/采购人:</span>
                <span className="text-sm font-medium text-gray-900">{project.tenderer || 'XXX建设局'}</span>
              </div>
            </div>
          </div>

          {/* Versions List */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">选择要检查的投标文件版本</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[50px_1.5fr_2.5fr] bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 py-3">
                <div className="flex justify-center items-center">
                  <div className="w-4 h-4 border border-gray-300 rounded bg-white" />
                </div>
                <div className="px-2">版本/文件名称</div>
                <div className="px-2">版本差异记录 (备注)</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {versions.length > 0 ? (
                  versions.map((version) => {
                    const isSelected = selectedVersions.includes(version.id);
                    // Mock additional data based on version ID or random
                    const isError = version.name.includes('废弃');
                    
                    return (
                      <div 
                        key={version.id} 
                        className={`grid grid-cols-[50px_1.5fr_2.5fr] py-4 items-center hover:bg-gray-50 transition-colors ${isError ? 'opacity-60 bg-gray-50/50' : ''}`}
                      >
                        <div className="flex justify-center items-center">
                          <button 
                            onClick={() => !isError && toggleVersion(version.id)}
                            disabled={isError}
                            className={`text-gray-400 hover:text-brand transition-colors ${isError ? 'cursor-not-allowed' : ''}`}
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-brand fill-brand/10" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </div>
                        <div className="px-2 pr-4">
                          <div className="text-sm font-medium text-gray-900 mb-1">{version.name}</div>
                          {isError && (
                            <div className="text-xs text-red-500 flex items-center gap-1">
                              <Info size={12} />
                              文件解析失败
                            </div>
                          )}
                        </div>
                        <div className="px-2 text-sm text-gray-600 italic">
                          {version.remark || '无备注信息'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    暂无版本信息
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info size={16} className="text-blue-500" />
            系统将同时对您选择的文件版本进行比对检查。
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-gray-900">
              预计扣费: <span className="text-lg font-bold font-mono mx-1">{selectedVersions.length}</span> 次
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirm}
                disabled={selectedVersions.length === 0}
              >
                确认并开始检查
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
