// DOM Elements
const urlInput = document.getElementById('urlInput');
const pasteBtn = document.getElementById('pasteBtn');
const downloadBtn = document.getElementById('downloadBtn');
const platformItems = document.querySelectorAll('.platform-item');
const formatRadios = document.querySelectorAll('input[name="format"]');
const qualitySelect = document.getElementById('quality');
const loadingModal = document.getElementById('loadingModal');
const resultModal = document.getElementById('resultModal');
const resultContent = document.getElementById('resultContent');
const closeModal = document.querySelector('.close-modal');
const faqItems = document.querySelectorAll('.faq-item');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const contactForm = document.querySelector('.contact-form');

// Platform detection patterns
const platformPatterns = {
    youtube: /(?:youtube\.com|youtu\.be)/i,
    instagram: /instagram\.com/i,
    facebook: /facebook\.com|fb\.watch/i,
    tiktok: /tiktok\.com/i,
    twitter: /twitter\.com|x\.com/i,
    linkedin: /linkedin\.com/i
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeSmoothScrolling();
    initializeAnimations();
});

// Event Listeners
function initializeEventListeners() {
    // Paste button functionality
    pasteBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            detectPlatform(text);
            validateUrl();
        } catch (err) {
            console.log('Failed to read clipboard:', err);
            // Fallback: focus on input for manual paste
            urlInput.focus();
        }
    });

    // URL input change detection
    urlInput.addEventListener('input', function() {
        detectPlatform(this.value);
        validateUrl();
    });

    // Platform selection
    platformItems.forEach(item => {
        item.addEventListener('click', function() {
            platformItems.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Download button
    downloadBtn.addEventListener('click', handleDownload);

    // FAQ accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Mobile navigation
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Modal close
    closeModal.addEventListener('click', function() {
        resultModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === resultModal) {
            resultModal.style.display = 'none';
        }
        if (event.target === loadingModal) {
            loadingModal.style.display = 'none';
        }
    });

    // Contact form
    contactForm.addEventListener('submit', handleContactForm);

    // Format change handler
    formatRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateQualityOptions();
        });
    });
}

// Platform Detection
function detectPlatform(url) {
    if (!url) return;

    // Remove active class from all platforms
    platformItems.forEach(item => item.classList.remove('active'));

    // Check each platform pattern
    for (const [platform, pattern] of Object.entries(platformPatterns)) {
        if (pattern.test(url)) {
            const platformElement = document.querySelector(`[data-platform="${platform}"]`);
            if (platformElement) {
                platformElement.classList.add('active');
            }
            break;
        }
    }
}

// URL Validation
function validateUrl() {
    const url = urlInput.value.trim();
    const isValid = isValidUrl(url);
    
    downloadBtn.disabled = !isValid;
    downloadBtn.style.opacity = isValid ? '1' : '0.6';
    downloadBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Update Quality Options
function updateQualityOptions() {
    const selectedFormat = document.querySelector('input[name="format"]:checked').value;
    
    if (selectedFormat === 'audio') {
        qualitySelect.innerHTML = `
            <option value="320kbps">320 kbps (Best)</option>
            <option value="256kbps">256 kbps</option>
            <option value="192kbps">192 kbps</option>
            <option value="128kbps">128 kbps</option>
        `;
    } else {
        qualitySelect.innerHTML = `
            <option value="best">Best Quality</option>
            <option value="1080p">1080p HD</option>
            <option value="720p">720p HD</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
        `;
    }
}

// Download Handler
async function handleDownload() {
    const url = urlInput.value.trim();
    const format = document.querySelector('input[name="format"]:checked').value;
    const quality = qualitySelect.value;
    const activePlatform = document.querySelector('.platform-item.active');
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }

    // Show loading modal
    showLoadingModal();

    try {
        // Call backend API
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                format: format,
                quality: quality,
                platform: activePlatform ? activePlatform.dataset.platform : 'auto'
            })
        });

        const data = await response.json();
        
        // Hide loading modal
        hideLoadingModal();
        
        if (data.success) {
            // Show result
            showResult(data);
        } else {
            throw new Error(data.error || 'Download failed');
        }
        
    } catch (error) {
        console.error('Download error:', error);
        hideLoadingModal();
        
        // Show error result
        showResult({
            success: false,
            error: error.message || 'Download failed. Please check the URL and try again.'
        });
    }
}

