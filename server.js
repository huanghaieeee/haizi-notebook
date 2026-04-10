const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir('public/images');
ensureDir('notes');

// Routes
// Get all notes
app.get('/api/notes', (req, res) => {
  try {
    const files = fs.readdirSync('notes');
    const notes = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = fs.readFileSync(path.join('notes', file), 'utf-8');
        return JSON.parse(content);
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single note
app.get('/api/notes/:id', (req, res) => {
  try {
    const filePath = path.join('notes', `${req.params.id}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(404).json({ error: 'Note not found' });
  }
});

// Create note
app.post('/api/notes', (req, res) => {
  try {
    const id = Date.now().toString();
    const note = {
      id,
      title: req.body.title || 'Untitled',
      content: req.body.content || '',
      category: req.body.category || 'General',
      tags: req.body.tags || [],
      images: req.body.images || [],
      timestamp: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    fs.writeFileSync(path.join('notes', `${id}.json`), JSON.stringify(note, null, 2));
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update note
app.put('/api/notes/:id', (req, res) => {
  try {
    const filePath = path.join('notes', `${req.params.id}.json`);
    const note = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    note.title = req.body.title !== undefined ? req.body.title : note.title;
    note.content = req.body.content !== undefined ? req.body.content : note.content;
    note.category = req.body.category !== undefined ? req.body.category : note.category;
    note.tags = req.body.tags !== undefined ? req.body.tags : note.tags;
    note.images = req.body.images !== undefined ? req.body.images : note.images;
    note.updated = new Date().toISOString();
    
    fs.writeFileSync(filePath, JSON.stringify(note, null, 2));
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const filePath = path.join('notes', `${req.params.id}.json`);
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    res.json({ filename: req.file.filename, path: `/images/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search notes
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q.toLowerCase();
    const files = fs.readdirSync('notes');
    const results = files
      .filter(file => file.endsWith('.json'))
      .map(file => JSON.parse(fs.readFileSync(path.join('notes', file), 'utf-8')))
      .filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query)) ||
        note.category.toLowerCase().includes(query)
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Haizi Notebook server running at http://localhost:${PORT}`);
});