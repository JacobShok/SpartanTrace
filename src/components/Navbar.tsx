import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  MessageSquare,
  Bell,
  Shield,
  User,
  LogOut,
  SlidersHorizontal,
  Database,
  MapPin,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { SJSU_LOCATIONS } from '../utils/constants';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onOpenPostModal: () => void;
  onOpenAlertsModal: () => void;
  onOpenAdminModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenNotifications: () => void;
  isSupabaseLive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  onOpenPostModal,
  onOpenAlertsModal,
  onOpenAdminModal,
  onOpenAuthModal,
  onOpenSupabaseModal,
  onOpenNotifications,
  isSupabaseLive,
}) => {
  const { user, isAuthenticated, isAdmin, logout, switchUser, availableUsers } = useAuth();
  const { unreadCount } = useNotifications();
  const { conversations, openChatWithConversation } = useChat();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Banner: Supabase status & Quick Test Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Database:{' '}
            <strong className="text-white">
              {isSupabaseLive ? 'Supabase Free Tier (Connected)' : 'Supabase Demo Store (Instant Local Mode)'}
            </strong>
          </span>
          <button
            onClick={onOpenSupabaseModal}
            className="ml-2 underline text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <Database className="w-3 h-3 inline" /> Supabase Settings / SQL
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="hidden sm:inline text-slate-400">Quick Test Switcher:</span>
          {availableUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user?.id === u.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {u.name.split(' ')[0]} {u.isAdmin ? '👑' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSearchChange('')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <span className="font-extrabold text-xl tracking-tight">ST</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-gray-900">Spartan<span className="text-emerald-600">Trace</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">SJSU</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-none">Campus Lost & Found Marketplace</p>
            </div>
          </div>

          {/* OfferUp-style Search Bar & Location dropdown */}
          <div className="flex-1 max-w-2xl flex items-center bg-gray-100 rounded-full border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:bg-white transition-all px-3 py-1.5">
            <Search className="w-5 h-5 text-gray-400 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Find lost AirPods, keys, backpack, student ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent border-none text-sm px-3 focus:outline-none text-gray-800 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="text-gray-400 hover:text-gray-600 p-1 mr-1"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Location selector pill */}
            <div className="relative shrink-0 border-l border-gray-300 pl-2">
              <button
                type="button"
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-emerald-600 max-w-[130px] truncate py-1 px-1.5 rounded"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{selectedLocation === 'All' ? 'SJSU Campus' : selectedLocation.split('-')[0]}</span>
              </button>

              {showLocationMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Select SJSU Location
                  </div>
                  <button
                    onClick={() => {
                      onLocationChange('All');
                      setShowLocationMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 ${
                      selectedLocation === 'All' ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-gray-700'
                    }`}
                  >
                    📍 All SJSU Campus Locations
                  </button>
                  {SJSU_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        onLocationChange(loc);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 hover:text-emerald-700 truncate ${
                        selectedLocation === loc ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-gray-700'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* OfferUp "Post" Button */}
            <button
              onClick={onOpenPostModal}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm px-4 py-2 rounded-full shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Post Found Item</span>
              <span className="sm:hidden">Post</span>
            </button>

            {/* Chat Icon */}
            <button
              onClick={() => {
                if (conversations.length > 0) {
                  openChatWithConversation(conversations[0].id);
                } else {
                  alert('No active chats. Submit a claim on a listing or receive a claim on your found item to chat!');
                }
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Direct Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {conversations.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications / Alerts Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Lost-Item Alerts Button */}
            <button
              onClick={onOpenAlertsModal}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 rounded-full transition-colors"
              title="Saved Item Alerts"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Lost Alerts</span>
            </button>

            {/* Admin Portal Button */}
            {isAdmin && (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors"
                title="Administrator Moderation Dashboard"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}

            {/* User Profile / Menu */}
            <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-700 hidden lg:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>SJSU Login</span>
                </button>
              )}

              {/* User Dropdown */}
              {showUserMenu && user && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Logged in with SJSU</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle className="w-3 h-3 text-emerald-600 inline" /> Verified SJSU Account
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAlertsModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" /> My Lost Item Alerts
                    </button>
                    {user.isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAdminModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-amber-600" /> Admin Dashboard (Reports & Audit)
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSupabaseModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Database className="w-4 h-4 text-emerald-600" /> Supabase Database Config
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase">
                      Switch Role (Grading Demo)
                    </div>
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between ${
                          user.id === u.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[10px] text-gray-400 capitalize">{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
