
import React, { useMemo } from 'react';
import type { Device, Product } from '../../types';
import { DeviceStatus } from '../../types';

interface VisitorPageProps {
  devices: Device[];
  products: Product[];
  t: (key: string) => string;
  onLoginClick: () => void;
  onExit: () => void;
}

const VisitorProductGroup: React.FC<{product: Product, devices: Device[], t: (key:string) => string}> = ({ product, devices, t }) => {
    const stats = useMemo(() => {
        const productDevices = devices.filter(d => d.productId === product.id);
        return {
            total: productDevices.length,
            available: productDevices.filter(d => d.status === DeviceStatus.Available).length,
        }
    }, [product, devices]);
    
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-4">
                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md"/>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.description}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 text-center">
                <div className="p-3">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-gray-500 uppercase">Total Devices</p>
                </div>
                 <div className="p-3 bg-green-50">
                    <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                    <p className="text-xs text-green-500 uppercase">{t('available')}</p>
                </div>
            </div>
        </div>
    )
}

const VisitorPage: React.FC<VisitorPageProps> = ({ devices, products, t, onLoginClick, onExit }) => {
  return (
    <div className="min-h-screen bg-spk-gray p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-spk-blue">SPK Device Hub - Available Devices</h1>
            <div>
                <button onClick={onLoginClick} className="text-white bg-spk-blue hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2">{t('login')}</button>
                <button onClick={onExit} className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5">Exit Visitor Mode</button>
            </div>
        </header>

        <div className="space-y-6">
            {products.map(product => (
                <VisitorProductGroup key={product.id} product={product} devices={devices} t={t} />
            ))}
        </div>
    </div>
  );
};
export default VisitorPage;
