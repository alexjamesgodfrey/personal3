import aspektaFontDataUrl from '@alexgodfrey/web/assets/fonts/Aspekta-600.woff2?inline';
import berkeleyMonoFontDataUrl from '@alexgodfrey/web/assets/fonts/BerkeleyMono.woff2?inline';
import {
  validateNoteSocialImageData,
  type NoteSocialImageData,
} from '@alexgodfrey/web/lib/og/note-social-image';
import sharp from 'sharp';

export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

interface WrappedText {
  lines: string[];
  truncated: boolean;
}

function fontBufferFromDataUrl(dataUrl: string): Buffer {
  const separator = dataUrl.indexOf(',');
  if (separator === -1 || !dataUrl.slice(0, separator).endsWith(';base64')) {
    throw new Error('Expected an inline base64 font asset.');
  }

  return Buffer.from(dataUrl.slice(separator + 1), 'base64');
}

const fontFiles = [
  fontBufferFromDataUrl(aspektaFontDataUrl),
  fontBufferFromDataUrl(berkeleyMonoFontDataUrl),
] as const;

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!,
  );
}

function characterWidth(character: string): number {
  if (character === ' ') return 0.3;
  if ((character.codePointAt(0) ?? 0) > 0xff) return 1;
  if (/[ilI1.,'!:;|]/.test(character)) return 0.3;
  if (/[mwMW@%&]/.test(character)) return 0.9;
  if (/[A-Z0-9]/.test(character)) return 0.65;
  return 0.54;
}

function textWidth(text: string, fontSize: number): number {
  return [...text].reduce((width, character) => width + characterWidth(character), 0) * fontSize;
}

function truncateLine(line: string, maxWidth: number, fontSize: number): string {
  const ellipsis = '…';
  let truncated = line;

  while (truncated && textWidth(`${truncated}${ellipsis}`, fontSize) > maxWidth) {
    truncated = truncated.slice(0, -1).trimEnd();
  }

  return `${truncated}${ellipsis}`;
}

function wrapText(
  value: string,
  maxWidth: number,
  fontSize: number,
  maxLines: number,
): WrappedText {
  const words = value.split(' ').filter(Boolean);
  const lines: string[] = [];
  let line = '';
  let truncated = false;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (textWidth(candidate, fontSize) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
    }

    if (lines.length === maxLines) {
      truncated = true;
      break;
    }

    if (textWidth(word, fontSize) > maxWidth) {
      lines.push(word);
      line = '';
      truncated = true;
      break;
    }

    line = word;
  }

  if (!truncated && line && lines.length < maxLines) {
    lines.push(line);
  } else if (!truncated && line) {
    truncated = true;
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
    truncated = true;
  }

  if (truncated && lines.length > 0) {
    lines[lines.length - 1] = truncateLine(lines[lines.length - 1]!, maxWidth, fontSize);
  }

  return { lines, truncated };
}

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid social image date: ${value}`);
  }
  return date;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseDate(value));
}

function buildSocialImageSvg(
  rawData: NoteSocialImageData,
  aspektaFont: Buffer,
  berkeleyMonoFont: Buffer,
): string {
  const data = validateNoteSocialImageData(rawData);
  const titleSize = data.title.length > 82 ? 60 : data.title.length > 54 ? 66 : 74;
  const title = wrapText(data.title, 1024, titleSize, 3);
  const description = wrapText(data.description, 940, 27, 2);
  const titleLineHeight = Math.round(titleSize * 1.08);
  const titleStartY = 190;
  const descriptionStartY = titleStartY + title.lines.length * titleLineHeight + 34;
  const date = formatDate(data.publishedDate).toUpperCase();
  const updated =
    data.updatedDate && data.updatedDate !== data.publishedDate
      ? `  ·  UPDATED ${formatDate(data.updatedDate).toUpperCase()}`
      : '';

  const titleLines = title.lines
    .map(
      (line, index) =>
        `<text x="80" y="${titleStartY + index * titleLineHeight}" class="title">${escapeXml(line)}</text>`,
    )
    .join('');
  const descriptionLines = description.lines
    .map(
      (line, index) =>
        `<text x="82" y="${descriptionStartY + index * 38}" class="description">${escapeXml(line)}</text>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_IMAGE_WIDTH}" height="${SOCIAL_IMAGE_HEIGHT}" viewBox="0 0 ${SOCIAL_IMAGE_WIDTH} ${SOCIAL_IMAGE_HEIGHT}">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#09090b"/>
        <stop offset="0.52" stop-color="#111113"/>
        <stop offset="1" stop-color="#17171a"/>
      </linearGradient>
      <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(1040 76) rotate(135) scale(500 420)">
        <stop offset="0" stop-color="#d7ff7b" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#d7ff7b" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.035"/>
      </pattern>
      <style>
        @font-face {
          font-family: "Aspekta";
          src: url("data:font/woff2;base64,${aspektaFont.toString('base64')}") format("woff2");
          font-weight: 600;
        }
        @font-face {
          font-family: "Berkeley Mono";
          src: url("data:font/woff2;base64,${berkeleyMonoFont.toString('base64')}") format("woff2");
          font-weight: 400;
        }
        .eyebrow, .footer {
          fill: #a1a1aa;
          font-family: "Berkeley Mono", monospace;
          font-size: 20px;
          letter-spacing: 1.8px;
        }
        .title {
          fill: #fafafa;
          font-family: "Aspekta", sans-serif;
          font-size: ${titleSize}px;
          font-weight: 600;
          letter-spacing: -1.4px;
        }
        .description {
          fill: #b8b8c1;
          font-family: "Aspekta", sans-serif;
          font-size: 27px;
          font-weight: 600;
        }
      </style>
    </defs>
    <rect width="1200" height="630" fill="url(#background)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <rect x="0" y="0" width="12" height="630" fill="#d7ff7b"/>
    <circle cx="1090" cy="92" r="34" fill="none" stroke="#d7ff7b" stroke-width="2"/>
    <path d="M1074 92H1106M1090 76V108" stroke="#d7ff7b" stroke-width="2"/>
    <text x="80" y="96" class="eyebrow">NOTE  ·  ${escapeXml(date + updated)}</text>
    ${titleLines}
    ${descriptionLines}
    <line x1="80" y1="536" x2="1120" y2="536" stroke="#ffffff" stroke-opacity="0.14"/>
    <text x="80" y="582" class="footer">ALEX GODFREY</text>
    <text x="1120" y="582" class="footer" text-anchor="end">ALEXGODFREY.COM</text>
  </svg>`;
}

export async function renderNoteSocialImage(data: NoteSocialImageData): Promise<Buffer> {
  const [aspektaFont, berkeleyMonoFont] = fontFiles;
  const svg = buildSocialImageSvg(data, aspektaFont, berkeleyMonoFont);

  return sharp(Buffer.from(svg))
    .png({
      compressionLevel: 9,
      quality: 92,
    })
    .toBuffer();
}
