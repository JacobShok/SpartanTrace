import React from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Listing } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface ItemCardProps {
  listing: Listing;
  onClick: () => void;
  isOwner?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ listing, onClick, isOwner }) => {
  const getStatusBadge = () => {
    switch (listing.status) {
      case 'Available':
        return (
          <span className="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
            Available
          </span>
        );
      case 'Pending':
        return (
          <span className="bg-amber-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
            Claim Pending
          </span>
        );
      case 'Claimed':
        return (
          <span className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
            Claimed
          </span>
        );
      case 'Returned':
        return (
          <span className="bg-slate-700 text-slate-100 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
            Returned ✓
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-400 hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full transform hover:-translate-y-0.5"
    >
      {/* Thumbnail with OfferUp style badges */}
      <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
        <img
          src={listing.photoUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // fallback if image fails to load
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {getStatusBadge()}
          {isOwner && (
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              You posted
            </span>
          )}
        </div>

        {/* OfferUp Price / "FOUND" pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-emerald-500/90 backdrop-blur-xs text-white text-xs font-black tracking-wide px-2.5 py-1 rounded-lg uppercase shadow-xs">
            FOUND
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-xs text-gray-500 mt-1.5 gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{listing.locationFound}</span>
          </div>
        </div>

        {/* Card Footer: Category & Date */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span className="font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {listing.category}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{formatRelativeTime(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
