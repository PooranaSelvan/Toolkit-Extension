import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  KeyRound, Copy, Check, AlertTriangle, ShieldCheck, ShieldX,
  Clock, ChevronDown, Trash2, Info, Eye, EyeOff,
  FileText, RefreshCw, Download, Search,
  History, Edit3, Unlock, Timer, Shield, Layers, X,
  Maximize2, Minimize2, GitCompare, BookOpen, CheckCircle,
  Plus, Hash, Lock, Zap, ArrowRight, Circle,
  CircleCheck, CircleX,
  Sparkles, Code, ListChecks, Building, Clipboard,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ── Reusable inline copy button hook (avoids shared "copied" state collision) ── */
function CopyButton({ text, label = 'Copy', size = 12, className = 'btn btn-ghost btn-xs gap-1' }) {
  const { copied, copyToClipboard } = useCopyToClipboard();
  if (!text) return null;
  return (
    <button onClick={() => copyToClipboard(text)} className={className}>
      {copied ? <Check size={size} className="text-success" /> : <Copy size={size} />}
      <span className="text-xs">{copied ? 'Copied!' : label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════ */
/*                   SAMPLE TOKENS                       */
/* ══════════════════════════════════════════════════════ */
const SAMPLE_TOKENS = [
  {
    name: 'Basic User Token',
    desc: 'HS256 · valid · user role',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsInJvbGUiOiJ1c2VyIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.VbSBMgEccRXPCcRN3DGlXnBGMz-_E-s0GxGxTBKklY8',
  },
  {
    name: 'Admin Token (expired)',
    desc: 'HS256 · expired · admin + permissions',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMiwicm9sZSI6ImFkbWluIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
  },
  {
    name: 'RS256 with Key ID',
    desc: 'Asymmetric · kid header · OpenID scopes',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InJzYS1rZXktMSJ9.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyXzEyMyIsImF1ZCI6ImFwaS5leGFtcGxlLmNvbSIsImV4cCI6MTk5OTk5OTk5OSwiaWF0IjoxNjAwMDAwMDAwLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.signature_placeholder',
  },
  {
    name: 'OAuth2 Access Token',
    desc: 'ES256 · multi-audience · scopes',
    token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6ImVjLWtleS0xIn0.eyJpc3MiOiJodHRwczovL29hdXRoLmV4YW1wbGUuY29tIiwic3ViIjoiY2xpZW50XzQ1NiIsImF1ZCI6WyJhcGkuZXhhbXBsZS5jb20iLCJhcGkyLmV4YW1wbGUuY29tIl0sImV4cCI6MTk5OTk5OTk5OSwiaWF0IjoxNzAwMDAwMDAwLCJzY29wZSI6InJlYWQgd3JpdGUgYWRtaW4iLCJjbGllbnRfaWQiOiJteS1hcHAiLCJqdGkiOiJ1bmlxdWUtdG9rZW4taWQtMTIzIn0.fake_es256_signature_here',
  },
  {
    name: 'Unsigned Token (none)',
    desc: '⚠️ No signature · insecure',
    token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikluc2VjdXJlIFVzZXIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTk5OTk5OTk5OSwicm9sZSI6ImFkbWluIn0.',
  },
];

/* ══════════════════════════════════════════════════════ */
/*                   CORE HELPERS                        */
/* ══════════════════════════════════════════════════════ */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  try { return JSON.parse(atob(base64)); } catch { return null; }
}

function base64UrlEncode(obj) {
  try {
    const json = JSON.stringify(obj);
    // Use TextEncoder instead of deprecated unescape() for proper Unicode handling
    const bytes = new TextEncoder().encode(json);
    const b64 = btoa(String.fromCharCode(...bytes));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch { return null; }
}

function decodeJwt(token) {
  const trimmed = token.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3) return { error: 'Invalid JWT: must have exactly 3 parts (header.payload.signature)' };
  const header = base64UrlDecode(parts[0]);
  if (!header) return { error: 'Invalid JWT header: could not decode base64url' };
  const payload = base64UrlDecode(parts[1]);
  if (!payload) return { error: 'Invalid JWT payload: could not decode base64url' };
  return { header, payload, signature: parts[2], raw: { header: parts[0], payload: parts[1], signature: parts[2] } };
}

function formatTimestamp(ts) {
  if (!ts && ts !== 0) return null;
  const d = new Date(ts * 1000);
  return { utc: d.toUTCString(), local: d.toLocaleString(), iso: d.toISOString(), relative: getRelativeTime(d) };
}

function getRelativeTime(date) {
  const now = new Date();
  const diffMs = date - now;
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs < 0;
  if (absDiff < 60000) return isPast ? 'just now' : 'in a moment';
  if (absDiff < 3600000) { const m = Math.floor(absDiff / 60000); return isPast ? `${m}m ago` : `in ${m}m`; }
  if (absDiff < 86400000) { const h = Math.floor(absDiff / 3600000); return isPast ? `${h}h ago` : `in ${h}h`; }
  const d = Math.floor(absDiff / 86400000);
  return isPast ? `${d}d ago` : `in ${d}d`;
}

function isExpired(payload) {
  if (!payload?.exp) return null;
  return payload.exp * 1000 < Date.now();
}

function getTokenAge(payload) {
  if (!payload?.iat) return null;
  const diffMs = Date.now() - payload.iat * 1000;
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  return `${days}d ${hours}h`;
}

function getTokenLifetime(payload) {
  if (!payload?.iat || !payload?.exp) return null;
  const diff = payload.exp - payload.iat;
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  return `${Math.floor(diff / 86400)}d ${Math.floor((diff % 86400) / 3600)}h`;
}

function getTokenSizeBytes(token) { return new TextEncoder().encode(token).length; }
function formatBytes(bytes) { return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(2)} KB`; }

function getTimeToExpiry(payload) {
  if (!payload?.exp) return null;
  const diff = payload.exp - Math.floor(Date.now() / 1000);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m ${s}s`;
}

/* ── Claim descriptions ── */
const CLAIM_INFO = {
  iss: 'Issuer – Identifies who issued the JWT',
  sub: 'Subject – Identifies the principal subject',
  aud: 'Audience – Recipients the JWT is intended for',
  exp: 'Expiration Time – After this time, the JWT is invalid',
  nbf: 'Not Before – JWT is not valid before this time',
  iat: 'Issued At – Time at which the JWT was issued',
  jti: 'JWT ID – Unique identifier for this JWT',
  scope: 'Scope – Permissions/access levels granted',
  azp: 'Authorized Party – The party the token was issued to',
  nonce: 'Nonce – String value to associate a session with a token',
  auth_time: 'Authentication Time – When end-user authentication occurred',
  at_hash: 'Access Token Hash – Hash of the access token',
  c_hash: 'Code Hash – Hash of the authorization code',
  acr: 'Authentication Context Class Reference',
  amr: 'Authentication Methods References',
  sid: 'Session ID – Identifier for the session',
  client_id: 'Client ID – OAuth client identifier',
  name: 'Full Name – User\'s full name',
  email: 'Email – User\'s email address',
  email_verified: 'Email Verified – Whether the email is verified',
  picture: 'Picture – URL of the user\'s profile picture',
  role: 'Role – User\'s role in the system',
  roles: 'Roles – User\'s assigned roles',
  permissions: 'Permissions – Specific permissions granted',
  groups: 'Groups – Group memberships',
  org_id: 'Organization ID – Organization identifier',
  tenant: 'Tenant – Multi-tenant identifier',
};

const ALGO_INFO = {
  HS256: { name: 'HMAC SHA-256', type: 'Symmetric', strength: 'Good', keySize: '256-bit', family: 'HMAC' },
  HS384: { name: 'HMAC SHA-384', type: 'Symmetric', strength: 'Strong', keySize: '384-bit', family: 'HMAC' },
  HS512: { name: 'HMAC SHA-512', type: 'Symmetric', strength: 'Very Strong', keySize: '512-bit', family: 'HMAC' },
  RS256: { name: 'RSA SHA-256', type: 'Asymmetric', strength: 'Good', keySize: '2048+ bit', family: 'RSA' },
  RS384: { name: 'RSA SHA-384', type: 'Asymmetric', strength: 'Strong', keySize: '2048+ bit', family: 'RSA' },
  RS512: { name: 'RSA SHA-512', type: 'Asymmetric', strength: 'Very Strong', keySize: '2048+ bit', family: 'RSA' },
  ES256: { name: 'ECDSA P-256', type: 'Asymmetric', strength: 'Good', keySize: '256-bit', family: 'ECDSA' },
  ES384: { name: 'ECDSA P-384', type: 'Asymmetric', strength: 'Strong', keySize: '384-bit', family: 'ECDSA' },
  ES512: { name: 'ECDSA P-521', type: 'Asymmetric', strength: 'Very Strong', keySize: '521-bit', family: 'ECDSA' },
  PS256: { name: 'RSA-PSS SHA-256', type: 'Asymmetric', strength: 'Good', keySize: '2048+ bit', family: 'RSA-PSS' },
  PS384: { name: 'RSA-PSS SHA-384', type: 'Asymmetric', strength: 'Strong', keySize: '2048+ bit', family: 'RSA-PSS' },
  PS512: { name: 'RSA-PSS SHA-512', type: 'Asymmetric', strength: 'Very Strong', keySize: '2048+ bit', family: 'RSA-PSS' },
  EdDSA: { name: 'EdDSA (Ed25519)', type: 'Asymmetric', strength: 'Very Strong', keySize: '256-bit', family: 'EdDSA' },
  none: { name: 'None (Unsigned)', type: 'None', strength: '⚠ Insecure', keySize: 'N/A', family: 'None' },
};

const HMAC_ALGOS = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };

