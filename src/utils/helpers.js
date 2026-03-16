export function formatBytes(bytes) {
  try {
    if (bytes == null || isNaN(bytes) || bytes < 0) return '0 B';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  } catch {
    return '0 B';
  }
}

export function formatDuration(ms) {
  try {
    if (ms == null || isNaN(ms)) return '0ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  } catch {
    return '0ms';
  }
}

export function getStatusColor(status) {
  try {
    const code = Number(status);
    if (isNaN(code)) return 'opacity-40';
    if (code >= 200 && code < 300) return 'text-success';
    if (code >= 300 && code < 400) return 'text-warning';
    if (code >= 400 && code < 500) return 'text-warning';
    if (code >= 500) return 'text-error';
    return 'opacity-40';
  } catch {
    return 'opacity-40';
  }
}

export function getStatusBadge(status) {
  try {
    const code = Number(status);
    if (isNaN(code)) return 'badge-ghost';
    if (code >= 200 && code < 300) return 'badge-success';
    if (code >= 300 && code < 400) return 'badge-warning';
    if (code >= 400 && code < 500) return 'badge-warning';
    if (code >= 500) return 'badge-error';
    return 'badge-ghost';
  } catch {
    return 'badge-ghost';
  }
}

export function prettyJSON(data) {
  try {
    if (data == null) return 'null';
    if (typeof data === 'string') {
      return JSON.stringify(JSON.parse(data), null, 2);
    }
    return JSON.stringify(data, null, 2);
  } catch {
    try {
      return typeof data === 'string' ? data : String(data);
    } catch {
      return '[Unserializable data]';
    }
  }
}

export function generateId() {
  try {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  } catch {
    return `id-${Math.random().toString(36).substring(2, 11)}`;
  }
}

export function truncate(str, maxLen = 50) {
  try {
    if (!str) return '';
    const s = String(str);
    return s.length > maxLen ? s.substring(0, maxLen) + '...' : s;
  } catch {
    return '';
  }
}

// DaisyUI badge classes for HTTP methods
export const METHOD_COLORS = {
  GET: 'badge-success',
  POST: 'badge-info',
  PUT: 'badge-warning',
  PATCH: 'badge-secondary',
  DELETE: 'badge-error',
  HEAD: 'badge-ghost',
  OPTIONS: 'badge-accent',
};

export const METHOD_DOT_COLORS = {
  GET: '#16a34a',
  POST: '#2563eb',
  PUT: '#d97706',
  PATCH: '#9333ea',
  DELETE: '#dc2626',
  HEAD: '#6b7280',
  OPTIONS: '#0891b2',
};
