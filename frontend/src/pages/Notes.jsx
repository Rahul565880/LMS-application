import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Save, Edit3, Check } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('myNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('myNotes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!noteTitle.trim() && !currentNote.trim()) {
      alert('Please enter a title or some content for your note');
      return;
    }

    const newNote = {
      id: Date.now(),
      title: noteTitle || 'Untitled Note',
      content: currentNote,
      createdAt: new Date().toLocaleString()
    };

    setNotes([newNote, ...notes]);
    setCurrentNote('');
    setNoteTitle('');
    setIsEditing(false);
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const handleEditNote = (note) => {
    setIsEditing(true);
    setEditingId(note.id);
    setNoteTitle(note.title);
    setCurrentNote(note.content);
  };

  const handleUpdateNote = () => {
    const updatedNotes = notes.map(note => 
      note.id === editingId 
        ? { ...note, title: noteTitle, content: currentNote, updatedAt: new Date().toLocaleString() }
        : note
    );
    
    setNotes(updatedNotes);
    setCurrentNote('');
    setNoteTitle('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setNoteTitle('');
    setCurrentNote('');
  };

  return (
    <div className="notes">
      <div className="container">
        <div className="notes-header">
          <h1><FileText size={32} /> My Notes</h1>
          <p>Your personal notepad for important information</p>
        </div>

        <div className="notes-editor-section">
          <div className="editor-card">
            <div className="editor-card-header">
              <h3>{isEditing ? 'Edit Note' : 'Create New Note'}</h3>
            </div>
            
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              className="note-title-input"
            />
            
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Write your note here..."
              className="note-textarea"
              rows="6"
            />
            
            <div className="editor-actions">
              {isEditing ? (
                <>
                  <button onClick={handleUpdateNote} className="btn btn-primary btn-sm">
                    <Check size={18} />
                    Update Note
                  </button>
                  <button onClick={handleCancelEdit} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleAddNote} className="btn btn-primary btn-sm">
                  <Plus size={18} />
                  Add Note
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="notes-list-section">
          <h2 style={{ marginBottom: '20px' }}>
            Your Notes ({notes.length})
          </h2>
          
          {notes.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No notes yet</h3>
              <p>Create your first note above!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="note-card-header">
                    <h4>{note.title}</h4>
                    <div className="note-actions">
                      <button 
                        onClick={() => handleEditNote(note)} 
                        className="btn-icon"
                        title="Edit note"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)} 
                        className="btn-icon"
                        title="Delete note"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="note-content">
                    <p>{note.content || 'No content'}</p>
                  </div>
                  
                  <div className="note-footer">
                    <small className="note-date">
                      Created: {note.createdAt}
                    </small>
                    {note.updatedAt && (
                      <small className="note-date">
                        Updated: {note.updatedAt}
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
