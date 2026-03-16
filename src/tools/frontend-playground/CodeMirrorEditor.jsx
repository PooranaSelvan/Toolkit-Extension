/* ═══════════════════════════════════════════════════════════
   CodeMirror 6 — React Smart Editor Component
   Full code intelligence: syntax highlighting, autocomplete,
   bracket matching, folding, search, multi-cursor, snippets
   ═══════════════════════════════════════════════════════════ */

import { useRef, useEffect, memo } from 'react';
import {
  EditorView,
  createEditorState,
  getLanguageExtension,
  getSnippetExtensions,
  languageCompartment,
  completionCompartment,
  wordWrapCompartment,
  placeholderCompartment,
} from './codemirrorSetup';
import { placeholder as cmPlaceholder } from '@codemirror/view';

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

const CodeMirrorEditor = memo(function CodeMirrorEditor({
  value,
  onChange,
  language = 'html',
  placeholder = '',
  wordWrap = false,
  fontSize = 13,
  onCursorChange,
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onCursorRef = useRef(onCursorChange);
  const prevLangRef = useRef(language);
  const prevWrapRef = useRef(wordWrap);
  const prevFontRef = useRef(fontSize);
  const prevPlaceholderRef = useRef(placeholder);
  // Track the last value we sent UP to React, to avoid echoing it back down
  const lastEmittedValueRef = useRef(value || '');

  // Keep callback refs fresh without recreating editor
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onCursorRef.current = onCursorChange;
  }, [onCursorChange]);

  // ─── Initialize Editor ───
  useEffect(() => {
    if (!containerRef.current) return;

    const state = createEditorState({
      doc: value || '',
      language,
      placeholderText: placeholder,
      wordWrap,
      onUpdate: (newDoc) => {
        // Always update the ref so we know what CodeMirror has
        lastEmittedValueRef.current = newDoc;
        onChangeRef.current?.(newDoc);
      },
      onCursorChange: (pos) => {
        onCursorRef.current?.(pos);
      },
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount/unmount — language/wordWrap changes handled via compartments
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Sync external value changes ───
  // Only push value into CodeMirror when it genuinely differs from
  // what CodeMirror last emitted (e.g. loading a sample, reset, undo).
  // This prevents the echo-back loop that caused the browser to freeze
  // when bracket auto-close or snippets modified the document.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // If the incoming value is exactly what CodeMirror last told us,
    // skip the dispatch — CodeMirror already has this content.
    if (value === lastEmittedValueRef.current) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      lastEmittedValueRef.current = value || '';
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: value || '',
        },
      });
    }
  }, [value]);

  // ─── Language change via compartment ───
  useEffect(() => {
    const view = viewRef.current;
    if (!view || language === prevLangRef.current) return;
    prevLangRef.current = language;

    const langExtension = getLanguageExtension(language);
    const snippetExts = getSnippetExtensions(language);

    // Reconfigure both language and snippet extensions in one dispatch.
    // snippetExts are proper Extension objects (language.data.of registrations),
    // so they're safe to pass into compartment.reconfigure().
    // The autocompletion() UI extension (configured without override) stays
    // static and picks up completions from the new language + snippets automatically.
    view.dispatch({
      effects: [
        languageCompartment.reconfigure(langExtension),
        completionCompartment.reconfigure(snippetExts),
      ],
    });
  }, [language]);

  // ─── Word wrap change via compartment ───
  useEffect(() => {
    const view = viewRef.current;
    if (!view || wordWrap === prevWrapRef.current) return;
    prevWrapRef.current = wordWrap;

    view.dispatch({
      effects: wordWrapCompartment.reconfigure(
        wordWrap ? EditorView.lineWrapping : []
      ),
    });
  }, [wordWrap]);

  // ─── Font size change ───
  useEffect(() => {
    const view = viewRef.current;
    if (!view || fontSize === prevFontRef.current) return;
    prevFontRef.current = fontSize;

    // Apply font size via DOM style (most reliable for dynamic changes)
    const dom = view.dom;
    if (dom) {
      dom.style.fontSize = `${fontSize}px`;
      const gutters = dom.querySelector('.cm-gutters');
      if (gutters) gutters.style.fontSize = `${Math.round(fontSize * 0.846)}px`;
    }
  }, [fontSize]);

  // ─── Placeholder change ───
  useEffect(() => {
    const view = viewRef.current;
    if (!view || placeholder === prevPlaceholderRef.current) return;
    prevPlaceholderRef.current = placeholder;

    view.dispatch({
      effects: placeholderCompartment.reconfigure(
        placeholder ? cmPlaceholder(placeholder) : []
      ),
    });
  }, [placeholder]);

  return (
    <div
      ref={containerRef}
      className="playground-cm-editor"
      data-language={language}
      style={{ height: '100%', overflow: 'hidden' }}
    />
  );
});

export default CodeMirrorEditor;
