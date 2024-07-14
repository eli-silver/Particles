/*
Youtube video I watched part of before making this particle system:
https://www.youtube.com/watch?v=Yvz_axxWG4Y&t=715s
don't forget to click!
Eli Silver 7/9/2024
*/


const canvas=document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const num_particles = 200;
const particlesArray = [];
mouse_dist_threshold = canvas.width/4;

use_color = true;

const mouse = {
    x: undefined,
    y: undefined,
}


window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouse_dist_threshold = canvas.width/4;
});

canvas.addEventListener('click', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
    use_color = !use_color;
});

canvas.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
});


class Particle {
    constructor(){
        this.size = Math.random() * 8 + 2;
        this.x = Math.random() * (canvas.width-this.size*2)+this.size;
        this.y = Math.random() * (canvas.height-this.size*2)+this.size;
        this.speed_x = Math.random() *2 -1;
        this.speed_y = Math.random() *2 -1;
        this.fill = this.randomColor();
        this.stroke = this.randomColor();
    }

    update(){
        this.x += this.speed_x;
        this.y += this.speed_y;
        if(this.x <= this.size || this.x >= canvas.width-this.size){
            this.speed_x *= -1;
        }
        if(this.y <= this.size || this.y >= canvas.height-this.size){
            this.speed_y *= -1;
        }
    }

    draw(){
        const alpha = this.mouse_dist_color();
        if (alpha !== 0){
            if(use_color){ctx.strokeStyle = this.rgba_to_string(this.stroke, alpha);}
            else{ctx.strokeStyle = this.rgba_to_string([255,255,255], alpha);}
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x,mouse.y);
            ctx.stroke();
        }
        
        if(use_color){
            ctx.fillStyle = this.rgba_to_string(this.fill);
            ctx.strokeStyle = this.rgba_to_string(this.stroke);
        }else{
            ctx.fillStyle = this.rgba_to_string([255,255,255]);
            ctx.strokeStyle = this.rgba_to_string([255,255,255]);
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }

    mouse_dist_color(){
        if(typeof mouse.x == 'undefined' || typeof mouse.y == 'undefined'){
            return 0
        }
        const dist = Math.sqrt((this.x-mouse.x)**2 + (this.y-mouse.y)**2);
        if(dist <= this.size){ return 1};
        if(dist >= mouse_dist_threshold){return 0};
        return 1- (dist / mouse_dist_threshold)**2;
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