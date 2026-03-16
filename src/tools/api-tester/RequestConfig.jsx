import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, Lock, Key, User, FlaskConical } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import ResponseTests from './ResponseTests';

const TABS = [
  { key: 'headers', label: 'Headers' },
  { key: 'params', label: 'Params' },
  { key: 'body', label: 'Body' },
  { key: 'auth', label: 'Auth' },
  { key: 'tests', label: 'Tests' },
];

const COMMON_HEADERS = [
  'Content-Type', 'Accept', 'Authorization', 'Cache-Control',
  'User-Agent', 'X-API-Key', 'X-Request-ID', 'Origin',
];

const BODY_TYPES = [
  { key: 'json', label: 'JSON' },
  { key: 'text', label: 'Text' },
  { key: 'xml', label: 'XML' },
  { key: 'form', label: 'Form URL Encoded' },
];

export default function RequestConfig({ request, onUpdate, tests = [], onSetTests, response }) {
  const [activeTab, setActiveTab] = useState('headers');
  const [showPassword, setShowPassword] = useState(false);

  const handleAddRow = (field) => {
    onUpdate(field, [...request[field], { key: '', value: '', enabled: true, id: generateId() }]);
  };

  const handleRemoveRow = (field, id) => {
    const updated = request[field].filter((row) => row.id !== id);
    if (updated.length === 0) {
      updated.push({ key: '', value: '', enabled: true, id: generateId() });
    }
    onUpdate(field, updated);
  };

  const handleRowChange = (field, id, prop, value) => {
    onUpdate(
      field,
      request[field].map((row) =>
        row.id === id ? { ...row, [prop]: value } : row
      )
    );
  };

  const handleToggleRow = (field, id) => {
    onUpdate(
      field,
      request[field].map((row) =>
        row.id === id ? { ...row, enabled: !row.enabled } : row
      )
    );
  };

  const renderKeyValueEditor = (field) => (
    <div className="space-y-3">
      {/* Column Headers */}
      <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-1 opacity-35">
        <span className="w-5" />
        <span className="flex-1">Key</span>
        <span className="flex-1">Value</span>
        <span className="w-8" />
      </div>

      {/* Rows */}
      {request[field].map((row, idx) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="flex items-center gap-3 group"
        >
          <input
            type="checkbox"
            checked={row.enabled !== false}
            onChange={() => handleToggleRow(field, row.id)}
            className="checkbox checkbox-primary checkbox-xs shrink-0"
          />
          <input
            type="text"
            value={row.key}
            onChange={(e) => handleRowChange(field, row.id, 'key', e.target.value)}
            placeholder="Key"
            className={`input input-sm font-mono text-xs flex-1 rounded-xl bg-base-100/80 backdrop-blur-sm transition-all duration-200 focus:ring-1 focus:ring-primary/10 ${!row.enabled ? 'opacity-40' : ''}`}
            list={field === 'headers' ? 'common-headers' : undefined}
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => handleRowChange(field, row.id, 'value', e.target.value)}
            placeholder="Value"
            className={`input input-sm font-mono text-xs flex-1 rounded-xl bg-base-100/80 backdrop-blur-sm transition-all duration-200 focus:ring-1 focus:ring-primary/10 ${!row.enabled ? 'opacity-40' : ''}`}
          />
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleRemoveRow(field, row.id)}
            className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-error shrink-0 rounded-lg hover:bg-error/10"
            title="Remove"
          >
            <Trash2 size={13} />
          </motion.button>
        </motion.div>
      ))}

      {field === 'headers' && (
        <datalist id="common-headers">
          {COMMON_HEADERS.map((h) => <option key={h} value={h} />)}
        </datalist>
      )}

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleAddRow(field)}
        className="btn btn-ghost btn-xs gap-1.5 text-primary mt-2 rounded-xl hover:bg-primary/10 border border-dashed border-primary/20 hover:border-primary/40 transition-all"
      >
        <Plus size={12} />
        Add Row
      </motion.button>
    </div>
  );

  const renderAuth = () => (
    <div className="space-y-5">
      {/* Auth Type Selector — Enhanced */}
      <div className="space-y-3">
        <label className="field-label">Auth Type</label>
        <div className="flex gap-2 flex-wrap bg-base-200/40 p-1.5 rounded-xl border border-base-200/60">
          {[
            { key: 'none', label: 'None', icon: null },
            { key: 'bearer', label: 'Bearer Token', icon: Key },
            { key: 'basic', label: 'Basic Auth', icon: User },
            { key: 'apikey', label: 'API Key', icon: Lock },
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdate('auth', { ...request.auth, type: key })}
              className={`btn btn-sm gap-1.5 rounded-xl transition-all duration-200 ${
                request.auth.type === key
                  ? 'btn-primary shadow-md shadow-primary/25'
                  : 'btn-ghost hover:bg-base-100/80'
              }`}
            >
              {Icon && <Icon size={13} />}
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bearer Token */}
      {request.auth.type === 'bearer' && (
        <div className="space-y-2">
          <label className="field-label">Token</label>
          <div className="join w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              value={request.auth.token}
              onChange={(e) => onUpdate('auth', { ...request.auth, token: e.target.value })}
              placeholder="Enter bearer token..."
              className="input input-sm font-mono text-xs flex-1 join-item"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-ghost btn-sm join-item border border-base-300"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Basic Auth */}
      {request.auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="field-label">Username</label>
            <input
              type="text"
              value={request.auth.username}
              onChange={(e) => onUpdate('auth', { ...request.auth, username: e.target.value })}
              placeholder="Username"
              className="input input-sm text-sm w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="field-label">Password</label>
            <div className="join w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={request.auth.password}
                onChange={(e) => onUpdate('auth', { ...request.auth, password: e.target.value })}
                placeholder="Password"
                className="input input-sm text-sm flex-1 join-item"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-ghost btn-sm join-item border border-base-300"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key */}
      {request.auth.type === 'apikey' && (
        <div className="space-y-2">
          <label className="field-label">API Key</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={request.auth.token}
            onChange={(e) => onUpdate('auth', { ...request.auth, token: e.target.value })}
            placeholder="Enter API key..."
            className="input input-sm font-mono text-xs w-full"
          />
        </div>
      )}

      {request.auth.type === 'none' && (
        <div className="rounded-lg bg-base-200/60 border border-base-300 p-4 text-center">
          <p className="text-sm opacity-50">No authentication configured for this request.</p>
        </div>
      )}
    </div>
  );

  const showBody = ['POST', 'PUT', 'PATCH'].includes(request.method);
  const activeCount = (field) => request[field]?.filter((r) => r.key?.trim() && r.enabled !== false).length || 0;

  return (
    <div className="section-card">
      <div className="p-5">
        {/* Tabs */}
        <div className="tabs tabs-border mb-5 border-b border-base-200 -mx-5 px-5">
          {TABS.map((tab) => {
            if (tab.key === 'body' && !showBody) return null;
            const count = tab.key === 'body'
              ? (request.body.trim() ? 1 : 0)
              : tab.key === 'auth'
                ? (request.auth.type !== 'none' ? 1 : 0)
                : tab.key === 'tests'
                  ? tests.length
                  : activeCount(tab.key);

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab gap-2 ${activeTab === tab.key ? 'tab-active font-semibold' : ''}`}
              >
                {tab.key === 'tests' && <FlaskConical size={13} />}
                {tab.label}
                {count > 0 && (
                  <span className={`badge badge-xs ${tab.key === 'tests' ? 'badge-secondary' : 'badge-primary'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'headers' && renderKeyValueEditor('headers')}
          {activeTab === 'params' && renderKeyValueEditor('params')}
          {activeTab === 'auth' && renderAuth()}
          {activeTab === 'tests' && (
            <ResponseTests tests={tests} onSetTests={onSetTests} response={response} />
          )}
          {activeTab === 'body' && showBody && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <label className="field-label mb-0">Format:</label>
                <div className="flex items-center gap-1.5 bg-base-200/40 p-1 rounded-xl border border-base-200/60 flex-wrap">
                  {BODY_TYPES.map(({ key, label }) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onUpdate('bodyType', key)}
                      className={`btn btn-xs rounded-lg transition-all duration-200 ${
                        request.bodyType === key ? 'btn-primary shadow-sm shadow-primary/20' : 'btn-ghost'
                      }`}
                    >
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>
              <textarea
                value={request.body}
                onChange={(e) => onUpdate('body', e.target.value)}
                placeholder={
                  request.bodyType === 'json' ? '{\n  "key": "value"\n}' :
                  request.bodyType === 'xml' ? '<root>\n  <item>value</item>\n</root>' :
                  request.bodyType === 'form' ? 'key1=value1&key2=value2' :
                  'Enter request body...'
                }
                rows={10}
                className="textarea font-mono text-xs leading-relaxed w-full rounded-xl bg-base-100/80 backdrop-blur-sm"
                spellCheck={false}
              />
            </div>
          )}
          {activeTab === 'body' && !showBody && (
            <div className="rounded-lg bg-base-200/60 border border-base-300 p-6 text-center">
              <p className="text-sm opacity-50">Body is only available for POST, PUT, and PATCH methods.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
