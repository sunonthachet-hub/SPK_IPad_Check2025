import React, { useState, useMemo } from 'react';
import type { User, Device, Product, StudentUser, TeacherUser } from '../../types';
import { UserRole, TeacherDepartment, DeviceStatus } from '../../types';

interface AssignFromProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  students: StudentUser[];
  teachers: TeacherUser[];
  devices: Device[];
  onAssign: (data: { user: User; device: Device; appleId: string; borrowNotes: string, borrowedAccessories: string[] }) => void;
  t: (key: string) => string;
}

const AssignFromProductModal: React.FC<AssignFromProductModalProps> = (props) => {
  const { isOpen, onClose, product, students, teachers, devices, onAssign, t } = props;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [appleId, setAppleId] = useState('');
  const [borrowNotes, setBorrowNotes] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState<string>('');

  const resetState = () => {
    setSelectedUser(null); setSelectedDevice(null); setAppleId(''); setBorrowNotes(''); setSelectedAccessory('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAssign = () => {
    if (selectedUser && selectedDevice && appleId) {
      onAssign({ user: selectedUser, device: selectedDevice, appleId, borrowNotes, borrowedAccessories: selectedAccessory ? [selectedAccessory] : [] });
      handleClose();
    } else {
        alert("Please fill all required fields.");
    }
  };

  const availableDevices = useMemo(() => {
      if (!product || !selectedUser) return [];
      return devices.filter(d => d.productId === product.id && d.status === DeviceStatus.Available && (!d.designatedFor || d.designatedFor === selectedUser.role));
  }, [product, devices, selectedUser]);

  const allUsers = useMemo(() => [...teachers, ...students], [teachers, students]);

  const availableAccessories = useMemo(() => {
    if(!selectedDevice?.accessories) return [];
    return Array.isArray(selectedDevice.accessories) ? selectedDevice.accessories : selectedDevice.accessories.split(',').map(s => s.trim());
  }, [selectedDevice]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] flex flex-col">
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"><span className="material-icons-outlined">close</span></button>
        <h2 className="text-xl font-bold mb-4">Assign {product.name}</h2>
        
        <div className="overflow-y-auto flex-grow space-y-4">
            <div>
                <label className="block text-sm font-medium">Select User</label>
                <select onChange={(e) => setSelectedUser(allUsers.find(u => u.id === e.target.value) || null)} defaultValue="" className="w-full p-2 border rounded">
                    <option value="" disabled>-- Select User --</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
            </div>

            {selectedUser && (
                <div>
                    <label className="block text-sm font-medium">Select Device</label>
                    <select onChange={(e) => setSelectedDevice(availableDevices.find(d => d.id === e.target.value) || null)} defaultValue="" className="w-full p-2 border rounded">
                        <option value="" disabled>-- Select Device --</option>
                        {availableDevices.map(d => <option key={d.id} value={d.id}>{d.serialNumber}</option>)}
                    </select>
                </div>
            )}

            {selectedDevice && (
                 <>
                    <div className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-bold text-lg">{selectedDevice.name}</h4>
                        <p className="text-sm text-gray-600">S/N: {selectedDevice.serialNumber}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Registration Date</label>
                        <input type="text" value={new Date().toLocaleDateString('th-TH')} disabled className="mt-1 w-full p-2 border rounded bg-gray-100" />
                    </div>
                    {availableAccessories.length > 0 && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Select Accessory</label>
                        <div className="mt-2 flex flex-col gap-2">
                            {availableAccessories.map(acc => (
                                <label key={acc} className="flex items-center gap-2">
                                    <input type="radio" name="accessory" value={acc} checked={selectedAccessory === acc} onChange={(e) => setSelectedAccessory(e.target.value)} className="focus:ring-spk-blue h-4 w-4 text-spk-blue border-gray-300" />
                                    <span>{acc}</span>
                                </label>
                            ))}
                        </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium">Apple ID</label>
                        <input type="email" value={appleId} onChange={e => setAppleId(e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Borrow Notes</label>
                        <textarea value={borrowNotes} onChange={e => setBorrowNotes(e.target.value)} className="mt-1 w-full p-2 border rounded" rows={2}></textarea>
                    </div>
                </>
            )}
        </div>

        <div className="pt-4 mt-4 border-t flex justify-end">
            <button onClick={handleAssign} disabled={!selectedUser || !selectedDevice || !appleId} className="bg-spk-blue text-white px-4 py-2 rounded-lg disabled:bg-gray-400">Confirm Assignment</button>
        </div>
      </div>
    </div>
  );
};

export default AssignFromProductModal;
