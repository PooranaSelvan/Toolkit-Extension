import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, X, FileJson, AlertCircle, CheckCircle2, FileText, Clipboard } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

export default function ImportExport({ collections, onSetCollections, history, environments, onClose }) {
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [activeTab, setActiveTab] = useState('export');
  const { copied, copyToClipboard } = useCopyToClipboard();

  // Export as JSON (our native format)
  const handleExportNative = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      source: 'DevToolbox API Tester',
      collections,
      environments,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-tester-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export as cURL collection
  const handleExportCurl = () => {
    let curl = `# API Tester - cURL Export\n# Generated: ${new Date().toISOString()}\n\n`;
    collections.forEach((item, idx) => {
      const headers = {};
      (item.headers || []).forEach(({ key, value, enabled }) => {
        if (key?.trim() && enabled !== false) headers[key.trim()] = value;
      });

      curl += `# ${idx + 1}. ${item.name}\n`;
      curl += `curl -X ${item.method} '${item.url}'`;
      Object.entries(headers).forEach(([k, v]) => { curl += ` \\\n  -H '${k}: ${v}'`; });
      if (['POST', 'PUT', 'PATCH'].includes(item.method) && item.body?.trim()) {
        curl += ` \\\n  -d '${item.body.trim()}'`;
      }
      curl += '\n\n';
    });

    const blob = new Blob([curl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-tester-curl-${Date.now()}.sh`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export history
  const handleExportHistory = () => {
    const data = { version: '1.0', exportedAt: new Date().toISOString(), history };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-tester-history-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.har';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        processImport(ev.target.result);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportFromText = () => {
    if (!importText.trim()) return;
    processImport(importText);
  };

  const processImport = (text) => {
    try {
      const data = JSON.parse(text);
      let imported = 0;

      // Native format
      if (data.source === 'DevToolbox API Tester' && Array.isArray(data.collections)) {
        const newItems = data.collections.map((c) => ({ ...c, id: generateId(), savedAt: new Date().toISOString() }));
        onSetCollections((prev) => [...prev, ...newItems]);
        imported = newItems.length;
      }
      // Postman Collection v2.1
      else if (data.info && data.item && Array.isArray(data.item)) {
        const newItems = parsePostmanCollection(data.item);
        onSetCollections((prev) => [...prev, ...newItems]);
        imported = newItems.length;
      }
      // HAR format
      else if (data.log && Array.isArray(data.log.entries)) {
        const newItems = parseHarEntries(data.log.entries);
        onSetCollections((prev) => [...prev, ...newItems]);
        imported = newItems.length;
      }
      // Plain array of requests
      else if (Array.isArray(data)) {
        const newItems = data.filter((d) => d.url && d.method).map((d) => ({
          ...d,
          id: generateId(),
          name: d.name || `${d.method} ${d.url}`,
          savedAt: new Date().toISOString(),
        }));
        onSetCollections((prev) => [...prev, ...newItems]);
        imported = newItems.length;
      }

      if (imported > 0) {
        setImportResult({ success: true, msg: `Successfully imported ${imported} request${imported > 1 ? 's' : ''}!` });
      } else {
        setImportResult({ success: false, msg: 'No valid requests found in the file. Supports: DevToolbox JSON, Postman Collection v2.1, HAR, or a plain array of requests.' });
      }
    } catch (err) {
      setImportResult({ success: false, msg: `Parse error: ${err.message}` });
    }

    setTimeout(() => setImportResult(null), 5000);
  };

  const parsePostmanCollection = (items, prefix = '') => {
    const result = [];
    for (const item of items) {
      // Nested folders
      if (item.item && Array.isArray(item.item)) {
        result.push(...parsePostmanCollection(item.item, prefix + (item.name ? item.name + '/' : '')));
        continue;
      }
      if (!item.request) continue;
      const req = item.request;
      const method = typeof req.method === 'string' ? req.method.toUpperCase() : 'GET';
      let url = '';
      if (typeof req.url === 'string') url = req.url;
      else if (req.url?.raw) url = req.url.raw;

      const headers = [];
      if (Array.isArray(req.header)) {
        req.header.forEach((h) => {
          headers.push({ id: generateId(), key: h.key, value: h.value, enabled: !h.disabled });
        });
      }

      let body = '';
      let bodyType = 'json';
      if (req.body) {
        if (req.body.mode === 'raw') {
          body = req.body.raw || '';
          if (req.body.options?.raw?.language === 'xml') bodyType = 'xml';
          else if (req.body.options?.raw?.language === 'text') bodyType = 'text';
        } else if (req.body.mode === 'urlencoded') {
          body = (req.body.urlencoded || []).map((p) => `${p.key}=${p.value}`).join('&');
          bodyType = 'form';
        }
      }

      let auth = { type: 'none', token: '', username: '', password: '' };
      if (req.auth) {
        if (req.auth.type === 'bearer') {
          const token = req.auth.bearer?.find((b) => b.key === 'token')?.value || '';
          auth = { type: 'bearer', token, username: '', password: '' };
        } else if (req.auth.type === 'basic') {
          const user = req.auth.basic?.find((b) => b.key === 'username')?.value || '';
          const pass = req.auth.basic?.find((b) => b.key === 'password')?.value || '';
          auth = { type: 'basic', token: '', username: user, password: pass };
        }
      }

      result.push({
        id: generateId(),
        name: prefix + (item.name || `${method} ${url}`),
        method,
        url,
        headers,
        params: [],
        body,
        bodyType,
        auth,
        savedAt: new Date().toISOString(),
      });
    }
    return result;
  };

  const parseHarEntries = (entries) => {
    return entries.map((entry) => {
      const req = entry.request;
      const method = req.method?.toUpperCase() || 'GET';
      const url = req.url || '';
      const headers = (req.headers || []).map((h) => ({
        id: generateId(), key: h.name, value: h.value, enabled: true,
      }));
      const body = req.postData?.text || '';
      return {
        id: generateId(),
        name: `${method} ${new URL(url).pathname}`,
        method, url, headers, params: [], body, bodyType: 'json',
        auth: { type: 'none', token: '', username: '', password: '' },
        savedAt: new Date().toISOString(),
      };
    });
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
            <FileJson size={16} className="text-primary" />
            Import / Export
          </h3>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="btn btn-ghost btn-xs rounded-lg">
            <X size={14} />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-border mb-5 -mx-5 px-5 border-b border-base-200">
          <button onClick={() => setActiveTab('export')} className={`tab gap-1.5 ${activeTab === 'export' ? 'tab-active font-semibold' : ''}`}>
            <Download size={13} /> Export
          </button>
          <button onClick={() => setActiveTab('import')} className={`tab gap-1.5 ${activeTab === 'import' ? 'tab-active font-semibold' : ''}`}>
            <Upload size={13} /> Import
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportNative}
                disabled={collections.length === 0}
                className="p-4 rounded-xl bg-base-200/60 border border-base-300/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <FileJson size={20} className="text-primary mb-2" />
                <div className="text-sm font-semibold">Collections (JSON)</div>
                <div className="text-[10px] opacity-50 mt-1">{collections.length} saved requests + environments</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportCurl}
                disabled={collections.length === 0}
                className="p-4 rounded-xl bg-base-200/60 border border-base-300/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <FileText size={20} className="text-secondary mb-2" />
                <div className="text-sm font-semibold">cURL Commands</div>
                <div className="text-[10px] opacity-50 mt-1">Shell script with all requests</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportHistory}
                disabled={history.length === 0}
                className="p-4 rounded-xl bg-base-200/60 border border-base-300/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <FileJson size={20} className="text-warning mb-2" />
                <div className="text-sm font-semibold">History (JSON)</div>
                <div className="text-[10px] opacity-50 mt-1">{history.length} recent requests</div>
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const data = JSON.stringify({ collections, environments }, null, 2);
                copyToClipboard(data);
              }}
              disabled={collections.length === 0}
              className={`btn btn-sm w-full gap-1.5 rounded-xl ${copied ? 'btn-success' : 'btn-ghost border border-base-300'}`}
            >
              <Clipboard size={13} />
              {copied ? 'Copied to Clipboard!' : 'Copy Collections as JSON'}
            </motion.button>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-info/10 border border-info/20">
              <p className="text-[11px] opacity-70 leading-relaxed">
                <strong>Supported formats:</strong> DevToolbox JSON, Postman Collection v2.1, HAR files, or a plain JSON array of requests.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImportFile}
              className="btn btn-primary btn-sm w-full gap-1.5 rounded-xl"
            >
              <Upload size={14} />
              Import from File (.json, .har)
            </motion.button>

            <div className="divider text-xs opacity-30">or paste JSON below</div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste Postman collection, HAR, or JSON array here...'
              className="textarea font-mono text-xs w-full rounded-xl min-h-[120px]"
              spellCheck={false}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImportFromText}
              disabled={!importText.trim()}
              className="btn btn-secondary btn-sm w-full gap-1.5 rounded-xl"
            >
              <Upload size={14} />
              Import from Text
            </motion.button>

            {importResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                  importResult.success ? 'bg-success/10 border border-success/30 text-success' : 'bg-error/10 border border-error/30 text-error'
                }`}
              >
                {importResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {importResult.msg}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
