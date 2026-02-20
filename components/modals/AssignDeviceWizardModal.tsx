
import React, { useState, useMemo } from 'react';
import type { User, Device, StudentUser, TeacherUser } from '../../types';
import { UserRole, TeacherDepartment, DeviceStatus } from '../../types';

interface AssignDeviceWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentUser[];
  teachers: TeacherUser[];
  devices: Device[];
  onAssign: (data: { user: User; device: Device; appleId: string; borrowNotes: string, borrowedAccessories: string[] }) => void;
  t: (key: string) => string;
}

const AssignDeviceWizardModal: React.FC<AssignDeviceWizardModalProps> = (props) => {
  const { isOpen, onClose, students, teachers, devices, onAssign, t } = props;

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserRole | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [serialNumberInput, setSerialNumberInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Step 2 state
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('');
  const [classroom, setClassroom] = useState('');
  const [userSearchInput, setUserSearchInput] = useState(''); // New autocomplete search state
  
  // Step 4 state
  const [appleId, setAppleId] = useState('');
  const [borrowNotes, setBorrowNotes] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState<string>('');

  const resetState = () => {
    setStep(1); setUserType(null); setSelectedUser(null); setSelectedDevice(null);
    setDepartment(''); setGrade(''); setClassroom(''); setUserSearchInput('');
    setAppleId(''); setBorrowNotes(''); setSelectedAccessory(''); setSerialNumberInput(''); setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleSelectUserType = (type: UserRole) => {
    setUserType(type);
    setStep(2);
  };
  
  const handleUserSelect = (userId: string) => {
    const allUsers = [...teachers, ...students];
    const user = allUsers.find(u => u.id === userId);
    if(user) {
        setSelectedUser(user);
        setStep(3);
    }
  };

  const handleSerialNumberSubmit = () => {
    const device = devices.find(d => d.serialNumber === serialNumberInput && d.status === DeviceStatus.Available);
    if (device) {
        if (device.designatedFor && device.designatedFor !== selectedUser?.role) {
            setError(`This device is designated for ${device.designatedFor}s only.`);
            setSelectedDevice(null);
        } else {
            setSelectedDevice(device);
            setError(null);
            setStep(4);
        }
    } else {
        setError('Device not found or not available.');
        setSelectedDevice(null);
    }
  }

  const handleAssign = () => {
    if (selectedUser && selectedDevice && appleId) {
      onAssign({ user: selectedUser, device: selectedDevice, appleId, borrowNotes, borrowedAccessories: selectedAccessory ? [selectedAccessory] : [] });
      handleClose();
    } else {
        alert("Please provide an Apple ID.");
    }
  };

  const filteredUsers = useMemo(() => {
    if (userType === UserRole.Teacher) {
      let filtered = teachers;
      if (department) filtered = filtered.filter(t => t.department === department);
      if (userSearchInput) filtered = filtered.filter(t => t.username.toLowerCase().includes(userSearchInput.toLowerCase()));
      return filtered;
    }
    if (userType === UserRole.Student) {
      let filtered = students;
      if (grade) filtered = filtered.filter(s => s.grade === parseInt(grade));
      if (classroom) {
        filtered = filtered.filter(s => s.classroom === classroom);
        // เรียงตามชื่อภายในห้อง
        filtered = filtered.sort((a, b) => a.username.localeCompare(b.username, 'th'));
      }
      if (userSearchInput) filtered = filtered.filter(s => s.username.toLowerCase().includes(userSearchInput.toLowerCase()));
      return filtered;
    }
    return [];
  }, [userType, teachers, students, department, grade, classroom, userSearchInput]);
  
  const availableAccessories = useMemo(() => {
    if(!selectedDevice?.accessories) return [];
    return Array.isArray(selectedDevice.accessories) ? selectedDevice.accessories : selectedDevice.accessories.split(',').map(s => s.trim());
  }, [selectedDevice]);

  const borrowPeriod = useMemo(() => {
      if (!selectedUser) return '';
      const days = selectedUser.role === UserRole.Student ? (2.5 * 365) : (5 * 365);
      return `${days} days`;
  }, [selectedUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] flex flex-col">
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"><span className="material-icons-outlined">close</span></button>
        <h2 className="text-xl font-bold mb-4">{t('assignUser')} - ขั้นตอนที่ {step}/4</h2>
        
        <div className="overflow-y-auto flex-grow">
            {step === 1 && (
                <div className="text-center space-y-4 pt-8">
                    <h3 className="text-lg font-medium">เลือกประเภทผู้ใช้</h3>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handleSelectUserType(UserRole.Teacher)} className="p-6 bg-blue-100 rounded-lg text-blue-800 hover:bg-blue-200 w-40 text-center"><span className="material-icons-outlined text-4xl mb-2">school</span><p>{t('teacher')}</p></button>
                        <button onClick={() => handleSelectUserType(UserRole.Student)} className="p-6 bg-green-100 rounded-lg text-green-800 hover:bg-green-200 w-40 text-center"><span className="material-icons-outlined text-4xl mb-2">face</span><p>{t('student')}</p></button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="font-semibold mb-2">เลือก{userType === UserRole.Teacher ? 'ครู' : 'นักเรียน'}</h3>
                    {userType === UserRole.Teacher && (
                        <select value={department} onChange={e => { setDepartment(e.target.value); setUserSearchInput(''); }} className="w-full p-2 border rounded mb-2"><option value="">ทุกกลุ่มสาระ</option>{Object.values(TeacherDepartment).map(d => <option key={d} value={d}>{d}</option>)}</select>
                    )}
                    {userType === UserRole.Student && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <select value={grade} onChange={e => { setGrade(e.target.value); setUserSearchInput(''); }} className="w-full p-2 border rounded"><option value="">ทุกระดับชั้น</option>{[...Array(6).keys()].map(i => <option key={i+1} value={i+1}>ม.{i+1}</option>)}</select>
                            <select value={classroom} onChange={e => { setClassroom(e.target.value); setUserSearchInput(''); }} className="w-full p-2 border rounded"><option value="">ทุกห้อง</option>{[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}</select>
                        </div>
                    )}
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder={`ค้นหา${userType === UserRole.Teacher ? 'ครู' : 'นักเรียน'}...`}
                            value={userSearchInput}
                            onChange={(e) => setUserSearchInput(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                        />
                    </div>
                    <select onChange={(e) => handleUserSelect(e.target.value)} defaultValue="" className="w-full p-2 border rounded">
                        <option value="" disabled>-- เลือกรายชื่อ --</option>
                        {filteredUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </select>
                </div>
            )}

            {step === 3 && selectedUser && (
                <div className="space-y-4">
                    <p className="font-semibold">ผู้ใช้ที่เลือก: <span className="font-normal">{selectedUser.username}</span></p>
                    <div>
                        <label className="block text-sm font-medium">กรอก Serial Number ของอุปกรณ์</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="text"
                                placeholder="Enter Serial Number..."
                                value={serialNumberInput}
                                onChange={e => setSerialNumberInput(e.target.value)}
                                className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
                            />
                            <button type="button" onClick={handleSerialNumberSubmit} className="p-2 bg-spk-blue text-white rounded-md hover:bg-blue-800 flex-shrink-0">
                                Verify
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                </div>
            )}

            {step === 4 && selectedUser && selectedDevice && (
                 <div className="space-y-4">
                    <p className="font-semibold">ผู้ใช้: <span className="font-normal">{selectedUser.username}</span></p>
                    <div className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-bold text-lg">{selectedDevice.name}</h4>
                        <p className="text-sm text-gray-600">S/N: {selectedDevice.serialNumber}</p>
                        <img src={selectedDevice.imageUrl} alt={selectedDevice.name} className="w-24 h-24 object-cover rounded-md mt-2"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">วันที่ลงทะเบียน</label>
                            <input type="text" value={new Date().toLocaleDateString('th-TH')} disabled className="mt-1 w-full p-2 border rounded bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">ระยะเวลาที่ยืมได้</label>
                            <input type="text" value={borrowPeriod} disabled className="mt-1 w-full p-2 border rounded bg-gray-100" />
                        </div>
                    </div>
                    {availableAccessories.length > 0 && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700">เลือกอุปกรณ์เสริม</label>
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
                        <label className="block text-sm font-medium">หมายเหตุการยืม</label>
                        <textarea value={borrowNotes} onChange={e => setBorrowNotes(e.target.value)} className="mt-1 w-full p-2 border rounded" rows={2}></textarea>
                    </div>
                </div>
            )}
        </div>

        <div className="pt-4 mt-4 border-t flex justify-between items-center">
            <div>{step > 1 && <button onClick={() => setStep(s => s - 1)} className="bg-gray-200 px-4 py-2 rounded-lg">ย้อนกลับ</button>}</div>
            <div>{step === 4 && <button onClick={handleAssign} disabled={!appleId} className="bg-spk-blue text-white px-4 py-2 rounded-lg disabled:bg-gray-400">ยืนยันการกำหนดผู้ใช้</button>}</div>
        </div>
      </div>
    </div>
  );
};

export default AssignDeviceWizardModal;
