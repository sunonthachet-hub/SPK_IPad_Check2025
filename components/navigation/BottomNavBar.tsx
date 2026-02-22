
import React from 'react';
import type { User } from '../../types';
import { UserRole } from '../../types';

interface BottomNavBarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  t: (key: string) => string;
  onScanClick: () => void;
}

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; hasBadge?: boolean; badgeCount?: number }> = ({ icon, label, isActive, onClick, hasBadge = false, badgeCount = 0 }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${isActive ? 'text-spk-blue' : 'text-gray-500 hover:text-spk-blue'}`}>
        <div className="relative">
            <span className="material-icons-outlined text-2xl">{icon}</span>
            {hasBadge && badgeCount > 0 && (
                <span className="absolute -top-1 -right-2.5 h-5 w-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center border-2 border-white">
                    {badgeCount}
                </span>
            )}
        </div>
        <span>{label}</span>
    </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ user, activeTab, setActiveTab, t, onScanClick }) => {
    
    // FIX: Define a type for navigation items to resolve property access errors on the union type.
    type NavItemType = {
        id: string;
        icon: string;
        label: string;
        isCentral?: boolean;
        hasBadge?: boolean;
        badgeCount?: number;
    };

    const userNavItems: NavItemType[] = [
        { id: 'home', icon: 'home', label: t('home') },
        { id: 'services', icon: 'build', label: t('services') },
        { id: 'scan', icon: 'qr_code_scanner', label: 'Scan', isCentral: true},
        { id: 'history', icon: 'history', label: t('history') },
        { id: 'profile', icon: 'person', label: t('profile') }
    ];

    const adminNavItems: NavItemType[] = [
        ...userNavItems.slice(0, 2),
        { id: 'scan', icon: 'qr_code_scanner', label: 'สแกน', isCentral: true},
        { id: 'reports', icon: 'analytics', label: t('reports') },
        { id: 'profile', icon: 'person', label: t('profile') }
    ];

    const navItems = user.role === UserRole.Admin ? adminNavItems : userNavItems;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40 flex items-center justify-around no-print">
             {navItems.map(item => {
                if (item.isCentral) {
                    return (
                        <div key={item.id} className="w-1/5 flex justify-center">
                            <button
                                onClick={onScanClick}
                                className="bg-spk-blue text-white rounded-full w-16 h-16 flex items-center justify-center -mt-8 shadow-lg transform hover:scale-110 transition-transform"
                                aria-label="Scan QR Code"
                            >
                                <span className="material-icons-outlined text-4xl">{item.icon}</span>
                            </button>
                        </div>
                    );
                }
                return (
                    <div key={item.id} className="w-1/5">
                        <NavItem
                            icon={item.icon}
                            label={item.label}
                            isActive={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                            hasBadge={item.hasBadge}
                            badgeCount={item.badgeCount}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default BottomNavBar;