/* ── Security audit checks ── */
function runSecurityAudit(header, payload) {
  const issues = [];
  const warnings = [];
  const info = [];

  if (header?.alg === 'none')
    issues.push({ severity: 'critical', message: 'Token uses "none" algorithm — no signature verification', fix: 'Use a secure algorithm like RS256 or ES256' });
  if (header?.alg?.startsWith('HS') && payload?.iss?.startsWith('http'))
    warnings.push({ severity: 'warning', message: 'Symmetric algorithm with public issuer — consider asymmetric signing', fix: 'Switch to RS256 or ES256 for public/multi-service architectures' });
  if (!payload?.exp)
    warnings.push({ severity: 'warning', message: 'No expiration claim (exp) — token never expires', fix: 'Always include an exp claim to limit token lifetime' });
  if (payload?.exp && payload?.iat) {
    const lifetime = payload.exp - payload.iat;
    if (lifetime > 86400 * 30)
      warnings.push({ severity: 'warning', message: `Token lifetime is very long (${Math.floor(lifetime / 86400)} days)`, fix: 'Consider shorter lifetimes with refresh tokens' });
  }
  if (isExpired(payload))
    issues.push({ severity: 'critical', message: 'Token is expired and should not be accepted', fix: 'Obtain a new token from the issuer' });
  if (payload?.nbf && payload.nbf * 1000 > Date.now())
    warnings.push({ severity: 'warning', message: 'Token is not yet valid (nbf is in the future)', fix: 'Wait until the nbf timestamp' });
  if (!payload?.iss) info.push({ severity: 'info', message: 'No issuer claim (iss) — origin cannot be verified', fix: 'Include an iss claim for token provenance' });
  if (!payload?.sub) info.push({ severity: 'info', message: 'No subject claim (sub) — identity not specified', fix: 'Include a sub claim to identify the principal' });
  if (!payload?.aud) info.push({ severity: 'info', message: 'No audience claim (aud) — recipient not restricted', fix: 'Include an aud claim to prevent token misuse' });
  if (!payload?.jti) info.push({ severity: 'info', message: 'No JWT ID (jti) — replay attacks cannot be detected', fix: 'Include jti for uniqueness and replay protection' });
  if (header?.kid) info.push({ severity: 'info', message: `Key ID (kid): "${header.kid}" — supports key rotation` });

  const sensitiveFields = ['password', 'secret', 'ssn', 'credit_card', 'cc_number', 'pin'];
  Object.keys(payload || {}).forEach(k => {
    if (sensitiveFields.includes(k.toLowerCase()))
      issues.push({ severity: 'critical', message: `Sensitive field "${k}" found in payload — JWTs are not encrypted`, fix: 'Never include secrets in JWT payloads. Use JWE for encrypted tokens.' });
  });

  return { issues, warnings, info, score: Math.max(0, 100 - issues.length * 30 - warnings.length * 15 - info.length * 5) };
}

