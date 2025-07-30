// Modern JavaScript for IEEE Workshop Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initActiveNavigation();
    initAnimations();
    initTableInteractions();
    initAccessibility();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.navigation a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 100; // Account for sticky nav
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

// Active navigation highlighting with improved performance
function initActiveNavigation() {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.navigation a');
    
    // Throttled scroll handler for better performance
    let ticking = false;
    
    function updateActiveSection() {
        const scrollPos = window.scrollY + 150;
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Update navigation
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + currentSection) {
                item.classList.add('active');
            }
        });
        
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateActiveSection);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial call
    updateActiveSection();
}

// Intersection Observer for animations
function initAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        return; // Skip animations if user prefers reduced motion
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Add staggered animation delay for grid items
                if (element.classList.contains('organizer-card') || 
                    element.classList.contains('speaker-card') ||
                    element.classList.contains('committee-member')) {
                    
                    const siblings = Array.from(element.parentElement.children);
                    const index = siblings.indexOf(element);
                    
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, index * 100);
                } else {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .organizer-card, 
        .speaker-card, 
        .timeline-item, 
        .committee-member,
        .subsection
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Enhanced table interactions
function initTableInteractions() {
    const tableRows = document.querySelectorAll('.schedule-table tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
        
        // Add keyboard navigation support
        row.setAttribute('tabindex', '0');
        row.addEventListener('focus', function() {
            this.style.transform = 'translateX(8px)';
            this.style.outline = '2px solid #2a5298';
            this.style.outlineOffset = '2px';
        });
        
        row.addEventListener('blur', function() {
            this.style.transform = 'translateX(0)';
            this.style.outline = 'none';
        });
    });
}

// Accessibility improvements
function initAccessibility() {
    // Add skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #1e3c72;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID for skip link
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.id = 'main-content';
    }
    
    // Improve keyboard navigation for cards
    const cards = document.querySelectorAll('.organizer-card, .speaker-card');
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Add ARIA labels for better screen reader support
    const navigation = document.querySelector('.navigation');
    if (navigation) {
        navigation.setAttribute('aria-label', 'Workshop sections navigation');
    }
    
    const timeline = document.querySelector('.timeline-container');
    if (timeline) {
        timeline.setAttribute('aria-label', 'Workshop timeline');
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize events
window.addEventListener('resize', debounce(() => {
    // Recalculate positions if needed
    const activeNavItem = document.querySelector('.navigation a.active');
    if (activeNavItem) {
        // Trigger a scroll event to recalculate active section
        window.dispatchEvent(new Event('scroll'));
    }
}, 250));

// Add loading state management
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add CSS for loaded state
    const style = document.createElement('style');
    style.textContent = `
        body:not(.loaded) * {
            animation-play-state: paused !important;
        }
        
        .skip-link:focus {
            top: 6px !important;
        }
        
        .navigation a.active {
            background: rgba(255, 255, 255, 0.2);
            font-weight: 600;
            border-bottom: 3px solid #fbbf24;
        }
        
        @media (max-width: 768px) {
            .navigation a.active {
                border-bottom: none;
                border-left: 4px solid #fbbf24;
            }
        }
    `;
    document.head.appendChild(style);
});

// Error handling for failed animations or interactions
window.addEventListener('error', function(e) {
    console.warn('Non-critical error occurred:', e.error);
    // Gracefully degrade functionality if needed
});

// Handle print events
window.addEventListener('beforeprint', function() {
    // Expand all collapsed content for printing
    const collapsedElements = document.querySelectorAll('[aria-expanded="false"]');
    collapsedElements.forEach(el => {
        el.setAttribute('aria-expanded', 'true');
    });
});

// Performance monitoring (optional)
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData && perfData.loadEventEnd - perfData.loadEventStart > 3000) {
                console.info('Page load took longer than expected. Consider optimizing resources.');
            }
        }, 0);
    });
}