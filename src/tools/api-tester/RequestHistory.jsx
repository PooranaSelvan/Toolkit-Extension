import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Search } from 'lucide-react';
import { METHOD_COLORS, formatDuration, truncate, getStatusColor } from '../../utils/helpers';


export default function RequestHistory({ history, onLoad, onClear }) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? history.filter(e => e.url.toLowerCase().includes(search.toLowerCase()) || e.method.toLowerCase().includes(search.toLowerCase()))
    : history;

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100">
        <div className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <History size={16} className="text-primary" />
            History
          </h3>
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-3">
              <History size={24} className="opacity-30" />
            </div>
            <p className="text-xs font-medium opacity-50">No requests yet.</p>
            <p className="text-xs mt-1.5 opacity-30">Send a request to see it here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <History size={16} className="text-primary" />
            History
            <span className="badge badge-ghost badge-xs">{history.length}</span>
          </h3>
          <motion.button
            onClick={onClear}
            className="btn btn-ghost btn-xs text-error rounded-lg hover:bg-error/10"
            title="Clear history"
          >
            <Trash2 size={12} />
          </motion.button>
        </div>

        <div className="relative mb-4">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="input input-sm w-full"
            style={{ paddingLeft: '2rem' }}
          />
        </div>

        <div className="space-y-2.5 max-h-[550px] overflow-y-auto scrollbar-thin">
          {filtered.map((entry, idx) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onLoad(entry)}
              className="w-full text-left group p-3 rounded-xl bg-base-200/60 border border-base-300/50 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge badge-xs ${METHOD_COLORS[entry.method] || 'badge-ghost'}`}>
                  {entry.method}
                </span>
                <span className={`text-[10px] font-mono font-semibold ${getStatusColor(entry.status)}`}>
                  {entry.status}
                </span>
                <span className="text-[10px] ml-auto opacity-40">
                  {formatDuration(entry.duration)}
                </span>
              </div>
              <p className="text-xs font-mono truncate opacity-70">
                {truncate(entry.url, 40)}
              </p>
              <p className="text-[10px] mt-1 opacity-40">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
