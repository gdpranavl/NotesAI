'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
};

export default function NoteCard({ note, onEdit }: NoteCardProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast('Note deleted. Your note has been deleted successfully.');
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast('Delete failed. Failed to delete the note. Please try again.');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(note.id);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{note.title}</CardTitle>
        <CardDescription>
          {formatDate(note.updated_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {note.summary && (
          <div className="mb-3 p-2 bg-gray-50 rounded-md text-sm">
            <strong>AI Summary:</strong> {note.summary}
          </div>
        )}
        <div className={`text-gray-600 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {note.content}
        </div>
        {note.content && note.content.length > 150 && (
          <Button 
            variant="link" 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="px-0 h-auto mt-1"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => onEdit(note)}>Edit</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
