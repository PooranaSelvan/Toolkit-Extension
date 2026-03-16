import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, FolderOpen, Code, Zap, Globe, Radio, PlayCircle, GitCompareArrows, FileJson, ChevronDown } from 'lucide-react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { executeRequest } from '../../services/apiService';
import { generateId } from '../../utils/helpers';
import RequestConfig from './RequestConfig';
import ResponsePanel from './ResponsePanel';
import RequestHistory from './RequestHistory';
import CodeGenerator from './CodeGenerator';
import SavedCollections from './SavedCollections';
import EnvironmentManager from './EnvironmentManager';
import WebSocketTester from './WebSocketTester';
import BulkRunner from './BulkRunner';
import ResponseDiff from './ResponseDiff';
import ImportExport from './ImportExport';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const INITIAL_REQUEST = {
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '', enabled: true, id: generateId() }],
  params: [{ key: '', value: '', enabled: true, id: generateId() }],
  body: '',
  bodyType: 'json',
  auth: { type: 'none', token: '', username: '', password: '' },
};

export default function ApiTester() {
  const [request, setRequest] = useState(INITIAL_REQUEST);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useLocalStorage('api-tester-history', []);
  const [collections, setCollections] = useLocalStorage('api-tester-collections', []);
  const [showCodeGen, setShowCodeGen] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // New feature states
  const [environments, setEnvironments] = useLocalStorage('api-tester-environments', []);
  const [activeEnvId, setActiveEnvId] = useLocalStorage('api-tester-active-env', null);
  const [showEnvManager, setShowEnvManager] = useState(false);
  const [showWebSocket, setShowWebSocket] = useState(false);
  const [tests, setTests] = useLocalStorage('api-tester-tests', []);
  const [showBulkRunner, setShowBulkRunner] = useState(false);
  const [showResponseDiff, setShowResponseDiff] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Active environment
  const activeEnv = useMemo(() => {
    if (!activeEnvId) return null;
    return environments.find((e) => e.id === activeEnvId) || null;
  }, [environments, activeEnvId]);

  // Resolve {{varName}} → value
  const resolveEnvVars = useCallback((text) => {
    if (!text || typeof text !== 'string' || !activeEnv) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const variable = activeEnv.variables.find((v) => v.key === varName && v.enabled);
      return variable ? variable.value : match;
    });
  }, [activeEnv]);

  const updateRequest = useCallback((field, value) => {
    setRequest((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSend = async () => {
    if (!request.url.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const headers = {};
      (request.headers || []).forEach(({ key, value, enabled }) => {
        try {
          if (key && key.trim() && enabled !== false) headers[key.trim()] = resolveEnvVars(value);
        } catch { /* skip invalid header */ }
      });

      if (request.auth?.type === 'bearer' && request.auth.token) {
        headers['Authorization'] = `Bearer ${resolveEnvVars(request.auth.token)}`;
      } else if (request.auth?.type === 'basic' && request.auth.username) {
        try {
          headers['Authorization'] = `Basic ${btoa(`${resolveEnvVars(request.auth.username)}:${resolveEnvVars(request.auth.password || '')}`)}`;
        } catch (e) {
          console.warn('[ApiTester] Failed to encode Basic auth credentials:', e);
        }
      } else if (request.auth?.type === 'apikey' && request.auth.token) {
        headers['X-API-Key'] = resolveEnvVars(request.auth.token);
      }

      const params = {};
      (request.params || []).forEach(({ key, value, enabled }) => {
        try {
          if (key && key.trim() && enabled !== false) params[key.trim()] = resolveEnvVars(value);
        } catch { /* skip invalid param */ }
      });

      const resolvedUrl = resolveEnvVars(request.url);
      const resolvedBody = request.body ? resolveEnvVars(request.body) : request.body;

      const result = await executeRequest({
        method: request.method,
        url: resolvedUrl,
        headers,
        params,
        body: resolvedBody,
      });

      setResponse(result);

      try {
        const historyEntry = {
          id: generateId(),
          method: request.method,
          url: request.url,
          resolvedUrl,
          headers,
          params,
          body: request.body,
          bodyType: request.bodyType,
          auth: request.auth,
          status: result.status,
          statusText: result.statusText,
          duration: result.duration,
          size: result.size,
          responseData: result.data,
          timestamp: new Date().toISOString(),
        };

        setHistory((prev) => [historyEntry, ...prev].slice(0, 100));
      } catch (historyErr) {
        console.warn('[ApiTester] Failed to save to history:', historyErr);
      }
    } catch (error) {
      console.error('[ApiTester] Request execution failed:', error);
      setResponse({
        success: false,
        status: 0,
        statusText: 'Client Error',
        headers: {},
        data: error?.message || 'An unexpected error occurred while sending the request.',
        duration: 0,
        size: 0,
        error: error?.message || 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = (entry) => {
    setRequest({
      method: entry.method,
      url: entry.url,
      headers: Object.entries(entry.headers || {}).map(([key, value]) => ({
        key, value, enabled: true, id: generateId(),
      })).concat([{ key: '', value: '', enabled: true, id: generateId() }]),
      params: Object.entries(entry.params || {}).map(([key, value]) => ({
        key, value, enabled: true, id: generateId(),
      })).concat([{ key: '', value: '', enabled: true, id: generateId() }]),
      body: entry.body || '',
      bodyType: entry.bodyType || 'json',
      auth: entry.auth || { type: 'none', token: '', username: '', password: '' },
    });
    setResponse(null);
  };

  const handleClearHistory = () => setHistory([]);

  const handleSaveToCollection = () => {
    if (!saveName.trim() || !request.url.trim()) return;
    const item = {
      id: generateId(),
      name: saveName.trim(),
      method: request.method,
      url: request.url,
      headers: request.headers.filter(h => h.key.trim()),
      params: request.params.filter(p => p.key.trim()),
      body: request.body,
      bodyType: request.bodyType,
      auth: request.auth,
      savedAt: new Date().toISOString(),
    };
    setCollections((prev) => [item, ...prev]);
    setSaveName('');
    setShowSaveInput(false);
  };

  const handleLoadCollection = (item) => {
    setRequest({
      method: item.method,
      url: item.url,
      headers: [...(item.headers || []).map(h => ({ ...h, id: generateId(), enabled: true })),
        { key: '', value: '', enabled: true, id: generateId() }],
      params: [...(item.params || []).map(p => ({ ...p, id: generateId(), enabled: true })),
        { key: '', value: '', enabled: true, id: generateId() }],
      body: item.body || '',
      bodyType: item.bodyType || 'json',
      auth: item.auth || { type: 'none', token: '', username: '', password: '' },
    });
    setShowCollections(false);
    setResponse(null);
  };

  const handleDeleteCollection = (id) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLoadBulkResult = (resultItem) => {
    handleLoadCollection(resultItem);
    setResponse(resultItem.result);
    setShowBulkRunner(false);
  };

  const closeAllPanels = () => {
    setShowEnvManager(false);
    setShowWebSocket(false);
    setShowBulkRunner(false);
    setShowResponseDiff(false);
    setShowImportExport(false);
  };

  const renderUrlWithEnvVars = () => {
    if (!activeEnv || !request.url.includes('{{')) return null;
    const resolved = resolveEnvVars(request.url);
    if (resolved === request.url) return null;
    return (
      <div className="text-[10px] font-mono opacity-40 mt-1.5 truncate px-1">
        → {resolved}
      </div>
    );
  };

  const activeEnvVarCount = activeEnv ? activeEnv.variables.filter((v) => v.key && v.enabled).length : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* URL Bar */}
      <div className="rounded-xl border border-base-300 bg-base-100">
        <div className="p-4 sm:p-5">
          {/* Active Environment Indicator */}
          {activeEnv && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-base-200/50">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: activeEnv.color }} />
              <span className="text-[11px] font-semibold opacity-60">{activeEnv.name}</span>
              <span className="text-[10px] opacity-30">{activeEnvVarCount} variables</span>
              <div className="flex-1" />
              <div className="flex gap-1 flex-wrap">
                {activeEnv.variables.filter((v) => v.key && v.enabled).slice(0, 4).map((v) => (
                  <span key={v.id} className="badge badge-ghost text-[9px] font-mono py-0">{`{{${v.key}}}`}</span>
                ))}
                {activeEnvVarCount > 4 && <span className="text-[10px] opacity-30">+{activeEnvVarCount - 4} more</span>}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Method selector */}
            <select
              value={request.method}
              onChange={(e) => updateRequest('method', e.target.value)}
              className="select select-sm w-full sm:w-[120px] font-bold text-sm shrink-0 rounded-xl"
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* URL input */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={request.url}
                onChange={(e) => updateRequest('url', e.target.value)}
                placeholder="https://api.example.com/endpoint  or  {{baseUrl}}/users"
                className="input input-sm font-mono text-sm w-full rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) handleSend();
                }}
              />
              {renderUrlWithEnvVars()}
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={loading || !request.url.trim()}
              className="btn btn-primary btn-sm gap-1.5 rounded-xl shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Send
                </>
              )}
            </button>
          </div>

          {/* Actions bar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-200 flex-wrap">
            <AnimatePresence mode="wait">
              {showSaveInput ? (
                <motion.div
                  key="save-input"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 bg-base-200/50 rounded-xl px-2 py-1 backdrop-blur-sm border border-base-300/40"
                >
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Request name..."
                    className="input input-xs w-52 rounded-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveToCollection()}
                    autoFocus
                  />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleSaveToCollection} className="btn btn-primary btn-xs rounded-lg shadow-sm shadow-primary/20">Save</motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSaveInput(false)} className="btn btn-ghost btn-xs rounded-lg">Cancel</motion.button>
                </motion.div>
              ) : (
                <motion.button
                  key="save-btn"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowSaveInput(true)}
                  className="btn btn-ghost btn-xs gap-1.5 rounded-xl hover:bg-base-200/80"
                  disabled={!request.url.trim()}
                >
                  <Save size={13} />
                  Save
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCollections(!showCollections)}
              className={`btn btn-xs gap-1.5 rounded-xl transition-all duration-200 ${showCollections ? 'btn-secondary shadow-md shadow-secondary/20' : 'btn-ghost hover:bg-base-200/80'}`}
            >
              <FolderOpen size={13} />
              Collections ({collections.length})
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCodeGen(!showCodeGen)}
              className={`btn btn-xs gap-1.5 rounded-xl transition-all duration-200 ${showCodeGen ? 'btn-secondary shadow-md shadow-secondary/20' : 'btn-ghost hover:bg-base-200/80'}`}
              disabled={!request.url.trim()}
            >
              <Code size={13} />
              Code
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { closeAllPanels(); setShowEnvManager(!showEnvManager); }}
              className={`btn btn-xs gap-1.5 rounded-xl transition-all duration-200 ${showEnvManager ? 'btn-secondary shadow-md shadow-secondary/20' : 'btn-ghost hover:bg-base-200/80'}`}
            >
              <Globe size={13} />
              Env
              {activeEnv && <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeEnv.color }} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { closeAllPanels(); setShowWebSocket(!showWebSocket); }}
              className={`btn btn-xs gap-1.5 rounded-xl transition-all duration-200 ${showWebSocket ? 'btn-secondary shadow-md shadow-secondary/20' : 'btn-ghost hover:bg-base-200/80'}`}
            >
              <Radio size={13} />
              WebSocket
            </motion.button>

            {/* More actions dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowMoreActions(!showMoreActions)}
                className={`btn btn-xs gap-1 rounded-xl transition-all duration-200 ${showMoreActions ? 'btn-secondary' : 'btn-ghost hover:bg-base-200/80'}`}
              >
                More <ChevronDown size={11} />
              </motion.button>
              <AnimatePresence>
                {showMoreActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute left-0 top-full mt-1.5 z-50 w-52 rounded-xl bg-base-100 border border-base-300 shadow-2xl p-1.5"
                  >
                    <button
                      onClick={() => { closeAllPanels(); setShowBulkRunner(!showBulkRunner); setShowMoreActions(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-xs transition-colors text-left"
                    >
                      <PlayCircle size={13} className="text-primary" />
                      Bulk Runner
                      <span className="badge badge-ghost badge-xs ml-auto">{collections.length}</span>
                    </button>
                    <button
                      onClick={() => { closeAllPanels(); setShowResponseDiff(!showResponseDiff); setShowMoreActions(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-xs transition-colors text-left"
                    >
                      <GitCompareArrows size={13} className="text-secondary" />
                      Response Diff
                      <span className="badge badge-ghost badge-xs ml-auto">{history.length}</span>
                    </button>
                    <button
                      onClick={() => { closeAllPanels(); setShowImportExport(!showImportExport); setShowMoreActions(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-xs transition-colors text-left"
                    >
                      <FileJson size={13} className="text-warning" />
                      Import / Export
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Panels */}
      <AnimatePresence>
        {showCollections && (
          <SavedCollections
            collections={collections}
            onLoad={handleLoadCollection}
            onDelete={handleDeleteCollection}
            onClose={() => setShowCollections(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCodeGen && request.url.trim() && (
          <CodeGenerator request={request} resolveEnvVars={resolveEnvVars} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEnvManager && (
          <EnvironmentManager
            environments={environments}
            activeEnvId={activeEnvId}
            onSetEnvironments={setEnvironments}
            onSetActiveEnv={setActiveEnvId}
            onClose={() => setShowEnvManager(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWebSocket && (
          <WebSocketTester onClose={() => setShowWebSocket(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkRunner && (
          <BulkRunner
            collections={collections}
            resolveEnvVars={resolveEnvVars}
            onClose={() => setShowBulkRunner(false)}
            onLoadResult={handleLoadBulkResult}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResponseDiff && (
          <ResponseDiff
            history={history}
            onClose={() => setShowResponseDiff(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImportExport && (
          <ImportExport
            collections={collections}
            onSetCollections={setCollections}
            history={history}
            environments={environments}
            onClose={() => setShowImportExport(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <RequestConfig
            request={request}
            onUpdate={updateRequest}
            tests={tests}
            onSetTests={setTests}
            response={response}
          />
          <ResponsePanel response={response} loading={loading} tests={tests} />
        </div>
        <div className="xl:col-span-1">
          <RequestHistory
            history={history}
            onLoad={handleLoadHistory}
            onClear={handleClearHistory}
          />
        </div>
      </div>
    </div>
  );
}
