class NotebookApp {
    constructor() {
        this.notes = [];
    }

    createNewNote(title, content) {
        const newNote = { id: this.notes.length + 1, title, content, images: [] };
        this.notes.push(newNote);
        return newNote;
    }

    openNote(id) {
        return this.notes.find(note => note.id === id);
    }

    saveNote(id, content) {
        const note = this.openNote(id);
        if (note) {
            note.content = content;
            return note;
        }
        return null;
    }

    deleteNote(id) {
        const index = this.notes.findIndex(note => note.id === id);
        if (index !== -1) {
            return this.notes.splice(index, 1)[0];
        }
        return null;
    }

    search(query) {
        return this.notes.filter(note => note.title.includes(query) || note.content.includes(query));
    }

    addImageToNote(id, image) {
        const note = this.openNote(id);
        if (note) {
            note.images.push(image);
            return note;
        }
        return null;
    }

    removeImageFromNote(noteId, image) {
        const note = this.openNote(noteId);
        if (note) {
            note.images = note.images.filter(img => img !== image);
            return note;
        }
        return null;
    }
}