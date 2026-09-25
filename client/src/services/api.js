export const DEFAULT_PRODUCTION_SERVER = 'https://pulsechat-server-2z5x.onrender.com';

export function getServerUrl() {
  if (typeof localStorage === 'undefined') return DEFAULT_PRODUCTION_SERVER;
  const custom = localStorage.getItem('pulsechat_server_url');
  if (custom && custom.trim()) {
    const clean = custom.trim().replace(/\/$/, '');
    // If it was an old local IP from earlier testing, automatically purge it
    if (
      clean.includes('192.168.') ||
      clean.includes('localhost') ||
      clean.includes('127.0.0.1') ||
      clean.startsWith('http://10.')
    ) {
      localStorage.removeItem('pulsechat_server_url');
      return DEFAULT_PRODUCTION_SERVER;
    }
    return clean;
  }
  return DEFAULT_PRODUCTION_SERVER;
}

export function setServerUrl(url) {
  if (typeof localStorage === 'undefined') return;
  if (url && url.trim()) {
    const clean = url.trim().replace(/\/$/, '');
    localStorage.setItem('pulsechat_server_url', clean);
  } else {
    localStorage.removeItem('pulsechat_server_url');
  }
  window.dispatchEvent(new CustomEvent('server-url:changed', { detail: { url } }));
}

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = getServerUrl();
  if (!base) return url;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function checkServerHealth(customUrl) {
  const base = (customUrl !== undefined ? customUrl : getServerUrl()).replace(/\/$/, '');
  const target = `${base}/api/health`;
  const controller = new AbortController();
  // 45-second timeout to accommodate Render free tier cold-start spin-up
  const timer = setTimeout(() => controller.abort(), 45000);
  const startTime = performance.now();
  try {
    const res = await fetch(target, { signal: controller.signal });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - startTime);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, latency, data, url: base };
    }
    return { ok: false, error: `HTTP ${res.status}`, latency, url: base };
  } catch (err) {
    clearTimeout(timer);
    return {
      ok: false,
      error: err.name === 'AbortError' ? 'Cloud server waking up (~30s). Please hold on...' : (err.message || 'Cannot reach server'),
      url: base
    };
  }
}

export function getToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('pulsechat_token') : null;
}

export function setToken(token) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem('pulsechat_token', token);
  } else {
    localStorage.removeItem('pulsechat_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not sending FormData, ensure JSON content type
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const base = getServerUrl();
  const fullUrl = `${base}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // Add a 45s timeout for Render free-tier cold starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  let response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      signal: options.signal || controller.signal,
      headers,
    });
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    const displayHost = base || window.location.origin || 'current server';
    if (fetchErr.name === 'AbortError') {
      throw new Error(`Cloud server is taking a moment to wake up (Render cold start). Please try again in 15 seconds!`);
    }
    throw new Error(`Cannot reach cloud server at "${displayHost}". If opening the app after inactivity, the free cloud server takes ~30s to wake up. Please tap retry in a moment!`);
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      setToken(null);
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  get: (url, options = {}) => {
    let finalUrl = url;
    if (options && options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });
      const qs = queryParams.toString();
      if (qs) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
      }
    }
    return request(finalUrl, { method: 'GET', ...options });
  },
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  del: (url) => request(url, { method: 'DELETE' }),

  uploadFile: async (file, type = 'file') => {
    const token = getToken();
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const base = getServerUrl();
    const fullUrl = `${base}/api/upload?type=${encodeURIComponent(type)}`;

    let response;
    try {
      response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: formData
      });
    } catch (err) {
      throw new Error(`Upload failed: Cannot reach server at "${base || 'current host'}".`);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  uploadMultiple: async (files) => {
    const token = getToken();
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const base = getServerUrl();
    const fullUrl = `${base}/api/upload/multiple`;

    let response;
    try {
      response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: formData
      });
    } catch (err) {
      throw new Error(`Upload failed: Cannot reach server at "${base || 'current host'}".`);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }
};
