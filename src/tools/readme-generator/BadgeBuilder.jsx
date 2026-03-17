import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import { Shield, Plus, Trash2, Palette } from 'lucide-react';


const BADGE_STYLES = ['flat', 'flat-square', 'plastic', 'for-the-badge', 'social'];

const BADGE_COLORS = [
  { name: 'Blue', value: '0969da' },
  { name: 'Green', value: '2ea043' },
  { name: 'Red', value: 'cf222e' },
  { name: 'Orange', value: 'f57c00' },
  { name: 'Purple', value: '8b5cf6' },
  { name: 'Pink', value: 'ec4899' },
  { name: 'Teal', value: '14b8a6' },
  { name: 'Yellow', value: 'eab308' },
  { name: 'Gray', value: '6b7280' },
  { name: 'Black', value: '000000' },
  { name: 'Indigo', value: '4f46e5' },
  { name: 'Cyan', value: '06b6d4' },
];

const PRESET_BADGES = [
  { label: 'build', text: 'passing', color: '2ea043', category: 'Status' },
  { label: 'tests', text: 'passing', color: '2ea043', category: 'Status' },
  { label: 'coverage', text: '95%', color: '0969da', category: 'Status' },
  { label: 'version', text: '1.0.0', color: '0969da', category: 'Status' },
  { label: 'PRs', text: 'welcome', color: '8b5cf6', category: 'Community' },
  { label: 'contributions', text: 'welcome', color: '14b8a6', category: 'Community' },
  { label: 'maintained', text: 'yes', color: '2ea043', category: 'Community' },
  { label: 'stars', text: '⭐', color: 'eab308', category: 'Community' },
  { label: 'npm', text: 'package', color: 'cf222e', category: 'Platform' },
  { label: 'docker', text: 'ready', color: '0969da', category: 'Platform' },
  { label: 'platform', text: 'linux | macos | windows', color: '6b7280', category: 'Platform' },
  { label: 'node', text: '>=16', color: '2ea043', category: 'Platform' },
];

const EMPTY_BADGE = { label: '', text: '', color: '0969da', style: 'flat', url: '' };

export default function BadgeBuilder({ badges = [], onChange }) {
  const [showPresets, setShowPresets] = useState(false);

  const addBadge = () => {
    onChange([...badges, { ...EMPTY_BADGE }]);
  };

  const addPreset = (preset) => {
    onChange([...badges, { ...preset, style: 'flat', url: '' }]);
  };

  const updateBadge = (index, field, value) => {
    const updated = badges.map((b, i) => i === index ? { ...b, [field]: value } : b);
    onChange(updated);
  };

  const removeBadge = (index) => {
    onChange(badges.filter((_, i) => i !== index));
  };

  const getBadgePreviewUrl = (badge) => {
    if (!badge.text) return null;
    const label = encodeURIComponent(badge.label || '');
    const text = encodeURIComponent(badge.text);
    const color = badge.color || '333';
    const style = badge.style || 'flat';
    return `https://img.shields.io/badge/${label}-${text}-${color}?style=${style}`;
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield size={14} className="text-primary" />
            </div>
            Badge Builder
            {badges.length > 0 && (
              <span className="badge badge-xs badge-primary">{badges.length}</span>
            )}
          </h3>
          <div className="flex items-center gap-1.5">
            <motion.button
              onClick={() => setShowPresets(!showPresets)}
              className={`btn btn-xs gap-1.5 rounded-xl transition-all duration-200 ${showPresets ? 'btn-primary shadow-md shadow-primary/20' : 'btn-ghost hover:bg-base-200/80'}`}
            >
              <Palette size={12} />
              Presets
            </motion.button>
            <motion.button
              onClick={addBadge}
              className="btn btn-xs gap-1.5 rounded-xl border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary transition-all"
            >
              <Plus size={12} />
              Custom
            </motion.button>
          </div>
        </div>

        {/* Presets grid */}
        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mb-4 p-3 rounded-lg bg-base-200/50 border border-base-200">
                <p className="text-[11px] font-medium text-base-content/70 mb-2.5">Click to add a preset badge:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BADGES.map((preset, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => addPreset(preset)}
                      className="group relative"
                      title={`Add ${preset.label}: ${preset.text}`}
                    >
                      <img
                        src={`https://img.shields.io/badge/${encodeURIComponent(preset.label)}-${encodeURIComponent(preset.text)}-${preset.color}?style=flat`}
                        alt={`${preset.label}: ${preset.text}`}
                        className="h-5 rounded"
                        loading="lazy"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge editor list */}
        {badges.length === 0 ? (
          <div className="text-center py-6 text-xs text-base-content/50">
            <Shield size={24} className="mx-auto mb-2 text-base-content/30" />
            No custom badges yet. Click &quot;Presets&quot; or &quot;Custom&quot; to add.
          </div>
        ) : (
          <div className="space-y-3">
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-base-200 bg-base-200/30 p-3 space-y-2.5 hover:border-primary/20 transition-colors"
              >
                {/* Preview */}
                {badge.text && (
                  <div className="flex items-center justify-between">
                    <img
                      src={getBadgePreviewUrl(badge)}
                      alt="Badge preview"
                      className="h-5"
                      loading="lazy"
                    />
                    <button
                      onClick={() => removeBadge(index)}
                      className="btn btn-ghost btn-xs text-error/60 hover:text-error"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                {/* Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={badge.label}
                    onChange={(e) => updateBadge(index, 'label', e.target.value)}
                    placeholder="Label (left)"
                    className="input input-xs w-full"
                  />
                  <input
                    type="text"
                    value={badge.text}
                    onChange={(e) => updateBadge(index, 'text', e.target.value)}
                    placeholder="Text (right)"
                    className="input input-xs w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Color picker */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded border border-base-300 shrink-0 cursor-pointer"
                      style={{ backgroundColor: `#${badge.color}` }}
                    />
                    <select
                      value={badge.color}
                      onChange={(e) => updateBadge(index, 'color', e.target.value)}
                      className="select select-xs flex-1"
                    >
                      {BADGE_COLORS.map((c) => (
                        <option key={c.value} value={c.value}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Style */}
                  <select
                    value={badge.style}
                    onChange={(e) => updateBadge(index, 'style', e.target.value)}
                    className="select select-xs w-full"
                  >
                    {BADGE_STYLES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Optional link */}
                <input
                  type="text"
                  value={badge.url || ''}
                  onChange={(e) => updateBadge(index, 'url', e.target.value)}
                  placeholder="Link URL (optional)"
                  className="input input-xs w-full font-mono text-[11px]"
                />
              </motion.div>
            ))}
          </div>
        )}

        {badges.length > 0 && (
          <p className="text-[11px] text-base-content/60 mt-3">
            {badges.filter((b) => b.text).length} badge{badges.filter((b) => b.text).length !== 1 ? 's' : ''} will appear at the top of your README
          </p>
        )}
      </div>
    </div>
  );
}
