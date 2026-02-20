
export enum UserRole {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student'
}

export enum TeacherDepartment {
  Executive = 'ผู้บริหาร',
  Careers = 'กลุ่มสาระการงานอาชีพ',
  Math = 'กลุ่มสาระคณิตศาสตร์',
  ForeignLang = 'กลุ่มสาระภาษาต่างประเทศ',
  Thai = 'กลุ่มสาระภาษาไทย',
  Science = 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี',
  Art = 'กลุ่มสาระศิลปะ',
  Social = 'กลุ่มสาระสังคมศึกษา',
  Health = 'กลุ่มสาระสุขศึกษา-พละ',
  ForeignTeacher = 'ครูต่างชาติ',
  Support = 'ฝ่ายสนับสนุนการสอน',
  GovEmployee = 'พนักงานราชการ'
}

export enum DeviceStatus {
  Available = 'Available',
  Borrowed = 'Borrowed',
  Maintenance = 'Maintenance',
  PendingApproval = 'Pending Approval',
  Lost = 'Lost',
}

export enum DeviceCategory {
  iPad = 'iPad',
  iPhone = 'iPhone',
  Macbook = 'Macbook',
  Others = 'อื่นๆ'
}

export interface Product {
  id: string;
  name: string;
  category: DeviceCategory;
  imageUrl: string;
  description?: string;
  designatedFor?: UserRole;
  defaultAccessories?: string[] | string;
}

export interface Device {
  serialNumber: string;
  id: string;
  productId: string;
  status: DeviceStatus;
  borrowedBy?: string;
  borrowDate?: string;
  dueDate?: string;
  appleId?: string;
  borrowNotes?: string;
  borrowedAccessories?: string;
  name?: string; 
  category?: DeviceCategory;
  imageUrl?: string; 
  designatedFor?: UserRole;
  accessories?: string[] | string;
}

interface BaseUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  profileImageUrl: string;
}

export interface TeacherUser extends BaseUser {
  role: UserRole.Teacher | UserRole.Admin;
  department: TeacherDepartment;
}

export interface StudentUser extends BaseUser {
  role: UserRole.Student;
  studentId: string;
  grade: number;
  classroom: string;
}

export type User = TeacherUser | StudentUser;

export interface HistoryEntry {
  historyId: string;
  deviceId: string;
  userId?: string;
  borrowerName: string;
  borrowDate: string;
  returnDate?: string;
  status: 'Returned' | 'Borrowed';
  appleId?: string;
  borrowNotes?: string;
  returnNotes?: string;
  borrowedAccessories?: string;
}

export interface ServiceRequest {
  id: string;
  device: {
    id: string;
    name: string;
    serialNumber: string;
  };
  reportedBy: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  reportedAt: string;
  repairLocation?: string;
  repairImageUrl?: string | null;
}

export interface ActivityLog {
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface ProductApprovalRequest {
  id: string;
  productId: string;
  productName: string;
  category: DeviceCategory;
  imageUrl: string;
  quantity: number;
  requestedBy: string;
  requestedByRole: UserRole;
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}
