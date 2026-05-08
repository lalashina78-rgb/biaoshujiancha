import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Check, Loader2, Trash2, Sparkles, Cpu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [parsingPhase, setParsingPhase] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsingMessages = [
    '正在解析文件结构...',
    '智能提取项目关键信息...',
    '分析所属地区与截止时间...',
    '优化项目名称...',
    '解析完成'
  ];

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
      setParsingPhase(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setIsUploading(true);
      setParsingPhase(0);

      // Simulate parsing phases
      const phaseInterval = setInterval(() => {
        setParsingPhase(prev => {
          if (prev >= parsingMessages.length - 2) {
            return prev;
          }
          return prev + 1;
        });
      }, 600);

      // Simulate completion
      setTimeout(() => {
        clearInterval(phaseInterval);
        setParsingPhase(parsingMessages.length - 1);
        setIsUploading(false);
        setFile(selectedFile);
        
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(fileNameWithoutExt);
      }, 3000);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
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
              <div className="border border-brand/20 rounded-xl p-6 bg-brand/5 overflow-hidden relative">
                {/* Background Animation Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div 
                    animate={{ 
                      x: ['-100%', '100%'],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/20 to-transparent skew-x-12"
                  />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-4">
                    {/* Pulsing rings */}
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-brand rounded-full filter blur-xl"
                    />
                    <div className="relative w-16 h-16 bg-white rounded-2xl shadow-lg border border-brand/10 flex items-center justify-center overflow-hidden">
                      <motion.div 
                        animate={{ 
                          translateY: ['-20px', '20px', '-20px'],
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="absolute inset-x-0 h-1 bg-brand/50 shadow-[0_0_10px_2px_rgba(37,99,235,0.4)] z-20"
                      />
                      <Sparkles className="text-brand animate-pulse" size={32} />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Cpu size={14} className="text-brand" />
                      </motion.div>
                      <span className="text-sm font-bold text-gray-800 tracking-tight">AI 智能解析中</span>
                    </div>
                    
                    <div className="h-6 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={parsingPhase}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-gray-500 font-medium italic"
                        >
                          {parsingMessages[parsingPhase]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Micro-indicators */}
                  <div className="mt-4 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          backgroundColor: i <= (parsingPhase % 4) ? '#2563eb' : '#e5e7eb',
                          scale: i <= (parsingPhase % 4) ? 1.2 : 1
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                      />
                    ))}
                  </div>
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
