
import React, { useState, useMemo } from 'react';
import type { Device } from '../../types';

interface ApprovalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  onConfirm: (deviceId: string, isApproved: boolean, appleId: string, borrowNotes: string, selectedAccessories: string[]) => void;
  t: (key: string) => string;
}

const ApprovalConfirmationModal: React.FC<ApprovalConfirmationModalProps> = ({ isOpen, onClose, device, onConfirm }) => {
  const [appleId, setAppleId] = useState('');
  const [borrowNotes, setBorrowNotes] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  
  const availableAccessories = useMemo(() => {
    if(!device.accessories) return [];
    return Array.isArray(device.accessories) ? device.accessories : device.accessories.split(',').map(s => s.trim());
  }, [device.accessories]);

  const handleAccessoryToggle = (accessory: string) => {
    setSelectedAccessories(prev => 
        prev.includes(accessory) ? prev.filter(a => a !== accessory) : [...prev, accessory]
    );
  };

  const handleConfirm = () => {
    if (!appleId) {
      alert('Please enter the Apple ID.');
      return;
    }
    onConfirm(device.id, true, appleId, borrowNotes, selectedAccessories);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <span className="material-icons-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-2">Approve Loan for {device.name}</h2>
        <p className="text-sm text-gray-600 mb-4">For user: {device.borrowedBy}</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="appleId" className="block text-sm font-medium text-gray-700">Borrower&apos;s Apple ID</label>
            <input
              type="email"
              id="appleId"
              value={appleId}
              onChange={(e) => setAppleId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          {availableAccessories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Accessories Included</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableAccessories.map(acc => (
                    <button 
                        key={acc} 
                        type="button" 
                        onClick={() => handleAccessoryToggle(acc)}
                        className={`px-3 py-1 text-sm rounded-full border ${selectedAccessories.includes(acc) ? 'bg-spk-blue text-white border-spk-blue' : 'bg-white text-gray-700'}`}
                    >
                        {acc}
                    </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label htmlFor="borrowNotes" className="block text-sm font-medium text-gray-700">Borrow Notes (Optional)</label>
            <textarea
              id="borrowNotes"
              rows={3}
              value={borrowNotes}
              onChange={(e) => setBorrowNotes(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          <button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Confirm Approval</button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalConfirmationModal;
