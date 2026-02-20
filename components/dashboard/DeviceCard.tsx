
import React from 'react';
import type { User, Device } from '../../types';
import { UserRole, DeviceStatus } from '../../types';

interface DeviceCardProps {
  device: Device;
  user: User | null;
  t: (key: string) => string;
  onReturn?: (device: Device) => void;
  onReport?: (device: Device) => void;
  onBorrowRequest?: (id: string) => void;
  onEdit?: (device: Device) => void;
  onDelete?: (id: string) => void;
  showAssetId?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = (props) => {
    const { device, user, t, onReturn, onReport, onBorrowRequest, onEdit, onDelete, showAssetId } = props;
    
    const statusColor: {[key in DeviceStatus]: string} = {
        [DeviceStatus.Available]: "border-green-500",
        [DeviceStatus.Borrowed]: "border-blue-500",
        [DeviceStatus.Maintenance]: "border-orange-500",
        [DeviceStatus.PendingApproval]: "border-yellow-500",
        [DeviceStatus.Lost]: "border-red-500",
    };

    const isMyDevice = user && device.borrowedBy === user.username;
    const canBorrow = user && device.status === DeviceStatus.Available && (device.designatedFor === user.role || !device.designatedFor || (device.designatedFor as string) === t('notSpecified'));
    
    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${statusColor[device.status]}`}>
            <div className="flex">
                <img src={device.imageUrl || 'https://picsum.photos/200'} alt={device.name} className="w-28 h-28 object-cover"/>
                <div className="p-3 flex-grow">
                    <h3 className="font-bold text-md text-gray-800">{device.name}</h3>
                    <p className="text-xs text-gray-500">{showAssetId ? `ID: ${device.id}` : `S/N: ${device.serialNumber}`}</p>
                    <div className="text-xs mt-2">
                        <span className={`px-2 py-1 rounded-full text-white ${
                            { [DeviceStatus.Available]: 'bg-green-500', [DeviceStatus.Borrowed]: 'bg-blue-500', [DeviceStatus.Maintenance]: 'bg-orange-500', [DeviceStatus.PendingApproval]: 'bg-yellow-500 text-black', [DeviceStatus.Lost]: 'bg-red-500' }[device.status]
                        }`}>{t(device.status.toLowerCase() as keyof typeof translations.en) || device.status}</span>
                    </div>
                    {device.status === DeviceStatus.Borrowed && <p className="text-xs mt-1 text-gray-600">Borrowed by: {device.borrowedBy}</p>}
                </div>
            </div>
            
            <div className="bg-gray-50 p-2 flex justify-end items-center gap-2">
                {isMyDevice && (
                    <>
                       <button onClick={() => onReturn?.(device)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <span className="material-icons-outlined text-lg">assignment_return</span> {t('return')}
                        </button>
                         <button onClick={() => onReport?.(device)} className="text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1">
                            <span className="material-icons-outlined text-lg">build</span> {t('reportIssue')}
                        </button>
                    </>
                )}
                {canBorrow && (
                    <button onClick={() => onBorrowRequest?.(device.id)} className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1">
                        <span className="material-icons-outlined text-lg">add_shopping_cart</span> {t('borrow')}
                    </button>
                )}
                {user?.role === UserRole.Admin && (
                    <div className="flex items-center gap-1 ml-auto">
                        {onEdit && (
                            <button onClick={() => onEdit(device)} className="text-sm text-indigo-600 hover:text-indigo-800 p-1" title="Edit">
                                <span className="material-icons-outlined text-lg">edit</span>
                            </button>
                        )}
                        <button onClick={() => onDelete?.(device.id)} className="text-sm text-red-500 hover:text-red-700 p-1" title="Delete">
                             <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceCard;
