import { cn } from '@alexgodfrey/ui/lib/utils';
import type { CSSProperties } from 'react';

const iconDefs = {
  arrowUpRight: 'arrow-up-right',
  squareStackUp: 'square-stack-up',
  pinCircle: 'pin-circle',
};

type IconProps = {
  name: keyof typeof iconDefs;
  className?: string;
  size?: number;
  title?: string;
  style?: CSSProperties;
};

type IconName = keyof typeof iconDefs;

export const version = Object.keys(iconDefs).length + 1;

export default function Icon({
  name,
  className = '',
  size = 20,
  title,
  style,
  ...rest
}: IconProps) {
  if (!name) {
    const placeholderStyle: CSSProperties = {
      width: size,
      height: size,
      ...(style ?? {}),
    };
    return (
      <div
        className={cn('animate-pulse bg-gray-300 rounded-full', className)}
        style={placeholderStyle}
        title={title || 'Loading...'}
      />
    );
  }

  const iconName = name as IconName;
  const iconId = iconDefs[iconName] as string;

  // Use relative URL to avoid CORS issues
  const spriteHref = `/icon-sprite.svg?v=${version}#icon-${iconId}`;

  console.log(spriteHref);

  return (
    <svg
      className={cn('fill-current', className)}
      width={size}
      height={size}
      style={style}
      {...rest}
    >
      {title && <title>{title}</title>}
      <use href={spriteHref} xlinkHref={spriteHref} />
    </svg>
  );
}
