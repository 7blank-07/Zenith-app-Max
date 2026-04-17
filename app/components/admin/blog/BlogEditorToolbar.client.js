'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './BlogEditor.module.css';

const IMAGE_SIZE_VALUES = Object.freeze(['narrow', 'medium', 'wide', 'full']);
const IMAGE_ALIGN_VALUES = Object.freeze(['left', 'center', 'right']);
const IMAGE_RATIO_VALUES = Object.freeze(['auto', '16x9', '4x3', '1x1', '3x4']);
const IMAGE_FIT_VALUES = Object.freeze(['contain', 'cover']);
const IMAGE_FOCUS_VALUES = Object.freeze(['center', 'top', 'bottom', 'left', 'right']);

const DEFAULT_IMAGE_SETTINGS = Object.freeze({
  size: 'wide',
  align: 'center',
  ratio: 'auto',
  fit: 'contain',
  focus: 'center',
  alt: 'Blog image',
  caption: ''
});

const DEFAULT_TABLE_SETTINGS = Object.freeze({
  columns: 3,
  rows: 3
});

const MAX_TABLE_DIMENSION = 12;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeOption(value, allowedValues, fallback) {
  const normalized = toText(value).toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function getClosestImageFigure(node, editor) {
  let current = node;

  while (current && current !== editor) {
    if (
      current &&
      current.nodeType === 1 &&
      current.tagName.toLowerCase() === 'figure' &&
      current.querySelector('img')
    ) {
      return current;
    }
    current = current.parentNode;
  }

  return null;
}

function readFigureImageSettings(figure) {
  if (!figure) return null;

  const image = figure.querySelector('img');
  if (!image) return null;

  const captionNode = figure.querySelector('figcaption');

  return {
    size: normalizeOption(figure.dataset.imgSize, IMAGE_SIZE_VALUES, DEFAULT_IMAGE_SETTINGS.size),
    align: normalizeOption(figure.dataset.imgAlign, IMAGE_ALIGN_VALUES, DEFAULT_IMAGE_SETTINGS.align),
    ratio: normalizeOption(figure.dataset.imgRatio, IMAGE_RATIO_VALUES, DEFAULT_IMAGE_SETTINGS.ratio),
    fit: normalizeOption(figure.dataset.imgFit, IMAGE_FIT_VALUES, DEFAULT_IMAGE_SETTINGS.fit),
    focus: normalizeOption(figure.dataset.imgFocus, IMAGE_FOCUS_VALUES, DEFAULT_IMAGE_SETTINGS.focus),
    alt: toText(image.getAttribute('alt'), DEFAULT_IMAGE_SETTINGS.alt),
    caption: toText(captionNode?.textContent)
  };
}

function applyImageSettingsToFigure(figure, settings) {
  if (!figure) return;
  const image = figure.querySelector('img');
  if (!image) return;

  figure.dataset.imgSize = normalizeOption(settings.size, IMAGE_SIZE_VALUES, DEFAULT_IMAGE_SETTINGS.size);
  figure.dataset.imgAlign = normalizeOption(settings.align, IMAGE_ALIGN_VALUES, DEFAULT_IMAGE_SETTINGS.align);
  figure.dataset.imgRatio = normalizeOption(settings.ratio, IMAGE_RATIO_VALUES, DEFAULT_IMAGE_SETTINGS.ratio);
  figure.dataset.imgFit = normalizeOption(settings.fit, IMAGE_FIT_VALUES, DEFAULT_IMAGE_SETTINGS.fit);
  figure.dataset.imgFocus = normalizeOption(settings.focus, IMAGE_FOCUS_VALUES, DEFAULT_IMAGE_SETTINGS.focus);
  image.setAttribute('alt', toText(settings.alt, DEFAULT_IMAGE_SETTINGS.alt) || DEFAULT_IMAGE_SETTINGS.alt);

  const caption = toText(settings.caption);
  const existingCaption = figure.querySelector('figcaption');
  if (caption) {
    if (existingCaption) {
      existingCaption.textContent = caption;
    } else {
      const nextCaption = document.createElement('figcaption');
      nextCaption.textContent = caption;
      figure.appendChild(nextCaption);
    }
  } else if (existingCaption) {
    existingCaption.remove();
  }
}

function buildImageMarkup({ url, alt, caption }) {
  const escapedAlt = escapeHtml(toText(alt, DEFAULT_IMAGE_SETTINGS.alt) || DEFAULT_IMAGE_SETTINGS.alt);
  const escapedCaption = escapeHtml(toText(caption));
  return `<figure data-img-size="${DEFAULT_IMAGE_SETTINGS.size}" data-img-align="${DEFAULT_IMAGE_SETTINGS.align}" data-img-ratio="${DEFAULT_IMAGE_SETTINGS.ratio}" data-img-fit="${DEFAULT_IMAGE_SETTINGS.fit}" data-img-focus="${DEFAULT_IMAGE_SETTINGS.focus}"><img src="${escapeHtml(url)}" alt="${escapedAlt}" />${escapedCaption ? `<figcaption>${escapedCaption}</figcaption>` : ''}</figure>`;
}

function sanitizeTableDimension(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(MAX_TABLE_DIMENSION, Math.max(1, parsed));
}

function buildTableMarkup({ columns, rows }) {
  const safeColumns = sanitizeTableDimension(columns, DEFAULT_TABLE_SETTINGS.columns);
  const safeRows = sanitizeTableDimension(rows, DEFAULT_TABLE_SETTINGS.rows);

  const headCells = Array.from({ length: safeColumns }, (_, index) => `<th>Column ${index + 1}</th>`).join('');
  const bodyRows = Array.from({ length: safeRows }, (_, rowIndex) => {
    const cells = Array.from({ length: safeColumns }, () => `<td>Value ${rowIndex + 1}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<table><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
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
  const toolbarRootRef = useRef(null);
  const selectionRef = useRef(null);
  const selectedFigureRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [toolbarError, setToolbarError] = useState('');
  const [selectedImageSettings, setSelectedImageSettings] = useState(null);
  const [tableSettings, setTableSettings] = useState(DEFAULT_TABLE_SETTINGS);

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
    const html = (editorRef.current?.innerHTML || '').replace(/\sdata-selected="true"/g, '');
    onChange(html);
  }

  function preventBlur(event) {
    event.preventDefault();
    rememberSelection();
  }

  function setSelectedFigure(nextFigure) {
    if (selectedFigureRef.current && selectedFigureRef.current !== nextFigure) {
      selectedFigureRef.current.removeAttribute('data-selected');
    }

    selectedFigureRef.current = nextFigure || null;

    if (!nextFigure) {
      setSelectedImageSettings(null);
      return;
    }

    nextFigure.setAttribute('data-selected', 'true');
    setSelectedImageSettings(readFigureImageSettings(nextFigure));
  }

  function syncSelectedFigureFromSelection() {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const figure = getClosestImageFigure(selection.anchorNode, editor);
    if (figure && editor.contains(figure)) {
      setSelectedFigure(figure);
      return;
    }

    if (selectionBelongsToEditor(selection)) {
      setSelectedFigure(null);
    }
  }

  function updateSelectedImageSettings(patch) {
    const figure = selectedFigureRef.current;
    if (!figure || !selectedImageSettings) return;

    const nextSettings = {
      ...selectedImageSettings,
      ...patch
    };

    applyImageSettingsToFigure(figure, nextSettings);
    setSelectedImageSettings(nextSettings);
    syncEditor();
  }

  function removeSelectedImage() {
    if (!selectedFigureRef.current) return;

    selectedFigureRef.current.remove();
    setSelectedFigure(null);
    syncEditor();
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

    const alt = window.prompt('Alt text for this image', '') || DEFAULT_IMAGE_SETTINGS.alt;
    const caption = window.prompt('Optional caption', '') || '';
    insertHtml(buildImageMarkup({ url, alt, caption }));
    syncSelectedFigureFromSelection();
  }

  function insertCodeBlock() {
    rememberSelection();
    const language = window.prompt('Language label (optional)', '') || '';
    const selectedText = window.getSelection()?.toString() || 'const example = true;';
    insertHtml(`<pre><code data-language="${escapeHtml(language)}">${escapeHtml(selectedText)}</code></pre>`);
  }

  function insertTable() {
    rememberSelection();
    const columnsInput = window.prompt(
      `How many columns? (1-${MAX_TABLE_DIMENSION})`,
      String(tableSettings.columns)
    );
    if (!columnsInput) return;

    const rowsInput = window.prompt(
      `How many rows? (1-${MAX_TABLE_DIMENSION})`,
      String(tableSettings.rows)
    );
    if (!rowsInput) return;

    const columns = sanitizeTableDimension(columnsInput, tableSettings.columns);
    const rows = sanitizeTableDimension(rowsInput, tableSettings.rows);
    setTableSettings({ columns, rows });
    insertHtml(buildTableMarkup({ columns, rows }));
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
      const fallbackAlt = toText(file.name).replace(/\.[^.]+$/g, '').replace(/[-_]+/g, ' ') || 'Uploaded blog image';
      const alt = window.prompt('Alt text for this image', fallbackAlt) || fallbackAlt;
      const caption = window.prompt('Optional caption', '') || '';
      insertHtml(buildImageMarkup({ url, alt, caption }));
      syncSelectedFigureFromSelection();
    } catch (uploadFailure) {
      setToolbarError(uploadFailure instanceof Error ? uploadFailure.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return undefined;

    function handleSelectionChange() {
      rememberSelection();
      syncSelectedFigureFromSelection();
    }

    function handleEditorClick(event) {
      rememberSelection();
      const figure = getClosestImageFigure(event.target, editor);
      setSelectedFigure(figure);
    }

    function handleEditorBlur() {
      window.requestAnimationFrame(() => {
        const activeElement = document.activeElement;
        if (editor.contains(activeElement)) return;
        if (toolbarRootRef.current?.contains(activeElement)) return;
        setSelectedFigure(null);
      });
    }

    editor.addEventListener('click', handleEditorClick);
    editor.addEventListener('blur', handleEditorBlur);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      editor.removeEventListener('click', handleEditorClick);
      editor.removeEventListener('blur', handleEditorBlur);
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (selectedFigureRef.current) {
        selectedFigureRef.current.removeAttribute('data-selected');
      }
    };
  }, [editorRef]);

  return (
    <div ref={toolbarRootRef}>
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
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('removeFormat')}>
            Clear
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('undo')}>
            Undo
          </button>
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => runCommand('redo')}>
            Redo
          </button>
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
          <button type="button" className={styles.toolbarButton} onMouseDown={preventBlur} onClick={() => insertHtml('<hr />')}>
            Divider
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

      {selectedImageSettings ? (
        <section className={styles.imagePanel}>
          <div className={styles.imagePanelHeader}>
            <h3 className={styles.imagePanelTitle}>Selected image options</h3>
            <button type="button" className={styles.removeButton} onMouseDown={preventBlur} onClick={removeSelectedImage}>
              Remove image
            </button>
          </div>
          <div className={styles.imagePanelGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Size</span>
              <select
                className={styles.toolbarSelect}
                value={selectedImageSettings.size}
                onChange={(event) => updateSelectedImageSettings({ size: event.target.value })}
              >
                <option value="narrow">Narrow</option>
                <option value="medium">Medium</option>
                <option value="wide">Wide</option>
                <option value="full">Full width</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Alignment</span>
              <select
                className={styles.toolbarSelect}
                value={selectedImageSettings.align}
                onChange={(event) => updateSelectedImageSettings({ align: event.target.value })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Crop ratio</span>
              <select
                className={styles.toolbarSelect}
                value={selectedImageSettings.ratio}
                onChange={(event) => updateSelectedImageSettings({ ratio: event.target.value })}
              >
                <option value="auto">Original</option>
                <option value="16x9">16:9</option>
                <option value="4x3">4:3</option>
                <option value="1x1">1:1</option>
                <option value="3x4">3:4</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Fit mode</span>
              <select
                className={styles.toolbarSelect}
                value={selectedImageSettings.fit}
                onChange={(event) => updateSelectedImageSettings({ fit: event.target.value })}
              >
                <option value="contain">Contain</option>
                <option value="cover">Cover (crop)</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Crop focus</span>
              <select
                className={styles.toolbarSelect}
                value={selectedImageSettings.focus}
                onChange={(event) => updateSelectedImageSettings({ focus: event.target.value })}
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Alt text</span>
              <input
                className={styles.toolbarInput}
                value={selectedImageSettings.alt}
                onChange={(event) => updateSelectedImageSettings({ alt: event.target.value })}
                placeholder="Describe this image for accessibility and SEO"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Caption</span>
              <textarea
                className={styles.toolbarTextarea}
                value={selectedImageSettings.caption}
                onChange={(event) => updateSelectedImageSettings({ caption: event.target.value })}
                rows={2}
                placeholder="Optional image caption"
              />
            </label>
          </div>
          <p className={styles.toolbarHint}>Click any image in the editor to update its size, crop, alignment, caption, and metadata.</p>
        </section>
      ) : (
        <p className={styles.toolbarHint}>Tip: click an image in the editor to open production image controls.</p>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />

      {toolbarError ? <div className={styles.error}>{toolbarError}</div> : null}
    </div>
  );
}

