// src/components/notes/NoteEditor.tsx
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
      toast.success('Note created', { description: 'Your note has been created successfully.' });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      toast.error('Create failed', { description: 'Failed to create the note. Please try again.' });
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
      toast.success('Note updated', { description: 'Your note has been updated successfully.' });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating note:', error);
      toast.error('Update failed', { description: 'Failed to update the note. Please try again.' });
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      if (!note) throw new Error('Note not found');
      
      const content = form.getValues('content');
      setIsSummarizing(true);
      
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
      
      const { error } = await supabase
        .from('notes')
        .update({
          summary: data.summary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', note.id);
      
      if (error) throw error;
      
      return data.summary;
    },
    onSuccess: (summary) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note summarized', { description: 'Your note has been summarized with Gemini AI.' });
      setIsSummarizing(false);
    },
    onError: (error) => {
      console.error('Error summarizing note:', error);
      toast.error('Summarization failed', { description: 'Failed to summarize note. Please try again.' });
      setIsSummarizing(false);
    },
  });

  const onSubmit = (data: z.infer<typeof noteSchema>) => {
    if (isEditing) {
      updateNoteMutation.mutate(data);
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const handleSummarize = () => {
    summarizeMutation.mutate();
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
            
            {isEditing && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>AI Summary</FormLabel>
                  {!note?.summary && (
                    <SummarizeButton 
                      onClick={handleSummarize} 
                      isLoading={isSummarizing || summarizeMutation.isPending} 
                    />
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                  {note?.summary ? (
                    <p className="text-sm text-gray-700">{note.summary}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {summarizeMutation.isPending || isSummarizing 
                        ? 'Generating summary with Gemini 2.5 Flash...' 
                        : 'No summary available. Click the "AI Summarize" button to generate one.'}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
