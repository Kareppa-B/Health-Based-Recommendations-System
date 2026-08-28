// Performance optimized variables
let ticking = false;
let lastScrollY = 0;
const navbar = document.getElementById('navbar');
const scrollTop = document.getElementById('scrollTop');
const floatingFoods = document.querySelectorAll('.floating-food');
const mobileMenu = document.getElementById('mobileMenu');
const navMenu = document.getElementById('navMenu');

// Optimized scroll handler with throttling
function handleScroll() {
    if (!ticking) {
        requestAnimationFrame(updateScrollElements);
        ticking = true;
    }
}

function updateScrollElements() {
    const scrollY = window.scrollY;

    // Navbar scroll effect
    if (scrollY > 100) {
        navbar.classList.add('scrolled');
        scrollTop.classList.add('visible');
    } else {
        navbar.classList.remove('scrolled');
        scrollTop.classList.remove('visible');
    }

    // // Parallax effect for hero (optimized)
    // if (scrollY < window.innerHeight) {
    //     const parallaxSpeed = scrollY * 0.5;
    //     const hero = document.querySelector('.hero');
    //     hero.style.transform = `translate3d(0, ${parallaxSpeed}px, 0)`;
    // }

    lastScrollY = scrollY;
    ticking = false;
}

// Enhanced scroll event listener
window.addEventListener('scroll', handleScroll, { passive: true });

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Enhanced boomerang effect with trail
function createBoomerangEffect(element) {
    element.classList.add('boomerang');

    // Create trail effect
    const trail = createTrailEffect(element);

    // Remove boomerang class after animation
    setTimeout(() => {
        element.classList.remove('boomerang');
        clearTrail(trail);
    }, 3000);
}

function createTrailEffect(element) {
    const trail = [];
    let trailInterval = setInterval(() => {
        const rect = element.getBoundingClientRect();
        const trailDot = document.createElement('div');
        trailDot.className = 'boomerang-trail';
        trailDot.style.left = rect.left + rect.width / 2 + 'px';
        trailDot.style.top = rect.top + rect.height / 2 + 'px';
        document.body.appendChild(trailDot);
        trail.push(trailDot);

        // Remove trail dot after animation
        setTimeout(() => {
            if (trailDot.parentNode) {
                trailDot.parentNode.removeChild(trailDot);
            }
        }, 1000);
    }, 50);

    return { interval: trailInterval, dots: trail };
}

function clearTrail(trail) {
    clearInterval(trail.interval);
    trail.dots.forEach(dot => {
        if (dot.parentNode) {
            dot.parentNode.removeChild(dot);
        }
    });
}

// Enhanced floating food interactions
floatingFoods.forEach((food, index) => {
    // Double click for boomerang effect
    food.addEventListener('dblclick', (e) => {
        e.preventDefault();
        createBoomerangEffect(food);

        // Add some fun feedback
        const foodType = food.getAttribute('data-food') || 'food';
        showNotification(`${food.textContent} is doing a boomerang dance!`, 'fun');
    });

    // Single click for regular interaction
    food.addEventListener('click', () => {
        food.style.animation = 'none';
        food.style.transform = 'scale(1.3) rotate(720deg)';
        food.style.opacity = '0.4';

        setTimeout(() => {
            food.style.animation = `float 8s ease-in-out infinite`;
            food.style.animationDelay = `${-index * 2}s`;
            food.style.transform = '';
            food.style.opacity = '0.1';
        }, 500);
    });

    // Touch support for mobile
    food.addEventListener('touchstart', (e) => {
        e.preventDefault();
        food.dispatchEvent(new Event('click'));
    }, { passive: false });
});

// Animated counter for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 100;

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-count');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
                if (target === 98) {
                    counter.innerText += '%';
                }
            }
        };
        updateCount();
    });
}

