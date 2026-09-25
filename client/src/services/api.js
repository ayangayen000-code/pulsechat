export function getServerUrl() {
  const custom = typeof localStorage !== 'undefined' ? localStorage.getItem('pulsechat_server_url') : null;
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // If running inside Capacitor Android/iOS WebView where hostname is localhost without dev port
  const isNative = typeof window !== 'undefined' && (
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80'))
  );
  if (isNative) {
    // Default to the computer's local Wi-Fi IP so the user can test at home immediately
    return 'http://192.168.1.3:5000';
  }
  return '';
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
  const timer = setTimeout(() => controller.abort(), 4000);
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
      error: err.name === 'AbortError' ? 'Connection timed out (4s)' : (err.message || 'Cannot reach server'),
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

  let response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (fetchErr) {
    const displayHost = base || window.location.origin || 'current server';
    throw new Error(`Cannot reach server at "${displayHost}". Check your Wi-Fi or tap Server Settings to configure.`);
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
