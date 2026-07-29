import type { PublishedNote } from '@alexgodfrey/web/lib/published-notes';
import { noteSlugFromId } from '@alexgodfrey/web/lib/og/note-social-image';
import {
  absoluteUrl,
  PROFILE_LAST_UPDATED,
  siteContent,
  SITE_ORIGIN,
} from '@alexgodfrey/web/lib/site-content';

const markdownLink = (label: string, url: string) => `[${label}](${absoluteUrl(url)})`;

function renderContactLinks(): string {
  return siteContent.contact
    .map((item) => `- [${item.label}](${item.href}): ${item.display}`)
    .join('\n');
}

function renderWritingLinks(notes: PublishedNote[]): string {
  if (notes.length === 0) {
    return '- No published articles.';
  }

  return notes
    .map((note) => {
      const slug = noteSlugFromId(note.id);
      return `- [${note.data.title}](${absoluteUrl(`/blog/${slug}`)}): ${note.data.description} ([Markdown alternate](${absoluteUrl(`/blog/${slug}.md`)}))`;
    })
    .join('\n');
}

function renderWork(): string {
  const { shv, oneTwentyOne, altum } = siteContent.work;

  return `## Experience

### ${shv.displayName} (${shv.organization})

- **Role:** ${shv.role}
- **Location:** ${shv.location}
- **Dates:** ${shv.dateLabel}

${shv.summary}

${shv.focus}

Selected projects:

${shv.projects.map((project) => `- [${project.name}](${project.url}): ${project.description}`).join('\n')}

Portfolio-company collaborations:

${shv.collaborations.map((company) => `- [${company.name}](${company.url})`).join('\n')}

### ${oneTwentyOne.organization}

- **Role:** ${oneTwentyOne.role}
- **Location:** ${oneTwentyOne.location}
- **Dates:** ${oneTwentyOne.dateLabel}

${oneTwentyOne.summary}

${oneTwentyOne.detail}

${oneTwentyOne.projects.map((project) => `- [${project.name}](${project.url}): ${project.description}`).join('\n')}

### ${altum.organization}

- **Role:** ${altum.role}
- **Location:** ${altum.location}
- **Dates:** ${altum.dateLabel}

${altum.summary}

${altum.detail}

- ${markdownLink(altum.evidence.label, altum.evidence.url)}`;
}

export function renderAboutMarkdown(notes: PublishedNote[]): string {
  return `# ${siteContent.name}

> ${siteContent.description}

- **Current role:** ${siteContent.work.shv.role} at ${siteContent.work.shv.organization}
- **Focus:** Software, biotechnology, longevity, and AI infrastructure
- **Profile last verified:** ${PROFILE_LAST_UPDATED}
- ${markdownLink('Visual homepage', '/')}
- ${markdownLink('Résumé in Markdown', '/resume.md')}
- ${markdownLink('Résumé PDF', siteContent.resources.resumePdf)}

## Summary

${siteContent.education}

${siteContent.focus}

${renderWork()}

## Technical focus

${siteContent.skills.map((skill) => `- ${skill}`).join('\n')}
- Model Context Protocol
- Health-data analysis and synchronization
- Multi-tenant application architecture

## Writing

${renderWritingLinks(notes)}

## Contact

${renderContactLinks()}

## Provenance

The visual page, structured data, and machine-readable documents are generated from the same canonical profile data.`;
}

export function renderResumeMarkdown(): string {
  return `# ${siteContent.name} — ${siteContent.role}

> ${siteContent.description}

${renderContactLinks()}

- ${markdownLink('Canonical profile', '/')}
- ${markdownLink('Download the PDF résumé', siteContent.resources.resumePdf)}
- **Last verified:** ${PROFILE_LAST_UPDATED}

## Profile

${siteContent.education}

${siteContent.focus}

${renderWork()}

## Skills

${siteContent.skills.map((skill) => `- ${skill}`).join('\n')}
- Model Context Protocol
- API and database architecture
- Health-data infrastructure`;
}

export function renderWorkMarkdown(): string {
  return `# Selected work by ${siteContent.name}

> Public work history and selected projects. Last verified ${PROFILE_LAST_UPDATED}.

- ${markdownLink('Canonical profile', '/')}
- ${markdownLink('Résumé', '/resume.md')}

${renderWork()}`;
}

export function renderContactMarkdown(): string {
  return `# Contact ${siteContent.name}

${renderContactLinks()}

- ${markdownLink('Canonical profile', '/')}
- ${markdownLink('Résumé', '/resume.md')}

Email is the most direct contact method. No form submission or JavaScript is required.`;
}

