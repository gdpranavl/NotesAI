import { Button } from '@/components/ui/button';

type SummarizeButtonProps = {
  onClick: () => void;
  isLoading: boolean;
};

export default function SummarizeButton({ onClick, isLoading }: SummarizeButtonProps) {
  return (
    <Button 
      variant="secondary" 
      type="button" 
      onClick={onClick} 
      disabled={isLoading}
    >
      {isLoading ? 'Summarizing...' : 'AI Summarize'}
    </Button>
  );
}
