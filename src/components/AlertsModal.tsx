import React, { useState, useEffect } from 'react';
import { X, Sparkles, Bell, Plus, Trash2, MapPin, Tag, AlertCircle } from 'lucide-react';
import { LostItemAlert } from '../types';
import { ITEM_CATEGORIES, SJSU_LOCATIONS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';

interface AlertsModalProps {
  onClose: () => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<LostItemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await dbService.getAlerts(user.id);
    setAlerts(data);
    setIsLoading(false);
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // FR16: At least one search criterion shall be required before the alert can be saved
    if (!keywords.trim() && !category && !location) {
      setError('At least one search criterion (keyword, category, or location) is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await dbService.createAlert({
        userId: user.id,
        keywords: keywords.trim(),
        category: category || undefined,
        location: location || undefined,
      });

      setKeywords('');
      setCategory('');
      setLocation('');
      await loadAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to save alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dbService.deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/90">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Lost-Item Alerts (FR16)</h2>
              <p className="text-xs text-gray-500">Get notified immediately when a matching item is posted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Create Alert Box */}
          <form onSubmit={handleCreateAlert} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Create New Alert</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Keywords (e.g. "AirPods", "Hydro Flask", "car key")
              </label>
              <input
                type="text"
                placeholder="Keywords to match in title or description"
                value={keywords}
                onChange={(e) => {
                  setKeywords(e.target.value);
                  if (error) setError('');
                }}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Category (Optional)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl px-2 py-2 bg-white focus:outline-emerald-500"
                >
                  <option value="">Any Category</option>
                  {ITEM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Location (Optional)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl px-2 py-2 bg-white focus:outline-emerald-500"
                >
                  <option value="">Any Location</option>
                  {SJSU_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc.split('-')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Alert...' : 'Save Lost-Item Alert'}</span>
            </button>
          </form>

          {/* Active Alerts List */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Your Active Alerts ({alerts.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-4 text-xs text-gray-400">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                You have no active alerts. Create one above to be automatically notified!
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-2xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">
                          {a.keywords || 'Any keyword'}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        {a.category && (
                          <span className="flex items-center gap-0.5">
                            <Tag className="w-3 h-3" /> {a.category}
                          </span>
                        )}
                        {a.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {a.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