// Optimized Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;

            // Stats counter animation
            if (target.id === 'stats') {
                animateCounters();
            }

            // Fade in animations
            if (target.classList.contains('fade-in')) {
                target.classList.add('visible');
            }

            // Step animations
            if (target.classList.contains('step')) {
                setTimeout(() => {
                    target.classList.add('animate');
                }, parseInt(target.querySelector('.step-number').textContent) * 200);
            }

            // Feature card animations
            if (target.classList.contains('feature-card')) {
                target.style.animationDelay = '0.1s';
                target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }

            observer.unobserve(target);
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.fade-in, .step, .feature-card, #stats').forEach(el => {
    observer.observe(el);
});

// Mobile menu toggle with enhanced animation
mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Enhanced scroll to top with boomerang effect
scrollTop.addEventListener('click', () => {
    scrollTop.style.animation = 'boomerang 1s ease-out';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    setTimeout(() => {
        scrollTop.style.animation = '';
    }, 1000);
});

// CTA button enhancements
document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        if (this.href && this.href.includes('#')) {
            return; // Let smooth scroll handle internal links
        }

        e.preventDefault();

        const originalText = this.innerHTML;
        this.innerHTML = '<span class="loading"></span> Loading...';
        this.style.pointerEvents = 'none';

        setTimeout(() => {
            if (this.href && this.href.includes('login.html')) {
                window.location.href = this.href;
            } else {
                this.innerHTML = originalText;
                this.style.pointerEvents = 'auto';
                showNotification('Feature coming soon!', 'info');
            }
        }, 2000);
    });
});

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    max-width: 320px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    `;

    const colors = {
        success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)',
        fun: 'linear-gradient(135deg, #f093fb, #f5576c)'
    };

    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

// Feature card click interactions
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
        card.style.transform = 'translateY(-15px) scale(1.02) rotateY(5deg)';
        setTimeout(() => {
            card.style.transform = '';
        }, 300);
    });
});

// Step number interactions
document.querySelectorAll('.step-number').forEach((stepNum, index) => {
    stepNum.addEventListener('click', () => {
        stepNum.style.transform = 'scale(0.9) rotateY(360deg)';
        stepNum.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';

        setTimeout(() => {
            stepNum.style.transform = 'scale(1)';
            stepNum.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        }, 600);

        showNotification(`Step ${index + 1} clicked! 🎉`, 'fun');
    });
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        scrollTop.click();
    }

    if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        const randomFood = floatingFoods[Math.floor(Math.random() * floatingFoods.length)];
        createBoomerangEffect(randomFood);
        showNotification('Random boomerang effect! 🎪', 'fun');
    }
});

// Add CSS animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes fadeInUp {
        0 % {
            opacity: 0;
            transform: translateY(30px);
        }
                100% {
        opacity: 1;
    transform: translateY(0);
                }
            }

    @keyframes slideInRight {
        from {
        transform: translateX(100%);
    opacity: 0;
                }
    to {
        transform: translateX(0);
    opacity: 1;
                }
            }

    @keyframes slideOutRight {
        from {
        transform: translateX(0);
    opacity: 1;
                }
    to {
        transform: translateX(100%);
    opacity: 0;
                }
            }

    .floating-food {
        cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    user-select: none;
            }
    `;
document.head.appendChild(additionalStyles);

// Initialize performance monitoring
let performanceStats = {
    scrollEvents: 0,
    animations: 0,
    interactions: 0
};

// Console welcome message
console.log(`
    🍽️ Smart Food Recommendation System
    ===================================

    🎪 Easter Eggs:
    - Double-click any floating food for boomerang effect
    - Ctrl + B for random boomerang
    - Ctrl + ↑ to scroll to top
    - Click step numbers for surprises

    🚀 Performance: Optimized with RAF and GPU acceleration
    🎨 Animations: CSS3 transforms with hardware acceleration
    📱 Mobile: Touch-friendly with responsive design
    `);

// Preload critical resources
window.addEventListener('load', () => {
    // Preload login page
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'login.html';
    document.head.appendChild(link);

    showNotification('Welcome to Smart Food! 🍽️', 'success');
});