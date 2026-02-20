
import React from 'react';
import type { Product } from '../../types';

interface ProductManagementPageProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAssignUser: (product: Product) => void;
  t: (key: string) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductManagementPage: React.FC<ProductManagementPageProps> = (props) => {
  const { products, onAddProduct, onEditProduct, onDeleteProduct, onAssignUser, t, searchTerm, setSearchTerm } = props;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('productManagement')}</h1>
        <p className="text-gray-500">Manage device models</p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
                 <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            </div>
            <button onClick={onAddProduct} className="bg-spk-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center hover:bg-blue-800">
                <span className="material-icons-outlined">add</span>Add Product
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                            <div className="ml-4 font-medium text-gray-900">{product.name}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button onClick={() => onAssignUser(product)} className="text-green-600 hover:text-green-900">Assign User</button>
                      <button onClick={() => onEditProduct(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => onDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementPage;
