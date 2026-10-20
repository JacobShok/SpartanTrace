import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  PlusCircle,
  Sparkles,
  Inbox,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Shield,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Listing } from './types';
import { dbService } from './services/db';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { FilterBar } from './components/FilterBar';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { PostItemModal } from './components/PostItemModal';
import { EditItemModal } from './components/EditItemModal';
import { ClaimModal } from './components/ClaimModal';
import { ChatDrawer } from './components/ChatDrawer';
import { AlertsModal } from './components/AlertsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ReportModal } from './components/ReportModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseModal } from './components/SupabaseModal';

export const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Search & Filter state (FR11, FR12, FR13)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest'>('relevance');
  const [viewMode, setViewMode] = useState<'all' | 'my-listings'>('all');

  // Listings data
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // Active Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [claimingListing, setClaimingListing] = useState<Listing | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Reporting state
  const [reportData, setReportData] = useState<{
    contentType: 'listing' | 'message';
    contentId: string;
    ownerId: string;
    ownerName: string;
    contentSnippet: string;
  } | null>(null);

  // Calculate Date bounds for filtering (FR13)
  const getDateRangeBounds = (range: string): { dateFrom?: string; dateTo?: string } => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (range === 'today') {
      return { dateFrom: todayStr, dateTo: todayStr };
    } else if (range === '3days') {
      const past = new Date(now.getTime() - 86400000 * 3).toISOString().split('T')[0];
      return { dateFrom: past, dateTo: todayStr };
    } else if (range === '7days') {
      const past = new Date(now.getTime() - 86400000 * 7).toISOString().split('T')[0];
      return { dateFrom: past, dateTo: todayStr };
    } else if (range === '30days') {
      const past = new Date(now.getTime() - 86400000 * 30).toISOString().split('T')[0];
      return { dateFrom: past, dateTo: todayStr };
    }
    return {};
  };

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    const { dateFrom, dateTo } = getDateRangeBounds(dateRange);

    const isLive = await dbService.isSupabaseConnected();
    setIsSupabaseLive(isLive);

    const items = await dbService.getListings({
      keyword: searchTerm,
      category: selectedCategory,
      location: selectedLocation,
      dateFrom,
      dateTo,
      sort: sortBy,
      includeReturned: viewMode === 'my-listings',
      finderId: viewMode === 'my-listings' ? user?.id : undefined,
    });

    setListings(items);
    setIsLoading(false);
  }, [searchTerm, selectedCategory, selectedLocation, dateRange, sortBy, viewMode, user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Compute active filters count
  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedLocation !== 'All' ? 1 : 0) +
    (dateRange !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setDateRange('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* OfferUp-style Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onOpenPostModal={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsPostModalOpen(true);
          }
        }}
        onOpenAlertsModal={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsAlertsModalOpen(true);
          }
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isSupabaseLive={isSupabaseLive}
      />

      {/* OfferUp-style Horizontal Category Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Filter & Sorting Controls */}
      <FilterBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearAllFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isAuthenticated={isAuthenticated}
        totalResults={listings.length}
      />

      {/* Main Marketplace Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        {/* Banner if in 'My Listings' view */}
        {viewMode === 'my-listings' && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <div>
              <span className="font-bold">Your Found Item Listings History:</span> Shows all items you reported, including active and completed returned items (FR08).
            </div>
            <button
              onClick={() => setViewMode('all')}
              className="font-bold underline text-emerald-800 hover:text-emerald-950"
            >
              Back to Campus Feed
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-gray-200/80 p-3 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="bg-gray-200 aspect-4/3 rounded-xl mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">No items match your criteria</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Try clearing some filters, or create a <strong>Lost-Item Alert</strong> to get notified as soon as someone finds it.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => {
                  if (!isAuthenticated) setIsAuthModalOpen(true);
                  else setIsAlertsModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Create Lost Alert</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {listings.map((item) => (
              <ItemCard
                key={item.id}
                listing={item}
                onClick={() => setSelectedListing(item)}
                isOwner={user?.id === item.finderId}
              />
            ))}
          </div>
        )}
      </main>

      {/* OfferUp-style Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              ST
            </div>
            <span className="font-bold text-gray-900">SpartanTrace</span>
            <span>— San Jose State University Lost & Found Recovery Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Supabase Free Tier Config</span>
            </button>
            <span>•</span>
            <span className="text-gray-400">Team: Yusuf, Jacob, Ziyad, Jagvir</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedListing && (
        <ItemDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onOpenClaimModal={(item) => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
            } else {
              setClaimingListing(item);
            }
          }}
          onOpenEditModal={(item) => setEditingListing(item)}
          onOpenReportModal={(type, id, ownerId, ownerName, snippet) => {
            setReportData({
              contentType: type,
              contentId: id,
              ownerId,
              ownerName,
              contentSnippet: snippet,
            });
          }}
          onListingUpdated={() => {
            fetchListings();
            if (selectedListing) {
              dbService.getListingById(selectedListing.id).then((l) => setSelectedListing(l));
            }
          }}
        />
      )}

      {isPostModalOpen && (
        <PostItemModal
          onClose={() => setIsPostModalOpen(false)}
          onSuccess={() => {
            fetchListings();
            alert('Your found item has been published and is now visible to people searching for lost property (FR03)!');
          }}
        />
      )}

      {editingListing && (
        <EditItemModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSuccess={(updated) => {
            fetchListings();
            setSelectedListing(updated);
            alert('Listing details updated successfully (FR10)!');
          }}
        />
      )}

      {claimingListing && (
        <ClaimModal
          listing={claimingListing}
          onClose={() => setClaimingListing(null)}
          onSuccess={() => {
            fetchListings();
            alert('Claim submitted! A direct message conversation has been opened with the Finder.');
          }}
        />
      )}

      {/* OfferUp Chat Drawer */}
      <ChatDrawer
        onOpenReportModal={(type, id, ownerId, ownerName, snippet) => {
          setReportData({
            contentType: type,
            contentId: id,
            ownerId,
            ownerName,
            contentSnippet: snippet,
          });
        }}
      />

      {isAlertsModalOpen && <AlertsModal onClose={() => setIsAlertsModalOpen(false)} />}

      {isNotificationsOpen && (
        <NotificationsModal
          onClose={() => setIsNotificationsOpen(false)}
          onOpenListing={async (id) => {
            const item = await dbService.getListingById(id);
            if (item) setSelectedListing(item);
          }}
        />
      )}

      {reportData && (
        <ReportModal
          reportData={reportData}
          onClose={() => setReportData(null)}
          onSuccess={() => {}}
        />
      )}

      {isAdminModalOpen && (
        <AdminPanelModal
          onClose={() => setIsAdminModalOpen(false)}
          onRefreshListings={fetchListings}
        />
      )}

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {isSupabaseModalOpen && (
        <SupabaseModal
          onClose={() => setIsSupabaseModalOpen(false)}
          onConfigUpdated={fetchListings}
        />
      )}
    </div>
  );
};

export default App;
