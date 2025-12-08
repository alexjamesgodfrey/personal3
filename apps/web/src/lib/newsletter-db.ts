import { DATABASE_URL } from 'astro:env/server';
import fs from 'fs';
import pkg from 'pg';

const { Pool } = pkg;

export type NewsletterSubscriber = {
  email: string;
  name: string | null;
  status: 'subscribed' | 'unsubscribed';
  subscribed_at: Date;
  unsubscribed_at: Date | null;
  updated_at: Date;
  source: string | null;
};

export type SubscribeResult = {
  subscriber: NewsletterSubscriber;
  isNew: boolean;
};

const globalForNewsletter = globalThis as typeof globalThis & {
  newsletterPool?: Pool;
  newsletterTableReady?: Promise<void>;
};

function getPool() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const connectionString = DATABASE_URL;
  const url = new URL(connectionString);
  const sslMode = (url.searchParams.get('sslmode') || process.env.PGSSLMODE || '').toLowerCase();
  const sslParam = (url.searchParams.get('ssl') || '').toLowerCase();
  const forceSSL = sslParam === 'true' || sslParam === '1';

  const useSSL =
    forceSSL ||
    sslMode === 'require' ||
    sslMode === 'verify-ca' ||
    sslMode === 'verify-full' ||
    sslMode === 'no-verify' ||
    sslMode === 'prefer' ||
    sslMode === 'allow' ||
    (!sslMode && process.env.NODE_ENV === 'production');

  const disableVerification =
    forceSSL ||
    sslMode === 'require' ||
    sslMode === 'no-verify' ||
    sslMode === 'prefer' ||
    sslMode === 'allow';

  const caPath = process.env.PGSSLROOTCERT;
  const ca = caPath && fs.existsSync(caPath) ? fs.readFileSync(caPath, 'utf8') : undefined;

  if (!globalForNewsletter.newsletterPool) {
    globalForNewsletter.newsletterPool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 5_000,
      keepAlive: true,
      ssl: useSSL
        ? {
            rejectUnauthorized: disableVerification ? false : sslMode === 'verify-full',
            ca,
          }
        : false,
    });
  }

  return globalForNewsletter.newsletterPool;
}

async function ensureNewsletterTable() {
  if (!globalForNewsletter.newsletterTableReady) {
    globalForNewsletter.newsletterTableReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_subscribers (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          status TEXT NOT NULL DEFAULT 'subscribed',
          subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          unsubscribed_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          source TEXT
        );
      `);
    })();
  }

  return globalForNewsletter.newsletterTableReady;
}

function mapRow(row: any): NewsletterSubscriber {
  return {
    email: row.email,
    name: row.name,
    status: row.status === 'unsubscribed' ? 'unsubscribed' : 'subscribed',
    subscribed_at: row.subscribed_at instanceof Date ? row.subscribed_at : new Date(row.subscribed_at),
    unsubscribed_at:
      row.unsubscribed_at instanceof Date || row.unsubscribed_at === null
        ? row.unsubscribed_at
        : row.unsubscribed_at
          ? new Date(row.unsubscribed_at)
          : null,
    updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
    source: row.source ?? null,
  };
}

export async function subscribeToNewsletter(
  email: string,
  name?: string,
  source = 'newsletter-page',
): Promise<SubscribeResult> {
  const normalizedEmail = email.trim().toLowerCase();
  await ensureNewsletterTable();
  const pool = getPool();

  const result = await pool.query(
    `
      INSERT INTO email_subscribers (email, name, status, source, unsubscribed_at, updated_at)
      VALUES ($1, $2, 'subscribed', $3, NULL, NOW())
      ON CONFLICT (email) DO UPDATE
      SET status = 'subscribed',
          unsubscribed_at = NULL,
          updated_at = NOW(),
          name = COALESCE(EXCLUDED.name, email_subscribers.name),
          source = COALESCE(EXCLUDED.source, email_subscribers.source)
      RETURNING email, name, status, subscribed_at, unsubscribed_at, updated_at, source, (xmax = 0) AS inserted;
    `,
    [normalizedEmail, name || null, source || null],
  );

  const row = result.rows[0];
  const subscriber = mapRow(row);
  const isNew = !!row.inserted;

  return { subscriber, isNew };
}

export async function unsubscribeFromNewsletter(
  email: string,
  source = 'newsletter-page',
): Promise<NewsletterSubscriber> {
  const normalizedEmail = email.trim().toLowerCase();
  await ensureNewsletterTable();
  const pool = getPool();

  const updated = await pool.query(
    `
      UPDATE email_subscribers
      SET status = 'unsubscribed',
          unsubscribed_at = NOW(),
          updated_at = NOW(),
          source = COALESCE($2, source)
      WHERE email = $1
      RETURNING email, name, status, subscribed_at, unsubscribed_at, updated_at, source;
    `,
    [normalizedEmail, source || null],
  );

  if (updated.rowCount > 0) {
    return mapRow(updated.rows[0]);
  }

  const inserted = await pool.query(
    `
      INSERT INTO email_subscribers (email, name, status, source, subscribed_at, unsubscribed_at, updated_at)
      VALUES ($1, NULL, 'unsubscribed', $2, NOW(), NOW(), NOW())
      RETURNING email, name, status, subscribed_at, unsubscribed_at, updated_at, source;
    `,
    [normalizedEmail, source || null],
  );

  return mapRow(inserted.rows[0]);
}
