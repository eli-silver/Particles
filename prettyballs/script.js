/*
Youtube video I watched part of before making this particle system:
https://www.youtube.com/watch?v=Yvz_axxWG4Y&t=715s
don't forget to click!
Eli Silver 7/9/2024
*/


// TODO: 

const canvas=document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const num_particles = 200;
const particlesArray = [];
let mouse_dist_threshold = canvas.width/6; // sets the length at which lines start to fade in / out of view. Shouldn't hold a magic number 4.... 
const max_velocity = 50;

let use_color = true; // flag to toggle between collor and B&W display. Currently toggled on mouse click event
let draw_collisions = true;

const acceleration_factor = 0.002;

let damping = true;
const damping_factor = 0.998

let debug = false; // flag to toggle console logs for debugging 

const mouse = {
    // undefined until mouse enters the window. No lines will be drawn before the mouse is visible 
    pos: new Vector(undefined, undefined),
}

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouse_dist_threshold = canvas.width/4;
});

canvas.addEventListener('click', function(event){
    use_color = !use_color;
});

canvas.addEventListener('mousemove', function(event){
    mouse.pos.set(event.x, event.y);
});

canvas.addEventListener('mouseleave', function(event){
    mouse.pos.set(undefined, undefined);
})


class Particle {
    constructor(){
        this.size = Math.random() * 8 + 2;
        const x = Math.random() * (canvas.width-this.size*2)+this.size;
        const y = Math.random() * (canvas.height-this.size*2)+this.size;
        this.pos = new Vector(x, y);
        const x_velocity = Math.random() *2 -1;
        const y_velocity = Math.random() *2 -1;
        this.velocity = new Vector(x_velocity,y_velocity);

        this.acceleration = new Vector(0,0);

        this.mass = Math.PI * this.size**2; // mass equal to area of particle
        this.is_colliding = false;
        this.fill = this.randomColor();
        this.stroke = this.randomColor();
    }

    update(){
        this.velocity = this.velocity.add(this.acceleration);
        if(damping){
            this.velocity = this.velocity.multiply(damping_factor);
        }
        if( this.velocity.magnitude() >= max_velocity){
            this.velocity = this.velocity.normalize().multiply(max_velocity);
        }
        this.pos = this.pos.add(this.velocity);
        if(this.pos.x <= this.size){
            this.is_colliding = true;
            this.edge_bounce(-1 , 1);
            this.pos = this.pos.add(new Vector(this.size-this.pos.x, 0)); // handles if a particle goes through the edge
        } else if(this.pos.x >= canvas.width-this.size){
            this.is_colliding = true;
            this.edge_bounce(-1 , 1);
            this.pos = this.pos.add(new Vector(canvas.width - this.size - this.pos.x, 0)); // handles if a particle goes through the edge
        }
        if(this.pos.y <= this.size){
            this.is_colliding = true;
            this.edge_bounce(1 , -1);
            this.pos = this.pos.add(new Vector(0, this.size-this.pos.y)); // handles if a particle goes through the edge
        } else if (this.pos.y >= canvas.height-this.size){
            this.is_colliding = true;
            this.edge_bounce(1 , -1);
            this.pos = this.pos.add(new Vector(0, canvas.height - this.size - this.pos.y)); // handles if a particle goes through the edge
        }
    }

    draw(){
        const alpha = this.mouse_dist_color();
        if (alpha !== 0){
            if(use_color){ctx.strokeStyle = this.rgba_to_string(this.stroke, alpha);}
            else{ctx.strokeStyle = this.rgba_to_string([255,0,0], alpha);}

            ctx.beginPath();
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(mouse.pos.x, mouse.pos.y);
            ctx.stroke();
        }
        
        if(use_color){
            ctx.fillStyle = this.rgba_to_string(this.fill);
            ctx.strokeStyle = this.rgba_to_string(this.stroke);
        }else{
            ctx.fillStyle = this.rgba_to_string([255,255,255]);
            ctx.strokeStyle = this.rgba_to_string([255,255,255]);
        }
        if(draw_collisions){
            if(this.is_colliding && !use_color){
                ctx.fillStyle = this.rgba_to_string([255,0,0]);
                this.is_colliding = false;
            }
        }
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }

    check_collisions(){
        for(let other of particlesArray){
            if(this != other){
                const dist = this.pos.subtract(other.pos).magnitude();
                const min_dist = this.size + other.size;
                if(dist <= min_dist){
                    this.is_colliding = true;
                    const normal = other.pos.subtract(this.pos).normalize();
                    const relative_v = other.velocity.subtract(this.velocity);
                    const impulse = normal.multiply(normal.dot(relative_v));
                    this.velocity = this.velocity.add(impulse);
                    other.velocity = other.velocity.subtract(impulse);
                    const repulsion = normal.multiply((min_dist - dist));
                    this.pos = this.pos.subtract(repulsion);
                    other.pos = other.pos.add(repulsion);
                }
            }
        }
    }

    edge_bounce(reverse_x, reverse_y){
        this.velocity.set(this.velocity.x * reverse_x, this.velocity.y * reverse_y);
    }

    mouse_dist_color(){
        if(typeof mouse.pos.x == 'undefined' || typeof mouse.pos.y == 'undefined'){
            this.acceleration.set(0,0);
            return 0
        }
        const dist = Math.sqrt((this.pos.x-mouse.pos.x)**2 + (this.pos.y-mouse.pos.y)**2);
        if(dist <= this.size){ return 1};
        if(dist >= mouse_dist_threshold){return 0};
        const dist_function = 1- (dist / mouse_dist_threshold)**2;
        this.acceleration = mouse.pos.subtract(this.pos).multiply(dist_function * acceleration_factor);
        if(use_color){this.acceleration = this.acceleration.multiply(-1)};
        return dist_function;
    }
    
    randomColor(){
        const r =  Math.random()*255;
        const g =  Math.random()*255;
        const b =  Math.random()*255;
        return [r, g, b];
    }

    rgba_to_string(rgb, alpha = 1){
        return ["rgba(", rgb[0], ",", rgb[1], ",", rgb[2], ",", alpha,")"].join("")
    }
}

function handleParticles(){
    for (let i = 0; i < particlesArray.length; i++){
        particlesArray[i].update();
        particlesArray[i].check_collisions();
        particlesArray[i].draw();
    }
}

function init(){
    for( let i=0; i<num_particles; i++){
        particlesArray.push(new Particle());
    }
}

function animate(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animate);
}

init();
animate();