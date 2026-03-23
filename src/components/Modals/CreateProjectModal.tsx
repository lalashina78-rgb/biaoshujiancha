import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Check, Loader2, Trash2 } from 'lucide-react';
import { Project, ProjectStatus, ProjectType } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Partial<Project>) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>(ProjectType.ENGINEERING);
  const [region, setRegion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  
  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setType(ProjectType.ENGINEERING);
      setRegion('');
      setDeadline('');
      setOpeningDate('');
      setFile(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate completion
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        setFile(selectedFile);
        
        // Auto-fill project name from filename (remove extension)
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(fileNameWithoutExt);
      }, 2500);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Partial<Project> = {
      name,
      type,
      region,
      deadline: deadline ? new Date(deadline) : undefined,
      openingDate: openingDate ? new Date(openingDate) : undefined,
      status: ProjectStatus.CREATED,
    };

    if (file) {
      newProject.tenderFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadTime: new Date(),
        // In a real app, we would upload the file and get a URL
      };
    }

    onCreate(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">新建项目</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">招标文件 <span className="text-gray-400 font-normal text-xs">(可选，自动提取项目名称)</span></label>
            
            {!file && !isUploading && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-gray-500 group-hover:text-brand group-hover:bg-blue-100">
                  <Upload size={20} />
                </div>
                <p className="text-sm text-gray-600 font-medium">点击上传招标文件</p>
                <p className="text-xs text-gray-400 mt-1">支持 PDF, Word, Excel (最大 50MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                />
              </div>
            )}

            {isUploading && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-brand" />
                    <span className="text-sm font-medium text-gray-700">正在解析文件...</span>
                  </div>
                  <span className="text-xs text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {file && !isUploading && (
              <div className="border border-brand/20 bg-brand/5 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-white rounded border border-brand/20 flex items-center justify-center text-brand shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Check size={12} className="text-green-500" /> 解析完成，已自动填充名称
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              placeholder="请输入项目名称"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">项目类型</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all bg-white"
              >
                {Object.values(ProjectType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属地区</label>
              <input 
                type="text" 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                placeholder="例如：上海市"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">投标截止时间</label>
              <input 
                type="datetime-local" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开标时间</label>
              <input 
                type="datetime-local" 
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={isUploading}
              className={`px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? '正在解析...' : '创建项目'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
