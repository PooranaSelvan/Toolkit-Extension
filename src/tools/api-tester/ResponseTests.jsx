import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Plus, Trash2, CheckCircle2, XCircle, Play, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { generateId } from '../../utils/helpers';

const ASSERTION_TYPES = [
  { key: 'status_equals', label: 'Status Code Equals', placeholder: '200', category: 'Status' },
  { key: 'status_range', label: 'Status Code in Range', placeholder: '200-299', category: 'Status' },
  { key: 'body_contains', label: 'Body Contains', placeholder: 'search text', category: 'Body' },
  { key: 'body_not_contains', label: 'Body Not Contains', placeholder: 'error', category: 'Body' },
  { key: 'json_path_equals', label: 'JSON Path Equals', placeholder: 'data.id = 1', category: 'JSON' },
  { key: 'json_path_exists', label: 'JSON Path Exists', placeholder: 'data.items', category: 'JSON' },
  { key: 'json_path_type', label: 'JSON Path Type Is', placeholder: 'data.count = number', category: 'JSON' },
  { key: 'json_array_length', label: 'JSON Array Length', placeholder: 'data.items >= 1', category: 'JSON' },
  { key: 'header_exists', label: 'Header Exists', placeholder: 'content-type', category: 'Headers' },
  { key: 'header_contains', label: 'Header Contains', placeholder: 'content-type: json', category: 'Headers' },
  { key: 'response_time', label: 'Response Time (ms) <', placeholder: '500', category: 'Performance' },
  { key: 'body_is_json', label: 'Body is Valid JSON', placeholder: '', category: 'Body' },
  { key: 'body_matches_regex', label: 'Body Matches Regex', placeholder: '"id":\\s*\\d+', category: 'Body' },
];

const PRESET_TEST_SUITES = [
  {
    name: 'Success Check',
    desc: 'Status 200, valid JSON, fast response',
    tests: [
      { type: 'status_equals', value: '200' },
      { type: 'body_is_json', value: '' },
      { type: 'response_time', value: '2000' },
    ],
  },
  {
    name: 'REST CRUD',
    desc: 'ID exists, is JSON, status 2xx',
    tests: [
      { type: 'status_range', value: '200-299' },
      { type: 'body_is_json', value: '' },
      { type: 'json_path_exists', value: 'id' },
    ],
  },
  {
    name: 'List Endpoint',
    desc: 'Array response, non-empty, correct type',
    tests: [
      { type: 'status_equals', value: '200' },
      { type: 'header_contains', value: 'content-type: json' },
      { type: 'json_array_length', value: 'data >= 1' },
    ],
  },
  {
    name: 'Error Handling',
    desc: 'Check for error messages',
    tests: [
      { type: 'status_range', value: '400-499' },
      { type: 'body_is_json', value: '' },
      { type: 'json_path_exists', value: 'error' },
    ],
  },
];

function resolveJsonPath(obj, path) {
  try {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = obj;
    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  } catch {
    return undefined;
  }
}

