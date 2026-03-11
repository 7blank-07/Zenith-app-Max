'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './BlogEditor.module.css';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmbedMarkup(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId
        ? `<figure><iframe src="https://www.youtube.com/embed/${escapeHtml(videoId)}" title="Embedded YouTube video"></iframe></figure>`
        : '';
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
      return videoId
        ? `<figure><iframe src="https://www.youtube.com/embed/${escapeHtml(videoId)}" title="Embedded YouTube video"></iframe></figure>`
        : '';
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      return videoId
        ? `<figure><iframe src="https://player.vimeo.com/video/${escapeHtml(videoId)}" title="Embedded Vimeo video"></iframe></figure>`
        : '';
    }
  } catch {
    return '';
  }

  return '';
}

export default function BlogEditorToolbar({
  editorRef,
  onChange,
  onUploadImage,
  slugHint
}) {
  const fileInputRef = useRef(null);
  const selectionRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [toolbarError, setToolbarError] = useState('');

  function selectionBelongsToEditor(selection) {
    const editor = editorRef.current;
    if (!editor || !selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const anchorNode = range.commonAncestorContainer;
    return editor.contains(anchorNode);
  }

  function rememberSelection() {
    const selection = window.getSelection();
    if (!selectionBelongsToEditor(selection)) {
      return;
    }

    selectionRef.current = selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    const selection = window.getSelection();
    if (!selection || !selectionRef.current) {
      editorRef.current?.focus();
      return;
    }

    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
    editorRef.current?.focus();
  }

  function syncEditor() {
    onChange(editorRef.current?.innerHTML || '');
  }

  function preventBlur(event) {
    event.preventDefault();
    rememberSelection();
  }

  function runCommand(command, value = null) {
    restoreSelection();
    document.execCommand(command, false, value);
    syncEditor();
  }

  function insertHtml(value) {
    restoreSelection();
    document.execCommand('insertHTML', false, value);
    syncEditor();
  }

  function promptForLink() {
    rememberSelection();
    const url = window.prompt('Enter a URL', 'https://');
    if (!url) return;

    const selectionText = window.getSelection()?.toString() || url;
    insertHtml(`<a href="${escapeHtml(url)}">${escapeHtml(selectionText)}</a>`);
  }

  function promptForImageUrl() {
    rememberSelection();
    const url = window.prompt('Enter an image URL', '');
    if (!url) return;

    const alt = window.prompt('Alt text for this image', '') || 'Blog image';
    insertHtml(`<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" /></figure>`);
  }

  function insertCodeBlock() {
    rememberSelection();
    const language = window.prompt('Language label (optional)', '') || '';
    const selectedText = window.getSelection()?.toString() || 'const example = true;';
    insertHtml(`<pre><code data-language="${escapeHtml(language)}">${escapeHtml(selectedText)}</code></pre>`);
  }

  function insertTable() {
    insertHtml(
      '<table><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr><td>Value</td><td>Value</td></tr><tr><td>Value</td><td>Value</td></tr></tbody></table>'
    );
  }

  function insertEmbed() {
    rememberSelection();
    const url = window.prompt('Enter a YouTube or Vimeo URL', 'https://');
    if (!url) return;

    const markup = buildEmbedMarkup(url);
    if (!markup) {
      setToolbarError('Only YouTube and Vimeo embeds are supported right now.');
      return;
    }

    setToolbarError('');
    insertHtml(markup);
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setUploading(true);
    setToolbarError('');

    try {
      const url = await onUploadImage(file, slugHint);
      insertHtml(`<figure><img src="${escapeHtml(url)}" alt="Uploaded blog image" /></figure>`);
    } catch (uploadFailure) {
      setToolbarError(uploadFailure instanceof Error ? uploadFailure.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    function handleSelectionChange() {
      rememberSelection();
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  });

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('formatBlock', 'p')}>
            P
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('formatBlock', 'h2')}>
            H2
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('formatBlock', 'h3')}>
            H3
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('bold')}>
            Bold
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('italic')}>
            Italic
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('insertUnorderedList')}>
            Bullets
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('insertOrderedList')}>
            Numbers
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('formatBlock', 'blockquote')}>
            Quote
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={insertCodeBlock}>
            Code
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={promptForLink}>
            Link
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={insertTable}>
            Table
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={promptForImageUrl}>
            Image URL
          </button>
          <button type="button" className={styles.toolbarUploadButton} onMouseDown={preventBlur} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload image'}
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={insertEmbed}>
            Embed
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />

      {toolbarError ? <div className={styles.error}>{toolbarError}</div> : null}
    </>
  );
}

