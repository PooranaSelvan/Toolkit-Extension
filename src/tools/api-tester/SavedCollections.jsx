import { motion } from 'framer-motion';
import { FolderOpen, Trash2, X } from 'lucide-react';
import { METHOD_COLORS, truncate } from '../../utils/helpers';

export default function SavedCollections({ collections, onLoad, onDelete, onClose }) {
  if (collections.length === 0) {
    return (
      <div className="section-card animate-fade-in">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen size={16} className="text-primary" />
              Saved Collections
            </h3>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="btn btn-ghost btn-xs rounded-lg hover:bg-base-200/80">
              <X size={14} />
            </motion.button>
          </div>
          <div className="text-center py-8">
            <p className="text-sm opacity-50">
              No saved requests yet. Save a request to start building your collection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card animate-fade-in">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FolderOpen size={16} className="text-primary" />
            Saved Collections
            <span className="badge badge-ghost badge-xs">{collections.length}</span>
          </h3>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="btn btn-ghost btn-xs rounded-lg hover:bg-base-200/80">
            <X size={14} />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group p-3.5 rounded-xl bg-base-200/60 border border-base-300/50 transition-all duration-200 cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 backdrop-blur-sm"
              onClick={() => onLoad(item)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{item.name}</span>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs text-error rounded-lg hover:bg-error/10"
                >
                  <Trash2 size={12} />
                </motion.button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge badge-xs ${METHOD_COLORS[item.method] || 'badge-ghost'}`}>
                  {item.method}
                </span>
                <span className="text-xs font-mono truncate opacity-50">
                  {truncate(item.url, 30)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
