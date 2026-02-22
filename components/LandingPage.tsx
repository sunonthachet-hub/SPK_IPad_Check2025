
import React, { useState, useMemo } from 'react';
import type { Device, User } from '../types';
import { UserRole, DeviceStatus, TeacherDepartment } from '../types';

interface LandingPageProps {
  onLoginClick: () => void;
  onVisitorClick: () => void;
  t: (key: string) => string;
  devices: Device[];
  teachers: User[];
  students: User[];
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onVisitorClick, t, devices, teachers, students }) => {
  const [searchMode, setSearchMode] = useState<'qr' | 'filter' | 'name' | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceNameSearch, setDeviceNameSearch] = useState('');
  const [userType, setUserType] = useState<UserRole | null>(null);
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('');
  const [classroom, setClassroom] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<{ device: Device; owner: User } | null>(null);
  const [searchError, setSearchError] = useState<string>('');

  const handleQRSearch = () => {
    setSearchError('');
    const device = devices.find(d => d.serialNumber === serialNumber);
    if (device) {
      if (device.borrowedBy) {
        // Search by username (device.borrowedBy contains username, not ID)
        const owner = [...teachers, ...students].find(u => u.username === device.borrowedBy);
        if (owner) {
          setSearchResult({ device, owner });
        } else {
          setSearchError('เครื่องนี้ได้รับการยืม แต่ไม่พบข้อมูลเจ้าของ');
          setSearchResult(null);
        }
      } else {
        setSearchError('เครื่องนี้ยังไม่ได้รับการยืม');
        setSearchResult(null);
      }
    } else {
      setSearchError('ไม่พบหมายเลขซีเรียลนี้ในระบบ');
      setSearchResult(null);
    }
  };

  const handleDeviceNameSearch = () => {
    setSearchError('');
    if (!deviceNameSearch.trim()) {
      setSearchError('กรุณาพิมพ์ชื่ออุปกรณ์ที่ต้องการค้นหา');
      return;
    }

    const searchLower = deviceNameSearch.toLowerCase();
    const borrowedDevices = devices.filter(d => 
      d.name?.toLowerCase().includes(searchLower) && d.borrowedBy
    );

    if (borrowedDevices.length > 0) {
      const device = borrowedDevices[0];
      const owner = [...teachers, ...students].find(u => u.username === device.borrowedBy);
      if (owner) {
        setSearchResult({ device, owner });
      } else {
        setSearchError('เครื่องนี้ได้รับการยืม แต่ไม่พบข้อมูลเจ้าของ');
        setSearchResult(null);
      }
    } else {
      const availableDevices = devices.filter(d => 
        d.name?.toLowerCase().includes(searchLower)
      );
      if (availableDevices.length > 0) {
        setSearchError('ไม่พบเครื่องที่ยืมแล้ว (เครื่องนี้ยังว่าง)');
      } else {
        setSearchError('ไม่พบเครื่องที่มีชื่อนี้ในระบบ');
      }
      setSearchResult(null);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered: User[] = [];
    
    if (userType === UserRole.Teacher) {
      filtered = teachers.filter(t => {
        if (department && (t as any).department !== department) return false;
        if (searchInput && !t.username.toLowerCase().includes(searchInput.toLowerCase())) return false;
        return true;
      });
    } else if (userType === UserRole.Student) {
      filtered = students.filter(s => {
        if (grade && (s as any).grade !== parseInt(grade)) return false;
        if (classroom && (s as any).classroom !== classroom) return false;
        if (searchInput && !s.username.toLowerCase().includes(searchInput.toLowerCase())) return false;
        return true;
      });
    }
    
    return filtered;
  }, [userType, teachers, students, department, grade, classroom, searchInput]);

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = [...teachers, ...students].find(u => u.id === userId);
    if (user) {
      const userDevices = devices.filter(d => d.borrowedBy === user.id);
      if (userDevices.length > 0) {
        setSearchResult({ device: userDevices[0], owner: user });
        setSearchError('');
      } else {
        setSearchError('ผู้ใช้นี้ยังไม่ได้ยืมเครื่องใด');
        setSearchResult(null);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-spk-blue text-white font-sarabun antialiased bg-blend-multiply"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1726996278602-d02bedd6dd2c?q)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header */}
      <header 
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10 bg-spk-blue/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">iPad Check</h1>
            <p className="text-sm sm:text-base opacity-90">ระบบยืมApple iPad เพื่อการศึกษา</p>
          </div>
        </div>
        <button
          onClick={onLoginClick}
          className="bg-white text-spk-blue font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-colors"
        >
          {t('login')}
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20 pb-10">
        <div className="max-w-3xl">
          <img src="https://www.spk.ac.th/home/wp-content/uploads/2025/10/spk-logo-png-new-1.png" alt="SPK Logo" className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            ระบบยืมอุปกรณ์ Apple iPad เพื่อการศึกษา
          </h2>
          <p className="mt-4 text-lg md:text-xl opacity-80">
            Sarakham Pittayakhom School Modern Equipment Loan System
          </p>
          {searchMode === null && (
            <div className="mt-10 space-y-4">
              <button
                onClick={onVisitorClick}
                className="mt-10 bg-spk-yellow text-spk-blue font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform ease-out-cubic block mx-auto"
              >
                เริ่มต้นใช้งาน
              </button>
              <button
                onClick={() => setSearchMode('filter')}
                className="bg-white text-spk-blue font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform block mx-auto border-2 border-spk-blue"
              >
                ค้นหาตามชื่อผู้ใช้
              </button>
              <button
                onClick={() => setSearchMode('name')}
                className="bg-white text-spk-blue font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform block mx-auto border-2 border-spk-blue"
              >
                ค้นหาตามชื่ออุปกรณ์
              </button>
            </div>
          )}

          {/* Device Owner Search */}
          {searchMode === 'filter' && !searchResult && (
            <div className="mt-10 bg-white text-spk-blue p-8 rounded-lg shadow-lg max-w-2xl">
              <button
                onClick={() => setSearchMode(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl mb-4 float-right"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold mb-6">ค้นหาเจ้าของอุปกรณ์</h3>

              {!userType ? (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setUserType(UserRole.Teacher)}
                    className="p-6 bg-blue-100 rounded-lg text-blue-800 hover:bg-blue-200 flex-1"
                  >
                    <span className="material-icons-outlined block text-4xl mb-2">school</span>
                    <p className="font-semibold">ครู</p>
                  </button>
                  <button
                    onClick={() => setUserType(UserRole.Student)}
                    className="p-6 bg-green-100 rounded-lg text-green-800 hover:bg-green-200 flex-1"
                  >
                    <span className="material-icons-outlined block text-4xl mb-2">face</span>
                    <p className="font-semibold">นักเรียน</p>
                  </button>
                </div>
              ) : (
                <div className="text-left space-y-4">
                  {userType === UserRole.Teacher && (
                    <>
                      <div>
                        <label className="block font-semibold mb-2">เลือกกลุ่มสาระ</label>
                        <select
                          value={department}
                          onChange={(e) => { setDepartment(e.target.value); setSelectedUser(''); }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">ทุกกลุ่มสาระ</option>
                          <option value={TeacherDepartment.Executive}>{TeacherDepartment.Executive}</option>
                          <option value={TeacherDepartment.Careers}>{TeacherDepartment.Careers}</option>
                          <option value={TeacherDepartment.Math}>{TeacherDepartment.Math}</option>
                          <option value={TeacherDepartment.ForeignLang}>{TeacherDepartment.ForeignLang}</option>
                          <option value={TeacherDepartment.Thai}>{TeacherDepartment.Thai}</option>
                          <option value={TeacherDepartment.Science}>{TeacherDepartment.Science}</option>
                          <option value={TeacherDepartment.Art}>{TeacherDepartment.Art}</option>
                          <option value={TeacherDepartment.Social}>{TeacherDepartment.Social}</option>
                          <option value={TeacherDepartment.Health}>{TeacherDepartment.Health}</option>
                          <option value={TeacherDepartment.ForeignTeacher}>{TeacherDepartment.ForeignTeacher}</option>
                          <option value={TeacherDepartment.Support}>{TeacherDepartment.Support}</option>
                          <option value={TeacherDepartment.GovEmployee}>{TeacherDepartment.GovEmployee}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-2">ค้นหาครู</label>
                        <input
                          type="text"
                          placeholder="พิมพ์ชื่อครู..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                        />
                        <select
                          value={selectedUser}
                          onChange={(e) => handleUserSelect(e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">-- เลือกครู --</option>
                          {filteredUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {userType === UserRole.Student && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold mb-2">เลือกชั้น</label>
                          <select
                            value={grade}
                            onChange={(e) => { setGrade(e.target.value); setClassroom(''); setSelectedUser(''); setSearchInput(''); }}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">ทุกชั้น</option>
                            <option value="4">ม.4</option>
                            <option value="5">ม.5</option>
                            <option value="6">ม.6</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">เลือกห้อง</label>
                          <select
                            value={classroom}
                            onChange={(e) => { setClassroom(e.target.value); setSelectedUser(''); setSearchInput(''); }}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">ทุกห้อง</option>
                            {[...Array(12).keys()].map(i => (
                              <option key={i+1} value={i+1}>{i+1}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-2">ค้นหานักเรียน</label>
                        <input
                          type="text"
                          placeholder="พิมพ์ชื่อนักเรียน..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                        />
                        <select
                          value={selectedUser}
                          onChange={(e) => handleUserSelect(e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">-- เลือกนักเรียน --</option>
                          {filteredUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => { setUserType(null); setSearchInput(''); setSelectedUser(''); setDepartment(''); setGrade(''); setClassroom(''); }}
                    className="w-full bg-gray-300 text-gray-800 font-semibold py-2 rounded hover:bg-gray-400"
                  >
                    เปลี่ยนประเภทผู้ใช้
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Device Name Search */}
          {searchMode === 'name' && !searchResult && (
            <div className="mt-10 bg-white text-spk-blue p-8 rounded-lg shadow-lg max-w-2xl">
              <button
                onClick={() => {
                  setSearchMode(null);
                  setDeviceNameSearch('');
                  setSearchError('');
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl mb-4 float-right"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold mb-6">ค้นหาอุปกรณ์ตามชื่อ</h3>
              <div className="text-left space-y-4">
                <div>
                  <label className="block font-semibold mb-2">ชื่ออุปกรณ์ (เช่น iPad Pro, iPad Air)</label>
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่ออุปกรณ์..."
                    value={deviceNameSearch}
                    onChange={(e) => setDeviceNameSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDeviceNameSearch()}
                    className="w-full p-2 border rounded mb-3"
                    autoFocus
                  />
                  <button
                    onClick={handleDeviceNameSearch}
                    className="w-full bg-spk-blue text-white font-semibold py-2 rounded hover:bg-blue-700"
                  >
                    ค้นหา
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSearchMode(null);
                    setDeviceNameSearch('');
                    setSearchError('');
                  }}
                  className="w-full bg-gray-300 text-gray-800 font-semibold py-2 rounded hover:bg-gray-400"
                >
                  กลับไปหน้าหลัก
                </button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResult && (
            <div className="mt-10 bg-white text-spk-blue p-8 rounded-lg shadow-lg max-w-2xl">
              <button
                onClick={() => {
                  setSearchResult(null);
                  setSearchError('');
                  if (searchMode === 'name') {
                    setSearchMode('name');
                    setDeviceNameSearch('');
                  } else {
                    setSearchMode('filter');
                    setUserType(null);
                    setSearchInput('');
                    setSelectedUser('');
                    setDepartment('');
                    setGrade('');
                    setClassroom('');
                  }
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl mb-4 float-right"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold mb-4">รายละเอียดเจ้าของเครื่อง</h3>
              <div className="space-y-3 text-left">
                <div className="border-b pb-2">
                  <p className="text-gray-600 text-sm">ชื่อผู้ใช้</p>
                  <p className="font-semibold text-lg">{searchResult.owner.username}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-gray-600 text-sm">บทบาท</p>
                  <p className="font-semibold">{searchResult.owner.role === UserRole.Teacher ? 'ครู' : 'นักเรียน'}</p>
                </div>
                {(searchResult.owner as any).department && (
                  <div className="border-b pb-2">
                    <p className="text-gray-600 text-sm">กลุ่มสาระ</p>
                    <p className="font-semibold">{(searchResult.owner as any).department}</p>
                  </div>
                )}
                {(searchResult.owner as any).grade && (
                  <div className="border-b pb-2">
                    <p className="text-gray-600 text-sm">ชั้นเรียน</p>
                    <p className="font-semibold">ม.{(searchResult.owner as any).grade} ห้อง {(searchResult.owner as any).classroom}</p>
                  </div>
                )}
                <div className="border-b pb-2">
                  <p className="text-gray-600 text-sm">รุ่นอุปกรณ์</p>
                  <p className="font-semibold">{searchResult.device.name}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-gray-600 text-sm">หมายเลขซีเรีย</p>
                  <p className="font-semibold">{searchResult.device.serialNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">สถานะ</p>
                  <p className="font-semibold text-green-600">{searchResult.device.status}</p>
                </div>
              </div>
            </div>
          )}

          {searchError && (
            <div className="mt-6 bg-red-100 text-red-800 p-4 rounded-lg max-w-2xl">
              <p className="font-semibold">{searchError}</p>
              <button
                onClick={() => {
                  setSearchError('');
                  if (searchMode === 'name') {
                    setDeviceNameSearch('');
                  } else {
                    setSearchMode('filter');
                    setUserType(null);
                    setSearchInput('');
                    setSelectedUser('');
                    setDepartment('');
                    setGrade('');
                    setClassroom('');
                  }
                }}
                className="mt-3 text-red-600 hover:text-red-800 underline"
              >
                ค้นหาใหม่
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white text-spk-blue py-16 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <span className="material-icons-outlined text-5xl text-spk-blue">system_update</span>
            <h3 className="text-xl font-bold mt-4 mb-2">รองรับ iOS ล่าสุด</h3>
            <p className="text-gray-600">อุปกรณ์ทุกเครื่องของเรามาพร้อมกับ iOS เวอร์ชันล่าสุด เพื่อความปลอดภัยและประสิทธิภาพสูงสุด</p>
          </div>
          <div className="p-6">
            <span className="material-icons-outlined text-5xl text-spk-blue">tablet_mac</span>
            <h3 className="text-xl font-bold mt-4 mb-2">iPad หลากหลายรุ่น</h3>
            <p className="text-gray-600">เรามี iPad ให้เลือกยืมหลากหลายรุ่น ตั้งแต่ iPad Air, Pro ไปจนถึง Mini ตอบโจทย์ทุกการใช้งาน</p>
          </div>
          <div className="p-6">
            <span className="material-icons-outlined text-5xl text-spk-blue">phone_iphone</span>
            <h3 className="text-xl font-bold mt-4 mb-2">มี iPhone ด้วย</h3>
            <p className="text-gray-600">นอกจาก iPad แล้ว เรายังมี iPhone สำหรับการใช้งานที่ต้องการความคล่องตัวสูง</p>
          </div>
        </div>
      </section>
      
       <div className="bg-white text-gray-500 text-center text-sm py-4">
        <p>Developed by ศูนย์ ไอซีที โรงเรียนสารคามพิทยาคม</p>
      </div>
    </div>
  );
};

export default LandingPage;
