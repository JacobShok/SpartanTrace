import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';

interface ReportModalProps {
  reportData: {
    contentType: 'listing' | 'message';
    contentId: string;
    ownerId: string;
    ownerName: string;
    contentSnippet: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportData,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to report content.');
      return;
    }

    if (!reason.trim()) {
      setError('A reason is required before submitting a report.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await dbService.createReport({
        reporterId: user.id,
        reporterName: user.name,
        contentType: reportData.contentType,
        contentId: reportData.contentId,
        ownerId: reportData.ownerId,
        ownerName: reportData.ownerName,
        reason: reason.trim(),
        contentSnippet: reportData.contentSnippet,
      });

      alert('Report submitted for Administrator review. Thank you for keeping SpartanTrace safe.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/60">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-extrabold text-gray-900">
              Report {reportData.contentType === 'listing' ? 'Listing' : 'Direct Message'} (FR26)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Snippet */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
          <span className="font-semibold block text-gray-500 mb-1">Reported Content:</span>
          <p className="italic line-clamp-2">"{reportData.contentSnippet}"</p>
          <span className="text-[10px] text-gray-400 block mt-1">
            Owner: {reportData.ownerName}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason for Report *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Inappropriate photo, scam/fraudulent claim, harassment, false information..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-red-500"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit to Admin Queue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
