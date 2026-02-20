import React, { useState, useEffect, useRef } from 'react';
import type { Product, Device, TeacherUser, StudentUser, User } from '../../types';
import { UserRole, DeviceStatus } from '../../types';
import { formatDate } from '../../utils/dateFormatter';

declare global {
    interface Window {
        Html5Qrcode: unknown;
    }
}

interface AssignDeviceFromProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  teachers: TeacherUser[];
  students: StudentUser[];
  currentUser: User | null;
  onAssign: (params: { user: User; device: Device; appleId: string; borrowNotes: string; borrowedAccessories: string[] }) => void;
  t: (key: string) => string;
}

const AssignDeviceFromProductModal: React.FC<AssignDeviceFromProductModalProps> = ({
  isOpen,
  onClose,
  product,
  teachers,
  students,
  currentUser,
  onAssign,
  t
}) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [appleId, setAppleId] = useState('');
  const [borrowingDays, setBorrowingDays] = useState('365');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [registrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef<unknown>(null);

  useEffect(() => {
    if (isOpen) {
      setSerialNumber('');
      setAppleId('');
      setBorrowingDays('365');
      setSelectedAccessories([]);
      setSelectedUser('');
      setError('');
    }
  }, [isOpen]);

  // QR Scanner effect
  useEffect(() => {
    if (isScannerOpen) {
      const html5QrCode = new window.Html5Qrcode("qr-reader-assign");
      scannerRef.current = html5QrCode;
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      const startScanner = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          stream.getTracks().forEach(track => track.stop());

          await html5QrCode.start({ facingMode: "environment" }, config, (decodedText: string) => {
            setSerialNumber(decodedText.trim());
            setIsScannerOpen(false);
          }, () => {
            // Error handler for QR scanning
          });
        } catch (err) {
          console.error("Failed to start scanner", err);
          alert("Could not start camera. Please grant permission and try again.");
          setIsScannerOpen(false);
        }
      };

      startScanner();
    } else if (scannerRef.current && (scannerRef.current as { isScanning?: boolean }).isScanning) {
      (scannerRef.current as { stop: () => Promise<void> }).stop().catch((err: Error) => console.error("Failed to stop scanner", err));
    }

    return () => {
      if (scannerRef.current && (scannerRef.current as { isScanning?: boolean }).isScanning) {
        (scannerRef.current as { stop: () => Promise<void> }).stop().catch((err: Error) => console.error("Failed to stop scanner", err));
      }
    };
  }, [isScannerOpen]);

  // Get available users based on product designation
  const getAvailableUsers = () => {
    if (product?.designatedFor === UserRole.Teacher) {
      return teachers;
    } else if (product?.designatedFor === UserRole.Student) {
      return students;
    }
    return [...teachers, ...students];
  };

  // Check if current user can register this product
  const canCurrentUserRegister = (): boolean => {
    if (!currentUser) return false;
    
    // If product is designated for teachers, only teachers/admins can register
    if (product?.designatedFor === UserRole.Teacher) {
      return currentUser.role === UserRole.Teacher || currentUser.role === UserRole.Admin;
    }
    
    // If product is designated for students, only students can register
    if (product?.designatedFor === UserRole.Student) {
      return currentUser.role === UserRole.Student;
    }
    
    // If no designation, admin and teachers can register
    return currentUser.role === UserRole.Admin || currentUser.role === UserRole.Teacher;
  };

  const availableUsers = getAvailableUsers();

  const handleAccessoryToggle = (accessory: string) => {
    setSelectedAccessories(prev =>
      prev.includes(accessory)
        ? prev.filter(a => a !== accessory)
        : [accessory]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!serialNumber.trim()) {
      setError('Serial number is required');
      return;
    }

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!product) {
      setError('Product information is missing');
      return;
    }

    if (!canCurrentUserRegister()) {
      setError('You do not have permission to register this product');
      return;
    }

    const selectedUserObj = availableUsers.find(u => u.id === selectedUser);
    if (!selectedUserObj) {
      setError('Selected user not found');
      return;
    }

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(borrowingDays));

    // Create device from product
    const newDevice: Device = {
      id: `DEV-${Date.now()}`,
      serialNumber: serialNumber.trim(),
      productId: product.id,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      designatedFor: product.designatedFor,
      status: DeviceStatus.Borrowed,
      borrowedBy: selectedUserObj.username,
      borrowDate: registrationDate,
      dueDate: dueDate.toISOString().split('T')[0],
      appleId: appleId.trim() || undefined,
      borrowedAccessories: selectedAccessories.join(', ') || undefined,
      accessories: product.defaultAccessories
    };

    // Call onAssign with the expected parameters
    onAssign({
      user: selectedUserObj,
      device: newDevice,
      appleId: appleId.trim(),
      borrowNotes: '',
      borrowedAccessories: selectedAccessories
    });
    onClose();
  };

  if (!isOpen || !product) return null;

  const shouldShowPermissionWarning = !canCurrentUserRegister();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <span className="material-icons-outlined">close</span>
        </button>

        <h2 className="text-xl font-bold mb-4 text-spk-blue">Assign Device from Product</h2>

        {shouldShowPermissionWarning && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold">Permission Denied</p>
            <p className="text-sm">This product is designated for {product.designatedFor}s. Only {product.designatedFor}s can register it.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Product Card */}
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Product Details</h3>
            <div className="flex gap-4">
              <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded object-cover" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{product.category}</p>
                {product.description && <p className="text-sm text-gray-600 mt-1">{product.description}</p>}
                {product.designatedFor && (
                  <p className="text-xs bg-blue-100 text-blue-800 inline-block px-2 py-1 rounded mt-2">
                    Designated for: {product.designatedFor}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Serial Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="flex-1 border border-gray-300 p-2 rounded-md"
                placeholder="Enter device serial number"
                required
                disabled={shouldShowPermissionWarning}
              />
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="bg-spk-blue text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={shouldShowPermissionWarning}
              >
                <span className="material-icons-outlined">qr_code_2</span>
              </button>
            </div>
          </div>

          {/* Registration Date (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
            <input
              type="date"
              value={registrationDate}
              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
              disabled
            />
          </div>

          {/* Borrowing Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borrowing Days</label>
            <input
              type="number"
              value={borrowingDays}
              onChange={(e) => setBorrowingDays(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="365"
              min="1"
              disabled={shouldShowPermissionWarning}
            />
          </div>

          {/* Apple ID */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Apple ID</label>
            <input
              type="text"
              value={appleId}
              onChange={(e) => setAppleId(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Enter Apple ID"
              disabled={shouldShowPermissionWarning}
            />
          </div>

          {/* Accessories */}
          {product.defaultAccessories && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Accessories</label>
              <div className="space-y-2">
                {(Array.isArray(product.defaultAccessories) ? product.defaultAccessories : (product.defaultAccessories as string).split(',')).map((accessory) => {
                  const cleanAccessory = typeof accessory === 'string' ? accessory.trim() : accessory;
                  return (
                    <label key={cleanAccessory} className="flex items-center">
                      <input
                        type="radio"
                        name="accessories"
                        value={cleanAccessory}
                        checked={selectedAccessories.includes(cleanAccessory)}
                        onChange={() => handleAccessoryToggle(cleanAccessory)}
                        className="w-4 h-4 text-spk-blue"
                        disabled={shouldShowPermissionWarning}
                      />
                      <span className="ml-2 text-sm text-gray-700">{cleanAccessory}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Select User */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
              required
              disabled={shouldShowPermissionWarning}
            >
              <option value="">Select a user...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={shouldShowPermissionWarning}
            className="px-4 py-2 bg-spk-blue text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Assign Device
          </button>
        </div>
      </form>

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-4 relative">
            <button
              type="button"
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <span className="material-icons-outlined">close</span>
            </button>
            <h2 className="text-lg font-bold text-center mb-4">Scan Serial Number</h2>
            <div id="qr-reader-assign" className="w-full"></div>
            <button
              type="button"
              onClick={() => setIsScannerOpen(false)}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignDeviceFromProductModal;
