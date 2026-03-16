import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Plus, Trash2, Copy, Check, Play, ChevronDown,
  ChevronUp, Globe, Code2, Zap, RefreshCw, Download, Settings2,
  ArrowRight, Hash, FileJson, Upload,
  Search, Layers, BookOpen, Shield,
  Clock, Terminal, Braces, Table,
  Shuffle, Package, X, FileCode,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ═══════════════════════════════════════════ */
/*          FAKE DATA GENERATORS               */
/* ═══════════════════════════════════════════ */
const FIRST_NAMES = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Sophia', 'Mason', 'Isabella', 'Ethan', 'Mia', 'Logan', 'Charlotte', 'Aiden', 'Amelia', 'Harper', 'Elijah', 'Evelyn', 'Alexander'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com', 'example.com', 'company.io', 'work.dev'];
const CITIES = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Mumbai', 'São Paulo', 'Dubai', 'Seoul', 'Amsterdam', 'Barcelona', 'Singapore', 'San Francisco'];
const STREETS = ['Main St', 'Oak Ave', 'Park Blvd', 'Elm Dr', 'Cedar Ln', 'Maple Rd', 'Pine Way', 'Birch Ct', 'Walnut St', 'Cherry Ln'];
const COMPANIES = ['TechCorp', 'InnovateLabs', 'CloudBase', 'DataStream', 'NeuralEdge', 'QuantumSoft', 'ByteForge', 'CyberPulse', 'NexGen', 'PrimeTech'];
const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Support', 'Research'];
const PRODUCT_NAMES = ['Widget Pro', 'Gadget X', 'Smart Hub', 'Power Core', 'Flex Band', 'Nova Pad', 'Pixel Lens', 'Echo Dock', 'Turbo Chip', 'Cloud Box'];
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Automotive', 'Health', 'Food', 'Software'];
const LOREM = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');
const TAGS = ['featured', 'new', 'popular', 'sale', 'premium', 'trending', 'bestseller', 'limited', 'exclusive', 'eco-friendly'];
const STATUSES = ['active', 'inactive', 'pending', 'suspended', 'archived'];
const POST_TITLES = ['Getting Started with React', 'Advanced TypeScript Tips', 'Building REST APIs', 'Docker for Beginners', 'CSS Grid Mastery', 'Node.js Best Practices', 'GraphQL Deep Dive', 'CI/CD Pipeline Guide', 'Microservices Architecture', 'Web Security Essentials'];
const COUNTRIES = ['US', 'UK', 'JP', 'DE', 'FR', 'AU', 'CA', 'IN', 'BR', 'AE', 'KR', 'NL', 'ES', 'SG'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'BRL'];
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const EVENT_TYPES = ['click', 'view', 'purchase', 'signup', 'login', 'logout', 'error', 'pageview', 'search', 'download'];
const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const USER_AGENTS = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Mozilla/5.0 (Linux; Android 13)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)'];
const IP_PREFIXES = ['192.168', '10.0', '172.16', '203.0', '198.51'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randBool = () => Math.random() > 0.5;
const randFloat = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const randDate = (startYear = 2020) => {
  const start = new Date(startYear, 0, 1).getTime();
  return new Date(start + Math.random() * (Date.now() - start)).toISOString();
};
const randSentence = (words = 8) => {
  const s = Array.from({ length: words }, () => rand(LOREM)).join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
};
const randParagraph = (sentences = 3) => Array.from({ length: sentences }, () => randSentence(randInt(6, 14))).join(' ');
const randIp = () => `${rand(IP_PREFIXES)}.${randInt(1, 254)}.${randInt(1, 254)}`;
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

/* ── Resource Generators ── */
const RESOURCE_GENERATORS = {
  users: (id) => ({
    id,
    firstName: rand(FIRST_NAMES),
    lastName: rand(LAST_NAMES),
    email: `${rand(FIRST_NAMES).toLowerCase()}${randInt(1, 999)}@${rand(DOMAINS)}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rand(FIRST_NAMES)}${id}`,
    age: randInt(18, 65),
    phone: `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
    address: { street: `${randInt(100, 9999)} ${rand(STREETS)}`, city: rand(CITIES), zipCode: `${randInt(10000, 99999)}`, country: rand(COUNTRIES) },
    company: rand(COMPANIES),
    department: rand(DEPARTMENTS),
    role: rand(['admin', 'user', 'moderator', 'editor', 'viewer']),
    status: rand(STATUSES),
    verified: randBool(),
    createdAt: randDate(),
    updatedAt: randDate(2023),
  }),
  products: (id) => ({
    id,
    name: `${rand(PRODUCT_NAMES)} ${rand(['V2', 'Pro', 'Max', 'Lite', 'Ultra', 'Mini'])}`,
    description: randParagraph(2),
    price: randFloat(9.99, 499.99),
    compareAtPrice: randBool() ? randFloat(29.99, 699.99) : null,
    currency: rand(CURRENCIES),
    category: rand(CATEGORIES),
    sku: `SKU-${randInt(10000, 99999)}`,
    barcode: `${randInt(100000000000, 999999999999)}`,
    inStock: randBool(),
    quantity: randInt(0, 500),
    weight: randFloat(0.1, 25.0, 1),
    dimensions: { width: randFloat(5, 60, 1), height: randFloat(5, 60, 1), depth: randFloat(2, 40, 1) },
    rating: randFloat(1.0, 5.0, 1),
    reviews: randInt(0, 2500),
    tags: Array.from({ length: randInt(1, 4) }, () => rand(TAGS)).filter((v, i, a) => a.indexOf(v) === i),
    images: Array.from({ length: randInt(1, 4) }, (_, idx) => `https://picsum.photos/seed/${idx}/400/300`),
    createdAt: randDate(),
  }),
  posts: (id) => ({
    id,
    title: rand(POST_TITLES) + ` — Part ${randInt(1, 10)}`,
    slug: rand(POST_TITLES).toLowerCase().replace(/\s+/g, '-') + `-${id}`,
    body: randParagraph(5),
    excerpt: randSentence(12),
    coverImage: `https://picsum.photos/seed/post-${id}/800/400`,
    author: { id: randInt(1, 50), name: `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=author${id}` },
    category: rand(['Technology', 'Science', 'Design', 'Business', 'Lifestyle']),
    tags: Array.from({ length: randInt(2, 5) }, () => rand(TAGS)).filter((v, i, a) => a.indexOf(v) === i),
    published: randBool(),
    featured: randBool(),
    views: randInt(50, 50000),
    likes: randInt(0, 5000),
    comments: randInt(0, 300),
    readingTime: `${randInt(2, 15)} min`,
    createdAt: randDate(),
    updatedAt: randDate(2024),
  }),
  comments: (id) => ({
    id,
    postId: randInt(1, 100),
    parentId: randBool() ? null : randInt(1, id),
    author: { id: randInt(1, 200), name: `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=comm${id}` },
    body: randParagraph(2),
    likes: randInt(0, 500),
    reported: randBool() && Math.random() < 0.1,
    createdAt: randDate(),
    editedAt: randBool() ? randDate(2024) : null,
  }),
  todos: (id) => ({
    id,
    title: randSentence(randInt(4, 8)).replace('.', ''),
    description: randBool() ? randParagraph(1) : null,
    completed: randBool(),
    priority: rand(['low', 'medium', 'high', 'urgent']),
    dueDate: randDate(2024),
    assignee: { id: randInt(1, 50), name: `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}` },
    labels: Array.from({ length: randInt(1, 3) }, () => rand(['bug', 'feature', 'docs', 'refactor', 'test', 'design'])),
    estimatedHours: randInt(1, 40),
    createdAt: randDate(),
    completedAt: randBool() ? randDate(2024) : null,
  }),
  orders: () => ({
    id: uuid(),
    orderNumber: `ORD-${randInt(100000, 999999)}`,
    customer: { id: randInt(1, 500), name: `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`, email: `${rand(FIRST_NAMES).toLowerCase()}@${rand(DOMAINS)}` },
    items: Array.from({ length: randInt(1, 5) }, () => ({
      productId: randInt(1, 200),
      name: `${rand(PRODUCT_NAMES)} ${rand(['V2', 'Pro', 'Max'])}`,
      quantity: randInt(1, 5),
      unitPrice: randFloat(9.99, 199.99),
    })),
    subtotal: randFloat(19.99, 999.99),
    tax: randFloat(1.50, 80.00),
    shipping: randFloat(0, 25.00),
    total: randFloat(25.00, 1100.00),
    currency: rand(CURRENCIES),
    status: rand(ORDER_STATUSES),
    paymentMethod: rand(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto']),
    shippingAddress: { street: `${randInt(100, 9999)} ${rand(STREETS)}`, city: rand(CITIES), country: rand(COUNTRIES), zipCode: `${randInt(10000, 99999)}` },
    trackingNumber: randBool() ? `TRK${randInt(1000000000, 9999999999)}` : null,
    notes: randBool() ? randSentence(6) : null,
    createdAt: randDate(),
    updatedAt: randDate(2024),
  }),
  events: () => ({
    id: uuid(),
    type: rand(EVENT_TYPES),
    source: rand(['web', 'mobile', 'api', 'webhook', 'cron']),
    userId: randBool() ? randInt(1, 500) : null,
    sessionId: uuid(),
    ip: randIp(),
    userAgent: rand(USER_AGENTS),
    metadata: {
      page: rand(['/home', '/products', '/cart', '/checkout', '/profile', '/settings']),
      referrer: rand(['google.com', 'twitter.com', 'direct', 'facebook.com', '']),
      duration: randInt(100, 30000),
      ...(Math.random() > 0.5 ? { value: randFloat(0, 500) } : {}),
    },
    country: rand(COUNTRIES),
    timestamp: randDate(2024),
  }),
  logs: (id) => ({
    id,
    level: rand(LOG_LEVELS),
    message: randSentence(randInt(5, 15)),
    service: rand(['api-gateway', 'auth-service', 'user-service', 'payment-service', 'notification-service', 'search-service']),
    traceId: uuid(),
    spanId: uuid().slice(0, 16),
    host: `srv-${randInt(1, 20)}.${rand(['us-east', 'eu-west', 'ap-south'])}.internal`,
    responseTime: randInt(1, 5000),
    statusCode: rand([200, 200, 200, 201, 204, 301, 400, 401, 403, 404, 500, 502, 503]),
    method: rand(['GET', 'GET', 'POST', 'PUT', 'DELETE']),
    path: rand(['/api/users', '/api/products', '/api/orders', '/api/auth/login', '/api/search', '/health']),
    timestamp: randDate(2024),
  }),
  notifications: (id) => ({
    id,
    type: rand(['info', 'warning', 'error', 'success', 'marketing', 'system']),
    channel: rand(['email', 'push', 'sms', 'in-app', 'webhook']),
    title: randSentence(randInt(4, 8)).replace('.', ''),
    body: randParagraph(1),
    recipient: { id: randInt(1, 500), email: `${rand(FIRST_NAMES).toLowerCase()}@${rand(DOMAINS)}` },
    read: randBool(),
    sent: randBool(),
    scheduledAt: randBool() ? randDate(2024) : null,
    sentAt: randBool() ? randDate(2024) : null,
    readAt: randBool() ? randDate(2024) : null,
    metadata: { priority: rand(['low', 'normal', 'high']), category: rand(['account', 'billing', 'security', 'feature', 'promotion']) },
    createdAt: randDate(),
  }),
};

/* ── Response Headers Generator ── */
function generateResponseHeaders(endpoint) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Request-Id': uuid(),
    'X-Response-Time': `${endpoint.delay || randInt(5, 200)}ms`,
  };
  if (endpoint.enablePagination) {
    headers['X-Total-Count'] = String(endpoint.paginationTotal || endpoint.count * 5);
    headers['X-Page'] = '1';
    headers['X-Per-Page'] = String(endpoint.count);
    headers['Link'] = `<${endpoint.path}?page=2>; rel="next", <${endpoint.path}?page=${Math.ceil((endpoint.paginationTotal || endpoint.count * 5) / endpoint.count)}>; rel="last"`;
  }
  if (endpoint.enableCors) {
    headers['Access-Control-Allow-Origin'] = endpoint.corsOrigin || '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
  if (endpoint.enableRateLimit) {
    headers['X-RateLimit-Limit'] = String(endpoint.rateLimitMax || 100);
    headers['X-RateLimit-Remaining'] = String(randInt(0, endpoint.rateLimitMax || 100));
    headers['X-RateLimit-Reset'] = new Date(Date.now() + 3600000).toISOString();
  }
  if (endpoint.enableCache) {
    headers['Cache-Control'] = `public, max-age=${endpoint.cacheMaxAge || 3600}`;
    headers['ETag'] = `"${uuid().slice(0, 8)}"`;
  }
  return headers;
}

/* ── HTTP Status Responses ── */
const STATUS_RESPONSES = {
  200: { statusText: 'OK' },
  201: { statusText: 'Created' },
  204: { statusText: 'No Content' },
  206: { statusText: 'Partial Content' },
  301: { statusText: 'Moved Permanently' },
  304: { statusText: 'Not Modified' },
  400: { statusText: 'Bad Request', error: 'The request was malformed or invalid.' },
  401: { statusText: 'Unauthorized', error: 'Authentication is required.' },
  403: { statusText: 'Forbidden', error: 'You do not have permission to access this resource.' },
  404: { statusText: 'Not Found', error: 'The requested resource could not be found.' },
  409: { statusText: 'Conflict', error: 'The request conflicts with the current state of the server.' },
  422: { statusText: 'Unprocessable Entity', error: 'The request was well-formed but contains semantic errors.' },
  429: { statusText: 'Too Many Requests', error: 'Rate limit exceeded. Please try again later.' },
  500: { statusText: 'Internal Server Error', error: 'An unexpected error occurred on the server.' },
  502: { statusText: 'Bad Gateway', error: 'The server received an invalid response from the upstream server.' },
  503: { statusText: 'Service Unavailable', error: 'The server is temporarily unable to handle the request.' },
};

/* ── Endpoint defaults ── */
const DEFAULT_ENDPOINT = {
  id: '',
  method: 'GET',
  path: '/api/users',
  resource: 'users',
  count: 10,
  statusCode: 200,
  delay: 0,
  description: '',
  customResponse: '',
  useCustomResponse: false,
  enablePagination: false,
  paginationTotal: 50,
  enableCors: false,
  corsOrigin: '*',
  enableRateLimit: false,
  rateLimitMax: 100,
  enableCache: false,
  cacheMaxAge: 3600,
  enableWrapping: true,
  authRequired: false,
  authType: 'bearer',
  tags: [],
};

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const METHOD_COLORS = {
  GET: 'badge-success',
  POST: 'badge-primary',
  PUT: 'badge-warning',
  PATCH: 'badge-info',
  DELETE: 'badge-error',
  HEAD: 'badge-ghost',
  OPTIONS: 'badge-ghost',
};

/* ── Preset Templates ── */
const PRESET_TEMPLATES = [
  {
    name: 'CRUD Users API',
    desc: 'Full CRUD for users',
    endpoints: [
      { method: 'GET', path: '/api/users', resource: 'users', count: 10, statusCode: 200, description: 'List all users', enablePagination: true, paginationTotal: 50 },
      { method: 'GET', path: '/api/users/:id', resource: 'users', count: 1, statusCode: 200, description: 'Get user by ID' },
      { method: 'POST', path: '/api/users', resource: 'users', count: 1, statusCode: 201, description: 'Create user' },
      { method: 'PUT', path: '/api/users/:id', resource: 'users', count: 1, statusCode: 200, description: 'Update user' },
      { method: 'DELETE', path: '/api/users/:id', resource: 'users', count: 0, statusCode: 204, description: 'Delete user' },
    ],
  },
  {
    name: 'E-commerce API',
    desc: 'Products + Orders + Users',
    endpoints: [
      { method: 'GET', path: '/api/products', resource: 'products', count: 20, statusCode: 200, description: 'Browse products', enablePagination: true },
      { method: 'GET', path: '/api/products/:id', resource: 'products', count: 1, statusCode: 200, description: 'Product details' },
      { method: 'GET', path: '/api/orders', resource: 'orders', count: 10, statusCode: 200, description: 'List orders', authRequired: true },
      { method: 'POST', path: '/api/orders', resource: 'orders', count: 1, statusCode: 201, description: 'Place order' },
      { method: 'GET', path: '/api/users/me', resource: 'users', count: 1, statusCode: 200, description: 'Current user profile', authRequired: true },
    ],
  },
  {
    name: 'Blog API',
    desc: 'Posts + Comments + Notifications',
    endpoints: [
      { method: 'GET', path: '/api/posts', resource: 'posts', count: 15, statusCode: 200, description: 'Latest posts', enablePagination: true },
      { method: 'GET', path: '/api/posts/:slug', resource: 'posts', count: 1, statusCode: 200, description: 'Post by slug' },
      { method: 'GET', path: '/api/posts/:id/comments', resource: 'comments', count: 20, statusCode: 200, description: 'Post comments' },
      { method: 'POST', path: '/api/posts/:id/comments', resource: 'comments', count: 1, statusCode: 201, description: 'Add comment' },
      { method: 'GET', path: '/api/notifications', resource: 'notifications', count: 10, statusCode: 200, description: 'User notifications' },
    ],
  },
  {
    name: 'Analytics API',
    desc: 'Events + Logs',
    endpoints: [
      { method: 'GET', path: '/api/events', resource: 'events', count: 50, statusCode: 200, description: 'Recent events', enablePagination: true },
      { method: 'POST', path: '/api/events', resource: 'events', count: 1, statusCode: 201, description: 'Track event' },
      { method: 'GET', path: '/api/logs', resource: 'logs', count: 50, statusCode: 200, description: 'Application logs', authRequired: true },
      { method: 'GET', path: '/api/logs/errors', resource: 'logs', count: 10, statusCode: 200, description: 'Error logs', authRequired: true },
    ],
  },
];

/* ════════════════════════════════════════ */
/*           ENDPOINT CARD                 */
/* ════════════════════════════════════════ */
function EndpointCard({ endpoint, onUpdate, onRemove, onDuplicate, onTest, testResult, index }) {
  const [expanded, setExpanded] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="section-card overflow-hidden">
      {/* Collapsed Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-base-200/40 transition-colors" onClick={() => setExpanded(e => !e)}>
        <span className="text-[10px] opacity-30 font-mono w-5 text-center">{index + 1}</span>
        <span className={`badge badge-sm font-mono font-bold ${METHOD_COLORS[endpoint.method]}`}>{endpoint.method}</span>
        <span className="font-mono text-sm font-medium flex-1 truncate">{endpoint.path}</span>
        <div className="flex items-center gap-1.5">
          {endpoint.authRequired && <Shield size={12} className="opacity-40" />}
          {endpoint.enablePagination && <Layers size={12} className="opacity-40" />}
          {endpoint.enableRateLimit && <Clock size={12} className="opacity-40" />}
          <span className="badge badge-ghost badge-xs">{endpoint.resource}</span>
          <span className="badge badge-ghost badge-xs">{endpoint.count} items</span>
        </div>
        {expanded ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-base-200 pt-4">
              {/* Row 1: Method + Path */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="field-label">Method</label>
                  <select value={endpoint.method} onChange={(e) => onUpdate({ ...endpoint, method: e.target.value })} className="select select-sm w-full">
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="field-label">Path</label>
                  <input type="text" value={endpoint.path} onChange={(e) => onUpdate({ ...endpoint, path: e.target.value })} className="input input-sm w-full font-mono" placeholder="/api/users/:id" />
                </div>
              </div>

              {/* Row 2: Resource + Count + Status + Delay */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="field-label">Resource Type</label>
                  <select value={endpoint.resource} onChange={(e) => onUpdate({ ...endpoint, resource: e.target.value })} className="select select-sm w-full">
                    {Object.keys(RESOURCE_GENERATORS).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Count</label>
                  <input type="number" min={0} max={200} value={endpoint.count} onChange={(e) => onUpdate({ ...endpoint, count: Math.min(200, Math.max(0, parseInt(e.target.value) || 0)) })} className="input input-sm w-full font-mono" />
                </div>
                <div>
                  <label className="field-label">Status Code</label>
                  <select value={endpoint.statusCode} onChange={(e) => onUpdate({ ...endpoint, statusCode: parseInt(e.target.value) })} className="select select-sm w-full">
                    {Object.entries(STATUS_RESPONSES).map(([code, info]) => <option key={code} value={code}>{code} – {info.statusText}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Delay (ms)</label>
                  <input type="number" min={0} max={10000} step={100} value={endpoint.delay} onChange={(e) => onUpdate({ ...endpoint, delay: Math.min(10000, Math.max(0, parseInt(e.target.value) || 0)) })} className="input input-sm w-full font-mono" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="field-label">Description (optional)</label>
                <input type="text" value={endpoint.description} onChange={(e) => onUpdate({ ...endpoint, description: e.target.value })} className="input input-sm w-full" placeholder="Describe this endpoint..." />
              </div>

              {/* Feature Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'enablePagination', label: 'Pagination', icon: Layers },
                  { key: 'authRequired', label: 'Auth Required', icon: Shield },
                  { key: 'enableCors', label: 'CORS Headers', icon: Globe },
                  { key: 'enableRateLimit', label: 'Rate Limiting', icon: Clock },
                  { key: 'enableCache', label: 'Caching', icon: Package },
                  { key: 'enableWrapping', label: 'Wrap Response', icon: Braces },
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-base-200/40 transition-colors cursor-pointer">
                    <input type="checkbox" checked={endpoint[key] || false} onChange={(e) => onUpdate({ ...endpoint, [key]: e.target.checked })} className="checkbox checkbox-xs checkbox-primary" />
                    <Icon size={12} className="opacity-50" />
                    <span className="text-xs font-medium opacity-70">{label}</span>
                  </label>
                ))}
              </div>

              {/* Pagination Config */}
              {endpoint.enablePagination && (
                <div className="rounded-lg bg-base-200/30 p-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Total Records</label>
                    <input type="number" min={1} max={10000} value={endpoint.paginationTotal || 50} onChange={(e) => onUpdate({ ...endpoint, paginationTotal: parseInt(e.target.value) || 50 })} className="input input-sm w-full font-mono" />
                  </div>
                  <div className="flex items-end">
                    <span className="text-[10px] opacity-40 pb-2">Pages: {Math.ceil((endpoint.paginationTotal || 50) / (endpoint.count || 10))}</span>
                  </div>
                </div>
              )}

              {/* Rate Limit Config */}
              {endpoint.enableRateLimit && (
                <div className="rounded-lg bg-base-200/30 p-3">
                  <label className="field-label">Max Requests / Hour</label>
                  <input type="number" min={1} max={10000} value={endpoint.rateLimitMax || 100} onChange={(e) => onUpdate({ ...endpoint, rateLimitMax: parseInt(e.target.value) || 100 })} className="input input-sm w-full font-mono" />
                </div>
              )}

              {/* Cache Config */}
              {endpoint.enableCache && (
                <div className="rounded-lg bg-base-200/30 p-3">
                  <label className="field-label">Cache Max-Age (seconds)</label>
                  <input type="number" min={0} max={86400} value={endpoint.cacheMaxAge || 3600} onChange={(e) => onUpdate({ ...endpoint, cacheMaxAge: parseInt(e.target.value) || 3600 })} className="input input-sm w-full font-mono" />
                </div>
              )}

              {/* Custom Response Toggle */}
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={endpoint.useCustomResponse} onChange={(e) => onUpdate({ ...endpoint, useCustomResponse: e.target.checked })} className="checkbox checkbox-xs checkbox-primary" />
                <span className="text-xs font-medium opacity-70">Use custom JSON response</span>
              </div>

              {endpoint.useCustomResponse && (
                <div>
                  <label className="field-label">Custom JSON Response</label>
                  <textarea value={endpoint.customResponse} onChange={(e) => onUpdate({ ...endpoint, customResponse: e.target.value })} className="textarea w-full font-mono text-xs" rows={6} placeholder='{"message": "Hello World", "data": []}' spellCheck={false} />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-base-200 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => onTest(endpoint)} className="btn btn-sm btn-primary gap-1.5"><Play size={14} /> Test</button>
                  <button onClick={() => copyToClipboard(JSON.stringify(generateResponse(endpoint), null, 2))} className="btn btn-sm btn-ghost gap-1.5">
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />} Copy Response
                  </button>
                  <button onClick={() => onDuplicate(endpoint)} className="btn btn-sm btn-ghost gap-1.5"><Shuffle size={14} /> Duplicate</button>
                </div>
                <button onClick={() => onRemove(endpoint.id)} className="btn btn-sm btn-ghost btn-error gap-1.5"><Trash2 size={14} /> Remove</button>
              </div>

              {/* Test Result */}
              <AnimatePresence>
                {testResult && testResult.endpointId === endpoint.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="rounded-lg bg-base-200/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-sm ${testResult.status < 400 ? 'badge-success' : 'badge-error'}`}>
                            {testResult.status} {STATUS_RESPONSES[testResult.status]?.statusText}
                          </span>
                          <span className="text-[10px] opacity-40">{testResult.duration}ms</span>
                          {testResult.bodySize && <span className="text-[10px] opacity-40">{testResult.bodySize}</span>}
                        </div>
                      </div>
                      {/* Response Headers */}
                      {testResult.headers && (
                        <details className="text-xs">
                          <summary className="cursor-pointer opacity-50 hover:opacity-80 transition-opacity font-semibold mb-1">Response Headers ({Object.keys(testResult.headers).length})</summary>
                          <div className="rounded bg-base-300/50 p-2 font-mono space-y-0.5">
                            {Object.entries(testResult.headers).map(([k, v]) => (
                              <div key={k}><span className="text-primary">{k}:</span> <span className="opacity-70">{v}</span></div>
                            ))}
                          </div>
                        </details>
                      )}
                      <pre className="text-xs font-mono overflow-auto max-h-64 p-3 bg-base-300/50 rounded-lg whitespace-pre-wrap">
                        {JSON.stringify(testResult.body, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Generate response for an endpoint ── */
function generateResponse(endpoint) {
  if (endpoint.useCustomResponse && endpoint.customResponse?.trim()) {
    try { return JSON.parse(endpoint.customResponse); } catch { return { error: 'Invalid JSON in custom response' }; }
  }

  const statusInfo = STATUS_RESPONSES[endpoint.statusCode];
  if (endpoint.statusCode >= 400) {
    return {
      status: endpoint.statusCode,
      error: statusInfo?.error || 'An error occurred',
      message: statusInfo?.statusText || 'Error',
      ...(endpoint.statusCode === 422 ? {
        errors: [
          { field: 'email', message: 'Email is required' },
          { field: 'name', message: 'Name must be at least 2 characters' },
        ],
      } : {}),
      timestamp: new Date().toISOString(),
    };
  }

  if (endpoint.statusCode === 204 || endpoint.count === 0) return null;

  const gen = RESOURCE_GENERATORS[endpoint.resource] || RESOURCE_GENERATORS.users;

  if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.statusCode === 201) {
    const item = gen(randInt(100, 999));
    return endpoint.enableWrapping !== false ? {
      status: 201,
      message: `${endpoint.resource.slice(0, -1)} created successfully`,
      data: item,
      timestamp: new Date().toISOString(),
    } : item;
  }

  if (endpoint.count === 1) {
    const item = gen(randInt(1, 100));
    return endpoint.enableWrapping !== false ? { status: endpoint.statusCode, data: item, timestamp: new Date().toISOString() } : item;
  }

  const data = Array.from({ length: endpoint.count }, (_, i) => gen(i + 1));

  if (endpoint.enableWrapping === false) return data;

  const response = {
    status: endpoint.statusCode,
    total: endpoint.enablePagination ? (endpoint.paginationTotal || endpoint.count * 5) : data.length,
    page: 1,
    perPage: endpoint.count,
    data,
    timestamp: new Date().toISOString(),
  };

  if (endpoint.enablePagination) {
    const totalPages = Math.ceil((endpoint.paginationTotal || endpoint.count * 5) / endpoint.count);
    response.totalPages = totalPages;
    response.hasNextPage = true;
    response.hasPrevPage = false;
    response.links = {
      self: `${endpoint.path}?page=1&limit=${endpoint.count}`,
      next: `${endpoint.path}?page=2&limit=${endpoint.count}`,
      last: `${endpoint.path}?page=${totalPages}&limit=${endpoint.count}`,
    };
  }

  return response;
}

/* ── Code snippet generators ── */
function generateCodeSnippet(endpoint, language) {
  const url = `https://api.example.com${endpoint.path}`;
  const method = endpoint.method;

  if (language === 'curl') {
    let cmd = `curl -X ${method} "${url}"`;
    if (endpoint.authRequired) cmd += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
    cmd += ` \\\n  -H "Content-Type: application/json"`;
    if (['POST', 'PUT', 'PATCH'].includes(method)) cmd += ` \\\n  -d '{"key": "value"}'`;
    return cmd;
  }

  if (language === 'fetch') {
    const opts = [`  method: '${method}'`];
    const headers = [`    'Content-Type': 'application/json'`];
    if (endpoint.authRequired) headers.push(`    'Authorization': 'Bearer YOUR_TOKEN'`);
    opts.push(`  headers: {\n${headers.join(',\n')}\n  }`);
    if (['POST', 'PUT', 'PATCH'].includes(method)) opts.push(`  body: JSON.stringify({ key: 'value' })`);
    return `const response = await fetch('${url}', {\n${opts.join(',\n')}\n});\nconst data = await response.json();`;
  }

  if (language === 'axios') {
    const config = [];
    if (endpoint.authRequired) config.push(`    Authorization: 'Bearer YOUR_TOKEN'`);
    const headerStr = config.length ? `,\n  headers: {\n${config.join(',\n')}\n  }` : '';
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      return `const { data } = await axios.${method.toLowerCase()}('${url}', {\n  key: 'value'\n}${headerStr});`;
    }
    return `const { data } = await axios.${method.toLowerCase()}('${url}'${headerStr ? `, {${headerStr}\n}` : ''});`;
  }

  return '';
}

/* ════════════════════════════════════════ */
/*         MOCK API GENERATOR              */
/* ════════════════════════════════════════ */
export default function MockApiGenerator() {
  const [endpoints, setEndpoints] = useLocalStorage('mock-api-endpoints-v2', [
    { ...DEFAULT_ENDPOINT, id: uuid(), path: '/api/users', resource: 'users', count: 5, description: 'Get all users', enablePagination: true },
    { ...DEFAULT_ENDPOINT, id: uuid(), path: '/api/products', resource: 'products', count: 10, description: 'Get all products' },
  ]);
  const [testResult, setTestResult] = useState(null);
  const [generatedApi, setGeneratedApi] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('json'); // json | table
  const [searchFilter, setSearchFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [showCodeSnippets, setShowCodeSnippets] = useState(null);
  const [snippetLang, setSnippetLang] = useState('fetch');
  const fileInputRef = useRef(null);
  const { copied, copyToClipboard } = useCopyToClipboard();

  /* ── Filtered endpoints ── */
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(ep => {
      const matchesSearch = !searchFilter || ep.path.toLowerCase().includes(searchFilter.toLowerCase()) || ep.description.toLowerCase().includes(searchFilter.toLowerCase()) || ep.resource.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesMethod = !methodFilter || ep.method === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [endpoints, searchFilter, methodFilter]);

  /* ── Actions ── */
  const addEndpoint = useCallback(() => {
    setEndpoints(prev => [...prev, { ...DEFAULT_ENDPOINT, id: uuid(), path: `/api/resource-${prev.length + 1}`, description: '' }]);
  }, [setEndpoints]);

  const updateEndpoint = useCallback((updated) => {
    setEndpoints(prev => prev.map(ep => ep.id === updated.id ? updated : ep));
  }, [setEndpoints]);

  const removeEndpoint = useCallback((id) => {
    setEndpoints(prev => prev.filter(ep => ep.id !== id));
    if (testResult?.endpointId === id) setTestResult(null);
  }, [setEndpoints, testResult]);

  const duplicateEndpoint = useCallback((endpoint) => {
    const dupe = { ...endpoint, id: uuid(), path: endpoint.path + '-copy', description: endpoint.description ? `${endpoint.description} (copy)` : '' };
    setEndpoints(prev => [...prev, dupe]);
  }, [setEndpoints]);

  const testEndpoint = useCallback((endpoint) => {
    const start = performance.now();
    setTimeout(() => {
      const body = generateResponse(endpoint);
      const headers = generateResponseHeaders(endpoint);
      const duration = Math.round(performance.now() - start + endpoint.delay);
      const bodyStr = JSON.stringify(body);
      const bodySize = bodyStr ? `${(new TextEncoder().encode(bodyStr).length / 1024).toFixed(1)} KB` : '0 B';
      setTestResult({ endpointId: endpoint.id, status: endpoint.statusCode, body, headers, duration, bodySize });
    }, endpoint.delay);
  }, []);

  const generateFullApi = useCallback(() => {
    const api = {};
    endpoints.forEach(ep => {
      const key = `${ep.method} ${ep.path}`;
      api[key] = { status: ep.statusCode, delay: ep.delay, description: ep.description, headers: generateResponseHeaders(ep), response: generateResponse(ep) };
    });
    setGeneratedApi(api);
    setShowPreview(true);
  }, [endpoints]);

  const regenerateAll = useCallback(() => {
    setEndpoints(prev => [...prev]);
    if (generatedApi) generateFullApi();
  }, [setEndpoints, generatedApi, generateFullApi]);

  const loadPreset = useCallback((preset) => {
    const newEndpoints = preset.endpoints.map(ep => ({ ...DEFAULT_ENDPOINT, ...ep, id: uuid() }));
    setEndpoints(newEndpoints);
    setTestResult(null);
    setShowPreview(false);
  }, [setEndpoints]);

  const clearAllEndpoints = useCallback(() => {
    setEndpoints([]);
    setTestResult(null);
    setShowPreview(false);
  }, [setEndpoints]);

  /* ── Import config ── */
const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const config = JSON.parse(ev.target.result);
          if (config.endpoints && Array.isArray(config.endpoints)) {
            setEndpoints(config.endpoints.map(ep => ({ ...DEFAULT_ENDPOINT, ...ep, id: uuid() })));
          }
        } catch (err) {
          console.error('Failed to parse imported Mock API config:', err);
        }
      };
      reader.onerror = () => {
        console.error('Failed to read file:', reader.error?.message || 'Unknown error');
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Import failed:', err);
    }
    e.target.value = '';
  }, [setEndpoints]);
  /* ── Stats ── */
  const stats = useMemo(() => {
    const methods = {};
    endpoints.forEach(ep => { methods[ep.method] = (methods[ep.method] || 0) + 1; });
    const resources = [...new Set(endpoints.map(e => e.resource))];
    const totalRecords = endpoints.reduce((sum, ep) => sum + ep.count, 0);
    const authCount = endpoints.filter(ep => ep.authRequired).length;
    return { total: endpoints.length, methods, totalRecords, resources, authCount };
  }, [endpoints]);

  /* ── Export ── */
  const exportConfig = useCallback((format = 'json') => {
    try {
      const config = {
        name: 'Mock API Configuration',
        version: '2.0.0',
        generatedAt: new Date().toISOString(),
        endpoints: endpoints.map(({ id, ...rest }) => rest),
      };

      if (format === 'openapi') {
      const paths = {};
      endpoints.forEach(ep => {
        const path = ep.path.replace(/:(\w+)/g, '{$1}');
        if (!paths[path]) paths[path] = {};
        paths[path][ep.method.toLowerCase()] = {
          summary: ep.description || `${ep.method} ${ep.path}`,
          tags: [ep.resource],
          responses: { [ep.statusCode]: { description: STATUS_RESPONSES[ep.statusCode]?.statusText || 'Response' } },
          ...(ep.authRequired ? { security: [{ bearerAuth: [] }] } : {}),
        };
      });
      const openapi = {
        openapi: '3.0.0',
        info: { title: 'Mock API', version: '1.0.0', description: 'Generated Mock API specification' },
        paths,
        components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
      };
      const blob = new Blob([JSON.stringify(openapi, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'openapi-spec.json'; a.click(); URL.revokeObjectURL(url);
      return;
    }

      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'mock-api-config.json'; a.click(); URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [endpoints]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Server size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">Mock API Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Generate fake REST API endpoints with realistic data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={regenerateAll} className="btn btn-sm btn-ghost gap-1.5"><RefreshCw size={14} /> Regenerate</button>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-ghost gap-1.5"><Download size={14} /> Export</div>
            <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-xl w-52 border border-base-300">
              <li><button onClick={() => exportConfig('json')} className="text-xs gap-2"><FileJson size={13} /> JSON Config</button></li>
              <li><button onClick={() => exportConfig('openapi')} className="text-xs gap-2"><FileCode size={13} /> OpenAPI 3.0 Spec</button></li>
            </ul>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-sm btn-ghost gap-1.5"><Upload size={14} /> Import</button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={generateFullApi} className="btn btn-sm btn-primary gap-1.5"><Zap size={14} /> Generate All</button>
        </div>
      </motion.div>

      {/* ── Stats Bar ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="section-card p-4">
          <div className="flex items-center gap-2 mb-1.5"><Globe size={16} className="text-primary" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Endpoints</span></div>
          <span className="text-lg font-bold">{stats.total}</span>
        </div>
        <div className="section-card p-4">
          <div className="flex items-center gap-2 mb-1.5"><Hash size={16} className="text-success" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Records</span></div>
          <span className="text-lg font-bold">{stats.totalRecords}</span>
        </div>
        <div className="section-card p-4">
          <div className="flex items-center gap-2 mb-1.5"><Code2 size={16} className="text-warning" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Methods</span></div>
          <div className="flex flex-wrap gap-1 mt-0.5">{Object.entries(stats.methods).map(([m, count]) => <span key={m} className={`badge badge-xs ${METHOD_COLORS[m]}`}>{m}:{count}</span>)}</div>
        </div>
        <div className="section-card p-4">
          <div className="flex items-center gap-2 mb-1.5"><FileJson size={16} className="text-info" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Resources</span></div>
          <div className="flex flex-wrap gap-1 mt-0.5">{stats.resources.map(r => <span key={r} className="badge badge-xs badge-ghost">{r}</span>)}</div>
        </div>
        <div className="section-card p-4">
          <div className="flex items-center gap-2 mb-1.5"><Shield size={16} className="text-error" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Protected</span></div>
          <span className="text-lg font-bold">{stats.authCount}</span>
        </div>
      </motion.div>

      {/* ── Preset Templates ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="section-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><BookOpen size={14} className="text-primary" /> Preset Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_TEMPLATES.map(preset => (
            <button key={preset.name} onClick={() => loadPreset(preset)} className="text-left rounded-lg bg-base-200/40 p-3 hover:bg-base-200/70 transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{preset.name}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>
              <p className="text-[10px] opacity-40">{preset.desc}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {preset.endpoints.slice(0, 3).map((ep, i) => <span key={i} className={`badge badge-xs ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>)}
                {preset.endpoints.length > 3 && <span className="badge badge-xs badge-ghost">+{preset.endpoints.length - 3}</span>}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Filter & Search ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input type="text" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder="Search endpoints..." className="input input-sm w-full pl-9" />
          {searchFilter && <button onClick={() => setSearchFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"><X size={12} /></button>}
        </div>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="select select-sm w-28">
          <option value="">All Methods</option>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="text-[10px] opacity-40">{filteredEndpoints.length}/{endpoints.length} shown</span>
      </motion.div>

      {/* ── Endpoints List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold opacity-60">Endpoints</h2>
          <div className="flex items-center gap-2">
            {endpoints.length > 0 && <button onClick={clearAllEndpoints} className="btn btn-xs btn-ghost btn-error gap-1"><Trash2 size={12} /> Clear All</button>}
            <button onClick={addEndpoint} className="btn btn-sm btn-outline gap-1.5"><Plus size={14} /> Add Endpoint</button>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredEndpoints.map((ep, i) => (
            <EndpointCard
              key={ep.id}
              endpoint={ep}
              index={i}
              onUpdate={updateEndpoint}
              onRemove={removeEndpoint}
              onDuplicate={duplicateEndpoint}
              onTest={testEndpoint}
              testResult={testResult}
            />
          ))}
        </AnimatePresence>

        {endpoints.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4"><Server size={28} className="opacity-30" /></div>
            <p className="text-sm font-medium opacity-50 mb-1">No endpoints configured</p>
            <p className="text-xs opacity-30 mb-4">Add your first endpoint or load a preset template</p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={addEndpoint} className="btn btn-sm btn-primary gap-1.5"><Plus size={14} /> Add Endpoint</button>
              <button onClick={() => loadPreset(PRESET_TEMPLATES[0])} className="btn btn-sm btn-outline gap-1.5"><BookOpen size={14} /> Load CRUD Preset</button>
            </div>
          </motion.div>
        )}

        {filteredEndpoints.length === 0 && endpoints.length > 0 && (
          <div className="text-center py-8">
            <Search size={24} className="opacity-20 mx-auto mb-2" />
            <p className="text-xs opacity-40">No endpoints match your filter</p>
          </div>
        )}
      </div>

      {/* ── Code Snippet Generator ── */}
      {endpoints.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="section-card overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-base-200 cursor-pointer hover:bg-base-200/40 transition-colors" onClick={() => setShowCodeSnippets(s => s ? null : endpoints[0]?.id)}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Terminal size={15} className="text-accent-content" /></div>
              <span className="text-sm font-semibold">Code Snippets</span>
              <span className="badge badge-ghost badge-xs">cURL • Fetch • Axios</span>
            </div>
            {showCodeSnippets ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />}
          </div>
          <AnimatePresence>
            {showCodeSnippets && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <select value={showCodeSnippets} onChange={(e) => setShowCodeSnippets(e.target.value)} className="select select-sm flex-1 font-mono">
                      {endpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.method} {ep.path}</option>)}
                    </select>
                    <div className="tabs tabs-box tabs-xs">
                      {['curl', 'fetch', 'axios'].map(lang => (
                        <button key={lang} className={`tab ${snippetLang === lang ? 'tab-active' : ''}`} onClick={() => setSnippetLang(lang)}>{lang}</button>
                      ))}
                    </div>
                  </div>
                  {(() => {
                    const ep = endpoints.find(e => e.id === showCodeSnippets);
                    if (!ep) return null;
                    const code = generateCodeSnippet(ep, snippetLang);
                    return (
                      <div className="relative">
                        <pre className="text-xs font-mono bg-base-200/50 rounded-lg p-4 overflow-auto max-h-48 whitespace-pre-wrap">{code}</pre>
                        <button onClick={() => copyToClipboard(code)} className="absolute top-2 right-2 btn btn-ghost btn-xs">
                          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Full API Preview ── */}
      <AnimatePresence>
        {showPreview && generatedApi && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="section-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><FileJson size={15} className="text-primary-content" /></div>
                <span className="text-sm font-semibold">Generated API Response</span>
                <span className="badge badge-ghost badge-xs">{Object.keys(generatedApi).length} endpoints</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="tabs tabs-box tabs-xs">
                  <button className={`tab gap-1 ${previewFormat === 'json' ? 'tab-active' : ''}`} onClick={() => setPreviewFormat('json')}><Braces size={11} /> JSON</button>
                  <button className={`tab gap-1 ${previewFormat === 'table' ? 'tab-active' : ''}`} onClick={() => setPreviewFormat('table')}><Table size={11} /> Table</button>
                </div>
                <button onClick={() => copyToClipboard(JSON.stringify(generatedApi, null, 2))} className="btn btn-ghost btn-xs gap-1">
                  {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy All'}
                </button>
                <button onClick={() => setShowPreview(false)} className="btn btn-ghost btn-xs"><X size={12} /></button>
              </div>
            </div>
            <div className="p-5 max-h-[500px] overflow-auto">
              {previewFormat === 'json' ? (
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-80">{JSON.stringify(generatedApi, null, 2)}</pre>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-xs table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Method</th><th>Path</th><th>Status</th><th>Delay</th><th>Description</th><th>Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(generatedApi).map(([key, val]) => {
                        const [method, ...pathParts] = key.split(' ');
                        return (
                          <tr key={key}>
                            <td><span className={`badge badge-xs ${METHOD_COLORS[method]}`}>{method}</span></td>
                            <td className="font-mono text-xs">{pathParts.join(' ')}</td>
                            <td><span className={`badge badge-xs ${val.status < 400 ? 'badge-success' : 'badge-error'}`}>{val.status}</span></td>
                            <td className="text-xs opacity-50">{val.delay}ms</td>
                            <td className="text-xs opacity-50 max-w-[200px] truncate">{val.description}</td>
                            <td className="text-xs font-mono">{val.response?.data?.length || val.response?.total || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Reference ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="section-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Settings2 size={14} className="text-primary" /> Available Resource Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Object.keys(RESOURCE_GENERATORS).map((resource) => {
            const sample = RESOURCE_GENERATORS[resource](1);
            const fields = Object.keys(sample);
            return (
              <div key={resource} className="rounded-lg bg-base-200/40 p-3 hover:bg-base-200/70 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-primary">{resource}</span>
                  <span className="badge badge-ghost badge-xs">{fields.length} fields</span>
                </div>
                <p className="text-[10px] opacity-40 font-mono truncate">
                  {fields.slice(0, 6).join(', ')}{fields.length > 6 ? ', ...' : ''}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