/* ── HMAC Signature Verification via Web Crypto API ── */
async function verifyHmacSignature(token, secret, alg) {
  const hashAlg = HMAC_ALGOS[alg];
  if (!hashAlg) return { verified: false, error: `Unsupported algorithm: ${alg}` };
  try {
    const parts = token.trim().split('.');
    const signingInput = `${parts[0]}.${parts[1]}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: hashAlg }, false, ['sign']);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
    const computedSig = btoa(String.fromCharCode(...new Uint8Array(signatureBytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return { verified: computedSig === parts[2], computed: computedSig };
  } catch (e) {
    return { verified: false, error: e.message };
  }
}

/* ── RFC 7519 Compliance ── */
function checkRfcCompliance(header, payload) {
  const checks = [];
  checks.push({ rule: 'Header "alg" claim present', passed: !!header?.alg, required: true, rfc: '7515 §4.1.1' });
  checks.push({ rule: 'Header "typ" claim present', passed: !!header?.typ, required: false, rfc: '7519 §5.1' });
  if (header?.typ) checks.push({ rule: '"typ" is "JWT" (case-insensitive)', passed: header.typ.toUpperCase() === 'JWT' || header.typ.toLowerCase().includes('jwt'), required: false, rfc: '7519 §5.1' });
  checks.push({ rule: 'Payload is a valid JSON object', passed: typeof payload === 'object' && payload !== null && !Array.isArray(payload), required: true, rfc: '7519 §7.2' });
  checks.push({ rule: '"iss" claim is a string', passed: payload?.iss === undefined || typeof payload?.iss === 'string', required: false, rfc: '7519 §4.1.1' });
  checks.push({ rule: '"sub" claim is a string', passed: payload?.sub === undefined || typeof payload?.sub === 'string', required: false, rfc: '7519 §4.1.2' });
  checks.push({ rule: '"aud" claim is string or array', passed: payload?.aud === undefined || typeof payload?.aud === 'string' || Array.isArray(payload?.aud), required: false, rfc: '7519 §4.1.3' });
  checks.push({ rule: '"exp" claim is a number', passed: payload?.exp === undefined || typeof payload?.exp === 'number', required: false, rfc: '7519 §4.1.4' });
  checks.push({ rule: '"nbf" claim is a number', passed: payload?.nbf === undefined || typeof payload?.nbf === 'number', required: false, rfc: '7519 §4.1.5' });
  checks.push({ rule: '"iat" claim is a number', passed: payload?.iat === undefined || typeof payload?.iat === 'number', required: false, rfc: '7519 §4.1.6' });
  checks.push({ rule: '"jti" claim is a string', passed: payload?.jti === undefined || typeof payload?.jti === 'string', required: false, rfc: '7519 §4.1.7' });
  if (payload?.exp && payload?.iat) checks.push({ rule: '"exp" is after "iat"', passed: payload.exp > payload.iat, required: true, rfc: '7519 §4.1.4' });
  if (payload?.nbf && payload?.iat) checks.push({ rule: '"nbf" is at or after "iat"', passed: payload.nbf >= payload.iat, required: false, rfc: '7519 §4.1.5' });
  const passedCount = checks.filter(c => c.passed).length;
  return { checks, score: Math.round((passedCount / checks.length) * 100) };
}

/* ══════════════════════════════════════════════════════ */
/*            COLLAPSIBLE SECTION WRAPPER                */
/* ══════════════════════════════════════════════════════ */
function CollapsibleSection({ title, icon: Icon, color, badge, badgeClass, actions, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');

  // Recalculate height when open state changes or children update
  useEffect(() => {
    if (open && contentRef.current) {
      const updateHeight = () => {
        setContentHeight(contentRef.current?.scrollHeight ?? 2000);
      };
      updateHeight();
      // Use ResizeObserver to reactively track content size changes
      let observer;
      try {
        observer = new ResizeObserver(updateHeight);
        observer.observe(contentRef.current);
      } catch { /* ResizeObserver not available */ }
      return () => { if (observer) observer.disconnect(); };
    }
  }, [open, children]);

  return (
    <div className="section-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-base-200/40 transition-colors" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}><Icon size={15} className="text-primary-content" /></div>
          <span className="text-sm font-semibold">{title}</span>
          {badge && <span className={`badge badge-xs ${badgeClass || 'badge-ghost'}`}>{badge}</span>}
        </div>
        <div className="flex items-center gap-2">
          {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
          <ChevronDown size={16} className={`opacity-40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>
      <div
        ref={contentRef}
        className="transition-all duration-200 ease-in-out overflow-hidden"
        style={{
          maxHeight: open ? contentHeight + 'px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
/*             JSON SECTION COMPONENT                    */
/* ══════════════════════════════════════════════════════ */
function JsonSection({ title, icon: Icon, color, data, showClaimInfo = false, searchTerm = '' }) {
  const matchesSearch = useCallback((key, value) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return key.toLowerCase().includes(term) || String(value).toLowerCase().includes(term) || (CLAIM_INFO[key]?.toLowerCase().includes(term));
  }, [searchTerm]);

  const filteredEntries = useMemo(() => Object.entries(data).filter(([key, value]) => matchesSearch(key, value)), [data, matchesSearch]);

  return (
    <CollapsibleSection
      title={title}
      icon={Icon}
      color={color}
      badge={`${filteredEntries.length}/${Object.keys(data).length} fields`}
      actions={<CopyButton text={JSON.stringify(data, null, 2)} />}
    >
      <div className="px-5 pb-4 space-y-1">
        {filteredEntries.length === 0 && searchTerm && <p className="text-xs opacity-40 text-center py-4">No matching claims found</p>}
        {filteredEntries.map(([key, value]) => {
          const isTimestamp = ['exp', 'iat', 'nbf', 'auth_time'].includes(key) && typeof value === 'number';
          const formatted = isTimestamp ? formatTimestamp(value) : null;
          const claimDesc = showClaimInfo ? CLAIM_INFO[key] : null;
          return (
            <div key={key} className="group rounded-lg px-3 py-2.5 hover:bg-base-200/60 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-primary">{key}</span>
                    {claimDesc && (
                      <div className="tooltip tooltip-right" data-tip={claimDesc}>
                        <Info size={12} className="opacity-30 hover:opacity-70 transition-opacity cursor-help" />
                      </div>
                    )}
                    <span className="text-[9px] opacity-30 font-mono">{Array.isArray(value) ? 'array' : typeof value}</span>
                  </div>
                  <div className="mt-1">
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">{value.map((v, i) => <span key={i} className="badge badge-sm badge-ghost font-mono">{String(v)}</span>)}</div>
                    ) : typeof value === 'object' && value !== null ? (
                      <pre className="text-xs font-mono opacity-70 whitespace-pre-wrap mt-0.5">{JSON.stringify(value, null, 2)}</pre>
                    ) : typeof value === 'boolean' ? (
                      <span className={`badge badge-sm ${value ? 'badge-success' : 'badge-error'}`}>{String(value)}</span>
                    ) : (
                      <span className="text-sm font-mono opacity-70 break-all">{String(value)}</span>
                    )}
                  </div>
                  {formatted && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="badge badge-xs badge-ghost font-mono gap-1"><Clock size={10} /> {formatted.local}</span>
                      <span className="badge badge-xs badge-ghost">{formatted.relative}</span>
                      {key === 'exp' && !isExpired({ exp: value }) && <span className="badge badge-xs badge-success gap-1"><Timer size={10} /> Expires {formatted.relative}</span>}
                    </div>
                  )}
                </div>
                <CopyButton text={typeof value === 'object' ? JSON.stringify(value) : String(value)} label="" size={11} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

/* ══════════════════════════════════════════════════════ */
/*          TOKEN TIMELINE VISUALIZATION                 */
/* ══════════════════════════════════════════════════════ */
function TokenTimeline({ payload }) {
  const iat = payload?.iat;
  const nbf = payload?.nbf;
  const exp = payload?.exp;
  const now = Math.floor(Date.now() / 1000);

  if (!iat && !exp) return null;

  const points = [];
  if (iat) points.push({ key: 'iat', label: 'Issued', ts: iat, color: 'bg-info' });
  if (nbf && nbf !== iat) points.push({ key: 'nbf', label: 'Not Before', ts: nbf, color: 'bg-warning' });
  points.push({ key: 'now', label: 'Now', ts: now, color: 'bg-primary' });
  if (exp) points.push({ key: 'exp', label: 'Expires', ts: exp, color: isExpired(payload) ? 'bg-error' : 'bg-success' });

  points.sort((a, b) => a.ts - b.ts);

  const minTs = Math.min(...points.map(p => p.ts));
  const maxTs = Math.max(...points.map(p => p.ts));
  // Prevent division by zero and overlapping points when timestamps are identical
  const range = maxTs - minTs || 3600;

  return (
    <CollapsibleSection title="Token Timeline" icon={Clock} color="bg-info" defaultOpen={true}>
      <div className="px-5 pb-5 pt-2">
        <div className="relative h-14 mb-2">
          {/* Track */}
          <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 rounded-full bg-base-200">
            {/* Active segment (iat/nbf to exp) */}
            {iat && exp && (() => {
              const start = ((nbf || iat) - minTs) / range * 100;
              const nowPos = Math.min(((now - minTs) / range * 100), ((exp - minTs) / range * 100));
              const width = nowPos - start;
              return width > 0 ? (
                <div className="absolute top-0 h-full rounded-full bg-success/30" style={{ left: `${start}%`, width: `${Math.max(0, width)}%` }} />
              ) : null;
            })()}
            {/* Expired segment */}
            {exp && now > exp && (() => {
              const expPos = (exp - minTs) / range * 100;
              const nowPos = (now - minTs) / range * 100;
              return (
                <div className="absolute top-0 h-full rounded-full bg-error/25" style={{ left: `${expPos}%`, width: `${nowPos - expPos}%` }} />
              );
            })()}
          </div>

          {/* Points */}
          {points.map(p => {
            const pos = ((p.ts - minTs) / range) * 100;
            const isNow = p.key === 'now';
            return (
              <div key={p.key} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `calc(16px + (100% - 32px) * ${pos / 100})` }}>
                <span className="text-[9px] font-semibold opacity-60 mb-1.5 whitespace-nowrap">{p.label}</span>
                <div className={`w-3.5 h-3.5 rounded-full ${p.color} border-2 border-base-100 shadow-sm ${isNow ? 'ring-2 ring-primary/30 ring-offset-1 ring-offset-base-100' : ''}`} />
                <span className="text-[8px] font-mono opacity-40 mt-1.5 whitespace-nowrap">
                  {p.key === 'now' ? 'current' : new Date(p.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend row */}
        <div className="flex items-center justify-between text-[10px] opacity-50 mt-4 pt-3 border-t border-base-200">
          <span className="font-mono">{iat ? new Date(iat * 1000).toLocaleDateString() : ''}</span>
          {exp && !isExpired(payload) && <span className="text-success font-medium">● Active — {getTimeToExpiry(payload)} remaining</span>}
          {exp && isExpired(payload) && <span className="text-error font-medium">● Expired — {getRelativeTime(new Date(exp * 1000))}</span>}
          <span className="font-mono">{exp ? new Date(exp * 1000).toLocaleDateString() : ''}</span>
        </div>
      </div>
    </CollapsibleSection>
  );
}

/* ══════════════════════════════════════════════════════ */
/*          SIGNATURE VERIFICATION COMPONENT             */
/* ══════════════════════════════════════════════════════ */
function SignatureVerifier({ token, decoded }) {
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const alg = decoded?.header?.alg;
  const isHmac = alg && HMAC_ALGOS[alg];

  // Reset verification result when token changes
  useEffect(() => { setResult(null); }, [token]);

  const handleVerify = useCallback(async () => {
    if (!secret.trim() || !isHmac) return;
    setVerifying(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 200));
    const res = await verifyHmacSignature(token, secret, alg);
    setResult(res);
    setVerifying(false);
  }, [token, secret, alg, isHmac]);

  return (
    <CollapsibleSection title="Signature Verification" icon={Lock} color="bg-blue-600" defaultOpen={true}>
      <div className="px-5 pb-5 space-y-4">
        {isHmac ? (
          <>
            <p className="text-xs opacity-50">
              Verify the {alg} HMAC signature using the Web Crypto API. Enter the shared secret key.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={e => { setSecret(e.target.value); setResult(null); }}
                  placeholder="Enter your secret key..."
                  className="input input-sm w-full font-mono pr-10"
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />
                <button onClick={() => setShowSecret(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs">
                  {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <button onClick={handleVerify} disabled={!secret.trim() || verifying} className="btn btn-sm btn-primary gap-1.5">
                {verifying ? <span className="loading loading-spinner loading-xs" /> : <ShieldCheck size={14} />}
                Verify
              </button>
            </div>
            {result && (
              <div className={`rounded-lg p-4 flex items-start gap-3 border ${result.verified ? 'bg-success/8 border-success/25' : 'bg-error/8 border-error/25'}`}>
                {result.verified ? <CircleCheck size={20} className="text-success shrink-0 mt-0.5" /> : <CircleX size={20} className="text-error shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${result.verified ? 'text-success' : 'text-error'}`}>
                    {result.verified ? 'Signature Valid ✓' : 'Signature Invalid ✗'}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    {result.verified
                      ? 'The HMAC signature matches the provided secret key. This token has not been tampered with.'
                      : result.error
                        ? `Verification error: ${result.error}`
                        : 'The signature does not match. Either the secret is wrong or the token was tampered with.'}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg bg-base-200/50 p-4 text-center">
            <Lock size={20} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs opacity-50">
              {alg === 'none'
                ? 'This token is unsigned (alg: none). No verification possible.'
                : `${alg || 'Unknown'} signature verification requires a public key and is not supported in the browser.`}
            </p>
            {alg && alg !== 'none' && (
              <p className="text-[10px] opacity-35 mt-1">HMAC verification (HS256/384/512) is supported via Web Crypto API.</p>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

/* ══════════════════════════════════════════════════════ */
/*             JWT BUILDER / ENCODER                     */
/* ══════════════════════════════════════════════════════ */
const BUILDER_CLAIM_PRESETS = [
  { key: 'iss', label: 'Issuer', placeholder: 'https://auth.example.com' },
  { key: 'sub', label: 'Subject', placeholder: 'user_123' },
  { key: 'aud', label: 'Audience', placeholder: 'api.example.com' },
  { key: 'name', label: 'Name', placeholder: 'John Doe' },
  { key: 'email', label: 'Email', placeholder: 'john@example.com' },
  { key: 'role', label: 'Role', placeholder: 'admin' },
  { key: 'scope', label: 'Scope', placeholder: 'read write' },
];

function JwtBuilder({ onTokenBuilt }) {
  const [builderAlg, setBuilderAlg] = useState('HS256');
  const [builderSecret, setBuilderSecret] = useState('your-256-bit-secret');
  const [showBuilderSecret, setShowBuilderSecret] = useState(false);
  const [builderClaims, setBuilderClaims] = useState([
    { key: 'sub', value: '1234567890' },
    { key: 'name', value: 'John Doe' },
    { key: 'iat', value: String(Math.floor(Date.now() / 1000)) },
  ]);
  const [expiresIn, setExpiresIn] = useState('1h');
  const [includeExp, setIncludeExp] = useState(true);
  const [includeIat, setIncludeIat] = useState(true);
  const [builderError, setBuilderError] = useState('');
  const [builtToken, setBuiltToken] = useState('');
  const addClaim = useCallback((key = '', value = '') => {
    setBuilderClaims(prev => [...prev, { key, value }]);
  }, []);

  const removeClaim = useCallback((index) => {
    setBuilderClaims(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateClaim = useCallback((index, field, val) => {
    setBuilderClaims(prev => prev.map((c, i) => i === index ? { ...c, [field]: val } : c));
  }, []);

  const parseExpiry = useCallback((str) => {
    const match = str.match(/^(\d+)(s|m|h|d|w)$/);
    if (!match) return null;
    const n = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
    return n * (multipliers[unit] || 0);
  }, []);

  const handleBuild = useCallback(async () => {
    setBuilderError('');
    setBuiltToken('');

    const header = { alg: builderAlg, typ: 'JWT' };
    const payload = {};

    const now = Math.floor(Date.now() / 1000);

    // First, process custom claims so auto-claims don't get overwritten
    for (const claim of builderClaims) {
      const key = claim.key.trim();
      if (!key) continue;
      // Skip iat/exp if they'll be added by checkboxes (avoids duplicates)
      if ((key === 'iat' && includeIat) || (key === 'exp' && includeExp)) continue;
      let val = claim.value;
      try {
        const parsed = JSON.parse(val);
        val = parsed;
      } catch { /* keep as string */ }
      payload[key] = val;
    }

    // Then apply auto-generated timestamps (these take priority)
    if (includeIat) payload.iat = now;
    if (includeExp) {
      const expSecs = parseExpiry(expiresIn);
      if (!expSecs) { setBuilderError(`Invalid expiry format: "${expiresIn}". Use: 30m, 1h, 7d, etc.`); return; }
      payload.exp = now + expSecs;
    }

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    if (!encodedHeader || !encodedPayload) { setBuilderError('Failed to encode header/payload'); return; }

    const signingInput = `${encodedHeader}.${encodedPayload}`;

    if (builderAlg === 'none') {
      setBuiltToken(`${signingInput}.`);
      return;
    }

    const hashAlg = HMAC_ALGOS[builderAlg];
    if (!hashAlg) {
      setBuilderError(`Token building only supports HMAC algorithms (HS256/384/512) and "none". ${builderAlg} requires a private key.`);
      return;
    }

    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', encoder.encode(builderSecret), { name: 'HMAC', hash: hashAlg }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
      const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      setBuiltToken(`${signingInput}.${sigB64}`);
    } catch (e) {
      setBuilderError(`Signing failed: ${e.message}`);
    }
  }, [builderAlg, builderSecret, builderClaims, expiresIn, includeExp, includeIat, parseExpiry]);

  return (
    <div className="space-y-4">
      {/* Algorithm & Secret */}
      <div className="section-card p-5 space-y-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Building size={15} className="text-primary-content" /></div>
          <span className="text-sm font-semibold">Token Configuration</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Algorithm</label>
            <select value={builderAlg} onChange={e => setBuilderAlg(e.target.value)} className="select select-sm w-full">
              <optgroup label="HMAC (Symmetric)">
                <option value="HS256">HS256 — HMAC SHA-256</option>
                <option value="HS384">HS384 — HMAC SHA-384</option>
                <option value="HS512">HS512 — HMAC SHA-512</option>
              </optgroup>
              <optgroup label="RSA (Asymmetric — header only)">
                <option value="RS256">RS256 — RSA SHA-256</option>
                <option value="RS384">RS384 — RSA SHA-384</option>
                <option value="ES256">ES256 — ECDSA P-256</option>
              </optgroup>
              <optgroup label="Insecure">
                <option value="none">none — Unsigned</option>
              </optgroup>
            </select>
          </div>
          {HMAC_ALGOS[builderAlg] && (
            <div>
              <label className="field-label">Secret Key</label>
              <div className="relative">
                <input type={showBuilderSecret ? 'text' : 'password'} value={builderSecret} onChange={e => setBuilderSecret(e.target.value)} className="input input-sm w-full font-mono pr-10" placeholder="your-secret-key" />
                <button onClick={() => setShowBuilderSecret(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs">
                  {showBuilderSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={includeIat} onChange={e => setIncludeIat(e.target.checked)} />
            <span className="text-xs">Include iat (Issued At)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={includeExp} onChange={e => setIncludeExp(e.target.checked)} />
            <span className="text-xs">Include exp (Expiration)</span>
          </label>
          {includeExp && (
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-50">Expires in:</span>
              <input type="text" value={expiresIn} onChange={e => setExpiresIn(e.target.value)} className="input input-xs w-20 font-mono" placeholder="1h" />
              <span className="text-[10px] opacity-35">e.g. 30m, 1h, 7d, 2w</span>
            </div>
          )}
        </div>
      </div>

      {/* Claims */}
      <div className="section-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><ListChecks size={15} className="text-secondary-content" /></div>
            <span className="text-sm font-semibold">Payload Claims</span>
            <span className="badge badge-xs badge-ghost">{builderClaims.length}</span>
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-xs btn-ghost gap-1"><Plus size={12} /> Add Preset</div>
            <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-xl w-48 border border-base-300 max-h-64 overflow-y-auto scrollbar-thin">
              {BUILDER_CLAIM_PRESETS.filter(p => !builderClaims.some(c => c.key === p.key)).map(preset => (
                <li key={preset.key}>
                  <button onClick={(e) => { addClaim(preset.key, preset.placeholder); e.target.closest('.dropdown')?.querySelector('[tabIndex]')?.blur(); }} className="text-xs">
                    <span className="font-mono font-semibold text-primary">{preset.key}</span>
                    <span className="opacity-40">{preset.label}</span>
                  </button>
                </li>
              ))}
              {BUILDER_CLAIM_PRESETS.filter(p => !builderClaims.some(c => c.key === p.key)).length === 0 && (
                <li><span className="text-xs opacity-40 px-3 py-2">All presets added</span></li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          {builderClaims.map((claim, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={claim.key} onChange={e => updateClaim(i, 'key', e.target.value)} className="input input-xs w-28 font-mono" placeholder="key" />
              <span className="opacity-30">:</span>
              <input type="text" value={claim.value} onChange={e => updateClaim(i, 'value', e.target.value)} className="input input-xs flex-1 font-mono" placeholder="value" />
              <button onClick={() => removeClaim(i)} className="btn btn-ghost btn-xs text-error"><X size={12} /></button>
            </div>
          ))}
        </div>

        <button onClick={() => addClaim('', '')} className="btn btn-xs btn-ghost gap-1 w-full border border-dashed border-base-300">
          <Plus size={12} /> Add Custom Claim
        </button>
      </div>

      {/* Build button */}
      <div className="flex items-center gap-2">
        <button onClick={handleBuild} className="btn btn-sm btn-primary gap-1.5">
          <Zap size={14} /> Build Token
        </button>
        {builtToken && (
          <button onClick={() => onTokenBuilt(builtToken)} className="btn btn-sm btn-outline gap-1.5">
            <ArrowRight size={14} /> Load in Decoder
          </button>
        )}
      </div>

      {builderError && (
        <div className="alert alert-error py-2"><AlertTriangle size={14} /><span className="text-xs">{builderError}</span></div>
      )}

      {builtToken && (
        <div className="section-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-60">Generated Token</span>
            <CopyButton text={builtToken} />
          </div>
          <div className="p-3 rounded-lg bg-base-200/50 font-mono text-xs break-all leading-relaxed">
            {(() => {
              const parts = builtToken.split('.');
              return (
                <>
                  <span className="text-error">{parts[0]}</span><span className="opacity-40">.</span>
                  <span className="text-primary">{parts[1]}</span><span className="opacity-40">.</span>
                  <span className="text-success">{parts[2]}</span>
                </>
              );
            })()}
          </div>
          <span className="text-[10px] opacity-40">{formatBytes(getTokenSizeBytes(builtToken))} · {builtToken.split('.').length} parts</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
/*            PAYLOAD EDITOR COMPONENT                   */
/* ══════════════════════════════════════════════════════ */
function PayloadEditor({ decoded, onTokenRebuilt }) {
  const [editJson, setEditJson] = useState('');
  const [editError, setEditError] = useState('');
  const [editTarget, setEditTarget] = useState('payload');
  const [isDirty, setIsDirty] = useState(false);

  // Only sync from decoded when user hasn't made local edits, or when switching tabs
  const lastTarget = useRef(editTarget);
  const lastToken = useRef(decoded?.raw?.header + decoded?.raw?.payload);

  useEffect(() => {
    const currentTokenKey = decoded?.raw?.header + decoded?.raw?.payload;
    const targetChanged = lastTarget.current !== editTarget;
    const tokenChanged = lastToken.current !== currentTokenKey;

    if (decoded && !decoded.error && (!isDirty || targetChanged || tokenChanged)) {
      setEditJson(JSON.stringify(editTarget === 'header' ? decoded.header : decoded.payload, null, 2));
      setEditError('');
      setIsDirty(false);
      lastTarget.current = editTarget;
      lastToken.current = currentTokenKey;
    }
  }, [decoded, editTarget, isDirty]);

  const handleRebuild = useCallback(() => {
    try {
      const parsed = JSON.parse(editJson);
      const newHeader = editTarget === 'header' ? parsed : decoded.header;
      const newPayload = editTarget === 'payload' ? parsed : decoded.payload;
      const encodedHeader = base64UrlEncode(newHeader);
      const encodedPayload = base64UrlEncode(newPayload);
      if (!encodedHeader || !encodedPayload) { setEditError('Failed to encode JSON'); return; }
      onTokenRebuilt(`${encodedHeader}.${encodedPayload}.${decoded.signature}`);
      setEditError('');
    } catch (e) { setEditError(`Invalid JSON: ${e.message}`); }
  }, [editJson, editTarget, decoded, onTokenRebuilt]);

  if (!decoded || decoded.error) return null;

  return (
    <div className="section-card overflow-hidden">
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-base-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center"><Edit3 size={15} className="text-warning-content" /></div>
          <span className="text-sm font-semibold">Payload Editor</span>
          <span className="badge badge-warning badge-xs">Experimental</span>
        </div>
        <div className="tabs tabs-box tabs-xs">
          <button className={`tab ${editTarget === 'header' ? 'tab-active' : ''}`} onClick={() => setEditTarget('header')}>Header</button>
          <button className={`tab ${editTarget === 'payload' ? 'tab-active' : ''}`} onClick={() => setEditTarget('payload')}>Payload</button>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <textarea value={editJson} onChange={(e) => { setEditJson(e.target.value); setEditError(''); setIsDirty(true); }} className="textarea w-full font-mono text-xs leading-relaxed" rows={8} spellCheck={false} />
        {editError && <p className="text-xs text-error flex items-center gap-1.5"><AlertTriangle size={12} /> {editError}</p>}
        <div className="flex items-center gap-2">
          <button onClick={handleRebuild} className="btn btn-sm btn-warning gap-1.5"><RefreshCw size={14} /> Rebuild Token</button>
          <CopyButton text={editJson} label="Copy JSON" size={14} className="btn btn-sm btn-ghost gap-1.5" />
        </div>
        <p className="text-[10px] opacity-40 flex items-center gap-1"><AlertTriangle size={10} /> Rebuilding modifies the unsigned payload. The original signature will no longer be valid.</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
/*            TOKEN COMPARE COMPONENT                    */
/* ══════════════════════════════════════════════════════ */
function TokenCompare({ primaryDecoded }) {
  const [compareToken, setCompareToken] = useState('');
  const compareDecoded = useMemo(() => {
    const trimmed = compareToken.trim();
    if (!trimmed) return null;
    // Strip "Bearer " prefix if present
    const cleaned = trimmed.replace(/^Bearer\s+/i, '');
    return decodeJwt(cleaned);
  }, [compareToken]);

  const differences = useMemo(() => {
    if (!primaryDecoded || primaryDecoded.error || !compareDecoded || compareDecoded.error) return null;
    const diffs = { header: [], payload: [] };
    const allHeaderKeys = new Set([...Object.keys(primaryDecoded.header), ...Object.keys(compareDecoded.header)]);
    allHeaderKeys.forEach(key => {
      if (JSON.stringify(primaryDecoded.header[key]) !== JSON.stringify(compareDecoded.header[key]))
        diffs.header.push({ key, left: primaryDecoded.header[key], right: compareDecoded.header[key] });
    });
    const allPayloadKeys = new Set([...Object.keys(primaryDecoded.payload), ...Object.keys(compareDecoded.payload)]);
    allPayloadKeys.forEach(key => {
      if (JSON.stringify(primaryDecoded.payload[key]) !== JSON.stringify(compareDecoded.payload[key]))
        diffs.payload.push({ key, left: primaryDecoded.payload[key], right: compareDecoded.payload[key] });
    });
    return diffs;
  }, [primaryDecoded, compareDecoded]);

  return (
    <div className="section-card overflow-hidden">
      <div className="px-5 py-3.5 flex items-center gap-2.5 border-b border-base-200">
        <div className="w-8 h-8 rounded-lg bg-info flex items-center justify-center"><GitCompare size={15} className="text-info-content" /></div>
        <span className="text-sm font-semibold">Token Comparison</span>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="field-label">Paste second token to compare</label>
          <textarea value={compareToken} onChange={(e) => setCompareToken(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..." rows={3} className="textarea w-full font-mono text-xs" spellCheck={false} />
        </div>
        {compareDecoded?.error && <div className="alert alert-error py-2"><AlertTriangle size={14} /> <span className="text-xs">{compareDecoded.error}</span></div>}
        {differences && (
          <div className="space-y-3">
            <div className="flex items-center gap-2"><Hash size={14} className="text-info" /><span className="text-xs font-semibold">{differences.header.length + differences.payload.length} difference(s) found</span></div>
            {['header', 'payload'].map(section => differences[section].length > 0 && (
              <div key={section} className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-50">{section}</span>
                {differences[section].map(({ key, left, right }) => (
                  <div key={key} className="rounded-lg bg-base-200/50 p-3 space-y-1.5">
                    <span className="font-mono text-xs font-semibold text-primary">{key}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded bg-error/10 p-2"><span className="text-[10px] opacity-50 block mb-1">Token 1</span><span className="font-mono text-xs break-all">{left === undefined ? '—' : JSON.stringify(left)}</span></div>
                      <div className="rounded bg-success/10 p-2"><span className="text-[10px] opacity-50 block mb-1">Token 2</span><span className="font-mono text-xs break-all">{right === undefined ? '—' : JSON.stringify(right)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {differences.header.length + differences.payload.length === 0 && (
              <div className="text-center py-4"><CheckCircle size={20} className="text-success mx-auto mb-2" /><p className="text-xs opacity-50">Tokens are identical (header + payload)</p></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
/*          SECURITY AUDIT COMPONENT                     */
/* ══════════════════════════════════════════════════════ */
function SecurityAudit({ header, payload }) {
  const audit = useMemo(() => runSecurityAudit(header, payload), [header, payload]);
  const scoreColor = audit.score >= 80 ? 'text-success' : audit.score >= 50 ? 'text-warning' : 'text-error';
  const scoreBg = audit.score >= 80 ? 'bg-success/10' : audit.score >= 50 ? 'bg-warning/10' : 'bg-error/10';
  const scoreBarColor = audit.score >= 80 ? 'bg-success' : audit.score >= 50 ? 'bg-warning' : 'bg-error';

  const statusBadges = (
    <div className="flex items-center gap-1.5">
      {audit.issues.length > 0 && <span className="badge badge-xs badge-error">{audit.issues.length} critical</span>}
      {audit.warnings.length > 0 && <span className="badge badge-xs badge-warning">{audit.warnings.length} warnings</span>}
      {audit.info.length > 0 && <span className="badge badge-xs badge-info">{audit.info.length} info</span>}
    </div>
  );

  return (
    <CollapsibleSection
      title="Security Audit"
      icon={Shield}
      color="bg-secondary"
      actions={
        <div className="flex items-center gap-3">
          {statusBadges}
          <div className={`${scoreBg} px-3 py-1 rounded-lg`}><span className={`text-sm font-bold ${scoreColor}`}>{audit.score}/100</span></div>
        </div>
      }
      defaultOpen={false}
    >
      <div className="px-5 pb-4 space-y-2">
        <div className="h-2 rounded-full bg-base-200 overflow-hidden mb-3">
          <div className={`h-full rounded-full ${scoreBarColor} transition-all duration-700`} style={{ width: `${audit.score}%` }} />
        </div>
        {[...audit.issues, ...audit.warnings, ...audit.info].map((item, i) => (
          <div key={i} className={`rounded-lg p-3 flex items-start gap-3 ${item.severity === 'critical' ? 'bg-error/8 border border-error/20' : item.severity === 'warning' ? 'bg-warning/8 border border-warning/20' : 'bg-info/8 border border-info/20'}`}>
            {item.severity === 'critical' ? <ShieldX size={16} className="text-error shrink-0 mt-0.5" /> : item.severity === 'warning' ? <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" /> : <Info size={16} className="text-info shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{item.message}</p>
              {item.fix && <p className="text-[10px] opacity-50 mt-1">💡 {item.fix}</p>}
            </div>
          </div>
        ))}
        {audit.issues.length === 0 && audit.warnings.length === 0 && (
          <div className="text-center py-4"><ShieldCheck size={24} className="text-success mx-auto mb-2" /><p className="text-xs opacity-60 font-medium">No critical issues or warnings detected</p></div>
        )}
      </div>
    </CollapsibleSection>
  );
}

/* ══════════════════════════════════════════════════════ */
/*          RFC 7519 COMPLIANCE COMPONENT                */
/* ══════════════════════════════════════════════════════ */
function RfcCompliance({ header, payload }) {
  const compliance = useMemo(() => checkRfcCompliance(header, payload), [header, payload]);
  const scoreColor = compliance.score >= 90 ? 'text-success' : compliance.score >= 70 ? 'text-warning' : 'text-error';

  return (
    <CollapsibleSection
      title="RFC 7519 Compliance"
      icon={ListChecks}
      color="bg-violet-600"
      badge={`${compliance.score}%`}
      badgeClass={compliance.score >= 90 ? 'badge-success' : compliance.score >= 70 ? 'badge-warning' : 'badge-error'}
      defaultOpen={false}
    >
      <div className="px-5 pb-4 space-y-1.5">
        {compliance.checks.map((check, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-base-200/40 transition-colors">
            {check.passed
              ? <CircleCheck size={14} className="text-success shrink-0" />
              : check.required
                ? <CircleX size={14} className="text-error shrink-0" />
                : <Circle size={14} className="text-warning shrink-0" />
            }
            <span className="text-xs flex-1">{check.rule}</span>
            <span className="text-[9px] font-mono opacity-30">{check.rfc}</span>
            {check.required && <span className="badge badge-xs badge-ghost">required</span>}
          </div>
        ))}
        <div className="pt-3 mt-2 border-t border-base-200 flex items-center justify-between">
          <span className="text-xs opacity-50">Overall compliance</span>
          <span className={`text-sm font-bold ${scoreColor}`}>{compliance.score}%</span>
        </div>
      </div>
    </CollapsibleSection>
  );
}

/* ══════════════════════════════════════════════════════ */
/*           TOKEN HISTORY COMPONENT                     */
/* ══════════════════════════════════════════════════════ */
function TokenHistory({ history, onLoad, onClear }) {
  if (history.length === 0) return null;

  return (
    <CollapsibleSection
      title="Recent Tokens"
      icon={History}
      color="bg-accent"
      badge={String(history.length)}
      actions={<button onClick={onClear} className="btn btn-ghost btn-xs btn-error gap-1"><Trash2 size={12} /> Clear</button>}
      defaultOpen={false}
    >
      <div className="px-5 pb-4 space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin">
        {history.map((item, i) => (
          <button key={i} onClick={() => onLoad(item.token)} className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-base-200/60 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`badge badge-xs ${item.expired ? 'badge-error' : 'badge-success'}`}>{item.alg || '?'}</span>
                <span className="text-xs font-mono truncate opacity-70">{item.sub || item.name || 'Unknown'}</span>
              </div>
              <span className="text-[10px] opacity-30 shrink-0">{item.timestamp}</span>
            </div>
          </button>
        ))}
      </div>
    </CollapsibleSection>
  );
}

/* ══════════════════════════════════════════════════════ */
/*           EXPIRY COUNTDOWN COMPONENT                  */
/* ══════════════════════════════════════════════════════ */
function ExpiryCountdown({ payload }) {
  const [timeLeft, setTimeLeft] = useState(getTimeToExpiry(payload));
  const [justExpired, setJustExpired] = useState(false);

  useEffect(() => {
    if (!payload?.exp) return;
    // Update immediately
    setTimeLeft(getTimeToExpiry(payload));
    setJustExpired(false);

    if (isExpired(payload)) return;

    const interval = setInterval(() => {
      const remaining = getTimeToExpiry(payload);
      setTimeLeft(remaining);
      if (!remaining) {
        setJustExpired(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [payload]);

  // Don't render if no exp or already expired on mount (and not just-expired during countdown)
  if (!payload?.exp) return null;
  if (isExpired(payload) && !justExpired) return null;

  if (justExpired) {
    return (
      <div className="alert border-error/20 bg-error/5">
        <ShieldX size={18} className="text-error" />
        <div>
          <p className="font-semibold text-sm text-error">Token Just Expired!</p>
          <p className="text-xs opacity-50 mt-0.5">Expired at {formatTimestamp(payload.exp)?.local}. Refresh or obtain a new token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert border-success/20 bg-success/5">
      <Timer size={18} className="text-success" />
      <div>
        <p className="font-semibold text-sm text-success">Token Active — Expires in {timeLeft}</p>
        <p className="text-xs opacity-50 mt-0.5">Live countdown · Expiration: {formatTimestamp(payload.exp)?.local}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
/*           MAIN: JWT DECODER COMPONENT                 */
/* ══════════════════════════════════════════════════════ */
export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('decode');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedView, setExpandedView] = useState(false);
  const [tokenHistory, setTokenHistory] = useLocalStorage('jwt-decoder-history', []);
  const [pasteError, setPasteError] = useState('');
  const textareaRef = useRef(null);

  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return null;
    // Strip "Bearer " prefix if present
    const cleaned = trimmed.replace(/^Bearer\s+/i, '');
    return decodeJwt(cleaned);
  }, [token]);
  const expired = useMemo(() => decoded && !decoded.error ? isExpired(decoded.payload) : null, [decoded]);
  const tokenAge = useMemo(() => decoded && !decoded.error ? getTokenAge(decoded.payload) : null, [decoded]);
  const tokenLifetime = useMemo(() => decoded && !decoded.error ? getTokenLifetime(decoded.payload) : null, [decoded]);
  const algoInfo = useMemo(() => decoded && !decoded.error ? (ALGO_INFO[decoded.header?.alg] || null) : null, [decoded]);
  const tokenSize = useMemo(() => token.trim() ? getTokenSizeBytes(token) : null, [token]);

  // Save to history — keyed on decoded signature to avoid redundant saves from whitespace changes
  const lastSavedSig = useRef('');
  useEffect(() => {
    if (decoded && !decoded.error && decoded.signature !== lastSavedSig.current) {
      lastSavedSig.current = decoded.signature;
      const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
      const entry = { token: cleanToken, alg: decoded.header?.alg, sub: decoded.payload?.sub, name: decoded.payload?.name, expired: isExpired(decoded.payload), timestamp: new Date().toLocaleTimeString() };
      setTokenHistory(prev => { if (prev.find(h => h.token === entry.token)) return prev; return [entry, ...prev].slice(0, 20); });
    }
  }, [decoded, token, setTokenHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setToken('');
        setSearchTerm('');
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClear = useCallback(() => { setToken(''); setSearchTerm(''); setPasteError(''); textareaRef.current?.focus(); }, []);
  const handleLoadSample = useCallback((sampleToken) => { setToken(sampleToken); setActiveTab('decode'); setPasteError(''); }, []);
  const handleTokenRebuilt = useCallback((newToken) => { setToken(newToken); setActiveTab('decode'); setPasteError(''); }, []);
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      setPasteError('');
      // navigator.clipboard.readText() is not available in VS Code webview
      // due to security restrictions. Use the Clipboard API with fallback.
      if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const text = await navigator.clipboard.readText();
        if (text) { setToken(text); return; }
        else { setPasteError('Clipboard is empty'); return; }
      }
      // Clipboard API not available (e.g., VS Code webview)
      setPasteError('Use Ctrl+V / Cmd+V to paste (direct clipboard access is restricted in this environment).');
    } catch {
      setPasteError('Use Ctrl+V / Cmd+V to paste (direct clipboard access is restricted in this environment).');
    }
  }, []);

  const handleExportDecoded = useCallback(() => {
    if (!decoded || decoded.error) return;
    try {
      const blob = new Blob([JSON.stringify({
        header: decoded.header,
        payload: decoded.payload,
        signature: decoded.signature,
        metadata: {
          algorithm: decoded.header?.alg,
          algorithmInfo: ALGO_INFO[decoded.header?.alg] || null,
          expired: isExpired(decoded.payload),
          tokenAge: getTokenAge(decoded.payload),
          tokenLifetime: getTokenLifetime(decoded.payload),
          sizeBytes: getTokenSizeBytes(token),
          securityAudit: runSecurityAudit(decoded.header, decoded.payload),
          rfcCompliance: checkRfcCompliance(decoded.header, decoded.payload),
          decodedAt: new Date().toISOString(),
        }
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `jwt-decoded-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
    } catch (err) {
      console.error('JWT export failed:', err);
    }
  }, [decoded, token]);

const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          let text = ev.target?.result?.trim();
          if (text) {
            text = text.replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
            setToken(text);
          }
        } catch (err) {
          console.error('Failed to process JWT file:', err);
        }
      };
      reader.onerror = () => {
        console.error('Failed to read JWT file:', reader.error?.message || 'Unknown error');
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('JWT file upload failed:', err);
    }
    e.target.value = '';
  }, []);
  const coloredParts = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    return parts.length === 3 ? { header: parts[0], payload: parts[1], signature: parts[2] } : null;
  }, [token]);

  const TABS = [
    { id: 'decode', label: 'Decode', icon: Unlock },
    { id: 'verify', label: 'Verify', icon: ShieldCheck },
    { id: 'editor', label: 'Editor', icon: Edit3 },
    { id: 'builder', label: 'Builder', icon: Zap },
    { id: 'compare', label: 'Compare', icon: GitCompare },
  ];

  return (
    <div className={`mx-auto space-y-6 ${expandedView ? 'max-w-6xl' : 'max-w-4xl'}`}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><KeyRound size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">JWT Decoder & Builder</h1>
            <p className="text-xs opacity-50 mt-0.5">Decode, verify, build, audit & compare JSON Web Tokens</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePasteFromClipboard} className="btn btn-sm btn-ghost gap-1.5"><Clipboard size={14} /> Paste</button>
          <label className="btn btn-sm btn-ghost gap-1.5 cursor-pointer">
            <FileText size={14} /> File
            <input type="file" accept=".txt,.jwt,.token" className="hidden" onChange={handleFileUpload} />
          </label>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline gap-2"><Sparkles size={14} /> Samples</div>
            <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-xl w-64 border border-base-300">
              {SAMPLE_TOKENS.map((s) => (
                <li key={s.name}><button onClick={(e) => { handleLoadSample(s.token); e.target.closest('.dropdown')?.querySelector('[tabIndex]')?.blur(); }} className="flex flex-col items-start gap-0.5 py-2"><span className="text-xs font-medium">{s.name}</span><span className="text-[10px] opacity-40">{s.desc}</span></button></li>
              ))}
            </ul>
          </div>
          {decoded && !decoded.error && (
            <>
              <button onClick={handleExportDecoded} className="btn btn-sm btn-ghost gap-1.5"><Download size={14} /> Export</button>
              <button onClick={() => setExpandedView(v => !v)} className="btn btn-sm btn-ghost gap-1.5">{expandedView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
            </>
          )}
          {token && <button onClick={handleClear} className="btn btn-sm btn-ghost btn-error gap-1.5"><Trash2 size={14} /> Clear</button>}
        </div>
      </div>

      {/* ── Tab Navigation (always visible) ── */}
      <div className="tabs tabs-box tabs-sm">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab gap-1.5 ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Token Input (shown for decode/verify/editor/compare tabs) ── */}
      {activeTab !== 'builder' && (
        <div className="section-card p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="field-label mb-0">Paste JWT Token</label>
            <div className="flex items-center gap-3">
              {tokenSize && <span className="text-[10px] opacity-40 font-mono">{formatBytes(tokenSize)} · {token.trim().split('.').length} parts</span>}
              <kbd className="kbd kbd-xs opacity-30">Ctrl+K clear</kbd>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={token}
            onChange={(e) => { setToken(e.target.value); setPasteError(''); }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkw..."
            rows={4}
            className="textarea w-full font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
          {pasteError && (
            <p className="text-xs text-warning flex items-center gap-1.5 mt-2"><AlertTriangle size={12} /> {pasteError}</p>
          )}
          {coloredParts && !decoded?.error && (
            <div className="mt-3 p-3 rounded-lg bg-base-200/50 font-mono text-xs break-all leading-relaxed">
              <span className="text-error font-medium">{coloredParts.header}</span><span className="opacity-40">.</span>
              <span className="text-primary font-medium">{coloredParts.payload}</span><span className="opacity-40">.</span>
              <span className="text-success font-medium">{coloredParts.signature}</span>
              <div className="flex gap-4 mt-2 pt-2 border-t border-base-300">
                <span className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full bg-error" /> Header ({coloredParts.header.length})</span>
                <span className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full bg-primary" /> Payload ({coloredParts.payload.length})</span>
                <span className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full bg-success" /> Signature ({coloredParts.signature.length})</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {decoded?.error && activeTab !== 'builder' && (
        <div className="alert alert-error"><AlertTriangle size={18} /><span className="text-sm font-medium">{decoded.error}</span></div>
      )}

      {/* ══ TAB: DECODE ══ */}
      {activeTab === 'decode' && decoded && !decoded.error && (
        <div className="space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`section-card p-4 ${expired === true ? 'border-error/30' : expired === false ? 'border-success/30' : ''}`}>
              <div className="flex items-center gap-2 mb-1.5">
                {expired === true ? <ShieldX size={16} className="text-error" /> : expired === false ? <ShieldCheck size={16} className="text-success" /> : <Clock size={16} className="opacity-40" />}
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Status</span>
              </div>
              <span className={`text-sm font-bold ${expired === true ? 'text-error' : expired === false ? 'text-success' : 'opacity-50'}`}>{expired === true ? 'Expired' : expired === false ? 'Valid' : 'No expiry'}</span>
            </div>
            <div className="section-card p-4"><div className="flex items-center gap-2 mb-1.5"><KeyRound size={16} className="text-primary" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Algorithm</span></div><span className="text-sm font-bold">{decoded.header?.alg || '?'}</span></div>
            <div className="section-card p-4"><div className="flex items-center gap-2 mb-1.5"><FileText size={16} className="text-secondary" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Type</span></div><span className="text-sm font-bold">{decoded.header?.typ || 'N/A'}</span></div>
            <div className="section-card p-4"><div className="flex items-center gap-2 mb-1.5"><Clock size={16} className="text-warning" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Age</span></div><span className="text-sm font-bold">{tokenAge || 'N/A'}</span></div>
            <div className="section-card p-4"><div className="flex items-center gap-2 mb-1.5"><Timer size={16} className="text-info" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Lifetime</span></div><span className="text-sm font-bold">{tokenLifetime || 'N/A'}</span></div>
            <div className="section-card p-4"><div className="flex items-center gap-2 mb-1.5"><Layers size={16} className="text-accent" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Size</span></div><span className="text-sm font-bold">{tokenSize ? formatBytes(tokenSize) : 'N/A'}</span></div>
          </div>

          {/* Expiry Countdown */}
          <ExpiryCountdown payload={decoded.payload} />

          {/* Algorithm Info Bar */}
          {algoInfo && (
            <div className="section-card px-5 py-3.5 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold opacity-60">Algorithm:</span>
              <span className="badge badge-sm badge-primary">{algoInfo.name}</span>
              <span className="badge badge-sm badge-ghost">{algoInfo.type}</span>
              <span className={`badge badge-sm ${algoInfo.strength === '⚠ Insecure' ? 'badge-error' : 'badge-success'}`}>{algoInfo.strength}</span>
              <span className="badge badge-sm badge-ghost">{algoInfo.keySize}</span>
              <span className="badge badge-sm badge-ghost">Family: {algoInfo.family}</span>
              {decoded.header?.kid && <span className="badge badge-sm badge-info gap-1"><Code size={10} /> kid: {decoded.header.kid}</span>}
            </div>
          )}

          {/* Token Timeline */}
          <TokenTimeline payload={decoded.payload} />

          {/* Claim Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search claims (e.g. email, exp, role...)" className="input input-sm w-full pl-9 font-mono" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"><X size={12} /></button>}
          </div>

          {/* Security Audit */}
          <SecurityAudit header={decoded.header} payload={decoded.payload} />

          {/* RFC Compliance */}
          <RfcCompliance header={decoded.header} payload={decoded.payload} />

          {/* Header & Payload Sections */}
          <JsonSection title="Header" icon={KeyRound} color="bg-error" data={decoded.header} searchTerm={searchTerm} />
          <JsonSection title="Payload" icon={FileText} color="bg-primary" data={decoded.payload} showClaimInfo searchTerm={searchTerm} />

          {/* Signature Section */}
          <CollapsibleSection
            title="Signature"
            icon={Lock}
            color="bg-success"
            badge={decoded.signature ? `${decoded.signature.length} chars` : 'empty'}
            defaultOpen={false}
            actions={decoded.signature ? <CopyButton text={decoded.signature} /> : null}
          >
            <div className="px-5 pb-4">
              <div className="p-3 rounded-lg bg-base-200/50 font-mono text-xs break-all leading-relaxed opacity-70">{decoded.signature || '(empty — unsigned token)'}</div>
              <p className="text-[10px] opacity-40 mt-2 flex items-center gap-1"><Info size={10} /> Use the "Verify" tab to check HMAC signatures with a secret key.</p>
            </div>
          </CollapsibleSection>

          {/* Copy Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <CopyButton text={JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2)} label="Copy Decoded JSON" size={14} className="btn btn-sm btn-outline gap-1.5" />
            <CopyButton text={token.trim().replace(/^Bearer\s+/i, '')} label="Copy Raw Token" size={14} className="btn btn-sm btn-ghost gap-1.5" />
          </div>

          {/* Warnings */}
          {decoded.header?.alg === 'none' && (
            <div className="alert alert-error"><AlertTriangle size={18} /><div><p className="font-semibold text-sm">Security Warning: Unsigned Token</p><p className="text-xs opacity-70 mt-0.5">This token uses "none" algorithm and has no signature. It should never be trusted in production.</p></div></div>
          )}
          {expired === true && (
            <div className="alert alert-warning"><Clock size={18} /><div><p className="font-semibold text-sm">Token Expired</p><p className="text-xs opacity-70 mt-0.5">Expired on {formatTimestamp(decoded.payload.exp)?.local}. It should no longer be accepted by servers.</p></div></div>
          )}
        </div>
      )}

      {/* ══ TAB: VERIFY ══ */}
      {activeTab === 'verify' && decoded && !decoded.error && (
        <SignatureVerifier token={token.trim()} decoded={decoded} />
      )}
      {activeTab === 'verify' && (!decoded || decoded?.error) && (
        <div className="section-card p-8 text-center">
          <Lock size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm opacity-50">Paste a valid JWT token above to verify its signature</p>
        </div>
      )}

      {/* ══ TAB: EDITOR ══ */}
      {activeTab === 'editor' && decoded && !decoded.error && (
        <PayloadEditor decoded={decoded} onTokenRebuilt={handleTokenRebuilt} />
      )}
      {activeTab === 'editor' && (!decoded || decoded?.error) && (
        <div className="section-card p-8 text-center">
          <Edit3 size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm opacity-50">Paste a valid JWT token above to edit its payload</p>
        </div>
      )}

      {/* ══ TAB: BUILDER ══ */}
      {activeTab === 'builder' && (
        <JwtBuilder onTokenBuilt={handleTokenRebuilt} />
      )}

      {/* ══ TAB: COMPARE ══ */}
      {activeTab === 'compare' && decoded && !decoded.error && (
        <TokenCompare primaryDecoded={decoded} />
      )}
      {activeTab === 'compare' && (!decoded || decoded?.error) && (
        <div className="section-card p-8 text-center">
          <GitCompare size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm opacity-50">Paste a valid JWT token above to compare with another token</p>
        </div>
      )}

      {/* ── Token History ── */}
      <TokenHistory history={tokenHistory} onLoad={handleLoadSample} onClear={() => setTokenHistory([])} />

      {/* ── Empty State (only on non-builder tabs with no token) ── */}
      {!token.trim() && activeTab !== 'builder' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4"><KeyRound size={28} className="opacity-30" /></div>
          <p className="text-sm font-medium opacity-50 mb-1">Paste a JWT token above to decode it</p>
          <p className="text-xs opacity-30 mb-6">Or try a sample token, or build one from scratch</p>
          <div className="max-w-lg mx-auto text-left section-card p-5">
            <h3 className="text-xs font-semibold flex items-center gap-2 mb-3"><BookOpen size={13} className="text-primary" /> JWT Quick Reference</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Structure', value: 'header.payload.signature (base64url encoded)' },
                { label: 'Header', value: 'Algorithm (alg) + Token type (typ) + optional kid' },
                { label: 'Payload', value: 'Registered claims (iss, sub, aud, exp, iat, jti) + custom claims' },
                { label: 'Signature', value: 'HMAC or RSA/ECDSA/EdDSA of header + payload' },
                { label: 'RFC', value: 'RFC 7519 (JWT) · RFC 7515 (JWS) · RFC 7516 (JWE)' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2 text-xs">
                  <span className="font-mono font-bold text-primary shrink-0 w-20">{item.label}</span>
                  <span className="opacity-50">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="separator my-4" />
            <h3 className="text-xs font-semibold flex items-center gap-2 mb-3"><Zap size={13} className="text-warning" /> Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Unlock, label: 'Decode & inspect' },
                { icon: ShieldCheck, label: 'HMAC verify' },
                { icon: Zap, label: 'Build tokens' },
                { icon: Edit3, label: 'Edit payloads' },
                { icon: GitCompare, label: 'Compare tokens' },
                { icon: Shield, label: 'Security audit' },
                { icon: ListChecks, label: 'RFC compliance' },
                { icon: Clock, label: 'Token timeline' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 text-xs opacity-50">
                  <f.icon size={11} className="text-primary" />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
