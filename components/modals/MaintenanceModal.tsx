
import React, { useState, useRef } from 'react';
import type { Device } from '../../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  t: (key: string) => string;
  handleFileUpload: (file: File, maxSizeMB: number) => Promise<string>;
  addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  onSubmit: (data: { device: Device; description: string; repairLocation: string; repairImageUrl: string | null }) => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose, device, t, handleFileUpload, addNotification, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [repairLocation, setRepairLocation] = useState('');
  const [repairImageUrl, setRepairImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      addNotification('Uploading image...', 'info');
      try {
        const url = await handleFileUpload(file, 5);
        setRepairImageUrl(url);
        addNotification('Upload successful!', 'success');
      } catch (error) {
        addNotification(error.message, 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      addNotification('Please provide a description of the issue.', 'error');
      return;
    }
    onSubmit({ device, description, repairLocation, repairImageUrl });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <span className="material-icons-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-2 text-spk-blue">{t('reportIssue')}</h2>
        <p className="text-sm text-gray-600 mb-4">Device: {device.name} ({device.serialNumber})</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Issue Description</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-spk-yellow focus:border-spk-yellow"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="repairLocation" className="block text-sm font-medium text-gray-700">Suggested Repair Location (Optional)</label>
            <input
              type="text"
              id="repairLocation"
              value={repairLocation}
              onChange={(e) => setRepairLocation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Photo (Optional)</label>
            <div className="mt-1 flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Choose File
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
              {repairImageUrl && <img src={repairImageUrl} alt="Preview" className="w-16 h-16 rounded object-cover" />}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
            <button type="submit" className="bg-spk-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800" disabled={isUploading}>
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
