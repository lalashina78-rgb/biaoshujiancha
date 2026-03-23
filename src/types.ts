export enum ProjectStatus {
  CREATED = '已创建',
  IN_PROGRESS = '标书制作中',
  CHECKING = '检查中',
  SUBMITTED = '已提交',
  OPENED = '已开标',
  WON = '已中标',
  LOST = '未中标'
}

export enum ProjectType {
  ENGINEERING = '工程类',
  GOODS = '货物类',
  SERVICES = '服务类'
}

export enum EventType {
  DEADLINE = 'DEADLINE',
  OPENING = 'OPENING',
  REMINDER = 'REMINDER'
}

export interface CalendarEvent {
  id: string;
  projectId: string;
  projectName: string;
  date: Date; // Keep as Date object for easier comparison
  type: EventType;
  completed: boolean;
  timeStr: string; // e.g., "17:00"
}

export interface CheckProgress {
  credit: 'success' | 'warning' | 'pending';
  technical: 'success' | 'warning' | 'pending';
  economic: 'success' | 'warning' | 'pending';
}

export interface ProjectFile {
  id: string;
  name: string;
  size: number; // bytes
  uploadTime: Date;
  url?: string;
}

export interface CheckStatus {
  status: 'pending' | 'processing' | 'success' | 'warning' | 'error';
  issueCount: number;
}

export interface ProposalVersion {
  id: string;
  name: string; // e.g., "投标文件-1"
  remark?: string;
  referenceDocName?: string; // e.g., "招标文件 V1.0" or "答疑文件 01"
  uploadTime: Date;
  files: ProjectFile[];
  checkStatus: {
    credit: CheckStatus;
    technical: CheckStatus;
    economic: CheckStatus;
  };
}

export interface Project {
  id: string;
  name: string;
  projectNumber?: string;
  region?: string;
  status: ProjectStatus;
  type: ProjectType;
  tenderer?: string;
  contactPerson?: string;
  contactPhone?: string;
  manager?: string;
  lastUpdated: Date;
  deadline?: Date;
  openingDate?: Date;
  progress: CheckProgress;
  // Extended details
  tenderFile?: ProjectFile;
  controlFile?: ProjectFile;
  versions?: ProposalVersion[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  company: string;
  email?: string;
  type?: 'personal' | 'enterprise';
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  PROJECT = 'PROJECT',
  REMINDER = 'REMINDER',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING'
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: NotificationType;
  projectId?: string;
}

export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface ScoringPoint {
  id: string;
  name: string;
  category: string;
  score: number;
  maxScore: number;
  riskLevel: RiskLevel;
  deductionSummary?: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
}

export interface ScoringResult {
  totalScore: number;
  maxTotalScore: number;
  riskLevel: RiskLevel;
  riskMessage: string;
  categories: CategoryScore[];
  points: ScoringPoint[];
}

export interface ScoringPointDetail extends ScoringPoint {
  deductionReasons: string[];
  suggestions: string[];
  requirements: string;
  requirementSource: string;
  responseContent: string;
  responseSource: string;
}
