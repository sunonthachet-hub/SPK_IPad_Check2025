
import React, { useState, useEffect, useCallback } from 'react';
import { translations, PREDEFINED_STUDENT_PICTURES, GAS_URL, GOOGLE_DRIVE_FOLDER_ID } from './constants';
import { gasHelper } from './services/gasService';
import type { User, Device, HistoryEntry, ServiceRequest, ActivityLog, Notification, TeacherUser, StudentUser, Product, ProductApprovalRequest } from './types';
import { UserRole, TeacherDepartment, DeviceStatus, DeviceCategory } from './types';

// Components
import NotificationToast from './components/NotificationToast';
import Footer from './components/Footer';
import AuthModal from './components/auth/AuthModal';
import Dashboard from './components/dashboard/Dashboard';

import BottomNavBar from './components/navigation/BottomNavBar';
import LandingPage from './components/LandingPage';
import HistoryPage from './components/history/HistoryPage';
import ProfilePage from './components/profile/ProfilePage';
import ServicesPage from './components/services/ServicesPage';
import ApprovalPage from './components/admin/ApprovalPage';
import MaintenanceModal from './components/modals/MaintenanceModal';
import ICloudModal from './components/modals/ICloudModal';
import DeviceDetailModal from './components/modals/DeviceDetailModal';
import ProductDetailModal from './components/modals/ProductDetailModal';
import ScannerModal from './components/modals/ScannerModal';
import DeviceInfoModal from './components/modals/DeviceInfoModal';
import ApprovalConfirmationModal from './components/modals/ApprovalConfirmationModal';
import AssignDeviceWizardModal from './components/modals/AssignDeviceWizardModal';
import AssignFromProductModal from './components/modals/AssignFromProductModal';
import AssignDeviceFromProductModal from './components/modals/AssignDeviceFromProductModal';
import SuccessBorrowModal from './components/modals/SuccessBorrowModal';
import SelectProfilePictureModal from './components/modals/SelectProfilePictureModal';
import UserManagementPage from './components/admin/UserManagementPage';
import ReportsPage from './components/admin/ReportsPage';
import ProductManagementPage from './components/admin/ProductManagementPage';
import ProductApprovalPage from './components/admin/ProductApprovalPage';
import VisitorPage from './components/visitor/VisitorPage';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authModalState, setAuthModalState] = useState('closed');
    const [activeTab, setActiveTab] = useState('home');
    const [language, setLanguage] = useState('th');
    const [pageSearchTerm, setPageSearchTerm] = useState('');
    const [isVisitorMode, setIsVisitorMode] = useState(false);

    const [devices, setDevices] = useState<Device[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<{ id: string; email: string; password?: string; role: UserRole }[]>([]);
    const [teachers, setTeachers] = useState<TeacherUser[]>([]);
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [productApprovalRequests, setProductApprovalRequests] = useState<ProductApprovalRequest[]>([]);
    

    const [isMaintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
    const [isICloudModalOpen, setICloudModalOpen] = useState(false);
    
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    const [isScannerOpen, setScannerOpen] = useState(false);
    const [scannerContext, setScannerContext] = useState<'user' | 'admin'>('user');
    const [isDeviceInfoModalOpen, setDeviceInfoModalOpen] = useState(false);
    const [scannedDevice, setScannedDevice] = useState<Device | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isAssignWizardOpen, setAssignWizardOpen] = useState(false);
    const [assignFromProduct, setAssignFromProduct] = useState<Product | null>(null);
    const [isAssignDeviceFromProductModalOpen, setAssignDeviceFromProductModalOpen] = useState(false);
    const [productForAssignment, setProductForAssignment] = useState<Product | null>(null);
    const [isApprovalConfirmationModalOpen, setApprovalConfirmationModalOpen] = useState(false);
    const [deviceToApprove, setDeviceToApprove] = useState<Device | null>(null);
    const [isSuccessBorrowModalOpen, setSuccessBorrowModalOpen] = useState(false);
    const [borrowSuccessInfo, setBorrowSuccessInfo] = useState({ borrowerName: '', borrowerRole: '', deviceName: '' });
    const [isProfilePictureModalOpen, setProfilePictureModalOpen] = useState(false);
    const [scanResultHandler, setScanResultHandler] = useState<((result: string) => void) | null>(null);

    const t = useCallback((key: keyof typeof translations.en): string => {
        return translations[language as keyof typeof translations][key] || key;
    }, [language]);
    
    const sanitizeForSheet = useCallback((payload: Record<string, unknown>): Record<string, unknown> => {
        const sanitized: Record<string, unknown> = { ...payload };
        const exceptions = ['serialNumber', 'appleId']; // Keys to exclude

        for (const key in sanitized) {
            if (exceptions.includes(key)) continue;

            if (sanitized[key] === null || sanitized[key] === undefined || sanitized[key] === '') {
                sanitized[key] = t('notSpecified');
            }
        }
        return sanitized;
    }, [t]);

    const addNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const id = Date.now();
        setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 5));
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const logActivity = useCallback(async (action: string, details: string) => {
        if (currentUser) {
            const payload: ActivityLog = { timestamp: new Date().toISOString(), userEmail: currentUser.email, action, details };
            if (GAS_URL !== 'YOUR_GOOGLE_APP_SCRIPT_WEB_APP_URL_HERE') {
                await gasHelper('append', 'ActivityLogs', sanitizeForSheet(payload));
            const notificationActions = ['BORROW_REQUESTED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'DEVICE_RETURNED', 'DEVICE_ASSIGNED'];
            if (notificationActions.includes(action)) {
                addNotification(details, 'info');
            }
            setActivityLogs(prev => [payload, ...prev]);
            }
            
        }
    }, [currentUser, sanitizeForSheet]);

    const loadInitialData = useCallback(async () => {
      setIsLoading(true);
      setError(null);

      if (GAS_URL === 'YOUR_GOOGLE_APP_SCRIPT_WEB_APP_URL_HERE') {
          addNotification('Running in DEMO mode. Connect to Google Sheets to save data.', 'info');
          
          const mockProducts: Product[] = [{ id: 'PROD-001', name: 'iPad Pro 11"', category: DeviceCategory.iPad, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800', description: 'Powerful iPad for Pros', designatedFor: UserRole.Teacher, defaultAccessories: ['Case', 'Stylus'] }];
          setProducts(mockProducts);
          
          const rawDevices: Partial<Device>[] = [
              { id: 'ipad-001', serialNumber: 'SKP-IP-001', productId: 'PROD-001', status: DeviceStatus.Available },
              { id: 'ipad-002', serialNumber: 'SKP-IP-002', productId: 'PROD-001', status: DeviceStatus.Borrowed, borrowedBy: 'สมชาย ใจดี', borrowDate: new Date('2023-08-15').toISOString(), dueDate: new Date('2025-02-15').toISOString(), appleId: 'somchai.j@icloud.com' },
              { id: 'ipad-003', serialNumber: 'SKP-IP-003', productId: 'PROD-001', status: DeviceStatus.PendingApproval, borrowedBy: 'คุณครูมานะ เรียนเก่ง'},
              { id: 'cam-001', serialNumber: 'SKP-CM-001', name: 'Sony A7 IV', category: DeviceCategory.Others, imageUrl: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=800', status: DeviceStatus.Maintenance, productId: '' }
          ];
          
          const hydratedDevices = rawDevices.map(d => {
              const prod = mockProducts.find(p => p.id === d.productId);
              if (prod) {
                  return { ...d, name: prod.name, category: prod.category, imageUrl: prod.imageUrl, designatedFor: prod.designatedFor, accessories: prod.defaultAccessories };
              }
              return d;
          });

          setDevices(hydratedDevices);
          setUsers([ { id: 'U001', email: 'somsri.s@spk.ac.th', role: UserRole.Teacher }, { id: 'U002', email: 'mana.r@spk.ac.th', role: UserRole.Teacher }, { id: 'U003', email: 'somchai.j@spk.ac.th', role: UserRole.Student }, { id: 'U004', email: 'somying.j@spk.ac.th', role: UserRole.Student }]);
          setTeachers([ { id: 'T001', username: 'คุณครูสมศรี สอนดี', email: 'somsri.s@spk.ac.th', role: UserRole.Teacher, profileImageUrl: 'https://i.pravatar.cc/150?u=teacher1', department: TeacherDepartment.Science }, { id: 'T002', username: 'คุณครูมานะ เรียนเก่ง', email: 'mana.r@spk.ac.th', role: UserRole.Teacher, profileImageUrl: 'https://i.pravatar.cc/150?u=teacher2', department: TeacherDepartment.Math }]);
          setStudents([ { id: 'S001', username: 'สมชาย ใจดี', email: 'somchai.j@spk.ac.th', role: UserRole.Student, profileImageUrl: PREDEFINED_STUDENT_PICTURES[0], studentId: '66001', grade: 6, classroom: '1' }, { id: 'S002', username: 'สมหญิง จริงใจ', email: 'somying.j@spk.ac.th', role: UserRole.Student, profileImageUrl: PREDEFINED_STUDENT_PICTURES[1], studentId: '65034', grade: 5, classroom: '3' }]);
          setHistory([ { historyId: 'bh1', deviceId: 'ipad-001', borrowerName: 'สมชาย ใจดี', borrowDate: new Date('2024-05-10').toISOString(), returnDate: new Date('2024-05-17').toISOString(), status: 'Returned', appleId: 'somchai.j@icloud.com', borrowNotes: 'First time borrower', returnNotes: 'Returned in good condition', borrowedAccessories: 'Case, Stylus Pen'}]);
          setServiceRequests([]);
          setIsLoading(false);
          return;
      }
      try {
          const [devicesRes, productsRes, usersRes, teachersRes, serviceRes, historyRes, logsRes, ...studentResults] = await Promise.all([
              gasHelper('read', 'Devices'), gasHelper('read', 'Products'), gasHelper('read', 'Users'), gasHelper('read', 'Teachers'), gasHelper('read', 'Service'), gasHelper('read', 'History'), gasHelper('read', 'ActivityLogs'), gasHelper('read', 'StudentsM4'), gasHelper('read', 'StudentsM5'), gasHelper('read', 'StudentsM6')
          ]);
          
          if (!devicesRes.success || !usersRes.success || !teachersRes.success) throw new Error('Failed to load critical data.');
          
          const loadedProducts: Product[] = productsRes.success ? productsRes.data || [] : [];
          const loadedDevices: Device[] = devicesRes.data || [];
          
          const hydratedDevices = loadedDevices.map(d => {
              const prod = loadedProducts.find(p => p.id === d.productId);
              if (prod) {
                  return { ...d, name: prod.name, category: prod.category, imageUrl: prod.imageUrl, designatedFor: prod.designatedFor, accessories: prod.defaultAccessories };
              }
              return d;
          });

          const allStudents = studentResults.reduce<StudentUser[]>((acc, result) => {
              if (result.success && result.data) return acc.concat(result.data);
              return acc;
          }, []);
          
          setDevices(hydratedDevices);
          setProducts(loadedProducts);
          setUsers(usersRes.data || []);
          setTeachers(teachersRes.data || []);
          setStudents(allStudents);
          setHistory(historyRes.data || []);
          setServiceRequests(serviceRes.data ? serviceRes.data.map((r: ServiceRequest) => {
              const dev = hydratedDevices.find((d: Device) => d.id === r.deviceId);
              return {...r, device: dev || {name: r.deviceName, serialNumber: r.deviceSerialNumber}};
          }) : []);
          setActivityLogs((logsRes.data || []).sort((a: ActivityLog, b: ActivityLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (err) {
          setError(err.message);
          addNotification(`Error loading data: ${err.message}`, 'error');
      } finally {
          setIsLoading(false);
      }
    
    }, []);

    useEffect(() => {
      loadInitialData();
    }, [loadInitialData]);
    
    const handleLoginSuccess = useCallback((username: string, password?: string) => {
        const usernameLower = username.toLowerCase();
        
        // Check if it's hardcoded admin
        if (usernameLower === 'admin' && password === 'spkadmin') {
            setCurrentUser({ id: 'admin-user', username: 'Admin', email: 'admin@spk.ac.th', role: UserRole.Admin, profileImageUrl: 'https://images.unsplash.com/photo-1635260191916-511fa73aa2dd?q', department: TeacherDepartment.Executive });
            setAuthModalState('closed'); setActiveTab('home'); return;
        }
        
        // Find user by ID (username field in auth) or by email
        const foundLoginUser = users.find(u => 
            u.id.toLowerCase() === usernameLower || 
            (u.email && u.email.toLowerCase() === usernameLower)
        );
        
        if (foundLoginUser) {
            // Verify password
            if (foundLoginUser.password && foundLoginUser.password !== password) {
                addNotification(t('errorInvalidCredentials'), 'error');
                return;
            }
            
            let userProfile: User | undefined;
            
            // Try to find matching profile by email if available
            if (foundLoginUser.email) {
                const emailLower = foundLoginUser.email.toLowerCase();
                if (foundLoginUser.role === UserRole.Teacher) {
                    userProfile = teachers.find(t => t.email.toLowerCase() === emailLower);
                } else if (foundLoginUser.role === UserRole.Student) {
                    userProfile = students.find(s => s.email.toLowerCase() === emailLower);
                } else if (foundLoginUser.role === UserRole.Admin) {
                    userProfile = {
                        id: foundLoginUser.id,
                        username: foundLoginUser.id,
                        email: foundLoginUser.email,
                        role: UserRole.Admin,
                        profileImageUrl: 'https://images.unsplash.com/photo-1635260191916-511fa73aa2dd?q',
                        department: TeacherDepartment.Executive
                    };
                }
            }
            
            // If no email match, create basic profile from login user
            if (!userProfile) {
                if (foundLoginUser.role === UserRole.Teacher) {
                    userProfile = {
                        id: foundLoginUser.id,
                        username: foundLoginUser.id,
                        email: foundLoginUser.email || '',
                        role: UserRole.Teacher,
                        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q',
                        department: TeacherDepartment.Executive
                    };
                } else if (foundLoginUser.role === UserRole.Student) {
                    userProfile = {
                        id: foundLoginUser.id,
                        username: foundLoginUser.id,
                        email: foundLoginUser.email || '',
                        role: UserRole.Student,
                        profileImageUrl: 'https://images.unsplash.com/photo-1535713566543-0ca126c9a646?q',
                        studentId: foundLoginUser.id,
                        grade: 0,
                        classroom: ''
                    };
                } else if (foundLoginUser.role === UserRole.Admin) {
                    userProfile = {
                        id: foundLoginUser.id,
                        username: foundLoginUser.id,
                        email: foundLoginUser.email || '',
                        role: UserRole.Admin,
                        profileImageUrl: 'https://images.unsplash.com/photo-1635260191916-511fa73aa2dd?q',
                        department: TeacherDepartment.Executive
                    };
                }
            }
            
            if (userProfile) {
                setCurrentUser(userProfile);
                setAuthModalState('closed');
                setActiveTab('home');
            } else {
                addNotification('ไม่สามารถโหลดโปรไฟล์ได้', 'error');
            }
        } else {
            addNotification(t('errorInvalidCredentials'), 'error');
        }
    }, [users, teachers, students, t, addNotification]);

    const handleLogout = useCallback(() => { setCurrentUser(null); setActiveTab('home'); }, []);

    const handleSaveProduct = async (productData: Product) => {
        const isEditing = !!productToEdit;
        const action = isEditing ? 'update' : 'append';
        const payload = isEditing ? productData : { ...productData, id: `PROD-${Date.now()}`};
        const result = await gasHelper(action, 'Products', sanitizeForSheet(payload));
        if (result.success) {
            const finalData = isEditing ? payload : result.data;
            if (isEditing) {
                setProducts(prev => prev.map(p => p.id === finalData.id ? finalData : p));
                setDevices(prev => prev.map(d => {
                    if (d.productId === finalData.id) {
                        return { ...d, name: finalData.name, category: finalData.category, imageUrl: finalData.imageUrl, designatedFor: finalData.designatedFor, accessories: finalData.defaultAccessories };
                    }
                    return d;
                }));
                addNotification(`${t('editSuccess')} ${finalData.name}`, 'success');
            } else {
                setProducts(prev => [finalData, ...prev]);
                addNotification(`${t('addSuccess')} ${finalData.name}`, 'success');
            }
            setProductModalOpen(false); setProductToEdit(null);
        } else { addNotification(`Error saving product: ${result.error}`, 'error'); }
    };

    const handleDeleteProduct = async (productId: string) => {
        const productToDelete = products.find(p => p.id === productId);
        if (window.confirm(t('confirmDeleteProductMsg').replace('{productName}', productToDelete?.name || productId))) {
            const result = await gasHelper('delete', 'Products', { id: productId });
            if (result.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                addNotification('Successfully deleted product', 'success');
            } else { addNotification(`Error deleting product: ${result.error}`, 'error'); }
        }
    };

    const openProductModal = (product: Product | null) => {
        setProductToEdit(product);
        setProductModalOpen(true);
    };

    const handleSaveDevice = async (deviceData: Device) => {
      const isEditing = !!deviceToEdit;
      const action = isEditing ? 'update' : 'append';
      
      const { name, category, imageUrl, designatedFor, accessories, ...payloadToSheet } = deviceData;

      const result = await gasHelper(action, 'Devices', sanitizeForSheet(payloadToSheet));
      
      if (result.success) {
        const savedData = isEditing ? payloadToSheet : result.data;
        const prod = products.find(p => p.id === savedData.productId);
        const hydratedResult = {
            ...savedData,
            name: prod ? prod.name : name,
            imageUrl: prod ? prod.imageUrl : imageUrl,
            category: prod ? prod.category : category,
            designatedFor: prod ? prod.designatedFor : designatedFor,
            accessories: prod ? prod.defaultAccessories : accessories
        };

        if (isEditing) {
            setDevices(prev => prev.map(d => d.id === hydratedResult.id ? hydratedResult : d));
            addNotification(`${t('editSuccess')} ${hydratedResult.name}`, 'success');
        } else {
            setDevices(prev => [hydratedResult, ...prev]);
            addNotification(`${t('addSuccess')} ${hydratedResult.name}`, 'success');
        }
        setDetailModalOpen(false); setDeviceToEdit(null);
      } else { addNotification(`Error saving device: ${result.error}`, 'error'); }
    };
    
    const handleDeleteDevice = async (deviceId: string) => {
        const deviceToDelete = devices.find(d => d.id === deviceId);
        if (window.confirm(t('confirmDeleteDeviceMsg').replace('{deviceName}', deviceToDelete?.name || deviceId))) {
            const result = await gasHelper('delete', 'Devices', { id: deviceId });
            if (result.success) {
                setDevices(prev => prev.filter(d => d.id !== deviceId));
                addNotification(`Successfully deleted ${deviceToDelete?.name}`, 'success');
            } else { addNotification(`Error deleting device: ${result.error}`, 'error'); }
        }
    };
    
    const handleBorrowRequest = async (deviceId: string) => {
        if (!currentUser) return;
        const deviceToUpdate = devices.find(d => d.id === deviceId);
        if (!deviceToUpdate) return;
        
        // Teacher must wait for admin approval, Student borrows directly
        let status = DeviceStatus.Borrowed;
        let message = t('borrowRequestSuccess');
        
        if (currentUser.role === UserRole.Teacher) {
            status = DeviceStatus.PendingApproval;
            message = 'ส่งคำขอยืมสำเร็จ รอการอนุมัติจากแอดมิน';
        }
        
        const minimalUpdate = { id: deviceId, status: status, borrowedBy: currentUser.username, borrowDate: new Date().toISOString() };
        
        const result = await gasHelper('update', 'Devices', sanitizeForSheet(minimalUpdate));
        if (result.success) {
            setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: status, borrowedBy: currentUser.username, borrowDate: new Date().toISOString() } : d));
            addNotification(message, 'success');
            await logActivity('BORROW_REQUESTED', `User ${currentUser.username} (${currentUser.role}) ${status === DeviceStatus.PendingApproval ? 'requested' : 'borrowed'} ${deviceToUpdate.name}`);
        } else { addNotification(`Error requesting device: ${result.error}`, 'error'); }
    };

    const processApproval = async (deviceId: string, isApproved: boolean, appleId = '', borrowNotes = '', selectedAccessories: string[] = []) => {
        const device = devices.find(d => d.id === deviceId);
        if (!device) return;
        
        let minimalUpdate: Partial<Device> & { id: string } = { id: deviceId };
        
        if (isApproved) {
            const borrowDate = new Date();
            const userToFind = [...teachers, ...students].find(u => u.username === device.borrowedBy);
            const userRole = userToFind ? userToFind.role : UserRole.Student;
            const dueDate = new Date(borrowDate);
            if (userRole === UserRole.Student) { dueDate.setFullYear(dueDate.getFullYear() + 2, dueDate.getMonth() + 6); }
            else if (userRole === UserRole.Teacher) { dueDate.setFullYear(dueDate.getFullYear() + 5); }
            
            minimalUpdate = {
                ...minimalUpdate,
                status: DeviceStatus.Borrowed,
                borrowDate: borrowDate.toISOString(),
                dueDate: dueDate.toISOString(),
                appleId,
                borrowNotes,
                borrowedAccessories: selectedAccessories.join(', ')
            };
        } else {
             minimalUpdate = {
                ...minimalUpdate,
                status: DeviceStatus.Available,
                borrowedBy: '',
                appleId: '',
                borrowNotes: '',
                borrowedAccessories: ''
            };
        }
        
        const result = await gasHelper('update', 'Devices', sanitizeForSheet(minimalUpdate));
        if (result.success) {
            setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, ...minimalUpdate } : d));
            if (isApproved) {
                const userToFind = [...teachers, ...students].find(u => u.username === device.borrowedBy);
                setBorrowSuccessInfo({ borrowerName: device.borrowedBy || 'User', borrowerRole: userToFind?.role || 'User', deviceName: device.name || 'Device' });
                setSuccessBorrowModalOpen(true);
                addNotification(`${t('approveSuccess')} ${device.name}`, 'success');
            } else {
                 addNotification(`${t('rejectSuccess')} ${device.name}`, 'info');
            }
            await logActivity(isApproved ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED', `Admin action on ${device.name} for ${device.borrowedBy}`);
        } else { addNotification(`Error updating status: ${result.error}`, 'error'); }
        setApprovalConfirmationModalOpen(false); setDeviceToApprove(null);
    };
    
    const handleApproval = (deviceId: string, isApproved: boolean) => {
        if (isApproved) {
            const device = devices.find(d => d.id === deviceId);
            if (device) {
              setDeviceToApprove(device);
              setApprovalConfirmationModalOpen(true);
            }
        } else {
            processApproval(deviceId, false);
        }
    };

    const handleProductApproval = async (requestId: string, isApproved: boolean, rejectReason?: string) => {
        const request = productApprovalRequests.find(r => r.id === requestId);
        if (!request || !currentUser) return;

        const updatedRequest: ProductApprovalRequest = {
            ...request,
            status: isApproved ? 'Approved' : 'Rejected',
            approvedBy: currentUser.username,
            approvalDate: new Date().toISOString(),
            rejectionReason: rejectReason
        };

        const result = await gasHelper('update', 'ProductApprovals', sanitizeForSheet(updatedRequest));
        if (result.success) {
            setProductApprovalRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
            const message = isApproved 
                ? `อนุมัติสินค้า ${request.productName} สำเร็จ`
                : `ปฏิเสธการอนุมัติสินค้า ${request.productName}`;
            addNotification(message, 'success');
            await logActivity('PRODUCT_APPROVAL', `${currentUser.username} ${isApproved ? 'อนุมัติ' : 'ปฏิเสธ'} สินค้า ${request.productName} จาก ${request.requestedBy}`);
        } else {
            addNotification(`ไม่สามารถดำเนินการได้: ${result.error}`, 'error');
        }
    };

    const handleDeviceReturn = (device: Device) => { setSelectedDevice(device); setICloudModalOpen(true); };
    
    const processReturn = async (device: Device, icloudEmail: string, returnNotes: string) => {
        if (!currentUser) return;
        const minimalUpdate = { id: device.id, status: DeviceStatus.Available, borrowedBy: '', borrowDate: '', dueDate: '', appleId: '', borrowNotes: '', borrowedAccessories: '' };
        
        const result = await gasHelper('update', 'Devices', sanitizeForSheet(minimalUpdate));
        if(result.success) {
            const historyEntry: HistoryEntry = {
                historyId: `hist-${Date.now()}`, deviceId: device.id, userId: currentUser.id,
                borrowerName: currentUser.username, borrowDate: device.borrowDate || '', returnDate: new Date().toISOString(),
                status: 'Returned', returnNotes, appleId: device.appleId, borrowNotes: device.borrowNotes, borrowedAccessories: device.borrowedAccessories
            };
            await gasHelper('append', 'History', sanitizeForSheet(historyEntry));
            setDevices(prev => prev.map(d => d.id === device.id ? { ...d, ...minimalUpdate } : d));
            setHistory(prev => [historyEntry, ...prev]);
            addNotification(`${t('returnSuccess')} ${device.name}`, 'success');
            await logActivity('DEVICE_RETURNED', `${device.name} returned by ${currentUser.username}. iCloud: ${icloudEmail}. Notes: ${returnNotes}`);
        } else { addNotification(`Error returning device: ${result.error}`, 'error'); }
    };
    
    const handleAssignDevice = async ({ user, device, appleId, borrowNotes, borrowedAccessories }: { user: User; device: Device; appleId: string; borrowNotes: string, borrowedAccessories: string[] }) => {
        const borrowDate = new Date();
        const dueDate = new Date(borrowDate);
        if (user.role === UserRole.Student) { dueDate.setFullYear(dueDate.getFullYear() + 2, dueDate.getMonth() + 6); } 
        else if (user.role === UserRole.Teacher) { dueDate.setFullYear(dueDate.getFullYear() + 5); }
        
        const minimalUpdate = {
             id: device.id,
             status: DeviceStatus.Borrowed,
             borrowedBy: user.username,
             borrowDate: borrowDate.toISOString(),
             dueDate: dueDate.toISOString(),
             appleId,
             borrowNotes,
             borrowedAccessories: borrowedAccessories.join(', ')
        };
        
        const result = await gasHelper('update', 'Devices', sanitizeForSheet(minimalUpdate));
        if (result.success) {
            setDevices(prev => prev.map(d => d.id === device.id ? { ...d, ...minimalUpdate } : d));
            setBorrowSuccessInfo({ borrowerName: user.username, borrowerRole: user.role, deviceName: device.name || 'Device' });
            setSuccessBorrowModalOpen(true);
            addNotification(`Assigned ${device.name} to ${user.username}`, 'success');
            await logActivity('DEVICE_ASSIGNED', `Admin assigned ${device.name} to ${user.username}. AppleID: ${appleId}`);
        } else {
            addNotification(`Error assigning device: ${result.error}`, 'error');
        }
    };
    
    const handleSubmitRepair = async ({ device, description, repairLocation, repairImageUrl }: { device: Device, description: string, repairLocation: string, repairImageUrl: string | null }) => {
        if (!currentUser) return;
        const newRequest = {
            id: `serv-${Date.now()}`,
            deviceId: device.id,
            deviceName: device.name,
            deviceSerialNumber: device.serialNumber,
            reportedBy: currentUser.username,
            description,
            repairLocation,
            repairImageUrl,
            status: 'Pending',
            reportedAt: new Date().toISOString()
        };
        const result = await gasHelper('append', 'Service', sanitizeForSheet(newRequest));
        if (result.success) {
            const newServiceRequestForState: ServiceRequest = {
                id: newRequest.id,
                device: { id: device.id, name: device.name || t('notSpecified'), serialNumber: device.serialNumber },
                reportedBy: newRequest.reportedBy,
                description: newRequest.description,
                status: 'Pending',
                reportedAt: newRequest.reportedAt,
                repairLocation: newRequest.repairLocation,
                repairImageUrl: newRequest.repairImageUrl,
            };
            setServiceRequests(prev => [newServiceRequestForState, ...prev]);
            addNotification(t('repairRequestSuccess'), 'success');
            await logActivity('REPAIR_REQUESTED', `Repair requested for ${device.name} by ${currentUser.username}`);
            setMaintenanceModalOpen(false);
        } else {
            addNotification(`Error submitting request: ${result.error}`, 'error');
        }
    };

    const handleFileUpload = (file: File, maxSizeMB: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (GOOGLE_DRIVE_FOLDER_ID === 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE') {
                reject(new Error("Google Drive Folder ID is not configured."));
                return;
            }
            if (!file.type.startsWith('image/')) {
                reject(new Error(t('errorInvalidFileType'))); return;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                reject(new Error(t('errorFileSizeTooLarge').replace('{maxSize}', String(maxSizeMB)))); return;
            }
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target?.result as string;
                const result = await gasHelper('uploadFile', null, { base64Data, fileName: file.name, folderId: GOOGLE_DRIVE_FOLDER_ID });
                if (result.success) { resolve(result.url); } 
                else { reject(new Error(result.error || "File upload failed.")); }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };
    
    const handleTeacherProfilePictureUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentUser && (currentUser.role === UserRole.Teacher || currentUser.role === UserRole.Admin)) {
            try {
                addNotification("Uploading picture...", "info");
                const newImageUrl = await handleFileUpload(file, 5);
                const updatedUser = { ...currentUser, profileImageUrl: newImageUrl };
                const result = await gasHelper('update', 'Teachers', updatedUser);
                if (result.success) {
                    setCurrentUser(updatedUser);
                    setTeachers(prev => prev.map(t => t.id === updatedUser.id ? (updatedUser as TeacherUser) : t));
                    addNotification("Profile picture updated!", "success");
                } else { throw new Error(result.error); }
            } catch (error) {
                addNotification(error.message, 'error');
            }
        }
    };
    
    const handleStudentProfilePictureUpdate = async (newImageUrl: string) => {
        if (!currentUser || !('grade' in currentUser)) return;
        const updatedUser: StudentUser = { ...(currentUser as StudentUser), profileImageUrl: newImageUrl };
        
        let sheetName;
        if (updatedUser.grade <= 4) sheetName = 'StudentsM4';
        else if (updatedUser.grade === 5) sheetName = 'StudentsM5';
        else sheetName = 'StudentsM6';

        const result = await gasHelper('update', sheetName, updatedUser);
        if (result.success) {
            setCurrentUser(updatedUser);
            setStudents(prev => prev.map(s => s.id === updatedUser.id ? updatedUser : s));
            addNotification("Profile picture updated!", "success");
            setProfilePictureModalOpen(false);
        } else {
            addNotification(`Error updating picture: ${result.error}`, 'error');
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        setScannerOpen(false);
        if (scanResultHandler) {
            scanResultHandler(decodedText);
            setScanResultHandler(null);
            return;
        }
        const foundDevice = devices.find(d => d.id === decodedText || d.serialNumber === decodedText);
        if (!foundDevice) { addNotification(t('deviceNotFound'), 'error'); return; }
        if (scannerContext === 'admin') { setPageSearchTerm(decodedText); } 
        else { setScannedDevice(foundDevice); setDeviceInfoModalOpen(true); }
    };

    const handleScanRequest = (callback: (result: string) => void) => {
        setScanResultHandler(() => callback);
        setScannerOpen(true);
    };

    const handleOpenScanner = (context: 'user' | 'admin') => { setScannerContext(context); setScannerOpen(true); };
    const openDetailModal = (device: Device | null) => { setDeviceToEdit(device); setDetailModalOpen(true); };
    const handleOpenMaintenanceModal = (device: Device) => { setSelectedDevice(device); setMaintenanceModalOpen(true); };
    
    const renderContent = () => {
      if (!currentUser) return null;
      switch (activeTab) {
        case 'home': return <Dashboard user={currentUser} devices={devices} products={products} onOpenMaintenanceModal={handleOpenMaintenanceModal} onDeviceReturn={handleDeviceReturn} onOpenAddDeviceModal={() => openDetailModal(null)} onOpenEditDeviceModal={openDetailModal} onOpenAssignDeviceModal={() => setAssignWizardOpen(true)} onOpenAssignFromProductModal={setAssignFromProduct} addNotification={addNotification} t={t} searchTerm={pageSearchTerm} setSearchTerm={setPageSearchTerm} onAdminScan={() => handleOpenScanner('admin')} onBorrowRequest={handleBorrowRequest} onDeleteDevice={handleDeleteDevice} activityLogs={activityLogs} />;
        case 'services': return <ServicesPage user={currentUser} requests={serviceRequests} setRequests={setServiceRequests} t={t} addNotification={addNotification} logActivity={logActivity} sanitizeForSheet={sanitizeForSheet} />;
        case 'approvals': return <ApprovalPage devices={devices} onApproval={handleApproval} t={t} />;
        case 'productApprovals': return currentUser.role === UserRole.Admin ? <ProductApprovalPage approvalRequests={productApprovalRequests} onApproval={handleProductApproval} t={t} /> : null;
        case 'history': return <HistoryPage history={history} devices={devices} t={t} />;
        case 'profile': return <ProfilePage user={currentUser} devices={devices} onLogout={handleLogout} setActiveTab={setActiveTab} t={t} language={language} setLanguage={setLanguage} onOpenProfilePictureModal={() => setProfilePictureModalOpen(true)} onTriggerTeacherProfilePictureUpload={handleTeacherProfilePictureUpdate} pendingApprovalsCount={devices.filter(d => d.status === DeviceStatus.PendingApproval).length} />;
        case 'userManagement': return <UserManagementPage teachers={teachers} students={students} t={t} />;
        case 'reports': return <ReportsPage borrowHistory={history} t={t} devices={devices} students={students} teachers={teachers} />;
        case 'productManagement': return <ProductManagementPage products={products} onEditProduct={openProductModal} onAddProduct={() => openProductModal(null)} onDeleteProduct={handleDeleteProduct} onAssignUser={(product) => { setProductForAssignment(product); setAssignDeviceFromProductModalOpen(true); }} t={t} searchTerm={pageSearchTerm} setSearchTerm={setPageSearchTerm} />;
        default: return <Dashboard user={currentUser} devices={devices} products={products} onOpenMaintenanceModal={handleOpenMaintenanceModal} onDeviceReturn={handleDeviceReturn} onOpenAddDeviceModal={() => openDetailModal(null)} onOpenEditDeviceModal={openDetailModal} onOpenAssignDeviceModal={() => setAssignWizardOpen(true)} addNotification={addNotification} t={t} searchTerm={pageSearchTerm} setSearchTerm={setPageSearchTerm} onAdminScan={() => handleOpenScanner('admin')} onBorrowRequest={handleBorrowRequest} onDeleteDevice={handleDeleteDevice} activityLogs={activityLogs} />;
      }
    };

    if (isLoading) return <div className="fixed inset-0 flex flex-col items-center justify-center bg-yellow-50 z-[200]"><div className="loader"></div><p className="mt-4 text-gray-600 font-semibold">Loading Data...</p></div>;
    if (error) return <div className="fixed inset-0 flex items-center justify-center bg-red-100 z-[200]"><p className="text-red-600 font-bold text-lg p-4 text-center">Error: {error}</p></div>;

    return (
      <div className={`min-h-screen font-sans text-gray-800 ${currentUser || isVisitorMode ? 'bg-spk-gray' : 'bg-spk-blue'}`}>
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm flex flex-col gap-2">{notifications.map(notification => <NotificationToast key={notification.id} notification={notification} onClose={removeNotification} />)}</div>
        
        {currentUser ? (
          <div className="pb-24">
            
            <main className="p-2 sm:p-4 lg:p-6">{renderContent()}</main>
            <Footer t={t} />
            <BottomNavBar user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} t={t} onScanClick={() => handleOpenScanner('user')} pendingApprovalsCount={devices.filter(d => d.status === DeviceStatus.PendingApproval).length}/>
          </div>
        ) : isVisitorMode ? (
            <VisitorPage
                devices={devices}
                products={products}
                t={t}
                onLoginClick={() => {
                    setIsVisitorMode(false);
                    setAuthModalState('login');
                }}
                onExit={() => setIsVisitorMode(false)}
            />
        ) : (
          <LandingPage 
            onLoginClick={() => setAuthModalState('login')} 
            onVisitorClick={() => setIsVisitorMode(true)} 
            t={t} 
          />
        )}

        {authModalState !== 'closed' && <AuthModal mode={authModalState} onClose={() => setAuthModalState('closed')} onSwitchMode={(mode) => setAuthModalState(mode)} onLoginSuccess={handleLoginSuccess} t={t} />}
        {selectedDevice && isMaintenanceModalOpen && <MaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => setMaintenanceModalOpen(false)} device={selectedDevice} t={t} handleFileUpload={handleFileUpload} addNotification={addNotification} onSubmit={handleSubmitRepair} />}
        {selectedDevice && isICloudModalOpen && <ICloudModal isOpen={isICloudModalOpen} onClose={() => {setICloudModalOpen(false); setSelectedDevice(null)}} device={selectedDevice} addNotification={addNotification} onReturn={processReturn} t={t} />}
        
        {isDetailModalOpen && <DeviceDetailModal isOpen={isDetailModalOpen} onClose={() => { setDetailModalOpen(false); setDeviceToEdit(null); }} onSave={handleSaveDevice} deviceToEdit={deviceToEdit} products={products} t={t} />}
        {isProductModalOpen && <ProductDetailModal isOpen={isProductModalOpen} onClose={() => { setProductModalOpen(false); setProductToEdit(null); }} onSave={handleSaveProduct} productToEdit={productToEdit} t={t} />}
        
        {isScannerOpen && <ScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} t={t} />}
        {isDeviceInfoModalOpen && scannedDevice && <DeviceInfoModal isOpen={isDeviceInfoModalOpen} onClose={() => setDeviceInfoModalOpen(false)} device={scannedDevice} t={t} onBorrowRequest={handleBorrowRequest} currentUser={currentUser}/>}
        {isApprovalConfirmationModalOpen && deviceToApprove && <ApprovalConfirmationModal isOpen={isApprovalConfirmationModalOpen} onClose={() => {setApprovalConfirmationModalOpen(false); setDeviceToApprove(null);}} device={deviceToApprove} onConfirm={processApproval} t={t} />}
        <AssignDeviceWizardModal isOpen={isAssignWizardOpen} onClose={() => setAssignWizardOpen(false)} students={students} teachers={teachers} devices={devices} onAssign={handleAssignDevice} t={t} />
            <AssignFromProductModal 
                isOpen={!!assignFromProduct}
                onClose={() => setAssignFromProduct(null)}
                product={assignFromProduct}
                students={students}
                teachers={teachers}
                devices={devices}
                onAssign={handleAssignDevice}
                t={t}
            />
            <AssignDeviceFromProductModal
                isOpen={isAssignDeviceFromProductModalOpen}
                onClose={() => { setAssignDeviceFromProductModalOpen(false); setProductForAssignment(null); }}
                product={productForAssignment}
                students={students}
                teachers={teachers}
                currentUser={currentUser}
                onAssign={handleAssignDevice}
                t={t}
            />
        <SuccessBorrowModal isOpen={isSuccessBorrowModalOpen} onClose={() => setSuccessBorrowModalOpen(false)} borrowerName={borrowSuccessInfo.borrowerName} borrowerRole={borrowSuccessInfo.borrowerRole} deviceName={borrowSuccessInfo.deviceName} t={t} />
        <SelectProfilePictureModal isOpen={isProfilePictureModalOpen} onClose={() => setProfilePictureModalOpen(false)} onSelect={handleStudentProfilePictureUpdate} t={t} />
      </div>
    );
};

export default App;