export function renderNewsletterMarkdown(): string {
  return `# Alex Godfrey's newsletter

> Concise field notes on longevity-focused software, personal experiments worth sharing, and useful ideas encountered while building products.

- ${markdownLink('Open the subscription page', '/newsletter')}
- ${markdownLink('Canonical profile', '/')}

Subscription requires an email address and explicit form submission on the visual subscription page.`;
}

export function renderIndexMarkdown(notes: PublishedNote[]): string {
  return `# alexgodfrey.com

> Canonical public information about ${siteContent.name}, a ${siteContent.role.toLowerCase()} working across software, biotechnology, longevity, and AI infrastructure.

## Primary documents

- ${markdownLink('Profile', '/')}: Canonical biography, current role, experience, projects, technical focus, and contact links. [Markdown alternate](${absoluteUrl('/about.md')}).
- ${markdownLink('Résumé PDF', siteContent.resources.resumePdf)}: Current résumé. [Markdown alternate](${absoluteUrl('/resume.md')}).
- ${markdownLink('Selected work', '/#shv-section')}: Organizations, roles, projects, and evidence. [Markdown alternate](${absoluteUrl('/work.md')}).
- ${markdownLink('Contact', '/contact')}: Direct email and verified social profiles. [Markdown alternate](${absoluteUrl('/contact.md')}).

## Writing

${renderWritingLinks(notes)}

## Optional

- ${markdownLink('Newsletter', '/newsletter')}: Newsletter description and subscription route. [Markdown alternate](${absoluteUrl('/newsletter.md')}).
- ${markdownLink('Full site context', '/llms-full.txt')}: Combined machine-readable profile, work, contact, and published writing.
- ${markdownLink('Visual homepage', '/')}: Human-oriented portfolio.`;
}

export function renderLlmsTxt(notes: PublishedNote[]): string {
  return `# Alex Godfrey

> ${siteContent.description}

Use the documents below for current, public information. Cite the canonical HTML URLs; Markdown URLs are retrieval alternates containing the same public facts.

## Profile

- [Canonical profile](${absoluteUrl('/')}): Biography, current role, experience, skills, projects, and verified contact links. [Markdown alternate](${absoluteUrl('/about.md')}).
- [Résumé PDF](${absoluteUrl(siteContent.resources.resumePdf)}): Current professional history. [Markdown alternate](${absoluteUrl('/resume.md')}).
- [Selected work](${absoluteUrl('/#shv-section')}): Roles, projects, collaborations, and supporting links. [Markdown alternate](${absoluteUrl('/work.md')}).

## Writing

${renderWritingLinks(notes)}

## Contact

- [Contact](${absoluteUrl('/contact')}): Direct email, GitHub, and LinkedIn links. [Markdown alternate](${absoluteUrl('/contact.md')}).

## Optional

- [Newsletter](${absoluteUrl('/newsletter')}): Newsletter scope and subscription page. [Markdown alternate](${absoluteUrl('/newsletter.md')}).
- [Full context](${absoluteUrl('/llms-full.txt')}): Combined contents of the primary machine-readable documents.
- [Visual website](${SITE_ORIGIN}/): Human-oriented portfolio.`;
}

function cleanMdxForAgents(body: string, canonicalUrl: string): string {
  return body
    .replace(/^import\s+.+?;\s*$/gm, '')
    .replace(
      /<Picture[\s\S]*?alt=["']([^"']+)["'][\s\S]*?\/>/g,
      `> Image: $1. [View the image in the visual article](${canonicalUrl}).`,
    )
    .replace(/^\s*<([A-Z][A-Za-z0-9.]*)[\s\S]*?\/>\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function renderNoteMarkdown(note: PublishedNote): string {
  const slug = noteSlugFromId(note.id);
  const canonicalUrl = absoluteUrl(`/blog/${slug}`);
  const markdownBody = cleanMdxForAgents(note.body ?? '', canonicalUrl);

  return `# ${note.data.title}

> ${note.data.description}

- **Author:** ${siteContent.name}
- **Published:** ${note.data.pubDate.toISOString().split('T')[0]}
${note.data.updatedDate ? `- **Updated:** ${note.data.updatedDate.toISOString().split('T')[0]}\n` : ''}- **Canonical page:** ${canonicalUrl}

${markdownBody}`;
}

export function renderLlmsFullTxt(notes: PublishedNote[]): string {
  const articles = notes.map((note) => renderNoteMarkdown(note)).join('\n\n---\n\n');

  return `# alexgodfrey.com — full machine-readable context

Generated from the same public content used by the visual website. Profile facts were last verified ${PROFILE_LAST_UPDATED}.

${renderAboutMarkdown(notes)}

---

${renderResumeMarkdown()}

---

${renderContactMarkdown()}

---

# Published writing

${articles || 'No published articles.'}`;
}
