import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Hash, AlertCircle, Copy, Check, Download, Search, Zap, CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import { formatDuration, formatBytes, getStatusBadge, prettyJSON } from '../../utils/helpers';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useDownloadFile from '../../hooks/useDownloadFile';


export default function ResponsePanel({ response, loading, tests = [] }) {
  const [activeTab, setActiveTab] = useState('body');
  const [searchQuery, setSearchQuery] = useState('');
  const [wrapLines, setWrapLines] = useState(true);
  const { copied, copyToClipboard } = useCopyToClipboard();
  const { downloadFile } = useDownloadFile();

  if (loading) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100">
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-5">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm font-medium opacity-50 mt-4">Sending request...</p>
          <p className="text-xs opacity-30 mt-1">Waiting for response...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100">
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-5">
          <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="opacity-30" />
          </div>
          <p className="text-sm font-medium opacity-50">Send a request to see the response here</p>
          <p className="text-xs opacity-30 mt-1">Hit the Send button or press Enter</p>
        </div>
      </div>
    );
  }

  const formattedBody = typeof response.data === 'object'
    ? prettyJSON(response.data)
    : String(response.data);

  const isJSON = typeof response.data === 'object';

  const highlightJSON = (text) => {
    if (!isJSON) return text;
    return text
      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="text-primary font-semibold">$1</span>$2')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="text-success">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-info">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-secondary">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="opacity-40">$1</span>');
  };

  const filteredBody = searchQuery
    ? formattedBody.split('\n').filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).join('\n')
    : formattedBody;

  const headerCount = Object.keys(response.headers || {}).length;

// Test results
  const testResults = useMemo(() => {
    if (!response || tests.length === 0) return null;
    // Simple inline test runner (mirrors ResponseTests logic)
    const resolveJsonPath = (obj, path) => {
      try {
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let current = obj;
        for (const part of parts) {
          if (current == null) return undefined;
          current = current[part];
        }
        return current;
      } catch { return undefined; }
    };

    const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const jsonData = typeof response.data === 'object' ? response.data : (() => { try { return JSON.parse(response.data); } catch { return null; } })();

    let passed = 0;
    let failed = 0;

    tests.forEach(({ type, value }) => {
      try {
        let pass = false;
        switch (type) {
          case 'status_equals': pass = response.status === Number(value); break;
          case 'status_range': { const [min, max] = value.split('-').map(Number); pass = response.status >= min && response.status <= max; break; }
          case 'body_contains': pass = body.includes(value); break;
          case 'body_not_contains': pass = !body.includes(value); break;
          case 'json_path_exists': pass = jsonData && resolveJsonPath(jsonData, value) !== undefined; break;
          case 'response_time': pass = response.duration < Number(value); break;
          case 'body_is_json': pass = typeof response.data === 'object' || (() => { try { JSON.parse(response.data); return true; } catch { return false; } })(); break;
          case 'header_exists': pass = Object.keys(response.headers || {}).some((k) => k.toLowerCase() === value.toLowerCase()); break;
          default: break;
        }
        if (pass) passed++; else failed++;
      } catch { failed++; }
    });

    return { passed, failed, total: tests.length };
  }, [response, tests]);

  const isSuccess = response.status >= 200 && response.status < 300;

  return (
    <div className={`rounded-xl border bg-base-100 ${isSuccess ? 'border-success/20' : 'border-base-300'}`}>
      <div className="p-4 sm:p-5">
        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5 pb-4 border-b border-base-200/50">
          <span className={`badge ${getStatusBadge(response.status)} gap-1`}>
            {response.status} {response.statusText}
          </span>

          <div className="flex items-center gap-1.5 text-sm opacity-50">
            <Clock size={14} />
            <span className="font-mono text-xs font-medium">{formatDuration(response.duration)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm opacity-50">
            <Hash size={14} />
            <span className="font-mono text-xs font-medium">{formatBytes(response.size)}</span>
          </div>

          {!response.success && (
            <div className="flex items-center gap-1.5 text-sm text-error">
              <AlertCircle size={14} />
              <span className="font-medium">Error</span>
            </div>
          )}

          {testResults && (
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${testResults.failed === 0 ? 'text-success' : 'text-error'}`}>
              <FlaskConical size={13} />
              {testResults.failed === 0 ? (
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {testResults.passed}/{testResults.total} passed</span>
              ) : (
                <span className="flex items-center gap-1"><XCircle size={12} /> {testResults.failed} failed</span>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(formattedBody)}
              className={`btn btn-xs gap-1 rounded-xl transition-all duration-300 ${
                copied ? 'btn-success shadow-sm shadow-success/20' : 'btn-ghost hover:bg-base-200/80'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => downloadFile(formattedBody, `response-${Date.now()}.${isJSON ? 'json' : 'txt'}`, isJSON ? 'application/json' : 'text/plain')}
              className="btn btn-ghost btn-xs gap-1 rounded-xl hover:bg-base-200/80"
            >
              <Download size={12} />
              Download
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 tabs tabs-border -mx-5 px-5 mb-5">
          <button
            onClick={() => setActiveTab('body')}
            className={`tab ${activeTab === 'body' ? 'tab-active font-semibold' : ''}`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`tab gap-1.5 ${activeTab === 'headers' ? 'tab-active font-semibold' : ''}`}
          >
            Headers
            {headerCount > 0 && (
              <span className="badge badge-ghost badge-xs">{headerCount}</span>
            )}
          </button>

          {activeTab === 'body' && (
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter..."
                  className="input input-xs w-40 rounded-lg bg-base-100/80 backdrop-blur-sm"
                  style={{ paddingLeft: '2rem' }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWrapLines(!wrapLines)}
                className={`btn btn-xs rounded-lg transition-all duration-200 ${wrapLines ? 'btn-secondary shadow-sm shadow-secondary/20' : 'btn-ghost'}`}
              >
                Wrap
              </motion.button>
            </div>
          )}
        </div>

        {/* Body */}
        {activeTab === 'body' && (
          <div className="max-h-[500px] overflow-auto rounded-xl scrollbar-thin">
            {isJSON ? (
              <pre
                className="p-4 text-xs font-mono leading-relaxed rounded-xl bg-base-200 border border-base-300"
                style={{
                  whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
                  wordBreak: wrapLines ? 'break-all' : 'normal',
                }}
                dangerouslySetInnerHTML={{ __html: highlightJSON(filteredBody) }}
              />
            ) : (
              <pre
                className="p-4 text-xs font-mono rounded-xl bg-base-200 border border-base-300"
                style={{
                  whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
                  wordBreak: wrapLines ? 'break-all' : 'normal',
                }}
              >
                {filteredBody}
              </pre>
            )}
          </div>
        )}

        {/* Headers tab */}
        {activeTab === 'headers' && (
          <div className="max-h-[500px] overflow-auto scrollbar-thin rounded-xl border border-base-300">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td className="font-mono font-semibold text-primary">{key}</td>
                    <td className="font-mono break-all opacity-70">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
