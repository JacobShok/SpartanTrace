import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  AlertTriangle,
  MessageCircle,
  Edit3,
  CheckCircle,
  Clock,
  ArrowRight,
  User,
  Share2,
} from 'lucide-react';
import { Listing, Claim } from '../types';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { dbService } from '../services/db';
import { formatDate, formatRelativeTime } from '../utils/formatters';

interface ItemDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onOpenClaimModal: (listing: Listing) => void;
  onOpenEditModal: (listing: Listing) => void;
  onOpenReportModal: (type: 'listing', id: string, ownerId: string, ownerName: string, snippet: string) => void;
  onListingUpdated: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  listing,
  onClose,
  onOpenClaimModal,
  onOpenEditModal,
  onOpenReportModal,
  onListingUpdated,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { openChatForClaim } = useChat();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  const isOwner = user && listing && user.id === listing.finderId;

  useEffect(() => {
    if (listing && isOwner) {
      loadClaims();
    }
  }, [listing?.id, isOwner]);

  const loadClaims = async () => {
    if (!listing) return;
    setIsLoadingClaims(true);
    const data = await dbService.getClaimsForListing(listing.id);
    setClaims(data);
    setIsLoadingClaims(false);
  };

  if (!listing) return null;

  // Status transitions: FR06, FR07
  const handleUpdateStatus = async (newStatus: Listing['status']) => {
    if (!listing || !isOwner) return;
    setStatusActionLoading(true);
    try {
      await dbService.updateListingStatus(listing.id, newStatus);
      onListingUpdated();
      alert(`Listing status successfully updated to "${newStatus}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusActionLoading(false);
    }
  };

  const handleClaimStatusChange = async (claimId: string, newStatus: 'Accepted' | 'Rejected') => {
    try {
      await dbService.updateClaimStatus(claimId, newStatus);
      if (newStatus === 'Accepted') {
        // FR06: transition listing to Claimed when claimant is accepted
        await dbService.updateListingStatus(listing.id, 'Claimed');
        onListingUpdated();
      }
      loadClaims();
      alert(`Claim has been marked as ${newStatus}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update claim');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
              {listing.category}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                listing.status === 'Available'
                  ? 'bg-emerald-600 text-white'
                  : listing.status === 'Pending'
                  ? 'bg-amber-500 text-white'
                  : listing.status === 'Claimed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {listing.status === 'Returned' ? 'Returned to Owner ✓' : listing.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-4/3 w-full border border-gray-200/80">
              <img
                src={listing.photoUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                Found on {formatDate(listing.dateFound)}
              </div>
            </div>

            {/* Right: Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                  {listing.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-gray-700">{listing.locationFound}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reported {formatRelativeTime(listing.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Finder's Description
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Finder Card */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                    {listing.finderName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900">{listing.finderName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-gray-500">{listing.finderEmail}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Verified SJSU
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {/* Looker Actions */}
                {!isOwner && (
                  <>
                    {listing.status === 'Available' ? (
                      <button
                        onClick={() => onOpenClaimModal(listing)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Claim This Item (Prove Ownership)</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-gray-100 rounded-xl text-xs text-gray-600 text-center font-medium">
                        This item is currently {listing.status.toLowerCase()} and is not accepting new claims.
                      </div>
                    )}
                  </>
                )}

                {/* Finder Actions (Owner of listing) */}
                {isOwner && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Finder Management Controls
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* FR09, FR10: Edit Listing (if not returned) */}
                      {listing.status !== 'Returned' && (
                        <button
                          onClick={() => onOpenEditModal(listing)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>
                      )}

                      {/* FR06: Change status to Pending */}
                      {listing.status === 'Available' && (
                        <button
                          disabled={statusActionLoading}
                          onClick={() => handleUpdateStatus('Pending')}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors"
                        >
                          <span>Set to Pending</span>
                        </button>
                      )}

                      {/* FR06: Change status to Claimed */}
                      {listing.status === 'Pending' && (
                        <button
                          disabled={statusActionLoading}
                          onClick={() => handleUpdateStatus('Claimed')}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
                        >
                          <span>Accept & Mark Claimed</span>
                        </button>
                      )}

                      {/* FR07: Mark Returned */}
                      {listing.status === 'Claimed' && (
                        <button
                          disabled={statusActionLoading}
                          onClick={() => handleUpdateStatus('Returned')}
                          className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm Handover & Complete Return (FR07)</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Report Content (FR26) */}
                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <button
                    onClick={() =>
                      onOpenReportModal('listing', listing.id, listing.finderId, listing.finderName, listing.title)
                    }
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline font-medium"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report this listing</span>
                  </button>
                  <span className="text-[11px] text-gray-400">ID: {listing.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FR04: Claims List (Visible only to Finder who created listing) */}
          {isOwner && (
            <div className="border-t border-gray-200 pt-5 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-gray-900">
                  Submitted Ownership Claims ({claims.length})
                </h3>
                <span className="text-xs text-gray-500">Only visible to you (Finder)</span>
              </div>

              {isLoadingClaims ? (
                <div className="py-4 text-center text-xs text-gray-400">Loading claims...</div>
              ) : claims.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-500">
                  No claims submitted yet. Lookers searching for this item will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{claim.claimantName}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                claim.status === 'Accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : claim.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {claim.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            {claim.claimantEmail} • Submitted {formatRelativeTime(claim.createdAt)}
                          </p>
                        </div>

                        {/* Open Chat with Claimant (FR05) */}
                        <button
                          onClick={() => {
                            openChatForClaim(claim.id);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Direct Chat</span>
                        </button>
                      </div>

                      {/* Claim proof description */}
                      <div className="bg-gray-50 p-2.5 rounded-lg text-xs text-gray-700">
                        <span className="font-bold text-gray-500 block mb-0.5">Proof of Ownership:</span>
                        "{claim.proofDescription}"
                      </div>

                      {/* Finder Accept/Reject options */}
                      {claim.status === 'Pending' && (
                        <div className="flex items-center gap-2 pt-1 justify-end">
                          <button
                            onClick={() => handleClaimStatusChange(claim.id, 'Rejected')}
                            className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-md font-medium"
                          >
                            Reject Claim
                          </button>
                          <button
                            onClick={() => handleClaimStatusChange(claim.id, 'Accepted')}
                            className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold"
                          >
                            Accept Claimant
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
