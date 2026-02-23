
import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { User, Device, Product, ActivityLog } from '../../types';
import { UserRole, DeviceStatus } from '../../types';
import DeviceCard from './DeviceCard';

interface DashboardProps {
  user: User;
  devices: Device[];
  products: Product[];
  onOpenMaintenanceModal: (device: Device) => void;
  onDeviceReturn: (device: Device) => void;
  onOpenAddDeviceModal: () => void;
  onOpenEditDeviceModal: (device: Device) => void;
  onBorrowRequest: (deviceId: string) => void;
  onDeleteDevice: (deviceId: string) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  t: (key: string) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdminScan: () => void;
  activityLogs: ActivityLog[];
}

// Utility function to calculate remaining time percentage and color
const getReturnTimeColor = (borrowDate: string | undefined, dueDate: string | undefined): { color: string; percentage: number; text: string } => {
  if (!borrowDate || !dueDate) return { color: 'bg-gray-100', percentage: 0, text: 'N/A' };
  
  const now = new Date();
  const borrow = new Date(borrowDate);
  const due = new Date(dueDate);
  
  const totalMs = due.getTime() - borrow.getTime();
  const remainingMs = due.getTime() - now.getTime();
  
  if (remainingMs <= 0) return { color: 'bg-red-100', percentage: 0, text: 'Overdue' };
  
  const percentage = (remainingMs / totalMs) * 100;
  
  let color = 'bg-gray-100';
  if (percentage > 70) color = 'bg-green-100'; // 🟢 Green
  else if (percentage > 30) color = 'bg-orange-100'; // 🟠 Orange
  else if (percentage > 10) color = 'bg-yellow-100'; // 🟡 Yellow
  else color = 'bg-red-100'; // 🔴 Red
  
  return { color, percentage: Math.round(percentage), text: `${Math.round(percentage)}%` };
};

interface DashboardProps {
  user: User;
  devices: Device[];
  products: Product[];
  onOpenMaintenanceModal: (device: Device) => void;
  onDeviceReturn: (device: Device) => void;
  onOpenAddDeviceModal: () => void;
  onOpenEditDeviceModal: (device: Device) => void;
  onBorrowRequest: (deviceId: string) => void;
  onDeleteDevice: (deviceId: string) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  t: (key: string) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdminScan: () => void;
  activityLogs: ActivityLog[];
}

