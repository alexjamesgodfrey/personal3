import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  renderAboutMarkdown,
  renderLlmsFullTxt,
  renderLlmsTxt,
  renderNoteMarkdown,
} from '@alexgodfrey/web/lib/agent-documents';
import type { PublishedNote } from '@alexgodfrey/web/lib/published-notes';
import { profilePageStructuredData, SITE_ORIGIN } from '@alexgodfrey/web/lib/site-content';

const note = {
  id: 'red-bull/index.mdx',
  body: `import image from './image.webp';
import { Picture } from 'astro:assets';

The article body.

<Picture
  src={image}
  alt="A useful test image"
  loading="lazy"
/>`,
  data: {
    title: 'A useful article',
    description: 'A concise description.',
    pubDate: new Date('2026-01-02T00:00:00.000Z'),
    updatedDate: new Date('2026-01-03T00:00:00.000Z'),
    relatedPosts: [],
    draft: false,
  },
} as unknown as PublishedNote;

describe('agent-facing documents', () => {
  it('publishes a concise profile with direct actions and no UI-operating instructions', () => {
    const markdown = renderAboutMarkdown([note]);

    assert.match(markdown, /^# Alex Godfrey/m);
    assert.match(markdown, /mailto:me@alexgodfrey\.com/);
    assert.match(markdown, /https:\/\/www\.alexgodfrey\.com\/resume\.md/);
    assert.match(markdown, /https:\/\/www\.alexgodfrey\.com\/blog\/red-bull\.md/);
    assert.doesNotMatch(markdown, /keyboard shortcut|scroll interaction|grid column|component:/i);
  });

  it('builds a spec-shaped llms index and a complete context document', () => {
    const index = renderLlmsTxt([note]);
    const full = renderLlmsFullTxt([note]);

    for (const path of ['about.md', 'resume.md', 'work.md', 'contact.md', 'red-bull.md']) {
      assert.match(index, new RegExp(path.replace('.', '\\.')));
    }
    assert.match(full, /# Published writing/);
    assert.match(full, /The article body\./);
  });

  it('converts presentational MDX into clean Markdown', () => {
    const markdown = renderNoteMarkdown(note);

    assert.doesNotMatch(markdown, /^import /m);
    assert.doesNotMatch(markdown, /<Picture/);
    assert.match(markdown, /> Image: A useful test image\./);
    assert.match(markdown, /Canonical page:.*\/blog\/red-bull/);
  });

  it('emits a canonical ProfilePage graph with stable identity links', () => {
    const data = profilePageStructuredData(`${SITE_ORIGIN}/profile.webp`);
    const serialized = JSON.stringify(data);

    assert.match(serialized, /"@type":"ProfilePage"/);
    assert.match(serialized, /linkedin\.com\/in\/alexgodfreyapi/);
    assert.match(serialized, /github\.com\/alexjamesgodfrey/);
    assert.doesNotMatch(serialized, /"https:\/\/alexgodfrey\.com/);
  });
});
