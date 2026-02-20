
import React from 'react';

interface SuccessBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowerName: string;
  borrowerRole: string;
  deviceName: string;
  t: (key: string) => string;
}

const SuccessBorrowModal: React.FC<SuccessBorrowModalProps> = ({ isOpen, onClose, borrowerName, borrowerRole, deviceName }) => {
  if (!isOpen) return null;
  
  const borrowPeriod = borrowerRole === 'Student' ? '2.5 years' : '5 years';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm relative text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <span className="material-icons-outlined text-4xl text-green-600">check</span>
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">Assign Successful!</h2>
        <p className="text-sm text-gray-600">
            The device has been successfully assigned.
        </p>
        <div className="mt-4 bg-gray-100 p-3 rounded-lg text-left text-sm space-y-1">
            <p><strong>Borrower:</strong> {borrowerName} ({borrowerRole})</p>
            <p><strong>Device:</strong> {deviceName}</p>
            <p><strong>Loan Period:</strong> <span className="font-semibold text-spk-blue">{borrowPeriod}</span></p>
        </div>
        <button 
            onClick={onClose}
            className="w-full mt-6 bg-spk-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
        >
            OK
        </button>
      </div>
    </div>
  );
};

export default SuccessBorrowModal;
