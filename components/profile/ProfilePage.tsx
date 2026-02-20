
import React, { useRef } from 'react';
import type { User, Device } from '../../types';
import { UserRole, DeviceStatus } from '../../types';

interface ProfilePageProps {
  user: User;
  devices: Device[];
  onLogout: () => void;
  setActiveTab: (tab: string) => void;
  t: (key: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
  onOpenProfilePictureModal: () => void;
  onTriggerTeacherProfilePictureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pendingApprovalsCount: number;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, devices, onLogout, setActiveTab, t, language, setLanguage, onOpenProfilePictureModal, onTriggerTeacherProfilePictureUpload, pendingApprovalsCount }) => {
  const myDevices = devices.filter(d => d.borrowedBy === user.username);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicClick = () => {
    if (user.role === UserRole.Student) {
      onOpenProfilePictureModal();
    } else if (user.role === UserRole.Teacher || user.role === UserRole.Admin) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative">
          <img
            src={user.profileImageUrl || `https://i.pravatar.cc/150?u=${user.id}`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-spk-yellow"
          />
          <button
            onClick={handleProfilePicClick}
            className="absolute -bottom-1 -right-1 bg-spk-blue text-white rounded-full p-1.5 hover:bg-blue-800 transition-colors"
            title="Change Profile Picture"
          >
            <span className="material-icons-outlined text-sm">edit</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onTriggerTeacherProfilePictureUpload}
          />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold">{user.username}</h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>
      </div>

      {/* Admin Quick Actions */}
      {user.role === UserRole.Admin && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold mb-2">Admin Panel</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <button onClick={() => setActiveTab('approvals')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 relative">
              <span className="material-icons-outlined text-yellow-600 text-3xl">rule</span>
              <p className="text-xs mt-1">{t('approvals')}</p>
              {pendingApprovalsCount > 0 && (
                 <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center border-2 border-white">
                    {pendingApprovalsCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('userManagement')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <span className="material-icons-outlined text-blue-600 text-3xl">manage_accounts</span>
              <p className="text-xs mt-1">{t('userManagement')}</p>
            </button>
             <button onClick={() => setActiveTab('productManagement')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <span className="material-icons-outlined text-purple-600 text-3xl">inventory_2</span>
              <p className="text-xs mt-1">{t('productManagement')}</p>
            </button>
            <button onClick={() => setActiveTab('reports')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <span className="material-icons-outlined text-green-600 text-3xl">analytics</span>
              <p className="text-xs mt-1">{t('reports')}</p>
            </button>
          </div>
        </div>
      )}

      {/* My Devices */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-bold mb-4">{t('myDevices')} ({myDevices.length})</h3>
        {myDevices.length > 0 ? (
          <div className="space-y-3">
            {myDevices.map(device => (
              <div key={device.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                <img src={device.imageUrl} alt={device.name} className="w-12 h-12 rounded-md object-cover mr-4" />
                <div className="flex-grow">
                  <p className="font-semibold">{device.name}</p>
                  <p className="text-xs text-gray-500">{device.serialNumber}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full text-white ${device.status === DeviceStatus.Borrowed ? 'bg-blue-500' : 'bg-orange-500'}`}>{device.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">You have no borrowed devices.</p>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-bold mb-2">Settings</h3>
        <div className="flex items-center justify-between">
          <label htmlFor="language-select" className="text-gray-700">{t('language')}</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded-md p-1"
          >
            <option value="th">ภาษาไทย</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Logout */}
      <div className="text-center pt-4">
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <span className="material-icons-outlined">logout</span>
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
