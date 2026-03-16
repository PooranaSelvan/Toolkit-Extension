/* ═══════════════════════════════════════════════════════════
   CodeMirror 6 — Full Editor Setup with Code Intelligence
   For Frontend Playground (HTML / CSS / JavaScript)
   ═══════════════════════════════════════════════════════════ */

import {
  EditorView,
  keymap,
  highlightActiveLine,
  highlightActiveLineGutter,
  lineNumbers,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  placeholder as cmPlaceholder,
} from '@codemirror/view';

import { EditorState, Compartment } from '@codemirror/state';

import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentUnit,
} from '@codemirror/language';

import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
  snippetCompletion,
  completeFromList,
} from '@codemirror/autocomplete';

import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  toggleComment,
} from '@codemirror/commands';

import {
  searchKeymap,
  highlightSelectionMatches,
} from '@codemirror/search';

import { html, htmlLanguage } from '@codemirror/lang-html';
import { css, cssLanguage } from '@codemirror/lang-css';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { tags } from '@lezer/highlight';

/* ═══════════════════════════════════════════════════════════
   CUSTOM DARK THEME (IDE-grade, glassmorphic)
   ═══════════════════════════════════════════════════════════ */
const playgroundTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
    height: '100%',
  },
  '.cm-content': {
    caretColor: 'var(--color-primary)',
    padding: '8px 0',
    minHeight: '100%',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-primary)',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--color-primary)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 4%, transparent)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 6%, transparent)',
    color: 'var(--color-primary)',
    fontWeight: '700',
  },
  '.cm-gutters': {
    backgroundColor: 'color-mix(in oklch, var(--color-base-200) 60%, transparent)',
    color: 'color-mix(in oklch, var(--color-base-content) 25%, transparent)',
    border: 'none',
    borderRight: '1px solid color-mix(in oklch, var(--color-base-content) 6%, transparent)',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '11px',
    minWidth: '3rem',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 4px',
    minWidth: '2.5rem',
    textAlign: 'right',
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
    cursor: 'pointer',
    color: 'color-mix(in oklch, var(--color-base-content) 20%, transparent)',
    transition: 'color 0.15s',
  },
  '.cm-foldGutter .cm-gutterElement:hover': {
    color: 'var(--color-primary)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 18%, transparent) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 22%, transparent) !important',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 12%, transparent)',
    borderRadius: '2px',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 18%, transparent)',
    color: 'var(--color-primary) !important',
    outline: '1px solid color-mix(in oklch, var(--color-primary) 30%, transparent)',
    borderRadius: '2px',
    fontWeight: '700',
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: 'color-mix(in oklch, var(--color-error) 15%, transparent)',
    color: 'var(--color-error) !important',
  },
  '.cm-searchMatch': {
    backgroundColor: 'color-mix(in oklch, var(--color-warning) 25%, transparent)',
    borderRadius: '2px',
    outline: '1px solid color-mix(in oklch, var(--color-warning) 40%, transparent)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 30%, transparent)',
    outline: '1px solid color-mix(in oklch, var(--color-primary) 50%, transparent)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 10%, transparent)',
    border: '1px solid color-mix(in oklch, var(--color-primary) 20%, transparent)',
    color: 'var(--color-primary)',
    borderRadius: '4px',
    padding: '0 6px',
    margin: '0 4px',
    fontSize: '0.75em',
    cursor: 'pointer',
  },
  '.cm-tooltip': {
    backgroundColor: 'color-mix(in oklch, var(--color-base-100) 97%, transparent)',
    backdropFilter: 'blur(20px) saturate(200%)',
    border: '1px solid color-mix(in oklch, var(--color-base-content) 10%, transparent)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px color-mix(in oklch, var(--color-base-content) 12%, transparent)',
    overflow: 'hidden',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul': {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '12px',
      maxHeight: '16em',
      padding: '4px',
    },
    '& > ul > li': {
      padding: '4px 8px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.1s',
      lineHeight: '1.6',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: 'color-mix(in oklch, var(--color-primary) 14%, transparent)',
      color: 'var(--color-base-content)',
    },
  },
  '.cm-completionIcon': {
    fontSize: '11px',
    opacity: '0.7',
    width: '1.2em',
    textAlign: 'center',
  },
  '.cm-completionLabel': {
    fontWeight: '600',
    flex: '1',
  },
  '.cm-completionMatchedText': {
    color: 'var(--color-primary)',
    fontWeight: '800',
    textDecoration: 'none',
  },
  '.cm-completionDetail': {
    fontSize: '10px',
    opacity: '0.45',
    fontStyle: 'italic',
    marginLeft: 'auto',
    paddingLeft: '8px',
  },
  '.cm-tooltip.cm-completionInfo': {
    padding: '8px 12px',
    fontSize: '12px',
    lineHeight: '1.5',
    maxWidth: '300px',
    borderRadius: '8px',
  },
  '.cm-panels': {
    backgroundColor: 'color-mix(in oklch, var(--color-base-200) 70%, transparent)',
    color: 'var(--color-base-content)',
    borderColor: 'color-mix(in oklch, var(--color-base-content) 8%, transparent)',
  },
  '.cm-panels .cm-button': {
    backgroundImage: 'none',
    backgroundColor: 'color-mix(in oklch, var(--color-primary) 12%, transparent)',
    color: 'var(--color-primary)',
    border: '1px solid color-mix(in oklch, var(--color-primary) 20%, transparent)',
    borderRadius: '6px',
    padding: '2px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  '.cm-panels .cm-textfield': {
    backgroundColor: 'color-mix(in oklch, var(--color-base-content) 5%, transparent)',
    color: 'var(--color-base-content)',
    border: '1px solid color-mix(in oklch, var(--color-base-content) 10%, transparent)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '12px',
    outline: 'none',
    fontFamily: "'JetBrains Mono', monospace",
  },
  '.cm-panels .cm-textfield:focus': {
    borderColor: 'color-mix(in oklch, var(--color-primary) 40%, transparent)',
    boxShadow: '0 0 0 2px color-mix(in oklch, var(--color-primary) 10%, transparent)',
  },
  '.cm-scroller': {
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'color-mix(in oklch, var(--color-base-content) 15%, transparent) transparent',
  },
  '.cm-specialChar': {
    color: 'var(--color-error)',
  },
}, { dark: false });

