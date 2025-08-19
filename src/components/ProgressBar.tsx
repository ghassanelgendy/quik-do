import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export const ProgressBar = ({ completed, total }: ProgressBarProps) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">Progress</span>
        <span className="text-sm text-muted-foreground">
          {completed} of {total} completed
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2 bg-secondary"
      />
      <div className="text-center">
        <span className="text-lg font-semibold text-primary">{percentage}%</span>
      </div>
    </div>
  );
};