
import React, { useMemo } from 'react';
import type { Device, User } from '../../types';
import { DeviceStatus } from '../../types';
import BorrowCountdownBadge from './BorrowCountdownBadge';

interface DeviceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  t: (key: string) => string;
  onBorrowRequest: (deviceId: string) => void;
  currentUser: User | null;
}

const DeviceInfoModal: React.FC<DeviceInfoModalProps> = ({ isOpen, onClose, device, onBorrowRequest, currentUser }) => {
  if (!isOpen) return null;
  
  const canBorrow = currentUser && device.status === DeviceStatus.Available && (device.designatedFor === currentUser.role || !device.designatedFor);

  const borrowProgress = useMemo(() => {
    if (!device.borrowDate || !device.dueDate) return null;
    try {
      const start = new Date(device.borrowDate).getTime();
      const end = new Date(device.dueDate).getTime();
      const now = Date.now();
      const total = Math.max(1, end - start);
      const remaining = Math.max(0, end - now);
      const pct = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
      return { pct, remaining, total };
    } catch (e) {
      return null;
    }
  }, [device.borrowDate, device.dueDate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <span className="material-icons-outlined">close</span>
        </button>
        <img src={device.imageUrl} alt={device.name} className="w-full h-48 object-cover rounded-lg mb-4" />
        <h2 className="text-xl font-bold text-spk-blue">{device.name}</h2>
        <p className="text-sm text-gray-500 mb-2">{device.serialNumber}</p>
        
        <div className="space-y-1 text-sm text-gray-700">
            <p><strong>Status:</strong> <span className="font-semibold">{device.status}</span></p>
            {device.status === DeviceStatus.Borrowed && <p><strong>Borrowed By:</strong> {device.borrowedBy}</p>}
        </div>

        {/* Borrow progress bar + countdown */}
        {device.status === DeviceStatus.Borrowed && borrowProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm text-gray-500" title="เวลาเหลือ">timer</span>
                <span>เวลาเหลือ</span>
              </div>
              <div className="text-right"><BorrowCountdownBadge dueDate={device.dueDate} t={() => ''} /></div>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full rounded bg-gradient-to-r from-green-400 via-yellow-300 to-red-500 transition-all"
                style={{ width: `${100 - borrowProgress.pct}%` }}
                aria-valuenow={100 - borrowProgress.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                title={`Remaining ${(Math.ceil(borrowProgress.remaining / (1000 * 60 * 60 * 24)))} days`}
              />
            </div>
          </div>
        )}

        {canBorrow && (
             <button
                onClick={() => {
                    onBorrowRequest(device.id);
                    onClose();
                }}
                className="w-full mt-6 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                title="ขออนุญาตยืมอุปกรณ์"
             >
                Request to Borrow
            </button>
        )}
      </div>
    </div>
  );
};

export default DeviceInfoModal;