const AdminTableView: React.FC<{devices: Device[], searchTerm: string, t: (key: string) => string, onEdit: (device: Device) => void, onReturn: (device: Device) => void, onReport: (device: Device) => void, onDelete: (deviceId: string) => void}> = ({ devices, searchTerm, t, onEdit, onReturn, onReport, onDelete }) => {
    const filteredDevices = useMemo(() => {
        if (!searchTerm) return devices;
        const lower = searchTerm.toLowerCase();
        return devices.filter(d =>
          d.name?.toLowerCase().includes(lower) ||
          d.serialNumber?.toLowerCase().includes(lower) ||
          d.borrowedBy?.toLowerCase().includes(lower) ||
          d.category?.toLowerCase().includes(lower)
        );
    }, [devices, searchTerm]);

    const groupedDevices = useMemo(() => {
        const groups: { [key: string]: Device[] } = {};
        filteredDevices.forEach(device => {
            const category = device.category || 'Others';
            if (!groups[category]) groups[category] = [];
            groups[category].push(device);
        });
        return groups;
    }, [filteredDevices]);

    return (
        <div className="space-y-4">
            {Object.entries(groupedDevices).map(([category, categoryDevices]) => (
                <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-spk-blue to-blue-500 text-white p-3 font-semibold">
                        {category} ({categoryDevices.length})
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left p-3">ผู้ยืม</th>
                                    <th className="text-left p-3">รุ่น</th>
                                    <th className="text-left p-3">S/N</th>
                                    <th className="text-center p-3">สถานะ</th>
                                    <th className="text-center p-3">เหลือ</th>
                                    <th className="text-center p-3">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categoryDevices.map(device => {
                                    const { color, percentage, text } = getReturnTimeColor(device.borrowDate, device.dueDate);
                                    return (
                                        <tr key={device.id} className="hover:bg-gray-50">
                                            <td className="p-3">{device.borrowedBy || '-'}</td>
                                            <td className="p-3">{device.name || '-'}</td>
                                            <td className="p-3 text-xs text-gray-500">{device.serialNumber || device.id}</td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                    device.status === DeviceStatus.Available ? 'bg-green-100 text-green-700' :
                                                    device.status === DeviceStatus.Borrowed ? 'bg-blue-100 text-blue-700' :
                                                    device.status === DeviceStatus.Maintenance ? 'bg-orange-100 text-orange-700' :
                                                    device.status === DeviceStatus.PendingApproval ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {device.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {device.status === DeviceStatus.Borrowed ? (
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
                                                        {text}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="p-3 text-center space-x-1">
                                                <button onClick={() => onEdit(device)} className="text-blue-600 hover:underline" title="Edit">✏️</button>
                                                {device.status === DeviceStatus.Borrowed && (
                                                    <button onClick={() => onReturn(device)} className="text-orange-600 hover:underline" title="Return">🔄</button>
                                                )}
                                                <button onClick={() => onReport(device)} className="text-red-600 hover:underline" title="Report">📋</button>
                                                <button onClick={() => { if (window.confirm('Delete?')) onDelete(device.id); }} className="text-red-700 hover:underline" title="Delete">🗑️</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};
    const stats = useMemo(() => {
        const productDevices = devices.filter(d => d.productId === product.id);
        return {
            total: productDevices.length,
            available: productDevices.filter(d => d.status === DeviceStatus.Available).length,
            borrowed: productDevices.filter(d => d.status === DeviceStatus.Borrowed).length,
            maintenance: productDevices.filter(d => d.status === DeviceStatus.Maintenance).length,
        }
    }, [product, devices]);
    
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-4">
                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md"/>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.description}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 text-center">
                <div className="p-3">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-gray-500 uppercase">ทั้งหมด</p>
                </div>
                 <div className="p-3 bg-green-50">
                    <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                    <p className="text-xs text-green-500 uppercase">{t('available')}</p>
                </div>
                 <div className="p-3 bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">{stats.borrowed}</p>
                    <p className="text-xs text-blue-500 uppercase">{t('borrowed')}</p>
                </div>
                 <div className="p-3 bg-orange-50">
                    <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
                    <p className="text-xs text-orange-500 uppercase">{t('maintenance')}</p>
                </div>
            </div>
        </div>
    )
}

const Pagination: React.FC<{currentPage: number, totalPages: number, onPageChange: (page: number) => void}> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > 4) {
                pageNumbers.push('...');
            }
            let start = Math.max(2, currentPage - 2);
            let end = Math.min(totalPages - 1, currentPage + 2);

            if (currentPage <= 4) {
                end = 5;
            }

            if (currentPage >= totalPages - 3) {
                start = totalPages - 4;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 3) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-4">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50">ก่อนหน้า</button>
            {pages.map((page, index) => (
                typeof page === 'number' ? (
                    <button key={index} onClick={() => onPageChange(page)} className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-spk-blue text-white' : 'bg-gray-200'}`}>{page}</button>
                ) : (
                    <span key={index} className="px-3 py-1">{page}</span>
                )
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50">ถัดไป</button>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { user, devices, products, t, onOpenAddDeviceModal, onOpenEditDeviceModal, onOpenMaintenanceModal, onDeviceReturn, onBorrowRequest, onDeleteDevice, activityLogs } = props;
  const [adminDeviceFilter, setAdminDeviceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const DEVICES_PER_PAGE = 9;

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activityLogs.length > 0) {
      setHasUnread(true);
    }
  }, [activityLogs]);

  const handleTogglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
    if (!isPanelOpen) {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const recentLogs = activityLogs.slice(0, 10);

  const { teacherProducts, studentProducts, generalProducts } = useMemo(() => {
    const teacherProducts = products.filter(p => p.designatedFor === UserRole.Teacher);
    const studentProducts = products.filter(p => p.designatedFor === UserRole.Student);
    const generalProducts = products.filter(p => !p.designatedFor || (p.designatedFor as string) === t('notSpecified'));
    return { teacherProducts, studentProducts, generalProducts };
  }, [products, t]);

  const overallStats = useMemo(() => {
    return {
        total: devices.length,
        available: devices.filter(d => d.status === DeviceStatus.Available).length,
        borrowed: devices.filter(d => d.status === DeviceStatus.Borrowed).length,
        maintenance: devices.filter(d => d.status === DeviceStatus.Maintenance).length,
        pending: devices.filter(d => d.status === DeviceStatus.PendingApproval).length,
    }
  }, [devices]);

  const filteredAdminDevices = useMemo(() => {
    if (!adminDeviceFilter) return devices;
    const lowercasedFilter = adminDeviceFilter.toLowerCase();
    return devices.filter(d =>
      d.name?.toLowerCase().includes(lowercasedFilter) ||
      d.serialNumber?.toLowerCase().includes(lowercasedFilter) ||
      d.borrowedBy?.toLowerCase().includes(lowercasedFilter) ||
      d.appleId?.toLowerCase().includes(lowercasedFilter)
    );
  }, [devices, adminDeviceFilter]);

  const paginatedAdminDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * DEVICES_PER_PAGE;
    return filteredAdminDevices.slice(startIndex, startIndex + DEVICES_PER_PAGE);
  }, [filteredAdminDevices, currentPage]);

  const totalPages = Math.ceil(filteredAdminDevices.length / DEVICES_PER_PAGE);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับ, {user.username.split(' ')[0]}!</h1>
            <p className="text-gray-500">สรุปภาพรวมอุปกรณ์ของโรงเรียนในวันนี้</p>
        </div>
        <div className="relative" ref={panelRef}>
            <button onClick={handleTogglePanel} className="relative" title={isPanelOpen ? 'ปิดการแจ้งเตือน' : 'เปิดการแจ้งเตือน'} aria-label={isPanelOpen ? 'Hide notifications' : 'Show notifications'}>
              <span className="material-icons-outlined text-3xl text-gray-600 hover:text-spk-blue transition-colors" aria-hidden>
                {isPanelOpen ? 'notifications_active' : 'notifications'}
              </span>
              {hasUnread && (
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
              )}
            </button>
            {isPanelOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border">
                <div className="p-3 font-bold border-b text-center text-gray-700">Recent Activity</div>
                <ul className="divide-y max-h-96 overflow-y-auto">
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log, index) => (
                      <li key={`${log.timestamp}-${index}`} className="p-3 text-sm hover:bg-gray-50">
                        <p className="font-semibold text-gray-800 capitalize">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center text-gray-500">No recent activity.</li>
                  )}
                </ul>
              </div>
            )}
        </div>
      </header>

       {user.role === UserRole.Admin && (
            <>
                <div className="bg-white p-3 rounded-lg shadow flex flex-wrap items-center justify-center gap-2">
                  <button onClick={onOpenAddDeviceModal} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm" title="เพิ่มอุปกรณ์ใหม่" aria-label="Add device">
                    <span className="material-icons-outlined" aria-hidden>add_box</span>
                    {t('addDevice')}
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">ภาพรวมอุปกรณ์ทั้งหมด</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 text-center gap-2">
                        <div className="p-3 bg-gray-100 rounded-lg"><p className="text-2xl font-bold">{overallStats.total}</p><p className="text-xs uppercase">ทั้งหมด</p></div>
                        <div className="p-3 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{overallStats.available}</p><p className="text-xs text-green-500 uppercase">{t('available')}</p></div>
                        <div className="p-3 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{overallStats.borrowed}</p><p className="text-xs text-blue-500 uppercase">{t('borrowed')}</p></div>
                        <div className="p-3 bg-orange-50 rounded-lg"><p className="text-2xl font-bold text-orange-600">{overallStats.maintenance}</p><p className="text-xs text-orange-500 uppercase">{t('maintenance')}</p></div>
                        <div className="p-3 bg-yellow-50 rounded-lg"><p className="text-2xl font-bold text-yellow-600">{overallStats.pending}</p><p className="text-xs text-yellow-500 uppercase">{t('pending')}</p></div>
                    </div>
                </div>
            </>
        )}

        {studentProducts.length > 0 && (
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-700 border-b-2 border-spk-yellow pb-1">อุปกรณ์สำหรับนักเรียน</h2>
                {studentProducts.map(p => <ProductGroup key={p.id} product={p} devices={devices} t={t} />)}
            </div>
        )}

        {teacherProducts.length > 0 && (
             <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-700 border-b-2 border-spk-yellow pb-1">อุปกรณ์สำหรับครู</h2>
                {teacherProducts.map(p => <ProductGroup key={p.id} product={p} devices={devices} t={t} />)}
            </div>
        )}
        
        {generalProducts.length > 0 && (
             <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-700 border-b-2 border-spk-yellow pb-1">อุปกรณ์ทั่วไป</h2>
                {generalProducts.map(p => <ProductGroup key={p.id} product={p} devices={devices} t={t} />)}
            </div>
        )}
        
        {user.role === UserRole.Admin && (
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-700 border-b-2 border-spk-blue pb-1">อุปกรณ์ทั้งหมดในระบบ ({filteredAdminDevices.length})</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาอุปกรณ์ (ชื่อ, S/N, ผู้ยืม, Category)..."
                    title="ค้นหาอุปกรณ์ด้วยชื่อ, S/N, ผู้ยืม หรือ Category"
                    value={adminDeviceFilter}
                    onChange={(e) => { setAdminDeviceFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                  <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>search</span>
                </div>
                <AdminTableView 
                    devices={filteredAdminDevices}
                    searchTerm={adminDeviceFilter}
                    t={t}
                    onEdit={onOpenEditDeviceModal}
                    onReturn={onDeviceReturn}
                    onReport={onOpenMaintenanceModal}
                    onDelete={onDeleteDevice}
                />
            </div>
        )}
    </div>
  );
};

export default Dashboard;
