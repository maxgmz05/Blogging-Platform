const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure posts.json exists with proper structure
if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, '[]');
}

// Utility function to read posts
function readPosts() {
    try {
        return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    } catch (error) {
        return [];
    }
}

// Utility function to write posts
function writePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// Basic XSS protection
function sanitizeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m];
    });
}

// API Routes
app.get('/api/posts', (req, res) => {
    const posts = readPosts();
    res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
    const posts = readPosts();
    const post = posts.find(p => p.id === req.params.id);
    
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
});

app.post('/api/posts', (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const posts = readPosts();
    const newPost = {
        id: Date.now().toString(),
        title: sanitizeHtml(title.trim()),
        content: sanitizeHtml(content),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    writePosts(posts);
    
    res.json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const posts = readPosts();
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    posts[postIndex] = {
        ...posts[postIndex],
        title: sanitizeHtml(title.trim()),
        content: sanitizeHtml(content),
        updatedAt: new Date().toISOString()
    };
    
    writePosts(posts);
    res.json(posts[postIndex]);
});

app.delete('/api/posts/:id', (req, res) => {
    const posts = readPosts();
    const filteredPosts = posts.filter(p => p.id !== req.params.id);
    
    if (filteredPosts.length === posts.length) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    writePosts(filteredPosts);
    res.json({ message: 'Post deleted successfully' });
});

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/write', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'write.html'));
});

app.get('/post/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
