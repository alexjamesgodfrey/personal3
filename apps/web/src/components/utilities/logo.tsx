export enum Logos {
  'Me' = '/logos/me.jpg',
  'SHV' = '/logos/shv.webp',
  'OneTwentyOne' = '/logos/121.webp',
  'Altum' = '/logos/leaf.svg',
  'TypeScript' = '/logos/typescript.svg',
  'JavaScript' = '/logos/javascript.svg',
  'Next' = '/logos/next.svg',
  'React' = '/logos/react.svg',
  'Node' = '/logos/node.svg',
  'PostgreSQL' = '/logos/postgresql.svg',
  'GraphQL' = '/logos/graphql.svg',
  'Express' = '/logos/express.svg',
  'Prisma' = '/logos/prisma.svg',
  'AWS' = '/logos/aws.svg',
  'GCP' = '/logos/gcp.svg',
  'Azure' = '/logos/azure.svg',
  'Tailwind' = '/logos/tailwind.svg',
  'Bootstrap' = '/logos/bootstrap.svg',
  'Sass' = '/logos/sass.svg',
  'Swift' = '/logos/swift.svg',
  'DigitalOcean' = '/logos/digital-ocean.svg',
}

export function Logo({ name, className }: { name: Logos; className?: string }) {
  return <img src={name} alt={name} className={className} loading="lazy" />;
}
