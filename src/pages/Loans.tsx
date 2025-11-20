import { useState, useEffect } from 'react';
import { loansApi, categoriesApi } from '../services/api';
import { Plus, Edit2, Trash2, Search, Banknote, Check, X, ExternalLink } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Loan {
  _id: string;
  category: {
    _id: string;
    name: string;
    description?: string;
  };
  loanTitle: string;
  loanCompany: string;
  bankName?: string;
  bankLogo?: string;
  loanDescription: string;
  loanQuote: string;
  link: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    loanTitle: '',
    loanCompany: '',
    bankName: '',
    bankLogo: null as File | null,
    loanDescription: '',
    loanQuote: '',
    link: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansData, categoriesData] = await Promise.all([
        loansApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setLoans(loansData.loans || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingLoan) {
        await loansApi.update(editingLoan._id, formData);
      } else {
        await loansApi.create(formData);
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
    if (!confirm('Are you sure you want to delete this loan?')) return;

    try {
      await loansApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete loan');
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      category: loan.category._id,
      loanTitle: loan.loanTitle,
      loanCompany: loan.loanCompany,
      bankName: loan.bankName || '',
      bankLogo: null,
      loanDescription: loan.loanDescription,
      loanQuote: loan.loanQuote,
      link: loan.link,
      isActive: loan.isActive,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (loan: Loan) => {
    try {
      await loansApi.update(loan._id, { isActive: !loan.isActive });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update loan');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLoan(null);
    setFormData({
      category: '',
      loanTitle: '',
      loanCompany: '',
      bankName: '',
      bankLogo: null,
      loanDescription: '',
      loanQuote: '',
      link: '',
      isActive: true,
    });
    setError('');
  };

  const filteredLoans = loans
    .filter((loan) => 
      loan.loanTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanCompany.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((loan) => categoryFilter === 'all' || loan.category._id === categoryFilter);

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
          <h1 className="text-3xl font-bold text-gray-800">Loans</h1>
          <p className="text-gray-600 mt-1">Manage loan products</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Loan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search loans by title or company..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Bank</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Company</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Quote</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {loan.bankLogo ? (
                          <img 
                            src={loan.bankLogo} 
                            alt={loan.bankName || loan.loanCompany}
                            className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-white p-1"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg ${loan.bankLogo ? 'hidden' : 'flex'}`}
                        >
                          <Banknote className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{loan.loanTitle}</p>
                          {loan.loanDescription && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{loan.loanDescription}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        {loan.bankLogo && (
                          <img 
                            src={loan.bankLogo} 
                            alt={loan.bankName || loan.loanCompany}
                            className="w-12 h-12 object-contain rounded-lg border border-gray-200 bg-white p-1 mb-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-gray-700 font-medium">{loan.bankName || loan.loanCompany}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{loan.loanCompany}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{loan.category.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700 text-sm">{loan.loanQuote}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {loan.isActive ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            loan.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {loan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={loan.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Open link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleToggleActive(loan)}
                          className={`p-2 rounded-lg transition ${
                            loan.isActive
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={loan.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {loan.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(loan)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loan._id)}
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
                    <Banknote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No loans found</p>
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
              {editingLoan ? 'Edit Loan' : 'Add New Loan'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Title *</label>
                <input
                  type="text"
                  value={formData.loanTitle}
                  onChange={(e) => setFormData({ ...formData, loanTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Home Loan - Best Rates"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Company *</label>
                <input
                  type="text"
                  value={formData.loanCompany}
                  onChange={(e) => setFormData({ ...formData, loanCompany: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ABC Bank"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ABC Bank"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Logo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, bankLogo: e.target.files?.[0] || null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingLoan}
                />
                {editingLoan && formData.bankLogo && (
                  <p className="mt-2 text-sm text-gray-600">New file selected: {formData.bankLogo.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Description *</label>
                <textarea
                  value={formData.loanDescription}
                  onChange={(e) => setFormData({ ...formData, loanDescription: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the loan product..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Quote *</label>
                <input
                  type="text"
                  value={formData.loanQuote}
                  onChange={(e) => setFormData({ ...formData, loanQuote: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Starting from 8.5% interest rate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link *</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/apply-loan"
                  required
                />
              </div>

              {editingLoan && (
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
                  {submitting ? 'Saving...' : editingLoan ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;

