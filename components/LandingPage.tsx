
import React from 'react';

interface LandingPageProps {
  onLoginClick: () => void;
  onVisitorClick: () => void;
  t: (key: string) => string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onVisitorClick, t }) => {
  return (
    <div 
      className="min-h-screen bg-spk-blue text-white font-sarabun antialiased bg-blend-multiply"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop)',
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
          <button
            onClick={onVisitorClick}
            className="mt-10 bg-spk-yellow text-spk-blue font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform ease-out-cubic"
          >
            เริ่มต้นใช้งาน
          </button>
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
