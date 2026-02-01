import { useState, useEffect } from 'react';
import { indiaApplyNowApi } from '../services/api';
import { Save, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Flag } from 'lucide-react';

interface IndiaApplyNowSettings {
  _id: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const IndiaApplyNow = () => {
  const [settings, setSettings] = useState<IndiaApplyNowSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ isActive: true, description: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await indiaApplyNowApi.get();
      if (data.applyNow) {
        setSettings(data.applyNow);
        setFormData({
          isActive: data.applyNow.isActive,
          description: data.applyNow.description || '',
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch India settings:', err);
      setError(err.message || 'Failed to load India Apply Now settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      let data;
      if (settings) {
        data = await indiaApplyNowApi.update(formData);
      } else {
        data = await indiaApplyNowApi.create(formData);
      }

      setSettings(data.applyNow);
      setSuccess(data.message || 'India settings updated successfully');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save India settings');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = () => {
    setFormData({ ...formData, isActive: !formData.isActive });
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
      <div className="flex items-center gap-3">
        <Flag className="w-7 h-7 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">India Apply Now Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage the Apply Now button visibility and settings specifically for India users
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">India Button Status</h2>
                <p className="text-gray-600 text-sm">
                  Toggle the India Apply Now button to be active or inactive
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition shadow-lg ${
                  formData.isActive
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <ToggleRight className="w-6 h-6" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter a description for the India Apply Now settings..."
            />
            <p className="text-gray-500 text-xs mt-1">
              This description can be used for internal notes or documentation
            </p>
          </div>

          {settings && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">India Settings Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-800 ml-2">
                    {new Date(settings.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-800 ml-2">
                    {new Date(settings.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={submitting}
            >
              <Save className="w-5 h-5" />
              {submitting ? 'Saving...' : settings ? 'Update India Settings' : 'Create India Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Current India Status</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              formData.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></div>
          <span className="text-sm text-blue-700">
            The India Apply Now button is currently{' '}
            <span className="font-semibold">
              {formData.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default IndiaApplyNow;
