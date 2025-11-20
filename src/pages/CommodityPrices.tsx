import { useState, useEffect } from 'react';
import { commodityPricesApi } from '../services/api';
import { Plus, Edit2, Trash2, Search, TrendingUp, Check, X } from 'lucide-react';

interface CommodityPrice {
  _id: string;
  commodityType: 'Silver' | 'INR' | 'Petrol' | 'Diesel' | 'LP Gas';
  state: string;
  city: string;
  price: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const COMMODITY_TYPES = ['Silver', 'INR', 'Petrol', 'Diesel', 'LP Gas'] as const;

const CommodityPrices = () => {
  const [commodityPrices, setCommodityPrices] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    commodityType: '',
    state: '',
    city: '',
    isActive: 'all' as 'all' | 'true' | 'false',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingCommodityPrice, setEditingCommodityPrice] = useState<CommodityPrice | null>(null);
  const [formData, setFormData] = useState({
    commodityType: '' as '' | 'Silver' | 'INR' | 'Petrol' | 'Diesel' | 'LP Gas',
    state: '',
    city: '',
    price: '',
    unit: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const filterParams: any = {};
      if (filters.commodityType) filterParams.commodityType = filters.commodityType;
      if (filters.state) filterParams.state = filters.state;
      if (filters.city) filterParams.city = filters.city;
      if (filters.isActive !== 'all') {
        filterParams.isActive = filters.isActive === 'true';
      }

      const data = await commodityPricesApi.getAll(filterParams);
      setCommodityPrices(data.commodityPrices || []);
    } catch (error) {
      console.error('Failed to fetch commodity prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const commodityData = {
        ...formData,
        price: Number(formData.price),
        commodityType: formData.commodityType as 'Silver' | 'INR' | 'Petrol' | 'Diesel' | 'LP Gas',
      };

      if (editingCommodityPrice) {
        await commodityPricesApi.update(editingCommodityPrice._id, commodityData);
      } else {
        await commodityPricesApi.create(commodityData);
      }
      await fetchData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commodity price?')) return;

    try {
      await commodityPricesApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete commodity price');
    }
  };

  const handleEdit = (commodityPrice: CommodityPrice) => {
    setEditingCommodityPrice(commodityPrice);
    setFormData({
      commodityType: commodityPrice.commodityType,
      state: commodityPrice.state,
      city: commodityPrice.city,
      price: commodityPrice.price.toString(),
      unit: commodityPrice.unit,
      isActive: commodityPrice.isActive,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (commodityPrice: CommodityPrice) => {
    try {
      await commodityPricesApi.update(commodityPrice._id, { isActive: !commodityPrice.isActive });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update commodity price');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCommodityPrice(null);
    setFormData({
      commodityType: '',
      state: '',
      city: '',
      price: '',
      unit: '',
      isActive: true,
    });
    setError('');
  };

  const filteredCommodityPrices = commodityPrices.filter((cp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cp.commodityType.toLowerCase().includes(searchLower) ||
      cp.state.toLowerCase().includes(searchLower) ||
      cp.city.toLowerCase().includes(searchLower)
    );
  });

  const getCommodityIcon = (type: string) => {
    switch (type) {
      case 'Silver':
        return '🥈';
      case 'INR':
        return '₹';
      case 'Petrol':
        return '⛽';
      case 'Diesel':
        return '🛢️';
      case 'LP Gas':
        return '🔥';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Commodity Prices</h1>
          <p className="text-gray-600 mt-1">Manage commodity prices (Silver, INR, Petrol, Diesel, LP Gas)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Commodity Price
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6 space-y-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by commodity type, state, or city..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.commodityType}
              onChange={(e) => setFilters({ ...filters, commodityType: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Commodity Types</option>
              {COMMODITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              placeholder="Filter by state..."
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Filter by city..."
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value as any })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Commodity</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">State</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">City</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Unit</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommodityPrices.length > 0 ? (
                filteredCommodityPrices.map((cp) => (
                  <tr key={cp._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg text-2xl">
                          {getCommodityIcon(cp.commodityType)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{cp.commodityType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{cp.state}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{cp.city}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800">
                        {cp.commodityType === 'INR' ? '₹' : '$'}
                        {cp.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700 text-sm">{cp.unit}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {cp.isActive ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            cp.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {cp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(cp)}
                          className={`p-2 rounded-lg transition ${
                            cp.isActive
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={cp.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {cp.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(cp)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cp._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No commodity prices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingCommodityPrice ? 'Edit Commodity Price' : 'Add New Commodity Price'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commodity Type *</label>
                <select
                  value={formData.commodityType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commodityType: e.target.value as 'Silver' | 'INR' | 'Petrol' | 'Diesel' | 'LP Gas',
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a commodity type</option>
                  {COMMODITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Maharashtra"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mumbai"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 105.50"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., per liter, per kg"
                    required
                  />
                </div>
              </div>

              {editingCommodityPrice && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingCommodityPrice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommodityPrices;

