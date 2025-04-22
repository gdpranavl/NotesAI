// src/components/notes/SummarizeButton.tsx
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
      className="flex items-center gap-1"
    >
      {isLoading ? 'Summarizing...' : 'AI Summarize'}
    </Button>
  );
}
