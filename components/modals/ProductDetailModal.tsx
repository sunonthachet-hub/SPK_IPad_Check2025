
import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { DeviceCategory, UserRole } from '../../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit: Product | null;
  t: (key: string) => string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [productData, setProductData] = useState<Product>({
    id: `PROD-${Date.now()}`,
    name: '',
    category: DeviceCategory.iPad,
    imageUrl: '',
    description: '',
    designatedFor: undefined,
    defaultAccessories: '',
  });

  useEffect(() => {
    if (productToEdit) {
      setProductData({
        ...productToEdit,
        defaultAccessories: Array.isArray(productToEdit.defaultAccessories) ? productToEdit.defaultAccessories.join(', ') : productToEdit.defaultAccessories || ''
      });
    } else {
      setProductData({
        id: `PROD-${Date.now()}`,
        name: '',
        category: DeviceCategory.iPad,
        imageUrl: '',
        description: '',
        designatedFor: undefined,
        defaultAccessories: '',
      });
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...productData,
        defaultAccessories: (productData.defaultAccessories as string).split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <span className="material-icons-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-4 text-spk-blue">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input type="text" name="name" value={productData.name} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select name="category" value={productData.category} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md">
              {Object.values(DeviceCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Image URL</label>
            <input type="text" name="imageUrl" value={productData.imageUrl} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" value={productData.description} onChange={handleChange} rows={3} className="mt-1 w-full border border-gray-300 p-2 rounded-md" />
          </div>
           <div>
            <label className="block text-sm font-medium">Designated For</label>
            <select name="designatedFor" value={productData.designatedFor || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md">
                <option value="">All Users</option>
                <option value={UserRole.Student}>Student</option>
                <option value={UserRole.Teacher}>Teacher</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Default Accessories (comma-separated)</label>
            <input type="text" name="defaultAccessories" value={productData.defaultAccessories} onChange={handleChange} className="mt-1 w-full border border-gray-300 p-2 rounded-md" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          <button type="submit" className="bg-spk-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800">Save Product</button>
        </div>
      </form>
    </div>
  );
};

export default ProductDetailModal;
