import { cn } from '@alexgodfrey/ui/lib/utils';

interface RangeSpecification {
  label: string;
  color: string;
  min: number;
  max: number;
  progress?: number;
}

interface Props {
  /** Main label for the metric (e.g., "Room Humidity", "Temperature") */
  label: string;
  /** Subtitle/description (e.g., "Living Room", "Current conditions") */
  description?: string;
  /** Current value as a string (e.g., "45%", "72°F") */
  value: string;
  /** Status text (e.g., "Too Low", "Optimal", "High") */
  statusLabel: string;
  /** Range specifications to display */
  ranges: RangeSpecification[];
  /** Whether lower values are better ("lower"), higher are better ("higher"), or middle is best ("optimal") */
  optimality: 'lower' | 'optimal' | 'higher';
  /** Direction the metric naturally trends (optional, for gradient display) */
  trend?: 'increase' | 'decrease' | 'stable';
}

export default function OptimalityCard({
  label,
  description,
  value,
  statusLabel,
  ranges,
  optimality,
  trend = 'stable',
}: Props) {
  const statusColor = ranges.find((r) => r.progress !== undefined)?.color;

  return (
    <div className="p-4 flex text-md justify-between items-center bg-muted rounded-lg h-20">
      {/* Left: Label & Description */}
      <div className="w-2/5 text-sm sm:text-base">
        <div className="font-semibold">
          {label} <span className="xl:hidden">· {value === 'scramble' ? '??' : value}</span>
        </div>
        {description && (
          <div className="opacity-70 text-xs sm:text-base">
            {description.replace(' minutes', 'm')}
          </div>
        )}
      </div>

      {/* Middle: Value & Status */}
      <div className="hidden xl:block w-1/5">
        <div className="font-semibold relative">
          {statusColor && (
            <div
              className={cn(
                statusColor,
                'absolute left-[-1.2rem] top-1.5 h-2.5 w-2.5 m-[0.08rem] rounded-full',
              )}
            />
          )}
          <div className="text-xs sm:text-base">{value === 'scramble' ? '??' : value}</div>
        </div>
        <div className="opacity-70 text-xs sm:text-base">{statusLabel}</div>
      </div>

      {/* Right: Range Visualization */}
      <div className="flex flex-col space-y-1 w-3/5 xl:w-2/5">
        {ranges.toReversed().map((spec, i) => (
          <RangeBar
            key={i}
            label={spec.label}
            color={spec.color}
            progress={spec.progress}
            optimality={optimality}
            trend={trend}
          />
        ))}
      </div>
    </div>
  );
}

interface RangeBarProps {
  label: string;
  color: string;
  progress?: number;
  optimality: 'lower' | 'optimal' | 'higher';
  trend: 'increase' | 'decrease' | 'stable';
}

function RangeBar({ label, color, progress, optimality, trend }: RangeBarProps) {
  const remOffsetMobile = progress !== undefined ? 4.5 * progress : 0;
  const remOffset = progress !== undefined ? 8.5 * progress : 0;

  const isLower = optimality === 'lower';
  const isOptimal = optimality === 'optimal';
  const isHigher = optimality === 'higher';

  return (
    <div className="flex justify-end items-center">
      <div className="text-xs sm:text-sm opacity-70 w-16 mr-3 text-right line-clamp-1">{label}</div>

      <div className="flex w-20 md:w-36 mb-1 relative">
        {progress === undefined ? (
          // Range endpoints when no current value
          <div className="flex mt-0.5 w-full justify-between">
            <div className={cn(color, 'bg-opacity-60 h-1.5 w-1.5 rounded-full')} />
            <div className={cn(color, 'bg-opacity-60 h-1.5 w-1.5 rounded-full')} />
          </div>
        ) : (
          // Full bar with indicator
          <div className="absolute">
            {/* Current value indicator */}
            <div
              style={{ left: `${remOffsetMobile}rem` }}
              className="md:hidden bg-background absolute z-5 h-2.5 w-2.5 top-[-.125rem] border-foreground border-[2.5px] rounded-full"
            />

            <div
              style={{ left: `${remOffset}rem` }}
              className="hidden md:block bg-background absolute z-5 h-2.5 w-2.5 top-[-.125rem] border-foreground border-[2.5px] rounded-full"
            />

            {/* Bar background */}
            <div className="relative w-20 md:w-36 h-[0.32rem]">
              <div className={cn(color, 'absolute inset-0 rounded-sm')} />

              {/* Gradient overlay based on optimality */}
              <div
                className={cn(
                  {
                    'bg-gradient-to-r': (isOptimal && trend === 'increase') || isLower,
                    'bg-gradient-to-l': (isOptimal && trend === 'decrease') || isHigher,
                    'bg-gradient-to-r bg-gradient-to-l': trend === 'stable',
                  },
                  'absolute inset-0 from-transparent to-muted rounded-sm',
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
