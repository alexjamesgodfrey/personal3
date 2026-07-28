import { DATABASE_URL } from 'astro:env/server';
import pg from 'pg';

const { Pool } = pg;

export type NewsletterRateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
};

export type NewsletterRateLimitPolicy = {
  limit: number;
  windowSeconds: number;
};

const globalForNewsletterSecurity = globalThis as typeof globalThis & {
  newsletterRateLimitPool?: InstanceType<typeof Pool>;
  newsletterRateLimitTableReady?: Promise<void>;
};

function getPool(): InstanceType<typeof Pool> {
  if (!DATABASE_URL) {
    throw new Error('newsletter_security_database_unavailable');
  }

  if (!globalForNewsletterSecurity.newsletterRateLimitPool) {
    globalForNewsletterSecurity.newsletterRateLimitPool = new Pool({
      connectionString: DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 5_000,
      keepAlive: true,
    });
  }

  return globalForNewsletterSecurity.newsletterRateLimitPool;
}

async function ensureRateLimitTable(): Promise<void> {
  if (!globalForNewsletterSecurity.newsletterRateLimitTableReady) {
    const initialization = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS newsletter_rate_limits (
          key_hash TEXT NOT NULL,
          bucket_start TIMESTAMPTZ NOT NULL,
          attempts BIGINT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (key_hash, bucket_start)
        );
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS newsletter_rate_limits_expires_at_idx
          ON newsletter_rate_limits (expires_at);
      `);
      await pool.query(`
        DELETE FROM newsletter_rate_limits
        WHERE expires_at < clock_timestamp() - INTERVAL '1 day';
      `);
    })();

    globalForNewsletterSecurity.newsletterRateLimitTableReady = initialization.catch((error) => {
      globalForNewsletterSecurity.newsletterRateLimitTableReady = undefined;
      throw error;
    });
  }

  return globalForNewsletterSecurity.newsletterRateLimitTableReady;
}

export async function consumeNewsletterRateLimit(
  keyHash: string,
  policy: NewsletterRateLimitPolicy,
): Promise<NewsletterRateLimitResult> {
  await ensureRateLimitTable();
  const pool = getPool();

  const result = await pool.query<{
    attempts: string;
    retry_after: number;
  }>(
    `
      WITH bucket AS (
        SELECT to_timestamp(
          floor(extract(epoch FROM clock_timestamp()) / $2::double precision) * $2
        ) AS starts_at
      ),
      consumed AS (
        INSERT INTO newsletter_rate_limits (key_hash, bucket_start, attempts, expires_at)
        SELECT
          $1,
          starts_at,
          1,
          starts_at + make_interval(secs => $2::double precision)
        FROM bucket
        ON CONFLICT (key_hash, bucket_start)
        DO UPDATE SET attempts = newsletter_rate_limits.attempts + 1
        RETURNING attempts, expires_at
      )
      SELECT
        attempts,
        greatest(
          1,
          ceil(extract(epoch FROM expires_at - clock_timestamp()))
        )::integer AS retry_after
      FROM consumed;
    `,
    [keyHash, policy.windowSeconds],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('newsletter_rate_limit_result_missing');
  }

  const attempts = Number(row.attempts);
  return {
    allowed: attempts <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - attempts),
    retryAfter: row.retry_after,
  };
}
