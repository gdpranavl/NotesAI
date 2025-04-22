'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Note } from '@/lib/types';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

export default function NotesList() {
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: notes, isLoading, isError } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Note[];
    },
  });

  const handleCreateNote = () => {
    setSelectedNote(undefined);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(undefined);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading your notes...</div>;
  }

  if (isError) {
    return <div className="text-center py-10 text-red-500">Error loading notes. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Notes</h1>
        <Button onClick={handleCreateNote}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {notes && notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You don't have any notes yet.</p>
          <Button onClick={handleCreateNote}>Create your first note</Button>
        </div>
      )}

      <NoteEditor 
        note={selectedNote} 
        isOpen={isEditorOpen} 
        onClose={handleCloseEditor} 
      />
    </div>
  );
}
