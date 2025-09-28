// Write Page JavaScript
class WritePage {
    constructor() {
        this.titleInput = document.getElementById('post-title');
        this.contentArea = document.getElementById('post-content');
        this.preview = document.getElementById('preview-content');
        this.saveBtn = document.getElementById('save-btn');
        this.charCount = document.getElementById('title-char-count');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderPreview();
    }

    setupEventListeners() {
        this.titleInput.addEventListener('input', () => {
            this.updateCharCount();
            this.renderPreview();
        });
        
        this.contentArea.addEventListener('input', () => {
            this.renderPreview();
        });
        
        this.saveBtn.addEventListener('click', () => this.savePost());
        
        // Auto-save draft every 30 seconds
        setInterval(() => this.autoSaveDraft(), 30000);
        
        // Load draft if exists
        this.loadDraft();
    }

    updateCharCount() {
        const count = this.titleInput.value.length;
        this.charCount.textContent = `${count}/100`;
        this.charCount.style.color = count > 90 ? '#f72585' : '#6c757d';
    }

    renderPreview() {
        const title = this.titleInput.value.trim() || 'Untitled';
        const content = this.contentArea.value;
        
        const htmlContent = `
            <h1>${this.escapeHtml(title)}</h1>
            <div class="post-content">${this.renderMarkdown(content)}</div>
        `;
        
        this.preview.innerHTML = content ? htmlContent : '<div class="empty">Start writing to see preview...</div>';
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

    async savePost() {
        const title = this.titleInput.value.trim();
        const content = this.contentArea.value.trim();
        
        if (!title || !content) {
            alert('Please add both title and content before publishing.');
            return;
        }
        
        this.saveBtn.disabled = true;
        this.saveBtn.textContent = 'Publishing...';
        
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            
            // Clear draft
            localStorage.removeItem('blog_draft');
            
            alert('Post published successfully!');
            window.location.href = '/';
            
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to publish post: ' + error.message);
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.textContent = 'Publish Post';
        }
    }

    autoSaveDraft() {
        const draft = {
            title: this.titleInput.value,
            content: this.contentArea.value,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('blog_draft', JSON.stringify(draft));
    }

    loadDraft() {
        const draft = localStorage.getItem('blog_draft');
        if (draft) {
            const { title, content, timestamp } = JSON.parse(draft);
            if (confirm('Found an unsaved draft from ' + new Date(timestamp).toLocaleString() + '. Load it?')) {
                this.titleInput.value = title;
                this.contentArea.value = content;
                this.updateCharCount();
                this.renderPreview();
            }
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

// Initialize write page
document.addEventListener('DOMContentLoaded', () => {
    new WritePage();
});
