import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, Trash2, X, Edit2, Check, Copy, ChevronDown, ChevronUp, Download, Upload } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const DEFAULT_ENVIRONMENTS = [
  {
    id: 'env-dev',
    name: 'Development',
    color: '#22c55e',
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'http://localhost:3000', enabled: true },
      { id: 'v2', key: 'apiKey', value: 'dev-api-key-123', enabled: true },
      { id: 'v3', key: 'token', value: '', enabled: false },
    ],
  },
  {
    id: 'env-staging',
    name: 'Staging',
    color: '#f59e0b',
    variables: [
      { id: 'v4', key: 'baseUrl', value: 'https://staging.api.example.com', enabled: true },
      { id: 'v5', key: 'apiKey', value: 'staging-key-456', enabled: true },
      { id: 'v6', key: 'token', value: '', enabled: false },
    ],
  },
  {
    id: 'env-prod',
    name: 'Production',
    color: '#ef4444',
    variables: [
      { id: 'v7', key: 'baseUrl', value: 'https://api.example.com', enabled: true },
      { id: 'v8', key: 'apiKey', value: '', enabled: true },
      { id: 'v9', key: 'token', value: '', enabled: false },
    ],
  },
];

export default function EnvironmentManager({
  environments,
  activeEnvId,
  onSetEnvironments,
  onSetActiveEnv,
  onClose,
}) {
  const [editingEnv, setEditingEnv] = useState(null);
  const [editName, setEditName] = useState('');
  const [expandedEnv, setExpandedEnv] = useState(activeEnvId || null);
  const { copied, copyToClipboard } = useCopyToClipboard();

  const envs = environments.length > 0 ? environments : DEFAULT_ENVIRONMENTS;

  const handleAddEnvironment = () => {
    const newEnv = {
      id: generateId(),
      name: 'New Environment',
      color: '#6366f1',
      variables: [{ id: generateId(), key: '', value: '', enabled: true }],
    };
    onSetEnvironments([...envs, newEnv]);
    setExpandedEnv(newEnv.id);
    setEditingEnv(newEnv.id);
    setEditName('New Environment');
  };

  const handleDeleteEnvironment = (envId) => {
    onSetEnvironments(envs.filter((e) => e.id !== envId));
    if (activeEnvId === envId) onSetActiveEnv(null);
  };

  const handleRenameEnvironment = (envId) => {
    if (!editName.trim()) return;
    onSetEnvironments(envs.map((e) => (e.id === envId ? { ...e, name: editName.trim() } : e)));
    setEditingEnv(null);
  };

  const handleColorChange = (envId, color) => {
    onSetEnvironments(envs.map((e) => (e.id === envId ? { ...e, color } : e)));
  };

  const handleAddVariable = (envId) => {
    onSetEnvironments(
      envs.map((e) =>
        e.id === envId
          ? { ...e, variables: [...e.variables, { id: generateId(), key: '', value: '', enabled: true }] }
          : e
      )
    );
  };

  const handleRemoveVariable = (envId, varId) => {
    onSetEnvironments(
      envs.map((e) =>
        e.id === envId
          ? { ...e, variables: e.variables.filter((v) => v.id !== varId) }
          : e
      )
    );
  };

  const handleUpdateVariable = (envId, varId, field, val) => {
    onSetEnvironments(
      envs.map((e) =>
        e.id === envId
          ? { ...e, variables: e.variables.map((v) => (v.id === varId ? { ...v, [field]: val } : v)) }
          : e
      )
    );
  };

  const handleToggleVariable = (envId, varId) => {
    onSetEnvironments(
      envs.map((e) =>
        e.id === envId
          ? { ...e, variables: e.variables.map((v) => (v.id === varId ? { ...v, enabled: !v.enabled } : v)) }
          : e
      )
    );
  };

  const handleExportEnvironments = () => {
    const data = JSON.stringify(envs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'api-tester-environments.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportEnvironments = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            const valid = imported.filter((e) => e.name && Array.isArray(e.variables));
            valid.forEach((e) => { if (!e.id) e.id = generateId(); });
            onSetEnvironments([...envs, ...valid]);
          }
        } catch { /* ignore invalid */ }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLoadDefaults = () => {
    onSetEnvironments(DEFAULT_ENVIRONMENTS);
    setExpandedEnv(DEFAULT_ENVIRONMENTS[0].id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="section-card animate-fade-in overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Globe size={16} className="text-primary" />
            Environments
            <span className="badge badge-ghost badge-xs">{envs.length}</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleImportEnvironments} className="btn btn-ghost btn-xs gap-1 rounded-xl" title="Import">
              <Upload size={12} /> Import
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportEnvironments} className="btn btn-ghost btn-xs gap-1 rounded-xl" title="Export">
              <Download size={12} /> Export
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="btn btn-ghost btn-xs rounded-lg">
              <X size={14} />
            </motion.button>
          </div>
        </div>

        {/* Active Environment Selector */}
        <div className="mb-5 p-3 rounded-xl bg-base-200/50 border border-base-300/50">
          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Active Environment</label>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSetActiveEnv(null)}
              className={`btn btn-xs rounded-xl ${!activeEnvId ? 'btn-primary' : 'btn-ghost'}`}
            >
              None
            </motion.button>
            {envs.map((env) => (
              <motion.button
                key={env.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSetActiveEnv(env.id)}
                className={`btn btn-xs rounded-xl gap-1.5 ${activeEnvId === env.id ? 'btn-primary shadow-md' : 'btn-ghost'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: env.color }} />
                {env.name}
                <span className="opacity-40 text-[10px]">({env.variables.filter((v) => v.key && v.enabled).length})</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Environment List */}
        <div className="space-y-3">
          {envs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm opacity-50 mb-3">No environments configured.</p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleLoadDefaults} className="btn btn-primary btn-sm rounded-xl gap-1.5">
                <Plus size={14} /> Load Defaults
              </motion.button>
            </div>
          )}

          {envs.map((env) => (
            <div key={env.id} className={`rounded-xl border transition-all duration-200 ${expandedEnv === env.id ? 'border-primary/30 bg-primary/5' : 'border-base-300/50 bg-base-200/40'}`}>
              {/* Environment Header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer select-none"
                onClick={() => setExpandedEnv(expandedEnv === env.id ? null : env.id)}
              >
                <input
                  type="color"
                  value={env.color}
                  onChange={(e) => handleColorChange(env.id, e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  title="Environment color"
                />

                {editingEnv === env.id ? (
                  <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameEnvironment(env.id)}
                      className="input input-xs flex-1 rounded-lg"
                      autoFocus
                    />
                    <button onClick={() => handleRenameEnvironment(env.id)} className="btn btn-primary btn-xs rounded-lg">
                      <Check size={11} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-semibold flex-1">{env.name}</span>
                )}

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] opacity-40 mr-1">{env.variables.filter((v) => v.key).length} vars</span>
                  {activeEnvId === env.id && <span className="badge badge-success badge-xs">Active</span>}
                  <button
                    onClick={() => { setEditingEnv(env.id); setEditName(env.name); }}
                    className="btn btn-ghost btn-xs rounded-lg opacity-50 hover:opacity-100"
                    title="Rename"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    onClick={() => {
                      const txt = env.variables.filter((v) => v.key && v.enabled).map((v) => `{{${v.key}}} = ${v.value}`).join('\n');
                      copyToClipboard(txt);
                    }}
                    className={`btn btn-ghost btn-xs rounded-lg ${copied ? 'text-success' : 'opacity-50 hover:opacity-100'}`}
                    title="Copy variables"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    onClick={() => handleDeleteEnvironment(env.id)}
                    className="btn btn-ghost btn-xs text-error rounded-lg opacity-50 hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                {expandedEnv === env.id ? <ChevronUp size={14} className="opacity-40" /> : <ChevronDown size={14} className="opacity-40" />}
              </div>

              {/* Variables */}
              <AnimatePresence>
                {expandedEnv === env.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      <div className="hidden sm:grid grid-cols-[24px_1fr_1fr_28px] gap-2 text-[10px] font-bold uppercase tracking-widest opacity-35 px-0.5">
                        <span />
                        <span>Variable Name</span>
                        <span>Value</span>
                        <span />
                      </div>
                      {env.variables.map((v) => (
                        <div key={v.id} className="grid grid-cols-[24px_1fr_1fr_28px] gap-2 items-center group">
                          <input
                            type="checkbox"
                            checked={v.enabled !== false}
                            onChange={() => handleToggleVariable(env.id, v.id)}
                            className="checkbox checkbox-primary checkbox-xs"
                          />
                          <input
                            type="text"
                            value={v.key}
                            onChange={(e) => handleUpdateVariable(env.id, v.id, 'key', e.target.value)}
                            placeholder="variable_name"
                            className={`input input-xs font-mono text-xs rounded-lg ${!v.enabled ? 'opacity-40' : ''}`}
                          />
                          <input
                            type="text"
                            value={v.value}
                            onChange={(e) => handleUpdateVariable(env.id, v.id, 'value', e.target.value)}
                            placeholder="value"
                            className={`input input-xs font-mono text-xs rounded-lg ${!v.enabled ? 'opacity-40' : ''}`}
                          />
                          <button
                            onClick={() => handleRemoveVariable(env.id, v.id)}
                            className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-error rounded-lg"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAddVariable(env.id)}
                        className="btn btn-ghost btn-xs gap-1.5 text-primary rounded-xl hover:bg-primary/10 border border-dashed border-primary/20"
                      >
                        <Plus size={12} /> Add Variable
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Add Environment Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddEnvironment}
          className="btn btn-ghost btn-sm gap-1.5 text-primary rounded-xl hover:bg-primary/10 border border-dashed border-primary/20 w-full mt-4"
        >
          <Plus size={14} /> Add Environment
        </motion.button>

        {/* Usage hint */}
        <div className="mt-4 p-3 rounded-xl bg-info/10 border border-info/20">
          <p className="text-[11px] opacity-70 leading-relaxed">
            <strong>Usage:</strong> Use <code className="bg-base-300/60 px-1 py-0.5 rounded text-[10px] font-mono">{'{{variableName}}'}</code> in URLs, headers, body, or auth fields. Variables from the active environment will be substituted automatically before sending.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
