/**
 *   Many body particle system visualizer
 *   Author: Eli Silver
 *   Date: 7/15/2024
 */


const DEBUG = true;

// Simulation configuration
const MAX_VELOCITY = 10000;
const MIN_SIZE_DEAD_ZONE = true; // set force to zero if distance between p1 & p2 is < r1 + r2
const COLLISIONS =  false;
const G = 0.2;

// Visualization configuration
const PARTICLE_TRAILS = true;
const SHOW_CENTER_OF_MASS = true;
const PARTICLE_COLOR = 'rgba(255,255,255,0.4)'
const TRANSLATE_STEP = 15; // dist to translate per press of arrow keys

// Canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let V_canvas_center = new Vector(canvas.width/2, canvas.height/2);

// Global variables
let mouse_down = false;
let brain;

const mouse = {
    pos: new Vector(undefined, undefined),
};

//Event listeners
window.addEventListener('resize', handleResize);
window.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseleave', handleMouseLeave);


/**
 * Represents a particle in the system
 */
class Particle{
    constructor( pos, radius=1, stroke=PARTICLE_COLOR, fill=PARTICLE_COLOR){
        // canvas attributes
        this.setRadius(radius);
        this.stroke = stroke;
        this.fill = fill;

        // Physics attributes
        this.pos = pos;
        this.velocity = new Vector(0,0);
        this.acceleration = new Vector(0,0);
    }

    update(){
        this.pos = this.pos.add(this.velocity);
        this.velocity = this.velocity.add(this.acceleration);
        if(this.velocity > MAX_VELOCITY){ this.velocity = MAX_VELOCITY; }
    }

    setRadius(radius){
        this.radius = radius;
        this.mass = this.radius ** 2;
    }

    grow(increment){
        this.setRadius(this.radius + increment);
    }

    draw(){
        ctx.strokeStyle = this.stroke;
        ctx.fillStyle = this.fill;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}


/**
 * Brain Knows All
*/
class Brain{
    constructor(){
        this.particles = []; // array containing all particles in system
        this.V_com = new Vector(canvas.width/2,canvas.height/2);
    }

    update(){
        if(mouse_down){ 
            const curr_particle = this.particles[this.particles.length -1]
            curr_particle.grow(0.3);
            curr_particle.pos.set(mouse.pos.x, mouse.pos.y);
        }
        for(let particle of this.particles){
            this.handleParticles();
            particle.update();
            this.calculateCenterOfMass();
            if(SHOW_CENTER_OF_MASS) this.drawCenterOfMass();
            particle.draw();
            if(this.center_com) this.resetCenterOfMass();
        }
    }

    handleParticles(){
        for (let p of this.particles){
            p.acceleration.set(0,0);
        }
        for(let i = 0; i<this.particles.length;i++){
            for(let j=i+1; j< this.particles.length; j++){
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const f12 = this.calculateForce(p1, p2);
                const f21 = f12.multiply(-1);

                // F = f1 + f2 + ... + fn
                // F/m = A
                // A = f1/m + f2/m + ... + fn/m
                p1.acceleration = p1.acceleration.add(f12.multiply(1/p1.mass));
                p2.acceleration = p2.acceleration.add(f21.multiply(1/p2.mass));
            }
        }
    }

    /**
     * Calculates the force of particle2 on particle1
     * @param {Particle} particle1 
     * @param {Particle} particle2 
     * @return {Vector} represents force
     */
    calculateForce(particle1, particle2){
        const v12 = particle2.pos.subtract(particle1.pos); // vector from particle1 to particle 2
        if(v12.magnitude() <= particle1.radius + particle2.radius){
            return new Vector(0,0);
        }
        const force = G * particle1.mass * particle2.mass / v12.magnitude()**2;
        return v12.normalize().multiply(force);
    }

    calculateCenterOfMass(){
        // CoM formula:
        // V_com = M^-1 * (m1*V_r1 + m2*V_r2+ ... +mn*V_rn)
        // where M = m1 + m2 + ... + mn
        let M = 0;
        let V_com = new Vector(0,0);
        for(let p of this.particles){
            M += p.mass;
            const mprp = p.pos.multiply(p.mass);
            V_com = V_com.add(mprp);
        }
        this.V_com = V_com.multiply(M**-1);
    }

    drawCenterOfMass(){
        const size = 10;
        ctx.strokeStyle = 'red';
        ctx.beginPath();

        ctx.moveTo(this.V_com.x + size/2, this.V_com.y + size/2);
        ctx.lineTo(this.V_com.x - size/2, this.V_com.y - size/2);
        ctx.moveTo(this.V_com.x - size/2, this.V_com.y + size/2);
        ctx.lineTo(this.V_com.x + size/2, this.V_com.y - size/2);

        ctx.stroke();
    }

    resetCenterOfMass(){
        const V_translate = V_canvas_center.subtract(this.V_com);
        for(let p of this.particles){
            p.pos = p.pos.add(V_translate);
        }
    }

    translate_view(V_translate){
        for(let p of this.particles){
            p.pos = p.pos.add(V_translate);
        }
    }

    newParticle(){ this.particles.push(new Particle(mouse.pos)); }
}


// Helper functions
function handleResize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    V_canvas_center.set(canvas.width/2, canvas.height/2);
}
function handleKeyDown(event){
    debug(event.code);
    switch(event.code){
        case 'Space':
            brain.resetCenterOfMass();
            break;
        case 'ArrowUp':
            brain.translate_view(new Vector(0,TRANSLATE_STEP));
            break;
        case 'ArrowDown':
            brain.translate_view(new Vector(0,-TRANSLATE_STEP));
            break;
        case 'ArrowLeft':
            brain.translate_view(new Vector(TRANSLATE_STEP,0));
            break;
        case 'ArrowRight':
            brain.translate_view(new Vector(-TRANSLATE_STEP,0));
            break;
        
    }
}
function handleMouseMove(event){
    mouse.pos.set(event.x, event.y);
}
function handleMouseLeave(){
    debug('mouse left');
    mouse.pos.set(undefined, undefined);
    mouse_down = false;
}
function handleMouseDown(){
    debug('mouse down')
    mouse_down = true;
    brain.newParticle();
}
function handleMouseUp(){
    debug('mouse up');
    mouse_down = false;
}
function debug(...args) {
    if(DEBUG == false) return;
    const stack = new Error().stack;
    const caller = stack.split('\n')[2].trim().split(' ')[1];
    console.log(`[DEBUG ${new Date().toISOString()}] (${caller}):`);
    args.forEach((arg, index) => {
      console.log(`  Arg ${index + 1}:`, arg);
      if (typeof arg === 'object' && arg !== null) {
        console.log('  Stringified:', JSON.stringify(arg, null, 2));
      }
    });
    console.log('\n');
  }

// Global initialization
function init(){
    brain = new Brain();
}

// Animation loop
function animate(){
    if(PARTICLE_TRAILS) ctx.fillStyle = 'rgba(0,0,0,0.1)';
    else ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    brain.update();
    requestAnimationFrame(animate);
}
// Program begin execution
init();
animate();