// Show Mock Result (for demo)
function showMockResult(url, format, quality) {
    const mockData = {
        success: true,
        title: 'Sample Video Title',
        thumbnail: 'https://via.placeholder.com/320x180/2563EB/FFFFFF?text=Video+Thumbnail',
        format: format,
        quality: quality,
        fileSize: format === 'audio' ? '4.2 MB' : '25.8 MB',
        downloadUrl: '#',
        duration: '3:45'
    };
    
    showResult(mockData);
}

// Show Result Modal
function showResult(data) {
    if (data.success) {
        resultContent.innerHTML = `
            <div class="result-success">
                <div class="result-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Download Ready!</h3>
                <div class="result-info">
                    <img src="${data.thumbnail}" alt="Thumbnail" class="result-thumbnail">
                    <div class="result-details">
                        <h4>${data.title}</h4>
                        <p><strong>Format:</strong> ${data.format.toUpperCase()}</p>
                        <p><strong>Quality:</strong> ${data.quality}</p>
                        <p><strong>Size:</strong> ${data.fileSize}</p>
                        ${data.duration ? `<p><strong>Duration:</strong> ${data.duration}</p>` : ''}
                    </div>
                </div>
                <div class="result-actions">
                    <a href="${data.downloadUrl}" class="download-link" download>
                        <i class="fas fa-download"></i>
                        Download File
                    </a>
                    <button class="copy-link-btn" onclick="copyToClipboard('${data.downloadUrl}')">
                        <i class="fas fa-copy"></i>
                        Copy Link
                    </button>
                </div>
            </div>
        `;
    } else {
        resultContent.innerHTML = `
            <div class="result-error">
                <div class="result-icon error">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3>Download Failed</h3>
                <p>${data.error || 'An error occurred while processing your request.'}</p>
                <button class="retry-btn" onclick="handleDownload()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
    }
    
    resultModal.style.display = 'block';
}

// Modal Functions
function showLoadingModal() {
    loadingModal.style.display = 'block';
}

function hideLoadingModal() {
    loadingModal.style.display = 'none';
}

function showError(message) {
    alert(message); // Replace with better error handling
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Link copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Contact Form Handler
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Simulate form submission
    showNotification('Message sent successfully!');
    e.target.reset();
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            navMenu.classList.remove('active');
        });
    });
}

// Animations
function initializeAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .step, .platform-card, .faq-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'var(--white)';
        header.style.backdropFilter = 'none';
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .result-success, .result-error {
        text-align: center;
    }
    
    .result-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--secondary-color);
    }
    
    .result-icon.error {
        color: #EF4444;
    }
    
    .result-info {
        display: flex;
        gap: 1rem;
        margin: 1.5rem 0;
        text-align: left;
    }
    
    .result-thumbnail {
        width: 120px;
        height: 68px;
        object-fit: cover;
        border-radius: var(--border-radius-xs);
    }
    
    .result-details h4 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .result-details p {
        margin-bottom: 0.25rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    .result-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .download-link, .copy-link-btn, .retry-btn {
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius-sm);
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: var(--transition);
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .download-link {
        background: var(--primary-color);
        color: var(--white);
    }
    
    .download-link:hover {
        background: #1d4ed8;
        transform: translateY(-2px);
    }
    
    .copy-link-btn {
        background: var(--border-color);
        color: var(--text-primary);
    }
    
    .copy-link-btn:hover {
        background: #D1D5DB;
    }
    
    .retry-btn {
        background: var(--accent-color);
        color: var(--white);
    }
    
    .retry-btn:hover {
        background: #D97706;
    }
    
    .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--white);
        flex-direction: column;
        padding: 1rem;
        box-shadow: var(--shadow);
    }
    
    @media (max-width: 768px) {
        .result-info {
            flex-direction: column;
            text-align: center;
        }
        
        .result-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

