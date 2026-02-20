
import React, { useMemo, useState } from 'react';
import type { User, ServiceRequest } from '../../types';
import { UserRole } from '../../types';
import { gasHelper } from '../../services/gasService';

interface ServicesPageProps {
  user: User;
  requests: ServiceRequest[];
  setRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>;
  t: (key: string) => string;
  addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  logActivity: (action: string, details: string) => Promise<void>;
  sanitizeForSheet: (payload: Record<string, unknown>) => Record<string, unknown>;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ user, requests, setRequests, t, addNotification, logActivity, sanitizeForSheet }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [repairLocation, setRepairLocation] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myRequests = useMemo(() => {
    if (user.role === UserRole.Admin) {
      return requests;
    }
    return requests.filter(r => r.reportedBy === user.username);
  }, [requests, user]);

  const handleStatusChange = async (requestId: string, newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
    const requestToUpdate = requests.find(r => r.id === requestId);
    if (!requestToUpdate) return;

    const payload = { id: requestId, status: newStatus };
    const result = await gasHelper('update', 'Service', sanitizeForSheet(payload));
    if (result.success) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
      addNotification(`${t('services')}: ${requestToUpdate.device.name} ${t('inProgress')}`, 'success');
      await logActivity('SERVICE_STATUS_CHANGED', `Request ${requestId} for ${requestToUpdate.device.name} changed to ${newStatus}`);
    } else {
      addNotification(`${t('errorInvalidCredentials')}: ${result.error}`, 'error');
    }
  };

  const handleSubmitRepairRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim() || !description.trim()) {
      addNotification('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    setIsSubmitting(true);
    const newRequest = {
      id: `serv-${Date.now()}`,
      serialNumber: serialNumber.trim(),
      description: description.trim(),
      repairLocation: repairLocation.trim(),
      reportedBy: user.username,
      reportedAt: new Date().toISOString(),
      status: 'Pending',
      device: {
        id: '',
        name: '',
        serialNumber: serialNumber.trim()
      }
    };

    const result = await gasHelper('create', 'Service', sanitizeForSheet(newRequest));
    if (result.success) {
      setRequests(prev => [...prev, newRequest]);
      setSerialNumber('');
      setDescription('');
      setRepairLocation('');
      setShowForm(false);
      addNotification(t('repairRequestSuccess'), 'success');
      await logActivity('SERVICE_REQUESTED', `${user.username} submitted repair request for serial: ${serialNumber}`);
    } else {
      addNotification(`ไม่สามารถส่งคำขอซ่อมได้: ${result.error}`, 'error');
    }
    setIsSubmitting(false);
  };

  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800'
  };

  const getStatusLabel = (status: string): string => {
    switch(status) {
      case 'Pending': return t('pending');
      case 'In Progress': return t('inProgress');
      case 'Resolved': return t('resolved');
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('services')}</h1>
        <p className="text-gray-500">{t('trackRepairRequests')}</p>
      </header>

      {(user.role === UserRole.Teacher || user.role === UserRole.Admin) && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-spk-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800"
        >
          <span className="material-icons-outlined">add</span>
          แจ้งซ่อมอุปกรณ์
        </button>
      )}

      {showForm && (user.role === UserRole.Teacher || user.role === UserRole.Admin) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">แจ้งซ่อมอุปกรณ์</h2>
          <form onSubmit={handleSubmitRepairRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">หมายเลขซีเรีย</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="ใส่หมายเลขซีเรีย"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">รายละเอียดปัญหา</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="อธิบายปัญหาของอุปกรณ์"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">สถานที่ซ่อม</label>
              <input
                type="text"
                value={repairLocation}
                onChange={(e) => setRepairLocation(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="เช่น ห้องเรียน 1 หรือ ลานกีฬา"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-spk-blue text-white py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400"
              >
                {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอซ่อม'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-4">
        {myRequests.length > 0 ? myRequests.map(req => (
          <div key={req.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{req.device.name || req.device.serialNumber}</h3>
                <p className="text-sm text-gray-500">{t('serialNumber')}: {req.device.serialNumber}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[req.status]}`}>
                {getStatusLabel(req.status)}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{req.description}</p>
            {req.repairLocation && (
              <p className="text-sm text-gray-600 mt-1">สถานที่: {req.repairLocation}</p>
            )}
            {req.repairImageUrl && (
              <a href={req.repairImageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                <img src={req.repairImageUrl} alt="Repair" className="w-24 h-24 rounded-md object-cover"/>
              </a>
            )}
            <p className="text-xs text-gray-500 mt-2">{t('reportedBy')} {req.reportedBy} {t('on')} {new Date(req.reportedAt).toLocaleDateString('th-TH')}</p>

            {user.role === UserRole.Admin && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2">
                <label className="text-sm font-medium">{t('changeStatus')}:</label>
                <select 
                  value={req.status} 
                  onChange={(e) => handleStatusChange(req.id, e.target.value as 'Pending' | 'In Progress' | 'Resolved')}
                  className="border rounded-md p-1 text-sm focus:ring-spk-yellow focus:border-spk-yellow"
                >
                  <option value="Pending">{t('pending')}</option>
                  <option value="In Progress">{t('inProgress')}</option>
                  <option value="Resolved">{t('resolved')}</option>
                </select>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-10">
            <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
            <p className="mt-4 text-gray-500">{t('noServiceRequests')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
