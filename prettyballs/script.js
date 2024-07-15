/*
Particle System inspired by: https://www.youtube.com/watch?v=Yvz_axxWG4Y&t=715s
Collision algorithm based on: https://www.gorillasun.de/blog/an-algorithm-for-particle-systems-with-collisions/
Author: Eli Silver
Date: 7/9/2024
*/

// Constants and configuration
const NUM_PARTICLES = 200;
const MAX_VELOCITY = 50;
const ACCELERATION_FACTOR = 0.002;
const DAMPING_FACTOR = 0.998;

// Canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Global variables
let mouseDistThreshold = canvas.width / 6;
let useColor = true;
let drawCollisions = true;
let damping = true;
let debug = false;

const particlesArray = [];
const mouse = {
    pos: new Vector(undefined, undefined),
};

// Event listeners
window.addEventListener('resize', handleResize);
canvas.addEventListener('click', toggleColor);
canvas.addEventListener('mousemove', updateMousePosition);
canvas.addEventListener('mouseleave', resetMousePosition);

/**
 * Represents a particle in the system.
 */
class Particle {
    constructor() {

        this.size = Math.random() * 8 + 2;      // radius random from (2px-10px)
        this.pos = this.randomPosition();
        this.velocity = this.randomVelocity();
        this.acceleration = new Vector(0, 0);   // acceleration is zero unless in range of mouse
        this.mass = Math.PI * this.size ** 2;   // mass = area of circle
        // flag set during frame where particle is in contact with edge or other particle
        this.isColliding = false;               
        this.fill = this.randomColor();
        this.stroke = this.randomColor();
    }

    randomPosition() {
        const x = Math.random() * (canvas.width - this.size * 2) + this.size;
        const y = Math.random() * (canvas.height - this.size * 2) + this.size;
        return new Vector(x, y);
    }

    randomVelocity() {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        return new Vector(x, y);
    }

    update() {

        this.updateVelocity();
        this.updatePosition();
        this.handleEdgeCollisions();
        this.handleParticleCollisions();
    }

    updateVelocity() {
        this.velocity = this.velocity.add(this.acceleration);
        if (damping) {
            this.velocity = this.velocity.multiply(DAMPING_FACTOR);
        }
        if (this.velocity.magnitude() >= MAX_VELOCITY) {
            this.velocity = this.velocity.normalize().multiply(MAX_VELOCITY);
        }
    }

    updatePosition() {
        this.pos = this.pos.add(this.velocity);
    }

    handleEdgeCollisions() {
        this.handleHorizontalEdges();
        this.handleVerticalEdges();
    }

    handleHorizontalEdges() {
        if (this.pos.x <= this.size) {
            this.edgeBounce(-1, 1);
            this.pos.x = this.size;
        } else if (this.pos.x >= canvas.width - this.size) {
            this.edgeBounce(-1, 1);
            this.pos.x = canvas.width - this.size;
        }
    }

    handleVerticalEdges() {
        if (this.pos.y <= this.size) {
            this.edgeBounce(1, -1);
            this.pos.y = this.size;
        } else if (this.pos.y >= canvas.height - this.size) {
            this.edgeBounce(1, -1);
            this.pos.y = canvas.height - this.size;
        }
    }

    draw() {
        this.drawParticle();
        this.drawLineToMouse();
    }

    drawLineToMouse() {
        const alpha = this.mouseDistanceFunction();
        if (alpha !== 0) {
            ctx.strokeStyle = useColor ? this.rgbaToString(this.stroke, alpha) : this.rgbaToString([255, 0, 0], alpha);
            ctx.beginPath();
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(mouse.pos.x, mouse.pos.y);
            ctx.stroke();
        }
    }

    drawParticle() {
        ctx.fillStyle = useColor ? this.rgbaToString(this.fill) : this.rgbaToString([255, 255, 255]);
        ctx.strokeStyle = useColor ? this.rgbaToString(this.stroke) : this.rgbaToString([255, 255, 255]);
        
        if (drawCollisions && this.isColliding && !useColor) {
            ctx.fillStyle = this.rgbaToString([255, 0, 0]);
            this.isColliding = false;
        }
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    handleParticleCollisions() {
        for (let other of particlesArray) {
            if (this !== other) {
                const dist = this.pos.subtract(other.pos).magnitude();
                const minDist = this.size + other.size;
                if (dist <= minDist) {
                    this.collideParticles(other, dist, minDist);
                }
            }
        }
    }

    collideParticles(other, dist, minDist) {
        this.isColliding = true;
        const normal = other.pos.subtract(this.pos).normalize();
        const relativeV = other.velocity.subtract(this.velocity);
        const impulse = normal.multiply(normal.dot(relativeV));
        this.velocity = this.velocity.add(impulse);
        other.velocity = other.velocity.subtract(impulse);
        const repulsion = normal.multiply((minDist - dist));
        this.pos = this.pos.subtract(repulsion);
        other.pos = other.pos.add(repulsion);
    }

    edgeBounce(reverseX, reverseY) {
        this.velocity.set(this.velocity.x * reverseX, this.velocity.y * reverseY);
        this.isColliding = true;
    }

    mouseDistanceFunction() {
        // mouse position is undefined when it is not over the canvas
        if (typeof mouse.pos.x == 'undefined' || typeof mouse.pos.y == 'undefined') {
            this.acceleration.set(0, 0);
            return 0;
        }
        //calculate distance from particle to mouse
        const dist = this.pos.subtract(mouse.pos).magnitude();
        if (dist <= this.size) return 1;
        if (dist >= mouseDistThreshold) return 0;
        const distFunction = 1 - (dist / mouseDistThreshold) ** 2;
        this.updateAcceleration(distFunction);
        return distFunction;
    }

    updateAcceleration(distFunction) {
        this.acceleration = mouse.pos.subtract(this.pos).multiply(distFunction * ACCELERATION_FACTOR);
        if (useColor) {
            this.acceleration = this.acceleration.multiply(-1);
        }
    }

    randomColor() {
        return [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    }

    rgbaToString(rgb, alpha = 1) {
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
}

// Helper functions
function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouseDistThreshold = canvas.width / 4;
}

function toggleColor() {
    useColor = !useColor;
}

function updateMousePosition(event) {
    mouse.pos.set(event.x, event.y);
}

function resetMousePosition() {
    mouse.pos.set(undefined, undefined);
}

function handleParticles() {
    for (let particle of particlesArray) {
        particle.update();
        particle.draw();
    }
}

function init() {
    for (let i = 0; i < NUM_PARTICLES; i++) {
        particlesArray.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animate);
}

// Start the animation
init();
animate();