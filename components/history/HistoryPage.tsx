
import React, { useState, useMemo } from 'react';
import type { HistoryEntry, Device } from '../../types';
import { formatDate } from '../../utils/dateFormatter';

interface HistoryPageProps {
  history: HistoryEntry[];
  devices: Device[];
  t: (key: string) => string;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, devices, t }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const enrichedHistory = useMemo(() => {
        return history
            .map(h => {
                const device = devices.find(d => d.id === h.deviceId);
                return {
                    ...h,
                    deviceName: device?.name || 'Unknown Device',
                    deviceImageUrl: device?.imageUrl || 'https://picsum.photos/200'
                };
            })
            .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
    }, [history, devices]);

    const filteredHistory = useMemo(() => {
        if (!searchTerm) return enrichedHistory;
        return enrichedHistory.filter(h =>
            h.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.borrowerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [enrichedHistory, searchTerm]);

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <header className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">{t('history')}</h1>
                <p className="text-gray-500">Your device borrowing records</p>
            </header>
            
            <div className="relative">
                 <input
                    type="text"
                    placeholder="Search by device or borrower..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-spk-yellow"
                />
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            </div>

            <div className="space-y-4">
                {filteredHistory.length > 0 ? filteredHistory.map(entry => (
                    <div key={entry.historyId} className="bg-white p-4 rounded-lg shadow-md flex items-start space-x-4">
                        <img src={entry.deviceImageUrl} alt={entry.deviceName} className="w-16 h-16 rounded-md object-cover"/>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{entry.deviceName}</h3>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${entry.status === 'Returned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {entry.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Borrower: {entry.borrowerName}</p>
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                                <p><strong>Borrowed:</strong> {formatDate(entry.borrowDate)}</p>
                                <p><strong>Returned:</strong> {formatDate(entry.returnDate)}</p>
                                {entry.borrowNotes && <p><strong>Notes:</strong> {entry.borrowNotes}</p>}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10">
                        <span className="material-icons-outlined text-6xl text-gray-300">history_toggle_off</span>
                        <p className="mt-4 text-gray-500">No history records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
