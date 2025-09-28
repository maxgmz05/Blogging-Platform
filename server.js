const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Middleware - FIXED: Serve static files from public directory
app.use(express.json());
app.use(express.static('public'));

// Ensure posts.json exists
if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, '[]');
}

// Utility functions
function readPosts() {
    try {
        const data = fs.readFileSync(POSTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// API Routes
app.get('/api/posts', (req, res) => {
    try {
        const posts = readPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load posts' });
    }
});

app.get('/api/posts/:id', (req, res) => {
    try {
        const posts = readPosts();
        const post = posts.find(p => p.id === req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load post' });
    }
});

app.post('/api/posts', (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const posts = readPosts();
        const newPost = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        posts.unshift(newPost);
        writePosts(posts);
        
        res.json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.delete('/api/posts/:id', (req, res) => {
    try {
        const posts = readPosts();
        const filteredPosts = posts.filter(p => p.id !== req.params.id);
        
        if (filteredPosts.length === posts.length) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        writePosts(filteredPosts);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// HTML Routes - SERVE STATIC FILES CORRECTLY
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
    console.log(`Homepage: http://localhost:${PORT}`);
    console.log(`Write page: http://localhost:${PORT}/write`);
});
