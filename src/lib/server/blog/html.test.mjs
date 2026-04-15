import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeRichTextHtml, stripRichTextHtml } from './html.mjs';

test('sanitizeRichTextHtml normalizes nested entities without persisting gibberish tokens', () => {
  const html = sanitizeRichTextHtml('<p>Fish &amp; Chips &nbsp; &amp;amp;amp;nbsp; &lt;code&gt;</p>');

  assert.match(html, /^<p>/);
  assert.ok(!html.includes('&amp;amp;'));
  assert.ok(!html.includes('&amp;nbsp;'));
  assert.ok(!html.includes('&nbsp;'));
  assert.ok(html.includes('Fish &amp; Chips'));
  assert.ok(html.includes('&lt;code&gt;'));
});

test('sanitizeRichTextHtml keeps supported figure image controls and drops unknown attributes', () => {
  const html = sanitizeRichTextHtml(
    '<figure data-img-size="wide" data-img-align="right" data-img-ratio="16x9" data-img-fit="cover" data-img-focus="top" data-selected="true"><img src="https://cdn.example.com/img.jpg" alt="Cover" /></figure>'
  );

  assert.ok(html.includes('data-img-size="wide"'));
  assert.ok(html.includes('data-img-align="right"'));
  assert.ok(html.includes('data-img-ratio="16x9"'));
  assert.ok(html.includes('data-img-fit="cover"'));
  assert.ok(html.includes('data-img-focus="top"'));
  assert.ok(!html.includes('data-selected='));
  assert.ok(html.includes('loading="lazy"'));
  assert.ok(html.includes('decoding="async"'));
});

test('stripRichTextHtml decodes nested html entities into readable text', () => {
  const text = stripRichTextHtml('<p>Tom &amp;amp; Jerry&nbsp; </p>');
  assert.equal(text, 'Tom & Jerry');
});
