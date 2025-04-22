'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Note } from '@/lib/types';
import { toast } from 'sonner';
import SummarizeButton from './SummarizeButton';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type NoteEditorProps = {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
};

export default function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!note;
  const [isSummarizing, setIsSummarizing] = useState(false);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof noteSchema>) => {
      const user = await supabase.auth.getUser();
      if (!user.data?.user) throw new Error('User not authenticated');
      
      const { data: noteData, error } = await supabase
        .from('notes')
        .insert([{
          user_id: user.data.user.id,
          title: data.title,
          content: data.content,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return noteData as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast('Note created. Your note has been created successfully.');
      onClose();
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      toast('Create failed. Failed to create the note. Please try again.');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof noteSchema>) => {
      if (!note) throw new Error('Note not found');
      
      const { data: updatedNote, error } = await supabase
        .from('notes')
        .update({
          title: data.title,
          content: data.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', note.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedNote as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast('Note updated. Your note has been updated successfully.');
      onClose();
    },
    onError: (error) => {
      console.error('Error updating note:', error);
      toast('Update failed. Failed to update the note. Please try again.');
    },
  });

  const onSubmit = (data: z.infer<typeof noteSchema>) => {
    if (isEditing) {
      updateNoteMutation.mutate(data);
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      const content = form.getValues('content');
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to summarize note');
      }
      
      const data = await response.json();
      
      if (note?.id) {
        // Update the note with the summary
        const { error } = await supabase
          .from('notes')
          .update({
            summary: data.summary,
            updated_at: new Date().toISOString(),
          })
          .eq('id', note.id);
        
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        toast('Note summarized successfully.');
        onClose();
      }
    } catch (error) {
      console.error('Error summarizing note:', error);
      toast('Failed to summarize note. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Note' : 'Create Note'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your note content here..." 
                      className="min-h-[200px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <div className="flex gap-2">
                {isEditing && (
                  <SummarizeButton 
                    onClick={handleSummarize} 
                    isLoading={isSummarizing} 
                  />
                )}
                <Button 
                  type="submit" 
                  disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                >
                  {isEditing 
                    ? (updateNoteMutation.isPending ? 'Saving...' : 'Save')
                    : (createNoteMutation.isPending ? 'Creating...' : 'Create')
                  }
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
