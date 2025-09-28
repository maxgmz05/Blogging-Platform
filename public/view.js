// View Page JavaScript 
document.addEventListener('DOMContentLoaded', function() {
    console.log('View page loaded');
    
    // Get post ID from URL
    const pathParts = window.location.pathname.split('/');
    const postId = pathParts[pathParts.length - 1];
    
    console.log('Post ID from URL:', postId);
    
    if (!postId || postId === 'view.html' || postId === 'post') {
        showError('Invalid post ID');
        return;
    }
    
    loadPost(postId);
});

async function loadPost(postId) {
    try {
        console.log('Fetching post with ID:', postId);
        const response = await fetch(`/api/posts/${postId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const post = await response.json();
        console.log('Post loaded:', post);
        renderPost(post);
        
    } catch (error) {
        console.error('Error loading post:', error);
        showError('Failed to load post: ' + error.message);
    }
}

function renderPost(post) {
    const container = document.getElementById('post-container');
    
    const html = `
        <article class="post-article">
            <h1>${escapeHtml(post.title)}</h1>
            <div class="post-meta-large">
                Published on ${new Date(post.createdAt).toLocaleDateString()} 
                at ${new Date(post.createdAt).toLocaleTimeString()}
            </div>
            <div class="post-content">
                ${formatContent(post.content)}
            </div>
        </article>
    `;
    
    container.innerHTML = html;
    document.title = `${post.title} - Mini Blog`;
    
    // Setup event listeners after rendering
    setupEventListeners(post.id);
}

function formatContent(content) {
    if (!content) return '<p>No content available.</p>';
    
    return content.split('\n')
        .map(line => {
            line = line.trim();
            if (!line) return '';
            
            if (line.startsWith('### ')) {
                return `<h3>${escapeHtml(line.substring(4))}</h3>`;
            } else if (line.startsWith('## ')) {
                return `<h2>${escapeHtml(line.substring(3))}</h2>`;
            } else if (line.startsWith('# ')) {
                return `<h1>${escapeHtml(line.substring(2))}</h1>`;
            } else {
                return `<p>${escapeHtml(line)}</p>`;
            }
        })
        .join('');
}

function setupEventListeners(postId) {
    const deleteBtn = document.getElementById('delete-btn');
    const editBtn = document.getElementById('edit-btn');
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deletePost(postId));
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            alert('Edit feature coming soon!');
        });
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete post');
        }
        
        alert('Post deleted successfully!');
        window.location.href = '/';
        
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post: ' + error.message);
    }
}

function showError(message) {
    const container = document.getElementById('post-container');
    container.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn-primary" onclick="location.href='/'">Back to Home</button>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
