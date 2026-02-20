
import React, { useState } from 'react';
import type { Device } from '../../types';

interface ICloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  addNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  onReturn: (device: Device, icloudEmail: string, returnNotes: string) => void;
  t: (key: string) => string;
}

const ICloudModal: React.FC<ICloudModalProps> = ({ isOpen, onClose, device, addNotification, onReturn }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [icloudEmail] = useState(device.appleId || '');

  const handleReturn = () => {
    if (!isChecked) {
      addNotification('Please confirm you have signed out of iCloud.', 'error');
      return;
    }
    onReturn(device, icloudEmail, returnNotes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <span className="material-icons-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-2 text-red-600">Important: Device Return</h2>
        <p className="text-sm text-gray-600 mb-4">Please ensure you have signed out of your Apple ID (<span className="font-semibold">{icloudEmail}</span>) before returning the device.</p>
        
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Return Notes (Condition, etc.)</label>
            <textarea
              rows={3}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>
          <div className="flex items-start">
            <input
              id="icloud-confirm"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-4 w-4 text-spk-blue border-gray-300 rounded mt-1"
            />
            <label htmlFor="icloud-confirm" className="ml-2 block text-sm text-gray-900">
              I confirm that I have signed out of my Apple ID and removed all personal data from the device.
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          <button 
            onClick={handleReturn} 
            className="bg-spk-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400"
            disabled={!isChecked}
          >
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default ICloudModal;
