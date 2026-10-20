import React from 'react';
import { ArrowUpDown, Calendar, Filter, X, History, Sparkles } from 'lucide-react';

interface FilterBarProps {
  sortBy: 'relevance' | 'newest';
  onSortChange: (sort: 'relevance' | 'newest') => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  viewMode: 'all' | 'my-listings';
  onViewModeChange: (mode: 'all' | 'my-listings') => void;
  isAuthenticated: boolean;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange,
  activeFilterCount,
  onClearFilters,
  viewMode,
  onViewModeChange,
  isAuthenticated,
  totalResults,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: View Mode Toggle & Total Count */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-gray-200/70 p-0.5 rounded-lg">
            <button
              onClick={() => onViewModeChange('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Lost & Found
            </button>
            {isAuthenticated && (
              <button
                onClick={() => onViewModeChange('my-listings')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'my-listings'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-emerald-600" />
                <span>My Listings History</span>
              </button>
            )}
          </div>

          <span className="text-gray-500 font-medium ml-1">
            ({totalResults} {totalResults === 1 ? 'item' : 'items'})
          </span>
        </div>

        {/* Right: Sort & Date Range Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* FR12: Sort by Relevance (default) or Newest */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
            <span className="text-gray-500 mr-1.5 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'relevance' | 'newest')}
              className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="relevance">Relevance (Default)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* FR13: Date Filter */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
            <span className="text-gray-500 mr-1.5 font-medium">Date:</span>
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Anytime</option>
              <option value="today">Today</option>
              <option value="3days">Past 3 Days</option>
              <option value="7days">Past Week</option>
              <option value="30days">Past Month</option>
            </select>
          </div>

          {/* Active Filter Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear Filters ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
