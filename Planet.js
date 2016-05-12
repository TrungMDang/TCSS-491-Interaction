/**
 * Created by Trung on 5/11/2016.
 */
 
 function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Satellite(gameEngine, canvas, planet, speed, distanceMultiplier){
    this.game = gameEngine;
    this.canvas = canvas;
    this.planet = planet;
    this.x = this.planet.x -  this.planet.radius * distanceMultiplier - this.radius / 2;
    this.y = this.planet.y - this.planet.radius * distanceMultiplier - this.radius / 2;
    this.radius = this.planet.radius / 3;
    this.mass = 10;
    this.rotationTime = 2;
	this.angularSpeed = speed;
	this.initialSpeed = speed;
	this.distanceMultiplier = distanceMultiplier;
    Entity.call(gameEngine, this.x, this.y);

};
Satellite.prototype = new Entity();
Satellite.prototype.constructor = Satellite;

Satellite.prototype.update = function() {

    //Move in a Planet

    //this.x = this.planet.x -  this.planet.radius * 2 - this.radius / 2;
    //this.y = this.planet.y - this.planet.radius * 2- this.radius / 2;

    //var speed = 2 * Math.PI * this.planet.radius * 3 / this.rotationTime;

	this.angularSpeed += this.initialSpeed;
	this.x = this.planet.radius * this.distanceMultiplier * Math.cos(this.angularSpeed) + this.planet.x;
	this.y = this.planet.radius * this.distanceMultiplier * Math.sin(this.angularSpeed) + this.planet.y;
    Entity.prototype.update.call(this);

};

Satellite.prototype.draw = function(ctx) {

    //ctx.save();
	//ctx.translate(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2);

    //ctx.rotate(10 * Math.PI / 180)
	ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.arc(this.planet.x, this.planet.y, this.planet.radius * this.distanceMultiplier, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    //ctx.restore();
};

var friction = 1;
function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Planet(game, canvas) {
	this.canvas = canvas;
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (this.canvas.clientWidth - this.radius * 2), this.radius + Math.random() * (this.canvas.clientHeight - this.radius * 2));

    this.velocity = { x: Math.random() * 200, y: Math.random() * 200 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
	//this.satellite = new Satellite(this.game, canvas, this);
	this.satellites = [];
};

Planet.prototype = new Entity();
Planet.prototype.constructor = Planet;

Planet.prototype.addSatellites = function(satellites) {
	this.satellites = satellites;
};
Planet.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 1000;
};

Planet.prototype.setNotIt = function () {
    this.it = false;
    this.color = 3;
    this.visualRadius = 100;
};

Planet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Planet.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Planet.prototype.collideRight = function () {
    return (this.x + this.radius) > this.canvas.clientWidth;
};

Planet.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Planet.prototype.collideBottom = function () {
    return (this.y + this.radius) > this.canvas.clientHeight;
};

Planet.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = this.canvas.clientWidth - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = this.canvas.clientHeight - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it) {
                this.setNotIt();
                ent.setIt();
            }
            else if (ent.it) {
                this.setIt();
                ent.setNotIt();
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
	for (var i = 0; i < this.satellites.length; i++) {
		this.satellites[i].update();
	};
};

Planet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
	for (var i = 0; i < this.satellites.length; i++) {
		this.satellites[i].draw(ctx);
	};
	//ctx.restore();

};
/* 
function Planet(gameEngine, canvas) {
    this.game = gameEngine;
    this.canvas= canvas;
    this.radius = 20;
	this.angularSpeed = 0.02;
    console.log(this.canvas.clientWidth + " " + this.canvas.clientHeight);
    this.x = this.canvas.clientWidth / 2;// - this.radius;
    this.y = this.canvas.clientHeight / 2;// - this.radius;
    this.color = 0;
    this.colors = ["Orange", "Red", "Green", "Blue", "White"];
	this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
	var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
	Entity.call(this, this.game, this.radius + Math.random() * (this.canvas.clientWidth - this.radius * 2), this.radius + Math.random() * (this.canvas.clientHeight - this.radius * 2));

    //Entity.call(gameEngine, this.canvas.clientWidth / 2, this.canvas.clientHeight / 2);
    this.satellite = new Satellite(gameEngine, canvas,this);

};

Planet.prototype = new Entity();
Planet.prototype.constructor = Planet;

Planet.prototype.setIt = function () {
    //this.it = true;
    //this.color = 0;
    //this.visualRadius = 500;
};

Planet.prototype.setNotIt = function () {
    //this.it = false;
    //this.color = 3;
    //this.visualRadius = 200;
};
Planet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Planet.prototype.collideLeft = function () {
    return (this.x - this.radius) + this.canvas.clientWidth / 2 < 0;
};

Planet.prototype.collideRight = function () {
    return (this.x + this.radius) + this.canvas.clientWidth / 2 > this.canvas.clientWidth;
};

Planet.prototype.collideTop = function () {
    return (this.y - this.radius) + this.canvas.clientHeight / 2 < 0;
};

Planet.prototype.collideBottom = function () {
    return (this.y + this.radius) + this.canvas.clientHeight / 2 > this.canvas.clientHeight;
};
Planet.prototype.update = function(){
	
    //this.x = this.canvas.clientWidth / 2 - 100;
    //this.y = this.canvas.clientHeight / 2 - 100;
	//this.angularSpeed += 0.02;
	//this.x = this.radius * 4 * Math.cos(this.angularSpeed);
	//this.y = this.radius * 4 * Math.sin(this.angularSpeed);
	//this.x = this.radius * 4 * Math.cos(this.angularSpeed + 0.02);
	//this.y = this.radius * 4 * Math.sin(this.angularSpeed + 0.02); 
	this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
	this.angularSpeed += 0.02;

	if (this.collideLeft() || this.collideRight()) {
		//console.log("Collide left or right");
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = this.canvas.clientWidth - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
		//console.log("Collide top or bottom");

        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = this.canvas.clientHeight - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
	
	//this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    //this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
	//this.x -= this.canvas.clientWidth / 2;
	//this.y -= this.canvas.clientHeight / 2;
	console.log(this.x + " " + this.y);
    this.satellite.update();
    Entity.prototype.update.call(this);
};

Planet.prototype.draw = function(ctx) {
	//ctx.save();
	//ctx.translate(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2);
    ctx.beginPath();
    ctx.fillStyle = this.colors[4];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();
	//ctx.restore();
    this.satellite.draw(ctx);
}; */