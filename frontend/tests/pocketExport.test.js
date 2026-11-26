import test from 'node:test';
import assert from 'node:assert/strict';
import { pocketMarkdown } from '../src/lib/pocketExport.js';

test('pocket notes preserve readable content and use the current frontend origin', () => {
  const markdown = pocketMarkdown(
    {
      generatedAt: '2026-11-01T10:00:00Z',
      items: [
        {
          id: 7,
          title: 'A useful guide',
          category: 'Academics',
          authorName: 'Student',
          description: 'First step\r\nSecond step',
          path: 'https://untrusted.invalid',
        },
      ],
    },
    'https://campus.example',
  );
  assert.ok(markdown.includes('## A useful guide'));
  assert.ok(markdown.includes('> First step\n> Second step'));
  assert.ok(markdown.includes('(https://campus.example/nodes/7)'));
  assert.ok(!markdown.includes('untrusted.invalid'));
});

test('post content cannot inject raw HTML, image markdown or new title sections', () => {
  const markdown = pocketMarkdown(
    {
      generatedAt: '2026-11-01',
      items: [
        {
          id: 1,
          title: 'Title\r\n# Heading',
          category: 'Events',
          description:
            '<script>alert(1)</script>\n![beacon](https://evil.invalid)\n```html\n<b>Hi</b>',
        },
      ],
    },
    'https://campus.example',
  );
  assert.ok(!markdown.includes('<script>'));
  assert.ok(!markdown.includes('![beacon]'));
  assert.ok(!markdown.includes('\n# Heading'));
  assert.ok(markdown.includes('\\<script\\>'));
  assert.ok(markdown.includes('\\!\\[beacon\\]'));
});

test('empty pockets give an honest empty snapshot and invalid IDs cannot become links', () => {
  assert.ok(
    pocketMarkdown({ generatedAt: 'today', items: [] }, 'https://campus.example').includes(
      'Your pocket is empty.',
    ),
  );
  const markdown = pocketMarkdown(
    { generatedAt: 'today', items: [{ id: 'javascript:evil', title: 'No link' }] },
    'https://campus.example',
  );
  assert.ok(!markdown.includes('Open on Campus Genome'));
  assert.ok(!markdown.includes('javascript:evil'));
});