function runAssertion(test, response) {
  try {
    const { type, value } = test;
    const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const jsonData = typeof response.data === 'object' ? response.data : (() => { try { return JSON.parse(response.data); } catch { return null; } })();

    switch (type) {
      case 'status_equals':
        return { pass: response.status === Number(value), msg: `Status is ${response.status}` };

      case 'status_range': {
        const [min, max] = value.split('-').map(Number);
        const inRange = response.status >= min && response.status <= max;
        return { pass: inRange, msg: `Status ${response.status} ${inRange ? 'in' : 'not in'} range ${value}` };
      }

      case 'body_contains':
        return { pass: body.includes(value), msg: value ? `Body ${body.includes(value) ? 'contains' : 'missing'} "${value}"` : 'No search value' };

      case 'body_not_contains':
        return { pass: !body.includes(value), msg: `Body ${!body.includes(value) ? 'does not contain' : 'contains'} "${value}"` };

      case 'json_path_equals': {
        const [path, ...valParts] = value.split('=').map((s) => s.trim());
        const expected = valParts.join('=').trim();
        if (!jsonData) return { pass: false, msg: 'Response is not JSON' };
        const actual = resolveJsonPath(jsonData, path);
        const matches = String(actual) === expected || actual === Number(expected);
        return { pass: matches, msg: `${path} = ${JSON.stringify(actual)} ${matches ? '===' : '!=='} ${expected}` };
      }

      case 'json_path_exists': {
        if (!jsonData) return { pass: false, msg: 'Response is not JSON' };
        const val = resolveJsonPath(jsonData, value);
        return { pass: val !== undefined, msg: `${value} ${val !== undefined ? 'exists' : 'not found'}` };
      }

      case 'json_path_type': {
        const [path, expectedType] = value.split('=').map((s) => s.trim());
        if (!jsonData) return { pass: false, msg: 'Response is not JSON' };
        const val = resolveJsonPath(jsonData, path);
        const actualType = Array.isArray(val) ? 'array' : typeof val;
        return { pass: actualType === expectedType, msg: `${path} type is "${actualType}" (expected "${expectedType}")` };
      }

      case 'json_array_length': {
        const match = value.match(/^(.+?)\s*(>=|<=|>|<|=|==)\s*(\d+)$/);
        if (!match) return { pass: false, msg: 'Invalid format. Use: path >= 1' };
        const [, path, op, num] = match;
        if (!jsonData) return { pass: false, msg: 'Response is not JSON' };
        const arr = resolveJsonPath(jsonData, path.trim());
        if (!Array.isArray(arr)) return { pass: false, msg: `${path} is not an array` };
        const len = arr.length;
        const n = Number(num);
        const ops = { '>=': len >= n, '<=': len <= n, '>': len > n, '<': len < n, '=': len === n, '==': len === n };
        return { pass: ops[op], msg: `${path}.length (${len}) ${op} ${n}` };
      }

      case 'header_exists': {
        const headers = response.headers || {};
        const found = Object.keys(headers).some((k) => k.toLowerCase() === value.toLowerCase());
        return { pass: found, msg: `Header "${value}" ${found ? 'exists' : 'not found'}` };
      }

      case 'header_contains': {
        const [hdr, ...hVal] = value.split(':').map((s) => s.trim());
        const searchVal = hVal.join(':').trim().toLowerCase();
        const headers = response.headers || {};
        const headerVal = Object.entries(headers).find(([k]) => k.toLowerCase() === hdr.toLowerCase())?.[1];
        const contains = headerVal && String(headerVal).toLowerCase().includes(searchVal);
        return { pass: !!contains, msg: `Header "${hdr}" ${contains ? 'contains' : 'missing'} "${searchVal}"` };
      }

      case 'response_time':
        return { pass: response.duration < Number(value), msg: `Response time ${response.duration}ms ${response.duration < Number(value) ? '<' : '>='} ${value}ms` };

      case 'body_is_json': {
        const isJson = typeof response.data === 'object' || (() => { try { JSON.parse(response.data); return true; } catch { return false; } })();
        return { pass: isJson, msg: `Body is ${isJson ? 'valid' : 'not valid'} JSON` };
      }

      case 'body_matches_regex': {
        try {
          const regex = new RegExp(value);
          const matches = regex.test(body);
          return { pass: matches, msg: `Body ${matches ? 'matches' : 'does not match'} /${value}/` };
        } catch {
          return { pass: false, msg: 'Invalid regex pattern' };
        }
      }

      default:
        return { pass: false, msg: 'Unknown assertion type' };
    }
  } catch (err) {
    return { pass: false, msg: `Error: ${err.message}` };
  }
}