/* ═══════════════════════════════════════════════════════════
   SYNTAX HIGHLIGHTING — Beautiful & language-aware
   ═══════════════════════════════════════════════════════════ */
const playgroundHighlightStyle = HighlightStyle.define([
  // Keywords & control
  { tag: tags.keyword, color: '#c678dd', fontWeight: '600' },
  { tag: tags.controlKeyword, color: '#c678dd', fontWeight: '700' },
  { tag: tags.operatorKeyword, color: '#c678dd' },
  { tag: tags.definitionKeyword, color: '#c678dd', fontWeight: '700' },
  { tag: tags.moduleKeyword, color: '#c678dd', fontWeight: '600' },

  // Variables, properties, definitions
  { tag: tags.variableName, color: '#e06c75' },
  { tag: tags.definition(tags.variableName), color: '#61afef', fontWeight: '600' },
  { tag: tags.propertyName, color: '#e06c75' },
  { tag: tags.definition(tags.propertyName), color: '#61afef' },
  { tag: tags.local(tags.variableName), color: '#e5c07b' },

  // Functions
  { tag: tags.function(tags.variableName), color: '#61afef', fontWeight: '600' },
  { tag: tags.function(tags.propertyName), color: '#61afef', fontWeight: '600' },

  // Types & classes
  { tag: tags.typeName, color: '#e5c07b', fontWeight: '600' },
  { tag: tags.className, color: '#e5c07b', fontWeight: '700' },
  { tag: tags.namespace, color: '#e5c07b' },
  { tag: tags.macroName, color: '#e06c75', fontWeight: '700' },

  // Strings & regex
  { tag: tags.string, color: '#98c379' },
  { tag: tags.special(tags.string), color: '#56b6c2' },
  { tag: tags.regexp, color: '#56b6c2' },
  { tag: tags.escape, color: '#d19a66', fontWeight: '700' },

  // Numbers & literals
  { tag: tags.number, color: '#d19a66' },
  { tag: tags.bool, color: '#d19a66', fontWeight: '700' },
  { tag: tags.null, color: '#d19a66', fontStyle: 'italic' },
  { tag: tags.atom, color: '#d19a66' },

  // Comments
  { tag: tags.comment, color: '#7f848e', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#7f848e', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#7f848e', fontStyle: 'italic' },
  { tag: tags.docComment, color: '#7f848e', fontStyle: 'italic' },

  // Operators & punctuation
  { tag: tags.operator, color: '#56b6c2' },
  { tag: tags.punctuation, color: '#abb2bf' },
  { tag: tags.paren, color: '#abb2bf' },
  { tag: tags.squareBracket, color: '#abb2bf' },
  { tag: tags.brace, color: '#abb2bf' },
  { tag: tags.derefOperator, color: '#abb2bf' },
  { tag: tags.separator, color: '#abb2bf' },

  // HTML specific
  { tag: tags.tagName, color: '#e06c75', fontWeight: '600' },
  { tag: tags.attributeName, color: '#d19a66' },
  { tag: tags.attributeValue, color: '#98c379' },
  { tag: tags.angleBracket, color: '#abb2bf' },
  { tag: tags.self, color: '#e06c75' },
  { tag: tags.documentMeta, color: '#7f848e' },
  { tag: tags.processingInstruction, color: '#7f848e' },

  // CSS specific
  { tag: tags.color, color: '#d19a66' },
  { tag: tags.unit, color: '#d19a66' },
  { tag: tags.labelName, color: '#e06c75' },

  // Meta
  { tag: tags.meta, color: '#7f848e' },
  { tag: tags.invalid, color: '#fff', backgroundColor: '#e06c75' },
  { tag: tags.link, color: '#61afef', textDecoration: 'underline' },
  { tag: tags.heading, color: '#e06c75', fontWeight: '800' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: '800' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
]);

/* ═══════════════════════════════════════════════════════════
   CUSTOM JS SNIPPETS
   ═══════════════════════════════════════════════════════════ */

const jsSnippets = [
  // Functions
  snippetCompletion('function ${name}(${params}) {\n\t${}\n}', { label: 'function', detail: 'function declaration', type: 'keyword', boost: 10 }),
  snippetCompletion('const ${name} = (${params}) => {\n\t${}\n}', { label: 'arrow', detail: 'arrow function', type: 'keyword', boost: 9 }),
  snippetCompletion('async function ${name}(${params}) {\n\ttry {\n\t\t${}\n\t} catch (err) {\n\t\tconsole.error(err);\n\t}\n}', { label: 'async', detail: 'async function + try/catch', type: 'keyword', boost: 9 }),

  // Control flow
  snippetCompletion('if (${condition}) {\n\t${}\n}', { label: 'if', detail: 'if statement', type: 'keyword', boost: 8 }),
  snippetCompletion('if (${condition}) {\n\t${}\n} else {\n\t\n}', { label: 'ifelse', detail: 'if/else statement', type: 'keyword', boost: 7 }),
  snippetCompletion('for (let ${i} = 0; ${i} < ${length}; ${i}++) {\n\t${}\n}', { label: 'for', detail: 'for loop', type: 'keyword', boost: 7 }),
  snippetCompletion('for (const ${item} of ${iterable}) {\n\t${}\n}', { label: 'forof', detail: 'for...of loop', type: 'keyword', boost: 7 }),
  snippetCompletion('for (const ${key} in ${object}) {\n\t${}\n}', { label: 'forin', detail: 'for...in loop', type: 'keyword', boost: 6 }),
  snippetCompletion('while (${condition}) {\n\t${}\n}', { label: 'while', detail: 'while loop', type: 'keyword', boost: 6 }),
  snippetCompletion('switch (${expr}) {\n\tcase ${value}:\n\t\t${}\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}', { label: 'switch', detail: 'switch statement', type: 'keyword', boost: 6 }),
  snippetCompletion('try {\n\t${}\n} catch (${err}) {\n\tconsole.error(${err});\n}', { label: 'trycatch', detail: 'try/catch block', type: 'keyword', boost: 6 }),

  // Classes
  snippetCompletion('class ${Name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}', { label: 'class', detail: 'class declaration', type: 'keyword', boost: 8 }),
  snippetCompletion('class ${Name} extends ${Base} {\n\tconstructor(${params}) {\n\t\tsuper(${});\n\t}\n}', { label: 'classex', detail: 'class extends', type: 'keyword', boost: 7 }),

  // Array methods
  snippetCompletion('.forEach((${item}) => {\n\t${}\n})', { label: '.forEach', detail: 'Array forEach', type: 'method', boost: 8 }),
  snippetCompletion('.map((${item}) => {\n\treturn ${item};\n})', { label: '.map', detail: 'Array map', type: 'method', boost: 8 }),
  snippetCompletion('.filter((${item}) => {\n\treturn ${condition};\n})', { label: '.filter', detail: 'Array filter', type: 'method', boost: 8 }),
  snippetCompletion('.reduce((${acc}, ${cur}) => {\n\treturn ${acc};\n}, ${})', { label: '.reduce', detail: 'Array reduce', type: 'method', boost: 7 }),
  snippetCompletion('.find((${item}) => ${condition})', { label: '.find', detail: 'Array find', type: 'method', boost: 7 }),
  snippetCompletion('.some((${item}) => ${condition})', { label: '.some', detail: 'Array some', type: 'method', boost: 6 }),
  snippetCompletion('.every((${item}) => ${condition})', { label: '.every', detail: 'Array every', type: 'method', boost: 6 }),

  // DOM
  snippetCompletion("document.querySelector('${selector}')", { label: 'qs', detail: 'querySelector', type: 'function', boost: 9 }),
  snippetCompletion("document.querySelectorAll('${selector}')", { label: 'qsa', detail: 'querySelectorAll', type: 'function', boost: 8 }),
  snippetCompletion("document.getElementById('${id}')", { label: 'gid', detail: 'getElementById', type: 'function', boost: 8 }),
  snippetCompletion("document.createElement('${tag}')", { label: 'ce', detail: 'createElement', type: 'function', boost: 7 }),
  snippetCompletion(".addEventListener('${event}', (${e}) => {\n\t${}\n})", { label: '.ael', detail: 'addEventListener', type: 'method', boost: 9 }),
  snippetCompletion(".addEventListener('click', (e) => {\n\t${}\n})", { label: '.click', detail: 'click listener', type: 'method', boost: 8 }),

  // Console
  snippetCompletion('console.log(${});', { label: 'clg', detail: 'console.log', type: 'function', boost: 10 }),
  snippetCompletion('console.warn(${});', { label: 'cwn', detail: 'console.warn', type: 'function', boost: 7 }),
  snippetCompletion('console.error(${});', { label: 'cer', detail: 'console.error', type: 'function', boost: 7 }),
  snippetCompletion('console.table(${});', { label: 'ctb', detail: 'console.table', type: 'function', boost: 6 }),

  // Async patterns
  snippetCompletion("fetch('${url}')\n\t.then(res => res.json())\n\t.then(data => {\n\t\t${}\n\t})\n\t.catch(err => console.error(err));", { label: 'fetch', detail: 'fetch API call', type: 'function', boost: 9 }),
  snippetCompletion("const ${response} = await fetch('${url}');\nconst ${data} = await ${response}.json();", { label: 'afetch', detail: 'await fetch', type: 'function', boost: 8 }),
  snippetCompletion('new Promise((resolve, reject) => {\n\t${}\n})', { label: 'prom', detail: 'new Promise', type: 'function', boost: 7 }),
  snippetCompletion('setTimeout(() => {\n\t${}\n}, ${delay});', { label: 'sto', detail: 'setTimeout', type: 'function', boost: 8 }),
  snippetCompletion('setInterval(() => {\n\t${}\n}, ${interval});', { label: 'si', detail: 'setInterval', type: 'function', boost: 7 }),
  snippetCompletion('requestAnimationFrame(function ${loop}() {\n\t${}\n\trequestAnimationFrame(${loop});\n});', { label: 'raf', detail: 'requestAnimationFrame loop', type: 'function', boost: 6 }),

  // Modern JS
  snippetCompletion('const [${a}, ${b}] = ${array};', { label: 'destarr', detail: 'array destructure', type: 'keyword', boost: 6 }),
  snippetCompletion('const { ${a}, ${b} } = ${object};', { label: 'destobj', detail: 'object destructure', type: 'keyword', boost: 6 }),
  snippetCompletion('const ${name} = `${template}`;', { label: 'tl', detail: 'template literal', type: 'keyword', boost: 6 }),
  snippetCompletion('export default ${};', { label: 'expd', detail: 'export default', type: 'keyword', boost: 5 }),
  snippetCompletion("import { ${} } from '${module}';", { label: 'imp', detail: 'import statement', type: 'keyword', boost: 5 }),

  // Storage
  snippetCompletion("localStorage.setItem('${key}', JSON.stringify(${value}));", { label: 'lss', detail: 'localStorage set', type: 'function', boost: 6 }),
  snippetCompletion("JSON.parse(localStorage.getItem('${key}'))", { label: 'lsg', detail: 'localStorage get', type: 'function', boost: 6 }),

  // Observer patterns
  snippetCompletion("const observer = new IntersectionObserver((entries) => {\n\tentries.forEach(entry => {\n\t\tif (entry.isIntersecting) {\n\t\t\t${}\n\t\t}\n\t});\n}, { threshold: ${0.1} });\nobserver.observe(${element});", { label: 'iobs', detail: 'IntersectionObserver', type: 'function', boost: 5 }),
  snippetCompletion("const observer = new MutationObserver((mutations) => {\n\tmutations.forEach(mutation => {\n\t\t${}\n\t});\n});\nobserver.observe(${element}, { childList: true, subtree: true });", { label: 'mobs', detail: 'MutationObserver', type: 'function', boost: 5 }),
];

/* ═══════════════════════════════════════════════════════════
   CUSTOM CSS SNIPPETS
   ═══════════════════════════════════════════════════════════ */

const cssSnippets = [
  snippetCompletion('display: flex;\nalign-items: ${center};\njustify-content: ${center};', { label: 'flex-center', detail: 'Flex centered layout', type: 'keyword', boost: 10 }),
  snippetCompletion('display: grid;\ngrid-template-columns: repeat(${auto-fit}, minmax(${280px}, 1fr));\ngap: ${1rem};', { label: 'grid-auto', detail: 'Auto-fit grid', type: 'keyword', boost: 9 }),
  snippetCompletion('position: absolute;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);', { label: 'abs-center', detail: 'Absolute center', type: 'keyword', boost: 8 }),
  snippetCompletion('background: linear-gradient(${135deg}, ${#667eea}, ${#764ba2});', { label: 'gradient', detail: 'Linear gradient', type: 'keyword', boost: 8 }),
  snippetCompletion('box-shadow: 0 ${4px} ${16px} rgba(0, 0, 0, ${0.1});', { label: 'shadow', detail: 'Box shadow', type: 'keyword', boost: 7 }),
  snippetCompletion('transition: all ${0.3s} ${ease};', { label: 'transition', detail: 'Transition shorthand', type: 'keyword', boost: 7 }),
  snippetCompletion('@keyframes ${name} {\n\tfrom { ${} }\n\tto { ${} }\n}', { label: '@keyframes', detail: 'Keyframes animation', type: 'keyword', boost: 8 }),
  snippetCompletion('@media (max-width: ${768px}) {\n\t${}\n}', { label: '@media', detail: 'Media query', type: 'keyword', boost: 8 }),
  snippetCompletion('background: rgba(${255}, ${255}, ${255}, ${0.05});\nbackdrop-filter: blur(${20px});\nborder: 1px solid rgba(${255}, ${255}, ${255}, ${0.1});\nborder-radius: ${1rem};', { label: 'glass', detail: 'Glassmorphism', type: 'keyword', boost: 9 }),
  snippetCompletion('overflow: hidden;\ntext-overflow: ellipsis;\nwhite-space: nowrap;', { label: 'truncate', detail: 'Text truncate', type: 'keyword', boost: 7 }),
  snippetCompletion('-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;\nbackground-clip: text;', { label: 'text-clip', detail: 'Gradient text clip', type: 'keyword', boost: 6 }),
  snippetCompletion(':root {\n\t--${name}: ${value};\n}', { label: ':root', detail: 'CSS variables root', type: 'keyword', boost: 6 }),
  snippetCompletion('scroll-behavior: smooth;', { label: 'smooth-scroll', detail: 'Smooth scroll', type: 'keyword', boost: 5 }),
];

/* ═══════════════════════════════════════════════════════════
   CUSTOM HTML SNIPPETS — Emmet-like
   ═══════════════════════════════════════════════════════════ */

const htmlSnippets = [
  snippetCompletion('<div class="${}">\n\t${}\n</div>', { label: 'div.', detail: 'div with class', type: 'keyword', boost: 10 }),
  snippetCompletion('<div id="${}">\n\t${}\n</div>', { label: 'div#', detail: 'div with id', type: 'keyword', boost: 9 }),
  snippetCompletion('<a href="${#}">${link text}</a>', { label: 'a', detail: 'anchor link', type: 'keyword', boost: 8 }),
  snippetCompletion('<img src="${}" alt="${}" />', { label: 'img', detail: 'image', type: 'keyword', boost: 8 }),
  snippetCompletion('<input type="${text}" name="${}" placeholder="${}" />', { label: 'input', detail: 'input field', type: 'keyword', boost: 8 }),
  snippetCompletion('<button type="${button}">${Click me}</button>', { label: 'btn', detail: 'button', type: 'keyword', boost: 8 }),
  snippetCompletion('<ul>\n\t<li>${}</li>\n\t<li>${}</li>\n\t<li>${}</li>\n</ul>', { label: 'ul>li', detail: 'unordered list', type: 'keyword', boost: 7 }),
  snippetCompletion('<section class="${}">\n\t<div class="container">\n\t\t${}\n\t</div>\n</section>', { label: 'section', detail: 'section + container', type: 'keyword', boost: 7 }),
  snippetCompletion('<nav class="${navbar}">\n\t<div class="logo">${Logo}</div>\n\t<ul>\n\t\t<li><a href="#">${Home}</a></li>\n\t\t<li><a href="#">${About}</a></li>\n\t\t<li><a href="#">${Contact}</a></li>\n\t</ul>\n</nav>', { label: 'nav', detail: 'navigation bar', type: 'keyword', boost: 7 }),
  snippetCompletion('<form action="${}" method="${post}">\n\t${}\n\t<button type="submit">${Submit}</button>\n</form>', { label: 'form', detail: 'form element', type: 'keyword', boost: 7 }),
  snippetCompletion('<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>${Header}</th>\n\t\t</tr>\n\t</thead>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td>${Data}</td>\n\t\t</tr>\n\t</tbody>\n</table>', { label: 'table', detail: 'table structure', type: 'keyword', boost: 6 }),
  snippetCompletion('<details>\n\t<summary>${Click to expand}</summary>\n\t${Content here}\n</details>', { label: 'details', detail: 'details/summary', type: 'keyword', boost: 5 }),
  snippetCompletion('<video src="${}" controls width="${640}"></video>', { label: 'video', detail: 'video element', type: 'keyword', boost: 5 }),
  snippetCompletion('<link rel="stylesheet" href="${}" />', { label: 'link:css', detail: 'CSS link', type: 'keyword', boost: 7 }),
  snippetCompletion('<script src="${}"></script>', { label: 'script:src', detail: 'JS script', type: 'keyword', boost: 7 }),
  snippetCompletion('<!-- ${comment} -->', { label: 'comment', detail: 'HTML comment', type: 'keyword', boost: 5 }),
];

/* ═══════════════════════════════════════════════════════════
   SNIPPET EXTENSIONS — Registered via language.data.of()
   
   These are proper CodeMirror Extension objects. They register
   custom snippets as ADDITIONAL completion sources alongside
   the built-in language completions (HTML tags, CSS properties,
   JS keywords). This is the correct CodeMirror 6 pattern.
   
   NEVER pass raw completion functions into extensions[].
   ALWAYS use language.data.of({ autocomplete: ... }) or
   autocompletion({ override: [...] }).
   ═══════════════════════════════════════════════════════════ */

const jsSnippetExtension = javascriptLanguage.data.of({
  autocomplete: completeFromList(jsSnippets),
});

const cssSnippetExtension = cssLanguage.data.of({
  autocomplete: completeFromList(cssSnippets),
});

const htmlSnippetExtension = htmlLanguage.data.of({
  autocomplete: completeFromList(htmlSnippets),
});

/* ═══════════════════════════════════════════════════════════
   LANGUAGE CONFIG FACTORY
   ═══════════════════════════════════════════════════════════ */

export function getLanguageExtension(lang) {
  switch (lang) {
    case 'html':
      return html({
        autoCloseTags: true,
        matchClosingTags: true,
        selfClosingTags: true,
      });
    case 'css':
      return css();
    case 'js':
      return javascript();
    default:
      return javascript();
  }
}

/**
 * Returns custom snippet extensions for each language.
 * These are proper CodeMirror Extension objects (language-data registrations),
 * NOT raw functions. Safe to include in extensions[] or compartment.reconfigure().
 */
export function getSnippetExtensions(lang) {
  switch (lang) {
    case 'html':
      return [htmlSnippetExtension];
    case 'css':
      return [cssSnippetExtension];
    case 'js':
      return [jsSnippetExtension];
    default:
      return [];
  }
}

/* ═══════════════════════════════════════════════════════════
   COMPARTMENTS — For dynamic reconfiguration
   ═══════════════════════════════════════════════════════════ */

export const languageCompartment = new Compartment();
export const completionCompartment = new Compartment();
export const tabSizeCompartment = new Compartment();
export const wordWrapCompartment = new Compartment();
export const readOnlyCompartment = new Compartment();
export const fontSizeCompartment = new Compartment();
export const placeholderCompartment = new Compartment();

/* ═══════════════════════════════════════════════════════════
   CREATE EDITOR STATE — Fully configured
   ═══════════════════════════════════════════════════════════ */

export function createEditorState({
  doc = '',
  language: lang = 'html',
  onUpdate = () => { },
  onCursorChange = () => { },
  placeholderText = '',
  wordWrap = false,
}) {
  const snippetExts = getSnippetExtensions(lang);

  return EditorState.create({
    doc,
    extensions: [
      // Core editor features
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter({
        openText: '▾',
        closedText: '▸',
      }),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),

      // Indentation
      tabSizeCompartment.of(indentUnit.of('  ')),

      // Word wrap
      wordWrapCompartment.of(wordWrap ? EditorView.lineWrapping : []),

      // Placeholder
      placeholderCompartment.of(placeholderText ? cmPlaceholder(placeholderText) : []),

      // Language support (includes built-in completions: HTML tags, CSS props, JS keywords)
      languageCompartment.of(getLanguageExtension(lang)),

      // Custom snippet extensions (registered via language.data.of — proper Extensions)
      // These ADD to the built-in completions, they don't replace them.
      completionCompartment.of(snippetExts),

      // Autocompletion UI configuration — NO override, so BOTH built-in
      // language completions AND our custom snippets work together
      autocompletion({
        maxRenderedOptions: 20,
        activateOnTyping: true,
        activateOnTypingDelay: 150,
        closeOnBlur: true,
        icons: true,
        tooltipClass: () => 'playground-cm-tooltip',
        // Don't trigger autocomplete for brackets/quotes — these are handled
        // by closeBrackets and triggering autocomplete on them causes lag
        activateOnCompletion: () => false,
      }),

      // Syntax highlighting
      syntaxHighlighting(playgroundHighlightStyle, { fallback: true }),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

      // Theme
      playgroundTheme,

      // Keymaps
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        indentWithTab,
        {
          key: 'Mod-/',
          run: toggleComment,
        },
      ]),

      // Update listener
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onUpdate(update.state.doc.toString());
        }
        if (update.selectionSet || update.docChanged) {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          onCursorChange({
            line: line.number,
            col: pos - line.from + 1,
          });
        }
      }),

      // DOM event handlers
      EditorView.domEventHandlers({
        scroll: () => { },
      }),
    ],
  });
}

/* ═══════════════════════════════════════════════════════════
   FONT SIZE THEME OVERRIDE
   ═══════════════════════════════════════════════════════════ */
export function fontSizeTheme(size) {
  return EditorView.theme({
    '&': { fontSize: `${size}px` },
    '.cm-gutters': { fontSize: `${Math.round(size * 0.846)}px` },
  });
}

/* ═══════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════ */
export { EditorView, EditorState };
