import React, { useState } from 'react';
import type { ProductApprovalRequest } from '../../types';
import { UserRole } from '../../types';

interface ProductApprovalPageProps {
  approvalRequests: ProductApprovalRequest[];
  onApproval: (requestId: string, isApproved: boolean, rejectReason?: string) => void;
  t: (key: string) => string;
}

const ProductApprovalPage: React.FC<ProductApprovalPageProps> = ({ approvalRequests, onApproval, t }) => {
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  const pendingRequests = approvalRequests.filter(r => r.status === 'Pending');

  const handleApprove = (requestId: string) => {
    onApproval(requestId, true);
  };

  const handleReject = (requestId: string) => {
    onApproval(requestId, false, rejectReason[requestId]);
    setShowRejectForm(null);
    setRejectReason(prev => ({ ...prev, [requestId]: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">อนุมัติสินค้า</h1>
        <p className="text-gray-500">รายการรอการอนุมัติสินค้าจากครู</p>
      </header>

      <div className="space-y-4">
        {pendingRequests.length > 0 ? pendingRequests.map(request => (
          <div key={request.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-24 flex-shrink-0">
                <img src={request.imageUrl} alt={request.productName} className="w-full h-24 rounded-md object-cover" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{request.productName}</h3>
                    <p className="text-sm text-gray-600">{request.category}</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                    รอการอนุมัติ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="font-semibold">ขอโดย:</span>
                    <p className="text-gray-700">{request.requestedBy}</p>
                  </div>
                  <div>
                    <span className="font-semibold">ตำแหน่ง:</span>
                    <p className="text-gray-700">
                      {request.requestedByRole === UserRole.Teacher ? 'ครู' : 
                       request.requestedByRole === UserRole.Student ? 'นักเรียน' : 'ผู้ดูแลระบบ'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">จำนวน:</span>
                    <p className="text-gray-700">{request.quantity} ชั้น</p>
                  </div>
                  <div>
                    <span className="font-semibold">วันที่ขอ:</span>
                    <p className="text-gray-700">{new Date(request.requestedDate).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>

                {showRejectForm === request.id && (
                  <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <label className="block text-sm font-medium mb-2">เหตุผลในการปฏิเสธ:</label>
                    <textarea
                      value={rejectReason[request.id] || ''}
                      onChange={(e) => setRejectReason(prev => ({ ...prev, [request.id]: e.target.value }))}
                      className="w-full border border-gray-300 p-2 rounded text-sm"
                      rows={2}
                      placeholder="อธิบายเหตุผลในการปฏิเสธ"
                    />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <span className="material-icons-outlined">check_circle</span>
                    อนุมัติ
                  </button>

                  {showRejectForm === request.id ? (
                    <>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <span className="material-icons-outlined">cancel</span>
                        ยืนยันปฏิเสธ
                      </button>
                      <button
                        onClick={() => setShowRejectForm(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowRejectForm(request.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <span className="material-icons-outlined">cancel</span>
                      ปฏิเสธ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-10">
            <span className="material-icons-outlined text-6xl text-gray-300">notifications_off</span>
            <p className="mt-4 text-gray-500">ไม่มีรายการรอการอนุมัติ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductApprovalPage;
