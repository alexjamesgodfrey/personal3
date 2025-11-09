import { Label } from '@alexgodfrey/ui/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@alexgodfrey/ui/components/ui/radio-group';
import { navigate } from 'astro:transitions/client';

interface Props {
  defaultValue: 'human' | 'machine';
  machineLink: string;
  humanLink: string;
}

export function HumanOrMachine({ defaultValue, machineLink, humanLink }: Props) {
  return (
    <RadioGroup
      defaultValue={defaultValue === 'machine' ? machineLink : humanLink}
      onValueChange={(value) => navigate(value)}
      className="flex items-center gap-3 bg-background/95 backdrop-blur-sm p-4 rounded-xl border-2 border-border shadow-2xl w-48"
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value={humanLink} id="human" />
        <Label htmlFor="human">Human</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value={machineLink} id="machine" />
        <Label htmlFor="machine">Machine</Label>
      </div>
    </RadioGroup>
  );
}
