export const SITE_ORIGIN = 'https://www.alexgodfrey.com';
export const PROFILE_LAST_UPDATED = '2026-09-01';

export const siteContent = {
  name: 'Alex Godfrey',
  role: 'Member of Technical Staff',
  shortRole: 'Technical Staff',
  description:
    'Alex Godfrey is a member of technical staff at Sutter Hill Ventures, building at the intersection of AI and biotechnology with a focus on aging.',
  identity: "I'm a member of technical staff at Sutter Hill Ventures.",
  education: 'I studied mathematics, computer science, and neuroscience at Cornell University.',
  educationShort: 'I studied math, CS, and neuroscience at Cornell University.',
  focus: "Right now I'm building in AI x bio, specifically around aging.",
  contact: [
    {
      id: 'email',
      label: 'Email',
      display: 'me@alexgodfrey.com',
      href: 'mailto:me@alexgodfrey.com',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      display: 'linkedin.com/in/alexgodfreyapi',
      href: 'https://www.linkedin.com/in/alexgodfreyapi',
    },
    {
      id: 'github',
      label: 'GitHub',
      display: 'github.com/alexjamesgodfrey',
      href: 'https://github.com/alexjamesgodfrey',
    },
  ],
  skills: ['PostgreSQL', 'AWS', 'Astro', 'Next.js', 'Tailwind CSS', 'React', 'TypeScript'],
  work: {
    shv: {
      id: 'shv',
      organization: 'Sutter Hill Ventures',
      displayName: 'SHV',
      location: 'Palo Alto',
      startYear: 2025,
      dateLabel: '2025–present',
      role: 'Member of Technical Staff',
      summary:
        'Sutter Hill Ventures employs a small internal engineering team to explore frontier technology and build products with portfolio companies.',
      focus: 'Alex has worked extensively on systems built around Model Context Protocol.',
      projects: [
        {
          name: 'AgentDB',
          url: 'https://agentdb.dev',
          description: 'Infrastructure for agent-accessible data.',
        },
        {
          name: 'ChatDB',
          url: 'https://www.chatdb.io',
          description: 'A data exploration and visualization product.',
        },
      ],
      collaborations: [
        { name: 'Ridge Biosciences', url: 'https://ridgebio.com' },
        { name: 'Integrated Biosciences', url: 'https://integratedbio.com' },
        { name: 'Run', url: 'https://run.so' },
        { name: 'Aria Networks', url: 'https://arianetworks.com' },
      ],
    },
    oneTwentyOne: {
      id: 'onetwentyone',
      organization: 'OneTwentyOne',
      location: 'Ithaca and San Francisco',
      startYear: 2023,
      dateLabel: '2023–present',
      role: 'Founder and CEO',
      summary:
        'Alex founded OneTwentyOne after a personal blood test revealed an overlooked biomarker pattern. The company developed health-data analysis and synchronization infrastructure.',
      detail:
        'In 2024, OneTwentyOne partnered with Michael Lustgarten, Ph.D., to build a biomarker analysis tool:',
      projects: [
        {
          name: 'Conquer',
          url: 'https://conquer.onetwentyone.ai',
          description: 'A biomarker analysis tool.',
        },
      ],
    },
    altum: {
      id: 'altum',
      organization: 'Altum Labs',
      location: 'New York City',
      startYear: 2023,
      endYear: 2023,
      dateLabel: '2023',
      role: 'API Architect → Technical Lead → CTO offer',
      summary:
        'Alex designed and implemented a secure multi-tenant database and API that supported a 12-engineer product team.',
      detail:
        'He later led nine web developers building Plantalysis, an online lab-testing marketplace, and was offered a full-time CTO position.',
      evidence: {
        label: 'Letter of recommendation from the CEO',
        url: '/resources/Letter%20of%20rec%20for%20Alex.pdf',
      },
    },
  },
  resources: {
    resumePdf: '/resources/resume.pdf',
    recommendationPdf: '/resources/Letter%20of%20rec%20for%20Alex.pdf',
    newsletter: '/newsletter',
  },
} as const;

export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_ORIGIN).toString();
}

export function canonicalPathname(pathname: string): string {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/+$/, '') || '/';
}

export function profilePageStructuredData(profileImageUrl: string) {
  const { shv, oneTwentyOne } = siteContent.work;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: siteContent.name,
        description: siteContent.description,
        inLanguage: 'en-US',
        about: {
          '@id': `${SITE_ORIGIN}/#alex-godfrey`,
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_ORIGIN}/#profile-page`,
        url: `${SITE_ORIGIN}/`,
        name: `${siteContent.name} — ${siteContent.role}`,
        description: siteContent.description,
        dateModified: PROFILE_LAST_UPDATED,
        inLanguage: 'en-US',
        mainEntity: {
          '@type': 'Person',
          '@id': `${SITE_ORIGIN}/#alex-godfrey`,
          name: siteContent.name,
          givenName: 'Alex',
          familyName: 'Godfrey',
          url: `${SITE_ORIGIN}/`,
          image: profileImageUrl,
          jobTitle: siteContent.role,
          email: siteContent.contact[0].href,
          description: siteContent.description,
          sameAs: siteContent.contact
            .filter((item) => item.href.startsWith('https://'))
            .map((item) => item.href),
          knowsAbout: [
            'Software engineering',
            'Model Context Protocol',
            'AI for biotechnology',
            'Health data infrastructure',
            'Biotechnology',
            'Biology of aging',
          ],
          worksFor: {
            '@type': 'Organization',
            name: shv.organization,
          },
          alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: 'Cornell University',
            url: 'https://www.cornell.edu/',
          },
          affiliation: {
            '@id': `${SITE_ORIGIN}/#onetwentyone`,
          },
          subjectOf: [
            {
              '@type': 'DigitalDocument',
              name: 'Alex Godfrey résumé',
              url: absoluteUrl(siteContent.resources.resumePdf),
              encodingFormat: 'application/pdf',
            },
            {
              '@type': 'DigitalDocument',
              name: 'Machine-readable profile',
              url: absoluteUrl('/about.md'),
              encodingFormat: 'text/markdown',
            },
          ],
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#onetwentyone`,
        name: oneTwentyOne.organization,
        url: 'https://onetwentyone.ai',
        founder: {
          '@id': `${SITE_ORIGIN}/#alex-godfrey`,
        },
      },
    ],
  };
}

export function articleStructuredData(input: {
  title: string;
  description: string;
  slug: string;
  publishedDate: Date;
  updatedDate?: Date;
  imageUrl: string;
}) {
  const canonicalUrl = absoluteUrl(`/blog/${input.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonicalUrl}#article`,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    headline: input.title,
    description: input.description,
    image: input.imageUrl,
    datePublished: input.publishedDate.toISOString(),
    dateModified: (input.updatedDate ?? input.publishedDate).toISOString(),
    inLanguage: 'en-US',
    author: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#alex-godfrey`,
      name: siteContent.name,
      url: `${SITE_ORIGIN}/`,
    },
    publisher: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#alex-godfrey`,
      name: siteContent.name,
    },
  };
}
