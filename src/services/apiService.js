import axios from 'axios';

/**
 * Execute an HTTP request via Axios.
 *
 * @param {Object} config
 * @param {string} config.method - HTTP method
 * @param {string} config.url - Request URL
 * @param {Object} config.headers - Request headers
 * @param {Object} config.params - Query parameters
 * @param {*} config.body - Request body (for POST/PUT/PATCH)
 * @returns {Promise<Object>} - Normalized response
 */
export async function executeRequest({ method, url, headers = {}, params = {}, body = null }) {
  const startTime = performance.now();

  // Input validation
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      success: false,
      status: 0,
      statusText: 'Invalid Request',
      headers: {},
      data: 'A valid URL is required.',
      duration: 0,
      size: 0,
      error: 'URL is required',
    };
  }

  if (!method || typeof method !== 'string') {
    return {
      success: false,
      status: 0,
      statusText: 'Invalid Request',
      headers: {},
      data: 'A valid HTTP method is required.',
      duration: 0,
      size: 0,
      error: 'HTTP method is required',
    };
  }

  try {
    // Build clean headers (filter empty keys/values) — safely handle non-object input
    const safeHeaders = (headers && typeof headers === 'object') ? headers : {};
    const cleanHeaders = Object.fromEntries(
      Object.entries(safeHeaders).filter(([k, v]) => k && String(k).trim() && v != null && String(v).trim())
    );

    // Build clean params — safely handle non-object input
    const safeParams = (params && typeof params === 'object') ? params : {};
    const cleanParams = Object.fromEntries(
      Object.entries(safeParams).filter(([k, v]) => k && String(k).trim() && v != null && String(v).trim())
    );

    // Parse body if string
    let parsedBody = body;
    if (typeof body === 'string' && body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
    }

    const config = {
      method: method.toLowerCase(),
      url: url.trim(),
      headers: cleanHeaders,
      params: cleanParams,
      validateStatus: () => true, // Don't throw on non-2xx
      timeout: 30000, // 30s timeout to prevent hanging requests
    };

    // Only attach body for methods that support it
    if (['post', 'put', 'patch'].includes(config.method) && parsedBody) {
      config.data = parsedBody;
      if (!cleanHeaders['Content-Type'] && !cleanHeaders['content-type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await axios(config);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Safely compute response size
    let size = 0;
    try {
      size = JSON.stringify(response.data).length;
    } catch {
      size = 0;
    }

    return {
      success: true,
      status: response.status,
      statusText: response.statusText || '',
      headers: response.headers || {},
      data: response.data,
      duration,
      size,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Differentiate error types for better UX
    let statusText = 'Network Error';
    let errorMessage = error?.message || 'Unknown error occurred';

    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      statusText = 'Request Timeout';
      errorMessage = 'The request timed out. The server may be slow or unreachable.';
    } else if (error?.code === 'ERR_NETWORK') {
      statusText = 'Network Error';
      errorMessage = 'Unable to reach the server. Check your internet connection or the URL.';
    } else if (error?.code === 'ERR_BAD_REQUEST') {
      statusText = 'Bad Request';
    }

    return {
      success: false,
      status: error?.response?.status || 0,
      statusText: error?.response?.statusText || statusText,
      headers: error?.response?.headers || {},
      data: error?.response?.data || errorMessage,
      duration,
      size: 0,
      error: errorMessage,
    };
  }
}
