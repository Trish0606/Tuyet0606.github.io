const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');
const bfs = document.querySelectorAll('.bf');
let particles = [];
let mouse = { x: -2000, y: -2000 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = Math.random() * 2 + 1;
        this.opacity = 0.8;
        this.vX = (Math.random() - 0.5) * 0.4;
        this.vY = (Math.random() - 0.5) * 0.4;
    }
    update() { this.x += this.vX; this.y += this.vY; this.opacity -= 0.012; }
    draw() {
        ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
}

function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bfs.forEach((bf, i) => {
        // HOME POSITIONS (Restored to use the full screen width/height)
        const homeX = (window.innerWidth * parseFloat(bf.dataset.homeX)) / 100;
        const homeY = (window.innerHeight * parseFloat(bf.dataset.homeY)) / 100;
        
        // NATURAL FLIGHT MATH (High frequency for flutter, low frequency for wandering)
        const wanderX = Math.sin(time * 0.0005 + i) * 150; 
        const wanderY = Math.cos(time * 0.0004 + i) * 120;
        const jitterX = Math.sin(time * 0.003 + i) * 40;
        const jitterY = Math.cos(time * 0.003 + i) * 40;

        let curX = parseFloat(bf.style.left) || homeX;
        let curY = parseFloat(bf.style.top) || homeY;
        
        const distToMouse = Math.hypot(mouse.x - curX, mouse.y - curY);
        let targetX = (distToMouse < 280) ? mouse.x : homeX + wanderX + jitterX;
        let targetY = (distToMouse < 280) ? mouse.y : homeY + wanderY + jitterY;
        
        let speed = (distToMouse < 280) ? 0.08 : 0.025;
        const nextX = curX + (targetX - curX) * speed;
        const nextY = curY + (targetY - curY) * speed;
        
        const angle = Math.atan2(nextY - curY, nextX - curX) * (180 / Math.PI);
        
        bf.style.left = nextX + 'px';
        bf.style.top = nextY + 'px';
        bf.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;

        if (Math.random() > 0.3) particles.push(new Particle(nextX, nextY));
    });

    particles.forEach((p, i) => {
        p.update(); p.draw();
        if (p.opacity <= 0) particles.splice(i, 1);
    });

    requestAnimationFrame(animate);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

requestAnimationFrame(animate);
