
import React from 'react';
import type { Device } from '../../types';
import { DeviceStatus } from '../../types';

interface ApprovalPageProps {
  devices: Device[];
  onApproval: (deviceId: string, isApproved: boolean) => void;
  t: (key: string) => string;
}

const ApprovalPage: React.FC<ApprovalPageProps> = ({ devices, onApproval, t }) => {
  const pendingDevices = devices.filter(d => d.status === DeviceStatus.PendingApproval);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('approvals')}</h1>
        <p className="text-gray-500">Review and manage borrow requests</p>
      </header>
      
      <div className="space-y-4">
        {pendingDevices.length > 0 ? pendingDevices.map(device => (
          <div key={device.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <img src={device.imageUrl} alt={device.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                <div>
                  <h3 className="font-bold text-lg">{device.name}</h3>
                  <p className="text-sm text-gray-600">Requested by: <span className="font-semibold">{device.borrowedBy}</span></p>
                  <p className="text-xs text-gray-500">{device.serialNumber}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => onApproval(device.id, true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span className="material-icons-outlined">check_circle</span>
                  {t('approve')}
                </button>
                <button
                  onClick={() => onApproval(device.id, false)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span className="material-icons-outlined">cancel</span>
                  {t('reject')}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-10">
            <span className="material-icons-outlined text-6xl text-gray-300">notifications_off</span>
            <p className="mt-4 text-gray-500">No pending approvals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;
