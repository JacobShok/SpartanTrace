import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle, Copy, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabase';
import { dbService } from '../services/db';

interface SupabaseModalProps {
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose, onConfigUpdated }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setTestStatus('testing');
    const isConn = await dbService.isSupabaseConnected();
    if (isConn) {
      setTestStatus('connected');
    } else {
      setTestStatus(currentConfig.isConfigured ? 'error' : 'idle');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    onConfigUpdated();
    await checkConnection();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setTestStatus('idle');
    onConfigUpdated();
    alert('Cleared Supabase credentials. App will use the built-in local persistent store.');
  };

  const copySqlSchema = () => {
    const sql = `-- SpartanTrace Supabase Schema
-- Run in your Supabase SQL Editor:
-- (Check file: supabase/schema.sql in the project root)
SELECT 'Ready to run supabase/schema.sql';`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Supabase Free Tier Database</h2>
              <p className="text-[11px] text-slate-400">Connect to live cloud PostgreSQL or use Local Demo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              testStatus === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : testStatus === 'error'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  testStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : testStatus === 'error'
                    ? 'bg-amber-500'
                    : 'bg-gray-400'
                }`}
              />
              <span className="font-bold">
                {testStatus === 'connected'
                  ? 'Connected to Live Supabase Free Tier'
                  : testStatus === 'error'
                  ? 'Configured but connection unconfirmed (check schema tables or API key)'
                  : 'Running in Local Store Mode (Pre-seeded with SJSU data)'}
              </span>
            </div>
            <button
              onClick={checkConnection}
              className="p-1 hover:bg-black/5 rounded text-gray-500"
              title="Re-check"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs font-mono border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Project Anon API Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full text-xs font-mono border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus:outline-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Clear Credentials (Use Local Demo)
              </button>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm"
              >
                Save & Connect Supabase
              </button>
            </div>
          </form>

          {/* Setup Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-gray-600">
            <h4 className="font-bold text-gray-900 flex items-center justify-between">
              <span>Quick 2-Minute Supabase Free Tier Setup:</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Supabase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>Create a free project on Supabase.</li>
              <li>
                In your Supabase project dashboard, open the <strong>SQL Editor</strong>.
              </li>
              <li>
                Open the file <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">supabase/schema.sql</code> from this repository, copy its full contents, paste into the SQL Editor, and click <strong>Run</strong>.
              </li>
              <li>
                In Supabase under <strong>Project Settings → API</strong>, copy your <strong>Project URL</strong> and <strong>anon public API key</strong>, then paste them above or into <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">.env</code>.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
