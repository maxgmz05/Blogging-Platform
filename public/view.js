// View Page JavaScript
class ViewPage {
    constructor() {
        this.postId = window.location.pathname.split('/').pop();
        this.postContent = document.getElementById('post-content');
        this.editBtn = document.getElementById('edit-btn');
        this.deleteBtn = document.getElementById('delete-btn');
        
        this.init();
    }

    async init() {
        await this.loadPost();
        this.setupEventListeners();
    }

    async loadPost() {
        try {
            const response = await fetch(`/api/posts/${this.postId}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            
            const post = await response.json();
            this.renderPost(post);
            
        } catch (error) {
            console.error('Error loading post:', error);
            this.postContent.innerHTML = `
                <div class="empty-state">
                    <h3>Post not found</h3>
                    <p>The post you're looking for doesn't exist or may have been deleted.</p>
                    <button class="btn-primary" onclick="location.href='/'">Back to Home</button>
                </div>
            `;
        }
    }

    renderPost(post) {
        const postDate = new Date(post.updatedAt);
        
        this.postContent.innerHTML = `
            <article class="post-article">
                <h1>${this.escapeHtml(post.title)}</h1>
                <div class="post-meta-large">
                    Published on ${postDate.toLocaleDateString()} at ${postDate.toLocaleTimeString()}
                </div>
                <div class="post-content">
                    ${this.renderMarkdown(post.content)}
                </div>
            </article>
        `;
        
        // Update page title
        document.title = `${post.title} - Mini Blog`;
    }

    renderMarkdown(text) {
        return text
            .split('\n')
            .map(line => {
                if (/^###\s+/.test(line)) {
                    return `<h3>${this.escapeHtml(line.replace(/^###\s+/, ''))}</h3>`;
                }
                if (/^##\s+/.test(line)) {
                    return `<h2>${this.escapeHtml(line.replace(/^##\s+/, ''))}</h2>`;
                }
                if (/^#\s+/.test(line)) {
                    return `<h1>${this.escapeHtml(line.replace(/^#\s+/, ''))}</h1>`;
                }
                if (/^-\s+/.test(line)) {
                    return `<li>${this.escapeHtml(line.replace(/^-\s+/, ''))}</li>`;
                }
                return line ? `<p>${this.escapeHtml(line)}</p>` : '<br>';
            })
            .join('');
    }

    setupEventListeners() {
        this.editBtn.addEventListener('click', () => {
            alert('Edit functionality will be implemented in the next version!');
            // Future implementation: window.location.href = `/edit/${this.postId}`;
        });
        
        this.deleteBtn.addEventListener('click', () => this.deletePost());
    }

    async deletePost() {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/posts/${this.postId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            
            alert('Post deleted successfully!');
            window.location.href = '/';
            
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post: ' + error.message);
        }
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

// Initialize view page
document.addEventListener('DOMContentLoaded', () => {
    new ViewPage();
});
