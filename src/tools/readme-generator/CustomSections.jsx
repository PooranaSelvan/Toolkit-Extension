import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronUp, ChevronDown, LayoutList } from 'lucide-react';


const EMPTY_SECTION = { title: '', content: '' };

export default function CustomSections({ sections = [], onChange }) {
  const addSection = () => {
    onChange([...sections, { ...EMPTY_SECTION }]);
  };

  const updateSection = (index, field, value) => {
    const updated = sections.map((s, i) => i === index ? { ...s, [field]: value } : s);
    onChange(updated);
  };

  const removeSection = (index) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutList size={14} className="text-primary" />
            </div>
            Custom Sections
            {sections.length > 0 && (
              <span className="badge badge-xs badge-primary">{sections.length}</span>
            )}
          </h3>
          <motion.button
            onClick={addSection}
            className="btn btn-xs gap-1.5 rounded-xl border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary transition-all"
          >
            <Plus size={12} />
            Add Section
          </motion.button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-6 text-xs text-base-content/50">
            <LayoutList size={24} className="mx-auto mb-2 text-base-content/30" />
            Add custom sections that appear at the bottom of your README
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-base-200 bg-base-200/30 p-3 space-y-2.5 hover:border-primary/20 transition-colors"
              >
                {/* Header row with controls */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveSection(index, -1)}
                      disabled={index === 0}
                      className="btn btn-ghost btn-xs h-4 w-4 p-0 min-h-0 text-base-content/50 hover:text-base-content disabled:text-base-content/20"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button
                      onClick={() => moveSection(index, 1)}
                      disabled={index === sections.length - 1}
                      className="btn btn-ghost btn-xs h-4 w-4 p-0 min-h-0 text-base-content/50 hover:text-base-content disabled:text-base-content/20"
                    >
                      <ChevronDown size={10} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder="Section Title (e.g., Deployment, Testing)"
                    className="input input-xs flex-1 font-medium"
                  />

                  <button
                    onClick={() => removeSection(index)}
                    className="btn btn-ghost btn-xs text-error/60 hover:text-error"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Content */}
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(index, 'content', e.target.value)}
                  placeholder="Section content (supports Markdown)..."
                  rows={3}
                  className="textarea text-xs w-full"
                />
              </motion.div>
            ))}
          </div>
        )}

        {sections.length > 0 && (
          <p className="text-[11px] text-base-content/60 mt-3">
            {sections.filter((s) => s.title && s.content).length} section{sections.filter((s) => s.title && s.content).length !== 1 ? 's' : ''} will be appended to your README
          </p>
        )}
      </div>
    </div>
  );
}
