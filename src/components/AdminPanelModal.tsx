import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  UserX,
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  Clock,
  Search,
} from 'lucide-react';
import { ReportItem, AdminAuditLog, UserProfile, Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { formatRelativeTime, formatDate } from '../utils/formatters';

interface AdminPanelModalProps {
  onClose: () => void;
  onRefreshListings: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onClose,
  onRefreshListings,
}) => {
  const { user, refreshUsers } = useAuth();

  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'listings' | 'audit'>('reports');

  // Reports
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [adminResolutionNote, setAdminResolutionNote] = useState('');

  // Users
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userReason, setUserReason] = useState('');

  // Listings for Moderation
  const [listings, setListings] = useState<Listing[]>([]);
  const [removalReason, setRemovalReason] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const r = await dbService.getReports();
    setReports(r);
    const u = await dbService.getUsers();
    setUsers(u);
    const l = await dbService.getListings({ includeReturned: true });
    setListings(l);
    const logs = await dbService.getAuditLogs();
    setAuditLogs(logs);
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
          <p className="text-red-600 font-bold mb-2">Access Denied</p>
          <p className="text-xs text-gray-500 mb-4">You must be logged in as an Administrator.</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  // FR28: Resolve Report
  const handleResolveReport = async (status: 'Dismissed' | 'Confirmed') => {
    if (!selectedReport) return;
    try {
      await dbService.resolveReport(
        selectedReport.id,
        status,
        user.id,
        user.name,
        adminResolutionNote
      );

      // If confirmed and content is listing, give option to remove listing immediately (FR29)
      if (status === 'Confirmed' && selectedReport.contentType === 'listing') {
        const shouldRemove = window.confirm(
          'Report confirmed. Do you also want to remove this listing from public search right now?'
        );
        if (shouldRemove) {
          await dbService.removeListing(
            selectedReport.contentId,
            user.id,
            user.name,
            adminResolutionNote || selectedReport.reason
          );
          onRefreshListings();
        }
      }

      setAdminResolutionNote('');
      setSelectedReport(null);
      await loadAllData();
      alert(`Report marked as ${status}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  // FR29, FR30: Admin Remove Listing
  const handleRemoveListing = async (listingId: string) => {
    const reason = removalReason.trim() || 'Violates SpartanTrace Community Guidelines';
    try {
      await dbService.removeListing(listingId, user.id, user.name, reason);
      setRemovalReason('');
      await loadAllData();
      onRefreshListings();
      alert('Listing removed. Normal users can no longer view it, and the owner has been notified.');
    } catch (err: any) {
      alert(err.message || 'Failed to remove listing');
    }
  };

  // FR31, FR32: Suspend / Restore User
  const handleToggleSuspend = async (targetUser: UserProfile) => {
    const isSuspending = !targetUser.isSuspended;
    const reason =
      userReason.trim() || (isSuspending ? 'Suspicious activity or repeated violations' : 'Account restored by administrator');

    try {
      await dbService.setAccountSuspension(
        targetUser.id,
        isSuspending,
        user.id,
        user.name,
        reason
      );
      setUserReason('');
      refreshUsers();
      await loadAllData();
      alert(`User ${targetUser.name} has been ${isSuspending ? 'SUSPENDED' : 'RESTORED'}.`);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Administrator Console</h2>
              <p className="text-xs text-gray-500">Moderation, Accounts & Audit Logs (FR26-FR32)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 border-b border-gray-200 bg-gray-50 gap-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('reports');
              setSelectedReport(null);
            }}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Reports Review Queue ({reports.filter((r) => r.status === 'Pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'listings'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Listings Content Removal (FR29)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserX className="w-4 h-4 text-red-500" />
            <span>User Accounts (FR31)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Audit Log (FR32)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {/* TAB 1: Reports Queue (FR26, FR27, FR28) */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {selectedReport ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Report ID: {selectedReport.id}
                    </span>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      ← Back to Queue
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 font-semibold">Reported Content Type:</p>
                      <p className="font-bold text-gray-800 capitalize">{selectedReport.contentType}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold">Content Owner:</p>
                      <p className="font-bold text-gray-800">{selectedReport.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold">Reported By:</p>
                      <p className="font-bold text-gray-800">{selectedReport.reporterName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold">Date Reported:</p>
                      <p className="font-bold text-gray-800">{formatRelativeTime(selectedReport.createdAt)}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 mb-1">Snippet of Reported Content:</p>
                    <p className="text-xs text-gray-800 italic font-mono">"{selectedReport.contentSnippet}"</p>
                  </div>

                  <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-800 mb-1">Reason Provided by Reporter:</p>
                    <p className="text-xs text-red-900">{selectedReport.reason}</p>
                  </div>

                  {selectedReport.status === 'Pending' ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Administrator Review Reason / Notes:
                        </label>
                        <input
                          type="text"
                          placeholder="Resolution rationale..."
                          value={adminResolutionNote}
                          onChange={(e) => setAdminResolutionNote(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:outline-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleResolveReport('Dismissed')}
                          className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4 text-gray-600" />
                          <span>Dismiss Report</span>
                        </button>
                        <button
                          onClick={() => handleResolveReport('Confirmed')}
                          className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                          <span>Confirm Report (Valid Violation)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-xl text-xs text-gray-700">
                      Resolved as <strong className="font-bold">{selectedReport.status}</strong> by{' '}
                      {selectedReport.resolvedBy} on {selectedReport.resolvedAt ? formatRelativeTime(selectedReport.resolvedAt) : 'N/A'}.
                      {selectedReport.adminNotes && <p className="mt-1 italic">Note: "{selectedReport.adminNotes}"</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No reported content in the queue.
                    </div>
                  ) : (
                    reports.map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedReport(rep)}
                        className="p-3.5 bg-white border border-gray-200 rounded-xl hover:border-amber-400 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rep.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : rep.status === 'Confirmed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {rep.status}
                            </span>
                            <span className="text-xs font-bold text-gray-800">
                              {rep.contentType.toUpperCase()}: "{rep.contentSnippet.slice(0, 45)}..."
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Reported by {rep.reporterName} • Reason: {rep.reason}
                          </p>
                        </div>
                        <span className="text-xs text-amber-700 font-semibold hover:underline">
                          Review →
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Listings Moderation (FR29, FR30) */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                Removing content hides it from normal user search and feeds immediately while preserving identifiers and moderation reasons for audit.
              </div>

              <div className="space-y-3">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={l.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{l.title}</h4>
                          {l.isRemoved && (
                            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                              REMOVED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Finder: {l.finderName} ({l.finderEmail}) • {l.locationFound}
                        </p>
                      </div>
                    </div>

                    {!l.isRemoved ? (
                      <button
                        onClick={() => {
                          const r = prompt('Administrative Reason for removal (sent to owner):');
                          if (r) {
                            setRemovalReason(r);
                            handleRemoveListing(l.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove (FR29)</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic shrink-0">
                        Removed: {l.moderationReason || 'By Admin'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: User Accounts Management (FR31) */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Suspended accounts are locked out and unable to log in or post activity (FR31).
              </p>

              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{u.name}</span>
                        {u.isAdmin && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        {u.isSuspended && (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">{u.email}</p>
                    </div>

                    {u.id !== user.id && (
                      <button
                        onClick={() => handleToggleSuspend(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          u.isSuspended
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {u.isSuspended ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore Account</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspend Account (FR31)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Read-Only Audit Log (FR32) */}
          {activeTab === 'audit' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">
                Read-only audit log tracking administrator actions, targets, and reasons (FR32).
              </p>

              {auditLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">No audit log entries yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white border border-gray-200 rounded-xl font-mono text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-gray-400 text-[11px]">
                      <span>Admin: {log.adminName}</span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700">{log.action}</span>
                      <span className="text-gray-500">[{log.targetType}: {log.targetId}]</span>
                    </div>
                    <p className="text-gray-600 text-[11px] font-sans">Reason: {log.reason}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
