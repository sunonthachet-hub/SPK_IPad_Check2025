
import React from 'react';
import type { Device, User } from '../../types';
import { DeviceStatus } from '../../types';

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

        {canBorrow && (
             <button
                onClick={() => {
                    onBorrowRequest(device.id);
                    onClose();
                }}
                className="w-full mt-6 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
             >
                Request to Borrow
            </button>
        )}
      </div>
    </div>
  );
};

export default DeviceInfoModal;
