import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const LANGUAGES = [
  { key: 'curl', label: 'cURL' },
  { key: 'javascript', label: 'JavaScript (fetch)' },
  { key: 'axios', label: 'JavaScript (axios)' },
  { key: 'python', label: 'Python (requests)' },
  { key: 'node', label: 'Node.js (http)' },
  { key: 'php', label: 'PHP (cURL)' },
];

function generateCode(language, request) {
  const headers = {};
  (request.headers || []).forEach(({ key, value, enabled }) => {
    if (key.trim() && enabled !== false) headers[key.trim()] = value;
  });

  const params = {};
  (request.params || []).forEach(({ key, value, enabled }) => {
    if (key.trim() && enabled !== false) params[key.trim()] = value;
  });

  if (request.auth?.type === 'bearer' && request.auth.token) {
    headers['Authorization'] = `Bearer ${request.auth.token}`;
  } else if (request.auth?.type === 'basic' && request.auth.username) {
    headers['Authorization'] = `Basic ${btoa(`${request.auth.username}:${request.auth.password}`)}`;
  } else if (request.auth?.type === 'apikey' && request.auth.token) {
    headers['X-API-Key'] = request.auth.token;
  }

  const qs = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const fullUrl = qs ? `${request.url}?${qs}` : request.url;
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(request.method) && request.body?.trim();

  switch (language) {
    case 'curl': {
      let cmd = `curl -X ${request.method} '${fullUrl}'`;
      Object.entries(headers).forEach(([k, v]) => { cmd += ` \\\n  -H '${k}: ${v}'`; });
      if (hasBody) cmd += ` \\\n  -d '${request.body.trim()}'`;
      return cmd;
    }
    case 'javascript': {
      let code = `const response = await fetch('${fullUrl}', {\n`;
      code += `  method: '${request.method}',\n`;
      if (Object.keys(headers).length) code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},\n`;
      if (hasBody) code += `  body: JSON.stringify(${request.body.trim()}),\n`;
      code += `});\n\nconst data = await response.json();\nconsole.log(data);`;
      return code;
    }
    case 'axios': {
      let code = `import axios from 'axios';\n\nconst response = await axios({\n`;
      code += `  method: '${request.method.toLowerCase()}',\n  url: '${request.url}',\n`;
      if (Object.keys(params).length) code += `  params: ${JSON.stringify(params, null, 4).replace(/\n/g, '\n  ')},\n`;
      if (Object.keys(headers).length) code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},\n`;
      if (hasBody) code += `  data: ${request.body.trim()},\n`;
      code += `});\n\nconsole.log(response.data);`;
      return code;
    }
    case 'python': {
      let code = `import requests\n\nresponse = requests.${request.method.toLowerCase()}(\n    '${request.url}',\n`;
      if (Object.keys(headers).length) code += `    headers=${JSON.stringify(headers)},\n`;
      if (Object.keys(params).length) code += `    params=${JSON.stringify(params)},\n`;
      if (hasBody) code += `    json=${request.body.trim()},\n`;
      code += `)\n\nprint(response.json())`;
      return code;
    }
    case 'node': {
      let code = `const https = require('https');\n\n`;
      try {
        const url = new URL(fullUrl.startsWith('http') ? fullUrl : `https://${fullUrl}`);
        code += `const options = {\n  hostname: '${url.hostname}',\n  path: '${url.pathname}${url.search}',\n  method: '${request.method}',\n`;
        if (Object.keys(headers).length) code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},\n`;
        code += `};\n\nconst req = https.request(options, (res) => {\n  let data = '';\n  res.on('data', (chunk) => data += chunk);\n  res.on('end', () => console.log(JSON.parse(data)));\n});\n`;
        if (hasBody) code += `\nreq.write(JSON.stringify(${request.body.trim()}));\n`;
        code += `req.end();`;
      } catch { code += '// Invalid URL'; }
      return code;
    }
    case 'php': {
      let code = `<?php\n\n$ch = curl_init('${fullUrl}');\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${request.method}');\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
      if (Object.keys(headers).length) {
        code += `curl_setopt($ch, CURLOPT_HTTPHEADER, [\n`;
        Object.entries(headers).forEach(([k, v]) => { code += `    '${k}: ${v}',\n`; });
        code += `]);\n`;
      }
      if (hasBody) code += `curl_setopt($ch, CURLOPT_POSTFIELDS, '${request.body.trim().replace(/'/g, "\\'")}');\n`;
      code += `\n$response = curl_exec($ch);\ncurl_close($ch);\n\necho $response;\n?>`;
      return code;
    }
    default: return '';
  }
}

export default function CodeGenerator({ request, resolveEnvVars }) {
  const [language, setLanguage] = useState('curl');
  const { copied, copyToClipboard } = useCopyToClipboard();
  const code = generateCode(language, request);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card animate-fade-in overflow-hidden"
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1.5 flex-wrap bg-base-200/40 p-1 rounded-xl border border-base-200/60 overflow-x-auto max-w-full">
            {LANGUAGES.map(({ key, label }) => (
              <motion.button
                key={key}
                onClick={() => setLanguage(key)}
                className={`btn btn-xs rounded-lg transition-all duration-200 ${language === key ? 'btn-primary shadow-sm shadow-primary/20' : 'btn-ghost'}`}
              >
                {label}
              </motion.button>
            ))}
          </div>
          <motion.button
            onClick={() => copyToClipboard(code)}
            className={`btn btn-xs gap-1 rounded-xl transition-all duration-300 ${
              copied ? 'btn-success shadow-sm shadow-success/20' : 'btn-ghost hover:bg-base-200/80'
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>

        <pre className="p-4 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto scrollbar-thin bg-neutral text-neutral-content border border-base-300/50 shadow-inner">
          {code}
        </pre>
      </div>
    </motion.div>
  );
}