export default function ResponseTests({ tests, onSetTests, response }) {
  const [showPresets, setShowPresets] = useState(false);

  const results = useMemo(() => {
    if (!response) return [];
    return tests.map((t) => ({ ...t, result: runAssertion(t, response) }));
  }, [tests, response]);

  const passCount = results.filter((r) => r.result?.pass).length;
  const failCount = results.filter((r) => r.result && !r.result.pass).length;

  const handleAddTest = () => {
    onSetTests([...tests, { id: generateId(), type: 'status_equals', value: '200' }]);
  };

  const handleRemoveTest = (id) => {
    onSetTests(tests.filter((t) => t.id !== id));
  };

  const handleUpdateTest = (id, field, val) => {
    onSetTests(tests.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
  };

  const handleLoadPreset = (preset) => {
    const newTests = preset.tests.map((t) => ({ id: generateId(), type: t.type, value: t.value }));
    onSetTests([...tests, ...newTests]);
    setShowPresets(false);
  };

  const getAssertionInfo = (type) => ASSERTION_TYPES.find((a) => a.key === type);

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FlaskConical size={14} className="text-primary" />
          <span className="text-xs font-semibold">Tests</span>
          {tests.length > 0 && <span className="badge badge-ghost badge-xs">{tests.length}</span>}
          {response && results.length > 0 && (
            <>
              {passCount > 0 && <span className="badge badge-success badge-xs gap-1"><CheckCircle2 size={9} /> {passCount}</span>}
              {failCount > 0 && <span className="badge badge-error badge-xs gap-1"><XCircle size={9} /> {failCount}</span>}
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowPresets(!showPresets)}
              className={`btn btn-xs rounded-xl gap-1 ${showPresets ? 'btn-secondary' : 'btn-ghost'}`}
            >
              <Sparkles size={11} /> Presets {showPresets ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </motion.button>

            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl bg-base-100 border border-base-300 shadow-2xl p-2"
                >
                  {PRESET_TEST_SUITES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="text-xs font-semibold">{preset.name}</div>
                      <div className="text-[10px] opacity-50">{preset.desc}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {preset.tests.map((t, i) => (
                          <span key={i} className="badge badge-ghost text-[8px] py-0">{t.type.replace(/_/g, ' ')}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAddTest}
            className="btn btn-ghost btn-xs gap-1 text-primary rounded-xl hover:bg-primary/10 border border-dashed border-primary/20"
          >
            <Plus size={12} /> Add Test
          </motion.button>
        </div>
      </div>

      {/* Tests list */}
      {tests.length === 0 ? (
        <div className="text-center py-6">
          <FlaskConical size={28} className="mx-auto opacity-20 mb-2" />
          <p className="text-xs opacity-50">No tests configured.</p>
          <p className="text-[10px] opacity-30 mt-1">Add tests or load a preset to validate responses.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tests.map((test, idx) => {
            const info = getAssertionInfo(test.type);
            const result = results.find((r) => r.id === test.id)?.result;
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-start sm:items-center gap-2.5 p-3 rounded-xl border group transition-all duration-200 ${
                  result
                    ? result.pass
                      ? 'bg-success/5 border-success/30'
                      : 'bg-error/5 border-error/30'
                    : 'bg-base-200/30 border-base-300/50'
                }`}
              >
                {/* Result Icon */}
                <div className="shrink-0 mt-0.5 sm:mt-0">
                  {result ? (
                    result.pass ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : (
                      <XCircle size={16} className="text-error" />
                    )
                  ) : (
                    <Play size={14} className="opacity-20" />
                  )}
                </div>

                {/* Assertion config */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                  <select
                    value={test.type}
                    onChange={(e) => handleUpdateTest(test.id, 'type', e.target.value)}
                    className="select select-xs rounded-lg text-xs font-medium min-w-0 sm:w-48 shrink-0"
                  >
                    {(() => {
                      let lastCat = '';
                      return ASSERTION_TYPES.map((a) => {
                        const showGroup = a.category !== lastCat;
                        lastCat = a.category;
                        return (
                          <option key={a.key} value={a.key}>
                            {showGroup ? `[${a.category}] ` : ''}{a.label}
                          </option>
                        );
                      });
                    })()}
                  </select>
                  {info && info.placeholder && (
                    <input
                      type="text"
                      value={test.value}
                      onChange={(e) => handleUpdateTest(test.id, 'value', e.target.value)}
                      placeholder={info.placeholder}
                      className="input input-xs font-mono text-xs flex-1 rounded-lg min-w-0"
                    />
                  )}
                </div>

                {/* Result message */}
                {result && (
                  <span className={`text-[10px] font-mono shrink-0 max-w-48 truncate ${result.pass ? 'text-success' : 'text-error'}`} title={result.msg}>
                    {result.msg}
                  </span>
                )}

                {/* Remove */}
                <button
                  onClick={() => handleRemoveTest(test.id)}
                  className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-error rounded-lg shrink-0"
                >
                  <Trash2 size={11} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {response && results.length > 0 && (
        <div className={`p-3 rounded-xl border text-center ${failCount === 0 ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`}>
          <div className="flex items-center justify-center gap-2">
            {failCount === 0 ? (
              <CheckCircle2 size={16} className="text-success" />
            ) : (
              <XCircle size={16} className="text-error" />
            )}
            <span className="text-sm font-semibold">
              {failCount === 0 ? 'All tests passed!' : `${failCount} of ${results.length} tests failed`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
