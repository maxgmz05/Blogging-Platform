// Homepage JavaScript 
document.addEventListener('DOMContentLoaded', function() {
    console.log('Homepage loaded');
    loadPosts();
});

async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '<div class="loading">Loading posts...</div>';
    
    try {
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        
        const posts = await response.json();
        renderPosts(posts);
        
    } catch (error) {
        console.error('Error loading posts:', error);
        showError('Failed to load posts. Please try again.');
    }
}

function renderPosts(posts) {
    const postsList = document.getElementById('posts-list');
    
    if (!posts || posts.length === 0) {
        postsList.innerHTML = `
            <div class="empty-state">
                <h3>No posts yet</h3>
                <p>Be the first to share your thoughts!</p>
                <button class="btn-primary" onclick="location.href='/write'">Write First Post</button>
            </div>
        `;
        return;
    }
    
    postsList.innerHTML = posts.map(post => `
        <div class="post-card" onclick="viewPost('${post.id}')">
            <h3>${escapeHtml(post.title)}</h3>
            <div class="post-preview">${getPreview(post.content)}</div>
            <div class="post-meta">
                <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                <span>${getReadTime(post.content)} min read</span>
            </div>
        </div>
    `).join('');
}

function viewPost(postId) {
    window.location.href = `/post/${postId}`;
}

function getPreview(content) {
    if (!content) return 'No content available';
    const text = content.replace(/#+\s+/g, '').substring(0, 150);
    return escapeHtml(text) + (content.length > 150 ? '...' : '');
}

function getReadTime(content) {
    if (!content) return 0;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

function showError(message) {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn-primary" onclick="loadPosts()">Try Again</button>
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
