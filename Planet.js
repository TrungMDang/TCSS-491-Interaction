/**
 * Created by Trung on 5/11/2016.
 */
const G = 6.674 * Math.pow();

 function distance(a, b, gravity) {
	 if (gravity) {
		var dx = (a.x + a.radius) - (b.x + b.radius);
		var dy = (a.y + a.radius) - (b.y + b.radius);
		return Math.sqrt(dx * dx + dy * dy);
	 }
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function gravity(a, b) {
	var r = distance(a, b, true);
	return G * a.mass * b.mass / (r * r);
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
	this.removeFromWorld = false;
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
    this.radius = this.planet.radius / 3;
	if (this.radius <= 1) {
		this.removeFromWorld = true;
	}
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

function Planet(game, canvas, characteristics) {
	this.game = game;
	this.canvas = canvas;
	this.id = characteristics.id;
	this.mass = characteristics.mass;
	this.actualColor = characteristics.color;
	this.x = characteristics.x;
	this.y = characteristics.y;
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 200;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
	this.okToCollide = false;
    this.velocity = { x: Math.random() * 200, y: Math.random() * 200 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
	this.collideCount = 0;
	this.gravityField = 0;
	//this.satellite = new Satellite(this.game, canvas, this);
	this.satellites = [];
	this.removeFromWorld = false;
	//Entity.call(this, game, this.x, this.y);
    Entity.call(this, game, this.radius + Math.random() * (this.canvas.clientWidth - this.radius * 2), this.radius + Math.random() * (this.canvas.clientHeight - this.radius * 2));

};

Planet.prototype = new Entity();
Planet.prototype.constructor = Planet;

Planet.prototype.addSatellites = function(satellites) {
	this.satellites = satellites;
};

Planet.prototype.addGravityField = function(gravityField) {
	this.gravityField = gravityField;
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
	//console.log("ID: " + this.id);
	//console.log("---gravity field: " + this.gravityField);
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
	var collideFlag = true;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
		if (ent != this && ent.radius <= 2) {
			ent.removeFromWorld = true;
		}
		
		if (this.okToCollide == false) {
			if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.gravityField })) {
			console.log("collide within proximity");

            /* var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
							console.log("3 if");

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
				console.log("4 if");

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
            } */
			} else if (ent != this && !this.collide({ x: ent.x, y: ent.y, radius: this.gravityField })) { //not collide
				this.collideCount++;

			}
		}
		if (this.okToCollide == true) {
			if (ent !== this && this.collide(ent)) {
			console.log("first if");
			this.radius -= 2;
			ent.radius -= 2;
            var radiusMultiplier = { x: this.velocity.x, y: this.velocity.y };

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
            ent.velocity.x = radiusMultiplier.x * friction;
            ent.velocity.y = radiusMultiplier.y * friction;
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
			this.gravityField -= 4;
		}
        
		
		

        /* if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
			console.log("2 if");

            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
							console.log("3 if");

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
				console.log("4 if");

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
        } */
    }
	//console.log(this.collideCount + " " + (this.game.entities.length - 1));
	if (this.collideCount == this.game.entities.length - 1) {
		this.okToCollide = true;
	} else {
		this.okToCollide = false;
	}
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
	//this.x = this.x -  this.radius * 3 - this.radius / 2;
    //this.y = this.y - this.radius * 3 - this.radius / 2;

	for (var i = 0; i < this.satellites.length; i++) {
		this.satellites[i].update();
	};
};

Planet.prototype.draw = function (ctx) {
	//ctx.save();
	//ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.fillStyle = this.actualColor;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
	//ctx.restore();
	for (var i = 0; i < this.satellites.length; i++) {
		this.satellites[i].draw(ctx);
	};
	

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
const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"];

function BigBang(gameEngine, canvas, characteristics) {
	this.game = gameEngine;
	this.canvas = canvas;
	this.mass = characteristics.mass;
	this.actualColor = characteristics.color;
	this.numbOfPlanets = characteristics.planets;
	this.x = canvas.clientWidth / 2;
	this.y = canvas.clientHeight / 2;
	this.radius = 5;
	this.rate = 0.1;
	this.explode = false;
	this.planets = [];
	Entity.call(this, gameEngine, this.x, this.y);
};
BigBang.prototype = new Entity();
BigBang.prototype.constructor = BigBang;

BigBang.prototype.addPlanets = function() {
	var gravityField = 0;
	for (var i = 0; i < this.numbOfPlanets; i++) {
		var numbOfSat = Math.floor(Math.random() * 4);

		var satellites = [];
		console.log("i: " + i);
		var planetMass = Math.floor(Math.random() * this.mass / this.numbOfPlanets);
		var characteristics = {id: (i + 1), mass: planetMass, color: colors[Math.floor(Math.random() * colors.length)]
									, x: this.x, y: this.y};
        var planet = new Planet(this.game, this.canvas, characteristics);
		var radiusMultiplier = 2;
		 for (var j = 0; j < numbOfSat; j++) {
			var distanceMultiplier = 0;
			do {
				distanceMultiplier = Math.floor(Math.random() * numbOfSat) + radiusMultiplier; //At least two times the radius of the planet.
			} while (distanceMultiplier <= radiusMultiplier * 0.5);
			radiusMultiplier = distanceMultiplier;
			console.log("j: " + j);
			//The further the farther the satellite from planet
			var satellite = new Satellite(this.game, this.canvas, 
									planet, 0.1 / distanceMultiplier, distanceMultiplier);
			gravityField += distanceMultiplier * planet.radius / 3;									
			satellites.push(satellite);
		 }
		 radiusMultiplier = 0;
		planet.addGravityField(gravityField);
		 planet.addSatellites(satellites);
         this.game.addEntity(planet);
	}
};
BigBang.prototype.update = function() {
	//this.x = Math.floor(this.x);
	//this.y = Math.floor(this.y);
	//console.log(this.radius);
	if (this.radius >= 200) {
		this.explode = true;
	} else {
		
		this.radius += this.rate;
		this.rate += 0.01;
	}
	if (this.explode) {
		 //this.radius + Math.random() * (this.canvas.clientWidth - this.radius * 2), this.radius + Math.random() * (this.canvas.clientHeight - this.radius * 2)
		this.addPlanets();
		this.removeFromWorld = true;
	}
	Entity.prototype.update.call(this);
};

BigBang.prototype.draw = function(ctx) {
	
	if (this.explode) {
		
	} else {
		ctx.beginPath();
		ctx.fillStyle = this.actualColor;
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath()
	}
	Entity.prototype.draw.call(this);
};


