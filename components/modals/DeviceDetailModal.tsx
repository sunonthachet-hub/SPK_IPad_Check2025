
import React, { useState, useEffect } from 'react';
import type { Device, Product } from '../../types';
import { DeviceStatus } from '../../types';

interface DeviceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Device) => void;
  deviceToEdit: Device | null;
  products: Product[];
  t: (key: string) => string;
}

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ isOpen, onClose, onSave, deviceToEdit, products }) => {
  const [deviceData, setDeviceData] = useState<Device>({
    id: `DVC-${Date.now()}`,
    serialNumber: '',
    productId: '',
    status: DeviceStatus.Available,
  });

  useEffect(() => {
    if (deviceToEdit) {
      setDeviceData(deviceToEdit);
    } else {
      setDeviceData({
        id: `DVC-${Date.now()}`,
        serialNumber: '',
        productId: products.length > 0 ? products[0].id : '',
        status: DeviceStatus.Available,
      });
    }
  }, [deviceToEdit, products, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeviceData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(deviceData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <span className="material-icons-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-4 text-spk-blue">{deviceToEdit ? 'Edit Device' : 'Add New Device'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Product Type</label>
            <select name="productId" value={deviceData.productId} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md" required>
                <option value="">Select a product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Asset ID (Tag)</label>
            <input type="text" name="id" value={deviceData.id} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Serial Number</label>
            <input type="text" name="serialNumber" value={deviceData.serialNumber} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select name="status" value={deviceData.status} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md">
              {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {deviceData.status === DeviceStatus.Borrowed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                    <label className="block text-sm font-medium">Borrowed By</label>
                    <input type="text" name="borrowedBy" value={deviceData.borrowedBy || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Apple ID</label>
                    <input type="text" name="appleId" value={deviceData.appleId || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md"/>
                </div>
            </div>
        )}

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          <button type="submit" className="bg-spk-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800">Save</button>
        </div>
      </form>
    </div>
  );
};

export default DeviceDetailModal;
