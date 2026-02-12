/**
 * BUTTERFLY ENGINE
 * Handles the natural erratic flight, trail particles, and mouse interaction.
 */

const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');
const bfs = document.querySelectorAll('.bf');
let particles = [];
let mouse = { x: -2000, y: -2000 };

// 1. Handle Responsive Canvas Size
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 2. Track Mouse Position
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// 3. Trail Particle Class (The sparkles)
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.opacity = 0.8;
        this.vX = (Math.random() - 0.5) * 0.5; // Slight drift
        this.vY = (Math.random() - 0.5) * 0.5;
    }
    update() {
        this.x += this.vX;
        this.y += this.vY;
        this.opacity -= 0.012; // How fast the sparkles fade
    }
    draw() {
        ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 4. Main Animation Loop
function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bfs.forEach((bf, i) => {
        // Find their "Home" position from the HTML data-attributes
        const homeX = (window.innerWidth * bf.dataset.homeX) / 100;
        const homeY = (window.innerHeight * bf.dataset.homeY) / 100;
        
        // NATURAL FLUTTER: This creates the zig-zagging motion
        // We combine a fast wave (0.002) for jitter and a slow wave (0.0005) for wandering
        const flutterX = Math.sin(time * 0.002 + i) * 45 + Math.sin(time * 0.0005 + i) * 120;
        const flutterY = Math.cos(time * 0.002 + i) * 45 + Math.cos(time * 0.0003 + i) * 90;

        let curX = parseFloat(bf.style.left) || homeX;
        let curY = parseFloat(bf.style.top) || homeY;
        
        const distToMouse = Math.hypot(mouse.x - curX, mouse.y - curY);
        
        // If mouse is within 250px, chase the mouse. Otherwise, wander naturally.
        let targetX = (distToMouse < 250) ? mouse.x : homeX + flutterX;
        let targetY = (distToMouse < 250) ? mouse.y : homeY + flutterY;
        
        // Lerp (Linear Interpolation) for smooth movement
        let speed = (distToMouse < 250) ? 0.08 : 0.025;
        const nextX = curX + (targetX - curX) * speed;
        const nextY = curY + (targetY - curY) * speed;
        
        // Calculate angle so the butterfly body turns where it's flying
        const angle = Math.atan2(nextY - curY, nextX - curX) * (180 / Math.PI);
        
        bf.style.left = nextX + 'px';
        bf.style.top = nextY + 'px';
        bf.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;

        // Occasionally drop a trail particle
        if (Math.random() > 0.35) {
            particles.push(new Particle(nextX, nextY));
        }
    });

    // Animate and Clean up particles
    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.opacity <= 0) particles.splice(i, 1);
    });

    requestAnimationFrame(animate);
}

// 5. Scroll Reveal Logic (For the About/Work sections)
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Start the animation
requestAnimationFrame(animate);
