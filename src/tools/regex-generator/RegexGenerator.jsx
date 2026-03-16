import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Regex, Copy, Check, AlertTriangle, Play, Trash2,
  Sparkles, BookOpen, Plus, X, Download,
  CheckCircle, XCircle, Flag, Search, Layers, Zap, Hash,
  Replace, ArrowRight, Eye, Code2, RotateCcw,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ══════════════════════════════════════════════════════════════
   PRESETS — Curated, tested, working patterns
   ══════════════════════════════════════════════════════════════ */
const PRESET_CATEGORIES = [
  {
    name: 'Validation',
    icon: CheckCircle,
    patterns: [
      { name: 'Email', pattern: '[\\w.+-]+@[a-zA-Z\\d-]+\\.[a-zA-Z]{2,}', flags: 'gi', desc: 'Standard email validation', testStr: 'user@example.com\ninvalid-email\ntest.user+tag@domain.co.uk\nbad@.com' },
      { name: 'URL', pattern: 'https?://[^\\s/$.?#][^\\s]*', flags: 'gi', desc: 'HTTP/HTTPS URLs', testStr: 'Visit https://example.com or http://test.org/path?q=1&foo=bar\nnot-a-url\nhttps://sub.domain.co.uk/page#anchor' },
      { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g', desc: 'US phone numbers', testStr: '(555) 123-4567\n555.123.4567\n5551234567\n555-123-4567' },
      { name: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g', desc: 'IPv4 addresses', testStr: '192.168.1.1\n10.0.0.255\n999.999.999.999\n0.0.0.0\n255.255.255.255' },
      { name: 'Credit Card', pattern: '\\b(?:4\\d{12}(?:\\d{3})?|5[1-5]\\d{14}|3[47]\\d{13})\\b', flags: 'g', desc: 'Visa, Mastercard, Amex', testStr: '4111111111111111\n5500000000000004\n378282246310005\n1234567890' },
      { name: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g', desc: 'CSS hex color codes', testStr: '#ff5733\n#333\ncolor: #ABCDEF;\n#xyz not valid' },
      { name: 'Password Strength', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', flags: 'm', desc: 'Min 8 chars, upper+lower+digit+special', testStr: 'Str0ng@Pass\nweak\n12345678\nNoSpecial1\nGo0d!Pass' },
    ],
  },
  {
    name: 'Text Processing',
    icon: Hash,
    patterns: [
      { name: 'HTML Tags', pattern: '<\\/?[a-z][\\s\\S]*?>', flags: 'gi', desc: 'Match HTML/XML tags', testStr: '<div class="test">Hello</div>\n<br />\n<img src="pic.jpg" alt="pic">\nplain text' },
      { name: 'Markdown Links', pattern: '\\[([^\\]]+)\\]\\(([^)]+)\\)', flags: 'g', desc: 'Markdown [text](url)', testStr: 'Check [Google](https://google.com) and [Docs](./readme.md)\nplain text without links' },
      { name: 'Words', pattern: '\\b[a-zA-Z]+\\b', flags: 'g', desc: 'Match alphabetic words', testStr: 'Hello world! This has 123 numbers and words.' },
      { name: 'Sentences', pattern: '[A-Z][^.!?]*[.!?]', flags: 'g', desc: 'Sentences starting with uppercase', testStr: 'Hello there. How are you? I am fine! lowercase start.' },
      { name: 'Quoted Strings', pattern: '(["\'])(?:(?!\\1|\\\\).|\\\\.)*\\1', flags: 'g', desc: 'Single or double quoted strings', testStr: 'const name = "John";\nconst msg = \'Hello World\';\nunquoted text' },
      { name: 'Duplicate Words', pattern: '\\b(\\w+)\\s+\\1\\b', flags: 'gi', desc: 'Repeated adjacent words', testStr: 'This is is a test test case.\nNo duplicates here.\nThe the quick brown fox.' },
    ],
  },
  {
    name: 'Development',
    icon: Zap,
    patterns: [
      { name: 'CSS Class', pattern: '\\.[a-zA-Z_][a-zA-Z0-9_-]*', flags: 'g', desc: 'CSS class selectors', testStr: '.container .btn-primary .my_class .active' },
      { name: 'JS Variable Decl', pattern: '(?:const|let|var)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)', flags: 'g', desc: 'JavaScript variable declarations', testStr: 'const myVar = 1;\nlet _private = true;\nvar $el = null;\nfunction notAVar() {}' },
      { name: 'Import Statement', pattern: 'import\\s+(?:\\{[^}]+\\}|[\\w*]+(?:\\s*,\\s*\\{[^}]+\\})?)\\s+from\\s+[\'"]([^\'"]+)[\'"]', flags: 'g', desc: 'ES module imports', testStr: "import React from 'react';\nimport { useState, useEffect } from 'react';\nimport * as utils from './utils';" },
      { name: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'gi', desc: 'UUID v4 format', testStr: '550e8400-e29b-41d4-a716-446655440000\nnot-a-uuid\na1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      { name: 'ISO Date', pattern: '\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?)?', flags: 'g', desc: 'ISO 8601 dates', testStr: '2024-01-15\n2024-01-15T10:30:00Z\n2024-01-15T10:30:00+05:30\nnot a date' },
      { name: 'Console Statements', pattern: 'console\\.(?:log|warn|error|info|debug)\\([^)]*\\)', flags: 'g', desc: 'Console method calls', testStr: 'console.log("debug");\nconsole.error("oops");\nconsole.warn("careful");\nalert("not console");' },
    ],
  },
];

const FLAG_OPTIONS = [
  { flag: 'g', name: 'Global', desc: 'Find all matches, not just the first' },
  { flag: 'i', name: 'Case Insensitive', desc: 'Ignore uppercase/lowercase differences' },
  { flag: 'm', name: 'Multiline', desc: '^ and $ match start/end of each line' },
  { flag: 's', name: 'Dotall', desc: '. also matches newline characters' },
  { flag: 'u', name: 'Unicode', desc: 'Enable full Unicode matching' },
];

const CHEATSHEET = [
  { cat: 'Character Classes', items: [
    { token: '.', desc: 'Any character (except newline)' },
    { token: '\\d', desc: 'Digit [0-9]' },
    { token: '\\D', desc: 'Non-digit' },
    { token: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
    { token: '\\W', desc: 'Non-word char' },
    { token: '\\s', desc: 'Whitespace' },
    { token: '\\S', desc: 'Non-whitespace' },
  ]},
  { cat: 'Anchors', items: [
    { token: '^', desc: 'Start of string/line' },
    { token: '$', desc: 'End of string/line' },
    { token: '\\b', desc: 'Word boundary' },
    { token: '\\B', desc: 'Non-word boundary' },
  ]},
  { cat: 'Quantifiers', items: [
    { token: '*', desc: '0 or more' },
    { token: '+', desc: '1 or more' },
    { token: '?', desc: '0 or 1 (optional)' },
    { token: '{n}', desc: 'Exactly n times' },
    { token: '{n,}', desc: 'n or more times' },
    { token: '{n,m}', desc: 'Between n and m times' },
    { token: '*?', desc: '0+ (lazy/non-greedy)' },
    { token: '+?', desc: '1+ (lazy/non-greedy)' },
  ]},
  { cat: 'Groups & Lookaround', items: [
    { token: '(abc)', desc: 'Capture group' },
    { token: '(?:abc)', desc: 'Non-capture group' },
    { token: '(?<name>)', desc: 'Named group' },
    { token: '(?=abc)', desc: 'Positive lookahead' },
    { token: '(?!abc)', desc: 'Negative lookahead' },
    { token: '(?<=abc)', desc: 'Positive lookbehind' },
    { token: '(?<!abc)', desc: 'Negative lookbehind' },
  ]},
  { cat: 'Logic & Sets', items: [
    { token: 'a|b', desc: 'Alternation (or)' },
    { token: '[abc]', desc: 'Character set' },
    { token: '[^abc]', desc: 'Negated set' },
    { token: '[a-z]', desc: 'Range' },
    { token: '\\1', desc: 'Backreference to group 1' },
  ]},
];

/* ══════════════════════════════════════════════════════════════
   PATTERN EXPLANATION ENGINE
   ══════════════════════════════════════════════════════════════ */
function explainPattern(pattern) {
  if (!pattern) return [];
  const explanations = [];
  let i = 0;

  while (i < pattern.length) {
    const remaining = pattern.slice(i);

    // Named group (?<name>)
    const namedGroupMatch = remaining.match(/^\(\?<([^>]+)>/);
    if (namedGroupMatch) {
      explanations.push({ token: namedGroupMatch[0], desc: `Named capture group "${namedGroupMatch[1]}"`, type: 'group' });
      i += namedGroupMatch[0].length; continue;
    }
    // Non-capture group (?:)
    if (remaining.startsWith('(?:')) {
      explanations.push({ token: '(?:', desc: 'Start non-capture group', type: 'group' });
      i += 3; continue;
    }
    // Positive lookahead (?=)
    if (remaining.startsWith('(?=')) {
      explanations.push({ token: '(?=', desc: 'Start positive lookahead', type: 'lookaround' });
      i += 3; continue;
    }
    // Negative lookahead (?!)
    if (remaining.startsWith('(?!')) {
      explanations.push({ token: '(?!', desc: 'Start negative lookahead', type: 'lookaround' });
      i += 3; continue;
    }
    // Positive lookbehind (?<=)
    if (remaining.startsWith('(?<=')) {
      explanations.push({ token: '(?<=', desc: 'Start positive lookbehind', type: 'lookaround' });
      i += 4; continue;
    }
    // Negative lookbehind (?<!)
    if (remaining.startsWith('(?<!')) {
      explanations.push({ token: '(?<!', desc: 'Start negative lookbehind', type: 'lookaround' });
      i += 4; continue;
    }
    // Character class [...]
    if (remaining.startsWith('[')) {
      const classMatch = remaining.match(/^\[(?:\\\]|[^\]])*\]/);
      if (classMatch) {
        const inner = classMatch[0];
        const negated = inner.startsWith('[^');
        const content = inner.slice(negated ? 2 : 1, -1);
        explanations.push({
          token: inner,
          desc: `${negated ? 'NOT ' : ''}Character set: ${content}`,
          type: 'charclass',
        });
        i += inner.length; continue;
      }
    }
    // Quantifier with range {n}, {n,}, {n,m} optionally lazy
    const qRange = remaining.match(/^\{(\d+)(?:,(\d*))?\}(\?)?/);
    if (qRange) {
      const min = qRange[1];
      const max = qRange[2];
      const lazy = qRange[3] === '?';
      let desc;
      if (max === undefined) desc = `Exactly ${min} times`;
      else if (max === '') desc = `${min} or more times`;
      else desc = `Between ${min} and ${max} times`;
      if (lazy) desc += ' (lazy)';
      explanations.push({ token: qRange[0], desc, type: 'quantifier' });
      i += qRange[0].length; continue;
    }
    // Escape sequences \d \w \s etc.
    if (remaining.startsWith('\\') && remaining.length > 1) {
      const next = remaining[1];
      const escapeMap = {
        'd': 'Digit [0-9]', 'D': 'Non-digit',
        'w': 'Word char [a-zA-Z0-9_]', 'W': 'Non-word char',
        's': 'Whitespace', 'S': 'Non-whitespace',
        'b': 'Word boundary', 'B': 'Non-word boundary',
        'n': 'Newline', 'r': 'Carriage return', 't': 'Tab',
      };
      if (escapeMap[next]) {
        explanations.push({ token: `\\${next}`, desc: escapeMap[next], type: 'escape' });
      } else if (/\d/.test(next)) {
        explanations.push({ token: `\\${next}`, desc: `Backreference to group ${next}`, type: 'escape' });
      } else {
        explanations.push({ token: `\\${next}`, desc: `Literal "${next}"`, type: 'escape' });
      }
      i += 2; continue;
    }

    // Single special characters
    const ch = pattern[i];
    const charMap = {
      '.': { desc: 'Any character (except newline)', type: 'charclass' },
      '*': { desc: '0 or more of previous', type: 'quantifier' },
      '+': { desc: '1 or more of previous', type: 'quantifier' },
      '?': { desc: '0 or 1 of previous (optional)', type: 'quantifier' },
      '^': { desc: 'Start of string/line', type: 'anchor' },
      '$': { desc: 'End of string/line', type: 'anchor' },
      '|': { desc: 'OR — match either side', type: 'logic' },
      '(': { desc: 'Start capture group', type: 'group' },
      ')': { desc: 'End group', type: 'group' },
    };

    if (charMap[ch]) {
      // Detect lazy quantifier (*? +? ??)
      if ((ch === '*' || ch === '+' || ch === '?') && pattern[i + 1] === '?') {
        explanations.push({
          token: ch + '?',
          desc: charMap[ch].desc.replace(' of previous', ' (lazy) of previous'),
          type: 'quantifier'
        });
        i += 2; continue;
      }
      explanations.push({ token: ch, ...charMap[ch] });
    } else {
      // Collect consecutive literal chars
      let literal = ch;
      let j = i + 1;
      while (j < pattern.length && !'\\.*+?^$|()[]{}' .includes(pattern[j])) {
        literal += pattern[j]; j++;
      }
      if (literal.length > 1) {
        explanations.push({ token: literal, desc: `Literal text "${literal}"`, type: 'literal' });
        i = j; continue;
      } else {
        explanations.push({ token: ch, desc: `Literal "${ch}"`, type: 'literal' });
      }
    }
    i++;
  }

  return explanations;
}

/* ══════════════════════════════════════════════════════════════
   HIGHLIGHTED TEXT — handles overlaps + zero-length matches
   ══════════════════════════════════════════════════════════════ */
function HighlightedText({ text, matches }) {
  if (!matches || matches.length === 0) {
    return <span className="opacity-50">{text}</span>;
  }

  // Filter zero-length, sort by index
  const sortedMatches = [...matches]
    .filter(m => m[0].length > 0)
    .sort((a, b) => a.index - b.index);

  // Remove overlapping: keep earlier one
  const cleanMatches = [];
  for (const m of sortedMatches) {
    const last = cleanMatches[cleanMatches.length - 1];
    if (!last || m.index >= last.index + last[0].length) {
      cleanMatches.push(m);
    }
  }

  const parts = [];
  let lastIdx = 0;

  cleanMatches.forEach((m, i) => {
    if (m.index > lastIdx) {
      parts.push(
        <span key={`t-${i}`} className="opacity-40">{text.slice(lastIdx, m.index)}</span>
      );
    }
    parts.push(
      <mark
        key={`m-${i}`}
        className="bg-primary/20 text-primary font-semibold rounded-sm px-[2px] border-b-2 border-primary/50"
        style={{ textDecoration: 'none' }}
        title={`Match #${i + 1} at index ${m.index}`}
      >
        {m[0]}
      </mark>
    );
    lastIdx = m.index + m[0].length;
  });

  if (lastIdx < text.length) {
    parts.push(<span key="tail" className="opacity-40">{text.slice(lastIdx)}</span>);
  }

  return <>{parts}</>;
}

/* ══════════════════════════════════════════════════════════════
   CODE GENERATOR — correct escaping per language
   ══════════════════════════════════════════════════════════════ */
function generateCode(pattern, flags, lang) {
  // For string contexts we escape backslashes + quotes
  const forDoubleQuoteStr = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const forSingleQuoteStr = pattern.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  switch (lang) {
    case 'javascript':
      return [
        `// JavaScript — regex literal`,
        `const regex = /${pattern}/${flags};`,
        ``,
        `// Test if string matches`,
        `const isMatch = regex.test(inputStr);`,
        ``,
        flags.includes('g')
          ? `// Find all matches\nconst matches = [...inputStr.matchAll(regex)];\nmatches.forEach(m => {\n  console.log(m[0], 'at index', m.index);\n});`
          : `// Find first match\nconst match = inputStr.match(regex);\nif (match) {\n  console.log(match[0], 'at index', match.index);\n}`,
        ``,
        `// Replace matches`,
        `const replaced = inputStr.replace(regex, 'replacement');`,
      ].join('\n');

    case 'python':
      return [
        `import re`,
        ``,
        `pattern = r'${pattern}'`,
        (() => {
          const pyFlags = [];
          if (flags.includes('i')) pyFlags.push('re.IGNORECASE');
          if (flags.includes('m')) pyFlags.push('re.MULTILINE');
          if (flags.includes('s')) pyFlags.push('re.DOTALL');
          if (flags.includes('u')) pyFlags.push('re.UNICODE');
          const hasFlags = pyFlags.length > 0;
          return hasFlags ? `flags = ${pyFlags.join(' | ')}` : `# No special flags needed`;
        })(),
        ``,
        `# Find all matches`,
        (() => {
          const hasFlags = flags.includes('i') || flags.includes('m') || flags.includes('s') || flags.includes('u');
          return hasFlags
            ? `matches = re.findall(pattern, text, flags)`
            : `matches = re.findall(pattern, text)`;
        })(),
        ``,
        `# Test if string matches`,
        (() => {
          const hasFlags = flags.includes('i') || flags.includes('m') || flags.includes('s') || flags.includes('u');
          return hasFlags
            ? `is_match = bool(re.search(pattern, text, flags))`
            : `is_match = bool(re.search(pattern, text))`;
        })(),
        ``,
        `# Replace matches`,
        `replaced = re.sub(pattern, 'replacement', text)`,
      ].join('\n');

    case 'java':
      return [
        `import java.util.regex.*;`,
        ``,
        (() => {
          const javaFlags = [];
          if (flags.includes('i')) javaFlags.push('Pattern.CASE_INSENSITIVE');
          if (flags.includes('m')) javaFlags.push('Pattern.MULTILINE');
          if (flags.includes('s')) javaFlags.push('Pattern.DOTALL');
          if (flags.includes('u')) javaFlags.push('Pattern.UNICODE_CHARACTER_CLASS');
          const flagStr = javaFlags.length > 0 ? `, ${javaFlags.join(' | ')}` : '';
          return `Pattern pattern = Pattern.compile("${forDoubleQuoteStr}"${flagStr});`;
        })(),
        `Matcher matcher = pattern.matcher(text);`,
        ``,
        `// Find all matches`,
        `while (matcher.find()) {`,
        `    System.out.println("Match: " + matcher.group() + " at " + matcher.start());`,
        `}`,
        ``,
        `// Replace matches`,
        `String replaced = matcher.replaceAll("replacement");`,
      ].join('\n');

    case 'go':
      return [
        `package main`,
        ``,
        `import (`,
        `    "fmt"`,
        `    "regexp"`,
        `)`,
        ``,
        flags.includes('i')
          ? `re := regexp.MustCompile(\`(?i)${pattern}\`)`
          : `re := regexp.MustCompile(\`${pattern}\`)`,
        ``,
        `// Find all matches`,
        `matches := re.FindAllString(text, -1)`,
        `fmt.Println(matches)`,
        ``,
        `// Test if string matches`,
        `isMatch := re.MatchString(text)`,
        ``,
        `// Replace matches`,
        `replaced := re.ReplaceAllString(text, "replacement")`,
      ].join('\n');

    case 'php':
      return [
        `<?php`,
        ``,
        `$pattern = '/${forSingleQuoteStr}/${flags}';`,
        ``,
        `// Find all matches`,
        `preg_match_all($pattern, $text, $matches);`,
        `print_r($matches[0]);`,
        ``,
        `// Test if string matches`,
        `$isMatch = preg_match($pattern, $text);`,
        ``,
        `// Replace matches`,
        `$replaced = preg_replace($pattern, 'replacement', $text);`,
      ].join('\n');

    case 'rust':
      return [
        `use regex::Regex;`,
        ``,
        flags.includes('i')
          ? `let re = Regex::new(r"(?i)${pattern}").unwrap();`
          : `let re = Regex::new(r"${pattern}").unwrap();`,
        ``,
        `// Find all matches`,
        `for mat in re.find_iter(&text) {`,
        `    println!("Match: {} at {}", mat.as_str(), mat.start());`,
        `}`,
        ``,
        `// Test if string matches`,
        `let is_match = re.is_match(&text);`,
        ``,
        `// Replace matches`,
        `let replaced = re.replace_all(&text, "replacement");`,
      ].join('\n');

    case 'csharp':
      return [
        `using System.Text.RegularExpressions;`,
        ``,
        (() => {
          const csFlags = ['RegexOptions.Compiled'];
          if (flags.includes('i')) csFlags.push('RegexOptions.IgnoreCase');
          if (flags.includes('m')) csFlags.push('RegexOptions.Multiline');
          if (flags.includes('s')) csFlags.push('RegexOptions.Singleline');
          return `var regex = new Regex(@"${pattern.replace(/"/g, '""')}", ${csFlags.join(' | ')});`;
        })(),
        ``,
        `// Find all matches`,
        `var matches = regex.Matches(text);`,
        `foreach (Match match in matches)`,
        `{`,
        `    Console.WriteLine($"Match: {match.Value} at index {match.Index}");`,
        `}`,
        ``,
        `// Test if string matches`,
        `bool isMatch = regex.IsMatch(text);`,
        ``,
        `// Replace matches`,
        `string replaced = regex.Replace(text, "replacement");`,
      ].join('\n');

    default:
      return `/${pattern}/${flags}`;
  }
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function RegexGenerator() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');
  const [activeTab, setActiveTab] = useState('test');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [savedPatterns, setSavedPatterns] = useLocalStorage('regex-saved-patterns-v2', []);
  const [patternName, setPatternName] = useState('');
  const [presetSearch, setPresetSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard();
  const patternRef = useRef(null);

  /* ── Regex Execution — safe with matchAll ── */
  const result = useMemo(() => {
    if (!pattern.trim()) return { valid: null, matches: [], error: null, groups: [] };
    try {
      const regex = new RegExp(pattern, flags);
      if (!testString) return { valid: true, matches: [], error: null, regex, groups: [] };

      const matches = [];
      const groups = [];
      const hasGlobal = flags.includes('g');

      if (hasGlobal) {
        const safeFlags = flags.includes('g') ? flags : flags + 'g';
        const safeRegex = new RegExp(pattern, safeFlags);
        let count = 0;
        for (const m of testString.matchAll(safeRegex)) {
          if (count++ > 1000) break;
          matches.push(m);
          if (m.length > 1) {
            const g = {};
            for (let k = 1; k < m.length; k++) {
              g[`Group ${k}`] = m[k] !== undefined ? m[k] : '(not matched)';
            }
            if (m.groups) {
              Object.entries(m.groups).forEach(([name, val]) => {
                g[name] = val !== undefined ? val : '(not matched)';
              });
            }
            groups.push({ matchIndex: matches.length - 1, groups: g });
          }
        }
      } else {
        const m = regex.exec(testString);
        if (m) {
          matches.push(m);
          if (m.length > 1) {
            const g = {};
            for (let k = 1; k < m.length; k++) {
              g[`Group ${k}`] = m[k] !== undefined ? m[k] : '(not matched)';
            }
            if (m.groups) {
              Object.entries(m.groups).forEach(([name, val]) => {
                g[name] = val !== undefined ? val : '(not matched)';
              });
            }
            groups.push({ matchIndex: 0, groups: g });
          }
        }
      }

      return { valid: true, matches, error: null, regex, groups };
    } catch (e) {
      return { valid: false, matches: [], error: e.message, groups: [] };
    }
  }, [pattern, flags, testString]);

  /* ── Pattern Explanation ── */
  const explanation = useMemo(() => explainPattern(pattern), [pattern]);

  /* ── Replace result ── */
  const replaceResult = useMemo(() => {
    if (!pattern || !testString || !showReplace) return '';
    try {
      const regex = new RegExp(pattern, flags);
      return testString.replace(regex, replacement);
    } catch {
      return '';
    }
  }, [pattern, flags, testString, replacement, showReplace]);

  /* ── Filtered presets ── */
  const filteredPresets = useMemo(() => {
    if (!presetSearch.trim()) return PRESET_CATEGORIES;
    const q = presetSearch.toLowerCase();
    return PRESET_CATEGORIES.map(cat => ({
      ...cat,
      patterns: cat.patterns.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.pattern.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.patterns.length > 0);
  }, [presetSearch]);

  /* ── Handlers ── */
  const toggleFlag = useCallback((flag) => {
    setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
  }, []);

  const loadPreset = useCallback((preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.testStr || '');
    setActiveTab('test');
  }, []);

  const insertAtCursor = useCallback((text) => {
    const input = patternRef.current;
    if (!input) { setPattern(p => p + text); return; }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const before = pattern.slice(0, start);
    const after = pattern.slice(end);
    setPattern(before + text + after);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + text.length, start + text.length);
    });
  }, [pattern]);

  const savePattern = useCallback(() => {
    if (!pattern.trim()) return;
    const entry = {
      id: Date.now(),
      name: patternName || `Pattern ${savedPatterns.length + 1}`,
      pattern, flags, testString,
      createdAt: new Date().toLocaleString(),
    };
    setSavedPatterns(prev => [entry, ...prev].slice(0, 50));
    setPatternName('');
  }, [pattern, flags, testString, patternName, savedPatterns, setSavedPatterns]);

  const handleExport = useCallback(() => {
    try {
      const data = {
        pattern, flags, testString, replacement,
        matchCount: result.matches.length,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `regex-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Regex export failed:', err);
    }
  }, [pattern, flags, testString, replacement, result]);

const handleImport = useCallback(() => {
    try {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.pattern) setPattern(data.pattern);
            if (data.flags) setFlags(data.flags);
            if (data.testString) setTestString(data.testString);
            if (data.replacement) setReplacement(data.replacement);
            setActiveTab('test');
          } catch (err) {
            console.error('Failed to parse imported regex file:', err);
          }
        };
        reader.onerror = () => {
          console.error('Failed to read file:', reader.error?.message || 'Unknown error');
        };
        reader.readAsText(file);
      };
      input.click();
    } catch (err) {
      console.error('Import failed:', err);
    }
  }, []);
  const TABS = [
    { id: 'test', label: 'Test & Match', icon: Play },
    { id: 'explain', label: 'Explain', icon: Eye },
    { id: 'presets', label: 'Presets', icon: Sparkles },
    { id: 'code', label: 'Code Gen', icon: Code2 },
    { id: 'saved', label: 'Saved', icon: Flag },
  ];

  const CODE_LANGS = [
    { id: 'javascript', label: 'JS' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'go', label: 'Go' },
    { id: 'php', label: 'PHP' },
    { id: 'rust', label: 'Rust' },
    { id: 'csharp', label: 'C#' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ═══════ Header ═══════ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Regex size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Regex Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Build, test, explain & generate regex patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowCheatsheet(s => !s)}
            className={`btn btn-sm gap-1.5 ${showCheatsheet ? 'btn-primary' : 'btn-ghost'}`}>
            <BookOpen size={14} /> Cheatsheet
          </button>
          <button onClick={handleImport} className="btn btn-sm btn-ghost gap-1.5">
            <Download size={14} className="rotate-180" /> Import
          </button>
          {pattern && (
            <>
              <button onClick={handleExport} className="btn btn-sm btn-ghost gap-1.5">
                <Download size={14} /> Export
              </button>
              <button onClick={() => { setPattern(''); setTestString(''); setFlags('g'); setReplacement(''); setShowReplace(false); }}
                className="btn btn-sm btn-ghost btn-error gap-1.5">
                <RotateCcw size={14} /> Reset
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* ═══════ Cheatsheet ═══════ */}
      <AnimatePresence>
        {showCheatsheet && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="section-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen size={14} className="text-primary" /> Regex Cheatsheet
                  <span className="text-[10px] opacity-40 font-normal ml-1">click any token to insert</span>
                </h3>
                <button onClick={() => setShowCheatsheet(false)} className="btn btn-ghost btn-xs"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                {CHEATSHEET.map(cat => (
                  <div key={cat.cat}>
                    <p className="text-xs font-bold text-primary mb-2">{cat.cat}</p>
                    <div className="space-y-0.5">
                      {cat.items.map(item => (
                        <button key={item.token} onClick={() => insertAtCursor(item.token)}
                          className="flex items-center gap-2 text-xs w-full text-left rounded px-1.5 py-1 hover:bg-primary/10 transition-colors group"
                          title={`Click to insert: ${item.token}`}>
                          <code className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px] shrink-0 min-w-[48px] text-center group-hover:bg-primary/20 transition-colors">
                            {item.token}
                          </code>
                          <span className="opacity-50 group-hover:opacity-70 transition-opacity truncate">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Pattern Input ═══════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="section-card p-5 space-y-4">
        <div>
          <label className="field-label">Regular Expression</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono font-bold text-lg opacity-50">/</span>
              <input ref={patternRef} type="text" value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className={`input w-full font-mono text-sm pl-7 pr-16 ${
                  result.valid === false ? 'input-error' :
                  result.valid === true ? 'input-success' : ''
                }`}
                spellCheck={false} autoComplete="off" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold opacity-40 text-sm pointer-events-none">
                /{flags}
              </span>
            </div>
            <button onClick={() => copyToClipboard(`/${pattern}/${flags}`)}
              className="btn btn-sm btn-ghost gap-1 shrink-0" title="Copy full regex">
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
          {result.error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs text-error flex items-center gap-1.5 mt-2">
              <AlertTriangle size={12} /> {result.error}
            </motion.p>
          )}
          {result.valid === true && pattern.trim() && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[11px] text-success flex items-center gap-1 mt-1.5">
              <CheckCircle size={11} /> Valid pattern
            </motion.p>
          )}
        </div>

        {/* Flags */}
        <div>
          <label className="field-label">Flags</label>
          <div className="flex flex-wrap gap-2">
            {FLAG_OPTIONS.map(f => (
              <button key={f.flag} onClick={() => toggleFlag(f.flag)} title={f.desc}
                className={`btn btn-xs gap-1.5 transition-all ${
                  flags.includes(f.flag) ? 'btn-primary shadow-sm' : 'btn-ghost border border-base-300'
                }`}>
                <code className="font-mono font-bold">{f.flag}</code>
                <span className="text-[10px] hidden sm:inline">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Insert */}
        <div>
          <label className="field-label">Quick Insert <span className="font-normal opacity-40">— click to insert at cursor</span></label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '\\d+', title: 'One or more digits' },
              { label: '\\w+', title: 'One or more word chars' },
              { label: '\\s+', title: 'One or more whitespace' },
              { label: '.+', title: 'One or more of any char' },
              { label: '.+?', title: 'One or more (lazy)' },
              { label: '[a-z]', title: 'Lowercase letter' },
              { label: '[A-Z]', title: 'Uppercase letter' },
              { label: '[0-9]', title: 'Digit' },
              { label: '[a-zA-Z]', title: 'Any letter' },
              { label: '\\b', title: 'Word boundary' },
              { label: '^', title: 'Start of string/line' },
              { label: '$', title: 'End of string/line' },
              { label: '()', title: 'Capture group' },
              { label: '(?:)', title: 'Non-capture group' },
              { label: '(?=)', title: 'Positive lookahead' },
              { label: '(?!)', title: 'Negative lookahead' },
              { label: '|', title: 'OR operator' },
              { label: '\\.', title: 'Literal dot' },
            ].map(block => (
              <button key={block.label} onClick={() => insertAtCursor(block.label)} title={block.title}
                className="btn btn-xs btn-ghost font-mono border border-base-300 hover:border-primary/50 hover:bg-primary/10 transition-all">
                {block.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════ Tab Navigation ═══════ */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="tabs tabs-box tabs-sm">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab gap-1.5 ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={13} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.id === 'saved' && savedPatterns.length > 0 && (
                <span className="badge badge-xs badge-primary">{savedPatterns.length}</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ═══════ TEST TAB ═══════ */}
        {activeTab === 'test' && (
          <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Test String Input */}
            <div className="section-card p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="field-label mb-0">Test String</label>
                <button onClick={() => setShowReplace(s => !s)}
                  className={`btn btn-xs gap-1.5 ${showReplace ? 'btn-primary' : 'btn-ghost'}`}>
                  <Replace size={12} /> Replace Mode
                </button>
              </div>
              <textarea value={testString} onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test the regex against..."
                rows={5} className="textarea w-full font-mono text-xs leading-relaxed" spellCheck={false} />
              <AnimatePresence>
                {showReplace && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-3 pt-3 border-t border-base-200">
                      <label className="field-label text-[11px]">
                        Replace with <span className="opacity-40 font-normal">— use $1, $2 for groups, $& for full match</span>
                      </label>
                      <input type="text" value={replacement} onChange={(e) => setReplacement(e.target.value)}
                        placeholder="Replacement string..."
                        className="input input-sm w-full font-mono text-xs" spellCheck={false} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Match Stats */}
            {result.valid && testString.trim() && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="section-card p-2.5 sm:p-3 text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${result.matches.length > 0 ? 'text-primary' : 'text-base-content/30'}`}>
                    {result.matches.length}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mt-0.5">Matches</p>
                </div>
                <div className="section-card p-2.5 sm:p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-secondary">{new Set(result.matches.map(m => m[0])).size}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mt-0.5">Unique</p>
                </div>
                <div className="section-card p-2.5 sm:p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-accent">
                    {result.matches.reduce((a, m) => a + m[0].length, 0)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mt-0.5">Chars Matched</p>
                </div>
                <div className="section-card p-2.5 sm:p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-info">{result.groups.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mt-0.5">With Groups</p>
                </div>
              </motion.div>
            )}

            {/* Highlighted Match Preview */}
            {result.valid && testString.trim() && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="section-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Search size={14} className="text-primary" /> Match Preview
                  </h3>
                  {result.matches.length === 0 ? (
                    <span className="badge badge-warning badge-xs gap-1"><XCircle size={10} /> No matches</span>
                  ) : (
                    <span className="badge badge-success badge-xs gap-1">
                      {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-base-200/50 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border border-base-300/30">
                  <HighlightedText text={testString} matches={result.matches} />
                </div>
              </motion.div>
            )}

            {/* Replace Preview */}
            {showReplace && result.valid && testString.trim() && pattern.trim() && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="section-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Replace size={14} className="text-primary" /> Replace Result
                  </h3>
                  <button onClick={() => copyToClipboard(replaceResult)} className="btn btn-xs btn-ghost gap-1">
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />} Copy
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-base-200/50 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border border-base-300/30">
                  {replaceResult || <span className="opacity-30 italic">Empty result</span>}
                </div>
              </motion.div>
            )}

            {/* Match Details Table */}
            {result.valid && result.matches.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="section-card overflow-hidden">
                <div className="px-5 py-3.5 flex items-center gap-2.5 border-b border-base-200">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Layers size={15} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Match Details</span>
                  <span className="text-[10px] opacity-30 ml-auto">
                    Showing {Math.min(result.matches.length, 100)} of {result.matches.length}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {result.matches.slice(0, 100).map((m, i) => (
                    <div key={i} className="px-5 py-2.5 hover:bg-base-200/40 transition-colors border-b border-base-200/50 last:border-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-primary/60 bg-primary/10 w-7 h-5 rounded flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <code className="text-xs font-mono text-primary font-medium truncate max-w-md">
                            {m[0] || <span className="opacity-30 italic">empty string</span>}
                          </code>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono opacity-30">
                            idx {m.index}&#8211;{m.index + m[0].length}
                          </span>
                          <button onClick={() => copyToClipboard(m[0])} className="btn btn-ghost btn-xs">
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                      {m.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 ml-10">
                          {Array.from({ length: m.length - 1 }, (_, gi) => (
                            <span key={gi} className="badge badge-xs badge-ghost font-mono gap-1">
                              <span className="opacity-50">${gi + 1}:</span>
                              <span className="text-secondary">{m[gi + 1] !== undefined ? m[gi + 1] : 'undefined'}</span>
                            </span>
                          ))}
                          {m.groups && Object.entries(m.groups).map(([name, val]) => (
                            <span key={name} className="badge badge-xs badge-primary badge-outline font-mono gap-1">
                              <span className="opacity-60">{name}:</span>
                              <span>{val !== undefined ? val : 'undefined'}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Save Pattern */}
            {pattern.trim() && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="section-card p-4">
                <div className="flex items-center gap-2">
                  <input type="text" value={patternName} onChange={(e) => setPatternName(e.target.value)}
                    placeholder="Pattern name (optional)..." className="input input-sm flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && savePattern()} />
                  <button onClick={savePattern} className="btn btn-sm btn-primary gap-1.5">
                    <Plus size={14} /> Save
                  </button>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!pattern.trim() && !testString.trim() && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <Regex size={28} className="opacity-30" />
                </div>
                <p className="text-sm font-medium opacity-50 mb-1">Enter a regex pattern to get started</p>
                <p className="text-xs opacity-30 mb-4">Or choose from the presets tab for common patterns</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setActiveTab('presets')} className="btn btn-sm btn-ghost gap-1.5">
                    <Sparkles size={14} /> Browse Presets
                  </button>
                  <button onClick={() => setShowCheatsheet(true)} className="btn btn-sm btn-ghost gap-1.5">
                    <BookOpen size={14} /> Cheatsheet
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════ EXPLAIN TAB ═══════ */}
        {activeTab === 'explain' && (
          <motion.div key="explain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {pattern.trim() ? (
              <>
                {/* Visual breakdown */}
                <div className="section-card p-5">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Eye size={14} className="text-primary" /> Pattern Breakdown
                  </h3>
                  <div className="p-4 rounded-lg bg-base-200/50 font-mono text-lg text-center tracking-wider leading-loose">
                    <span className="opacity-30">/</span>
                    {explanation.map((part, i) => (
                      <span key={i} title={part.desc}
                        className={`inline-block px-0.5 rounded cursor-help transition-colors hover:bg-primary/20 ${
                          part.type === 'quantifier' ? 'text-warning' :
                          part.type === 'charclass' ? 'text-info' :
                          part.type === 'escape' ? 'text-secondary' :
                          part.type === 'anchor' ? 'text-error' :
                          part.type === 'group' ? 'text-primary' :
                          part.type === 'lookaround' ? 'text-accent' :
                          part.type === 'logic' ? 'text-warning' :
                          'text-base-content'
                        }`}>
                        {part.token}
                      </span>
                    ))}
                    <span className="opacity-30">/{flags}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3 justify-center">
                    {[
                      { label: 'Literal', cls: 'text-base-content' },
                      { label: 'Char class', cls: 'text-info' },
                      { label: 'Escape', cls: 'text-secondary' },
                      { label: 'Quantifier', cls: 'text-warning' },
                      { label: 'Anchor', cls: 'text-error' },
                      { label: 'Group', cls: 'text-primary' },
                      { label: 'Lookaround', cls: 'text-accent' },
                    ].map(l => (
                      <span key={l.label} className={`text-[10px] flex items-center gap-1 ${l.cls}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span> {l.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-step */}
                <div className="section-card overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-base-200 flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Step-by-Step Explanation</h3>
                    <span className="text-[10px] opacity-30 ml-auto">{explanation.length} tokens</span>
                  </div>
                  <div className="divide-y divide-base-200/50 max-h-96 overflow-y-auto scrollbar-thin">
                    {explanation.map((part, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-base-200/30 transition-colors">
                        <span className="text-[10px] font-mono text-base-content/30 w-5 text-right shrink-0">{i + 1}</span>
                        <code className={`font-mono font-bold text-sm min-w-[80px] px-2 py-0.5 rounded ${
                          part.type === 'quantifier' ? 'bg-warning/10 text-warning' :
                          part.type === 'charclass' ? 'bg-info/10 text-info' :
                          part.type === 'escape' ? 'bg-secondary/10 text-secondary' :
                          part.type === 'anchor' ? 'bg-error/10 text-error' :
                          part.type === 'group' ? 'bg-primary/10 text-primary' :
                          part.type === 'lookaround' ? 'bg-accent/10 text-accent' :
                          part.type === 'logic' ? 'bg-warning/10 text-warning' :
                          'bg-base-200 text-base-content'
                        }`}>{part.token}</code>
                        <span className="text-xs opacity-70 flex-1">{part.desc}</span>
                        <span className="badge badge-xs badge-ghost capitalize">{part.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Flags */}
                {flags && (
                  <div className="section-card p-5">
                    <h3 className="text-sm font-semibold mb-3">Active Flags</h3>
                    <div className="space-y-2">
                      {flags.split('').map(f => {
                        const flagInfo = FLAG_OPTIONS.find(fo => fo.flag === f);
                        return flagInfo ? (
                          <div key={f} className="flex items-center gap-3">
                            <code className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{f}</code>
                            <span className="text-xs"><strong>{flagInfo.name}</strong> — {flagInfo.desc}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Eye size={28} className="opacity-20 mx-auto mb-3" />
                <p className="text-sm opacity-40">Enter a regex pattern to see the explanation</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ PRESETS TAB ═══════ */}
        {activeTab === 'presets' && (
          <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="section-card p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input type="text" value={presetSearch} onChange={(e) => setPresetSearch(e.target.value)}
                  placeholder="Search presets..." className="input input-sm w-full pl-9" />
                {presetSearch && (
                  <button onClick={() => setPresetSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {filteredPresets.length === 0 ? (
              <div className="text-center py-12">
                <Search size={28} className="opacity-20 mx-auto mb-3" />
                <p className="text-sm opacity-40">No presets match &quot;{presetSearch}&quot;</p>
              </div>
            ) : (
              filteredPresets.map(cat => (
                <div key={cat.name}>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <cat.icon size={14} className="text-primary" /> {cat.name}
                    <span className="badge badge-xs badge-ghost">{cat.patterns.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.patterns.map(preset => (
                      <button key={preset.name} onClick={() => loadPreset(preset)}
                        className="section-card p-4 text-left hover:border-primary/30 transition-all group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{preset.name}</p>
                            <p className="text-xs opacity-50 mt-0.5">{preset.desc}</p>
                            <code className="text-[10px] font-mono text-primary/60 mt-2 block truncate bg-primary/5 px-2 py-1 rounded">
                              /{preset.pattern}/{preset.flags}
                            </code>
                          </div>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 mt-1 text-primary" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ═══════ CODE GEN TAB ═══════ */}
        {activeTab === 'code' && (
          <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="section-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Code2 size={14} className="text-primary" /> Code Snippet
                </h3>
                <div className="flex flex-wrap gap-1 -mx-1 px-1 overflow-x-auto sm:overflow-visible">
                  {CODE_LANGS.map(lang => (
                    <button key={lang.id}
                      className={`btn btn-xs shrink-0 ${codeLanguage === lang.id ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                      onClick={() => setCodeLanguage(lang.id)}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              {pattern.trim() ? (
                <div className="relative group">
                  <pre className="p-4 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">
                    {generateCode(pattern, flags, codeLanguage)}
                  </pre>
                  <button onClick={() => copyToClipboard(generateCode(pattern, flags, codeLanguage))}
                    className="absolute top-2 right-2 btn btn-xs btn-ghost text-neutral-content/40 hover:text-neutral-content opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code2 size={28} className="opacity-20 mx-auto mb-3" />
                  <p className="text-sm opacity-40">Enter a regex pattern to generate code</p>
                  <p className="text-xs opacity-30 mt-1">Supports JavaScript, Python, Java, Go, PHP, Rust, C#</p>
                </div>
              )}
            </div>

            {/* Language-specific tips */}
            {pattern.trim() && (
              <div className="section-card p-5">
                <h3 className="text-sm font-semibold mb-3">
                  Tips for {CODE_LANGS.find(l => l.id === codeLanguage)?.label}
                </h3>
                <div className="space-y-2 text-xs opacity-60">
                  {codeLanguage === 'javascript' && (
                    <>
                      <p>&#8226; Use <code className="text-primary font-mono">.matchAll()</code> for global matches with capture groups (returns iterator)</p>
                      <p>&#8226; Regex literals <code className="text-primary font-mono">/pattern/flags</code> are compiled at load time</p>
                      <p>&#8226; Use <code className="text-primary font-mono">new RegExp(pattern, flags)</code> for dynamic patterns</p>
                    </>
                  )}
                  {codeLanguage === 'python' && (
                    <>
                      <p>&#8226; Always use raw strings <code className="text-primary font-mono">r&#39;...&#39;</code> to avoid double-escaping</p>
                      <p>&#8226; <code className="text-primary font-mono">re.findall()</code> returns strings, <code className="text-primary font-mono">re.finditer()</code> returns match objects</p>
                      <p>&#8226; Compile patterns with <code className="text-primary font-mono">re.compile()</code> for reuse in loops</p>
                    </>
                  )}
                  {codeLanguage === 'java' && (
                    <>
                      <p>&#8226; Java strings need double-escaped backslashes: <code className="text-primary font-mono">\d</code> becomes <code className="text-primary font-mono">&quot;\\d&quot;</code></p>
                      <p>&#8226; <code className="text-primary font-mono">Pattern.compile()</code> and reuse for performance</p>
                      <p>&#8226; <code className="text-primary font-mono">Matcher.matches()</code> checks entire string; <code className="text-primary font-mono">find()</code> searches within</p>
                    </>
                  )}
                  {codeLanguage === 'go' && (
                    <>
                      <p>&#8226; Go uses RE2 syntax &#8212; no lookahead/lookbehind or backreferences</p>
                      <p>&#8226; Use backtick strings <code className="text-primary font-mono">`...`</code> to avoid escaping</p>
                      <p>&#8226; <code className="text-primary font-mono">MustCompile</code> panics on error &#8212; use <code className="text-primary font-mono">Compile</code> for handling</p>
                    </>
                  )}
                  {codeLanguage === 'php' && (
                    <>
                      <p>&#8226; PHP regex uses delimiters: <code className="text-primary font-mono">/pattern/flags</code></p>
                      <p>&#8226; <code className="text-primary font-mono">preg_match()</code> for first, <code className="text-primary font-mono">preg_match_all()</code> for all</p>
                      <p>&#8226; Use <code className="text-primary font-mono">u</code> modifier for UTF-8 support</p>
                    </>
                  )}
                  {codeLanguage === 'rust' && (
                    <>
                      <p>&#8226; Add <code className="text-primary font-mono">regex = &quot;1&quot;</code> to Cargo.toml</p>
                      <p>&#8226; RE2-like syntax &#8212; no lookaround support</p>
                      <p>&#8226; Inline flags: <code className="text-primary font-mono">(?i)</code> for case-insensitive</p>
                    </>
                  )}
                  {codeLanguage === 'csharp' && (
                    <>
                      <p>&#8226; Use verbatim strings <code className="text-primary font-mono">@&quot;...&quot;</code> to avoid double-escaping</p>
                      <p>&#8226; <code className="text-primary font-mono">RegexOptions.Compiled</code> improves reused pattern performance</p>
                      <p>&#8226; .NET supports all features including variable-length lookbehind</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ SAVED TAB ═══════ */}
        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {savedPatterns.length === 0 ? (
              <div className="text-center py-16">
                <Flag size={28} className="opacity-20 mx-auto mb-3" />
                <p className="text-sm opacity-40">No saved patterns yet</p>
                <p className="text-xs opacity-30 mt-1">Save patterns from the Test tab</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {savedPatterns.length} Saved Pattern{savedPatterns.length !== 1 ? 's' : ''}
                  </span>
                  <div className="relative">
                    <button onClick={() => setShowClearConfirm(true)}
                      className="btn btn-xs btn-ghost btn-error gap-1">
                      <Trash2 size={12} /> Clear All
                    </button>
                    <AnimatePresence>
                      {showClearConfirm && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowClearConfirm(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-base-100 rounded-xl border border-error/20 shadow-2xl z-50 p-3"
                          >
                            <p className="text-xs font-semibold mb-2">Delete all saved patterns?</p>
                            <div className="flex gap-2">
                              <button onClick={() => { setSavedPatterns([]); setShowClearConfirm(false); }} className="btn btn-error btn-xs gap-1 rounded-lg">
                                <Trash2 size={11} /> Delete All
                              </button>
                              <button onClick={() => setShowClearConfirm(false)} className="btn btn-ghost btn-xs rounded-lg">Cancel</button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="space-y-2">
                  {savedPatterns.map(sp => (
                    <div key={sp.id} className="section-card p-4 flex items-center justify-between gap-4 group hover:border-primary/20 transition-all">
                      <div className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => { setPattern(sp.pattern); setFlags(sp.flags); setTestString(sp.testString || ''); setActiveTab('test'); }}>
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">{sp.name}</p>
                        <code className="text-[10px] font-mono text-primary/60 truncate block mt-0.5 bg-primary/5 px-2 py-0.5 rounded inline-block">
                          /{sp.pattern}/{sp.flags}
                        </code>
                        <span className="text-[10px] opacity-30 block mt-0.5">{sp.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => copyToClipboard(`/${sp.pattern}/${sp.flags}`)}
                          className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60" title="Copy regex">
                          <Copy size={12} />
                        </button>
                        <button onClick={() => setSavedPatterns(prev => prev.filter(p => p.id !== sp.id))}
                          className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60 hover:!text-error" title="Delete">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
