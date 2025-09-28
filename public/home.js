// Homepage JavaScript
class HomePage {
    constructor() {
        this.postsList = document.getElementById('posts-list');
        this.init();
    }

    async init() {
        await this.loadPosts();
    }

    async loadPosts() {
        this.postsList.innerHTML = '<div class="loading">Loading posts...</div>';
        
        try {
            const response = await fetch('/api/posts');
            const posts = await response.json();
            
            if (!response.ok) throw new Error(posts.error);
            
            this.renderPosts(posts);
        } catch (error) {
            console.error('Error loading posts:', error);
            this.postsList.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load posts</h3>
                    <p>Please try refreshing the page</p>
                </div>
            `;
        }
    }

    renderPosts(posts) {
        if (posts.length === 0) {
            this.postsList.innerHTML = `
                <div class="empty-state">
                    <h3>No posts yet</h3>
                    <p>Be the first to share your thoughts!</p>
                    <button class="btn-primary" onclick="location.href='/write'" style="margin-top: 1rem;">
                        Write First Post
                    </button>
                </div>
            `;
            return;
        }

        this.postsList.innerHTML = posts.map(post => `
            <a href="/post/${post.id}" class="post-card">
                <h3>${this.escapeHtml(post.title)}</h3>
                <div class="post-preview">${this.getPreview(post.content)}</div>
                <div class="post-meta">
                    <span class="post-date">${new Date(post.updatedAt).toLocaleDateString()}</span>
                    <span>${this.getReadTime(post.content)} min read</span>
                </div>
            </a>
        `).join('');
    }

    getPreview(content) {
        // Remove markdown headers and get first 150 characters
        const plainText = content.replace(/^#+\s+/gm, '').replace(/\n/g, ' ');
        return this.escapeHtml(plainText.substring(0, 150)) + (plainText.length > 150 ? '...' : '');
    }

    getReadTime(content) {
        const words = content.split(/\s+/).length;
        return Math.ceil(words / 200); // Average reading speed
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
