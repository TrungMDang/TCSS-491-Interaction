/**
 * Created by Trung on 5/11/2016.
 */
const G = 6.674 * Math.pow();
const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"];
const quadrants = [1, 2, 3, 4];
const ACCURACY = 5;
const SHOOTABLE_DISTANCE = 20;
 function distance(a, b, gravity) {
	 if (gravity) {
		var dx = (a.x) - (b.x);
		var dy = (a.y) - (b.y);
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

function quadrant(origin, target) {
	if (target.x - origin.x > 0 && target.y - origin.y < 0) {
		return 1;
	} else if (target.x - origin.x < 0 && target.y - origin.y < 0) {
		return 2;
	} else if (target.x - origin.x < 0 && target.y - origin.y > 0) {
		return 3;
	} else 
		return 4;
	
}

function Projectile(sentinel, gameEngine, target, angle) {
	this.speed = 18;
	this.source = sentinel;
	this.game = gameEngine;
	this.ctx = gameEngine.canvas;
	this.angle = angle;
	this.target = target;
	this.radial_distance = this.source.radius * this.source.distanceMultiplier ;
	this.x = this.source.x;
	this.y = this.source.y;
	var difX = target.x - this.source.x;
	var difY = target.y - this.source.y;
	var ratio = this.speed / Math.sqrt(difX * difX - difY * difY);

	this.speedX = difX;
	this.speedY = difY;

	this.radius = sentinel.radius / 1.25;
	//console.log(this.speedX + " " + this.speedY);
//Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale)
	//this.animation = new Animation(ASSET_MANAGER.getAsset("./img/laser.png"), 290, 74, 290, 1, 1, true, 0.5);
	Entity.call(this, this.game, this.x, this.y);


};
Projectile.prototype = new Entity();
Projectile.prototype.constructor = Projectile;

Projectile.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};
Projectile.prototype.update = function() {
	//console.log(this.x + " " + this.y);
	if (this.outsideWorld()) {
		console.log("out");
		this.removeFromWorld = true;
	} else {
		this.x += this.speedX * this.game.clockTick;
		this.y += this.speedY * this.game.clockTick;
		for (var i = 0; i < this.game.entities.length; i++) {
			var ent = this.game.entities[i];
			if (ent instanceof Planet && ent != this.source.planet && this.collide(ent)) {
				//console.log("bullet hits");
				this.removeFromWorld = true;
				ent.radius -= 2;				
			}
			if (ent instanceof Planet && ent != this.source.planet) {
				for (var j = 0; j < ent.sentinels.length; j++) {
					var sent = ent.sentinels[j];
					if (this.collide(sent)) {
						this.removeFromWorld = true;
					}
				}
			}		
		}	
	}
	
	Entity.prototype.update.call(this);
};

Projectile.prototype.draw = function(ctx) {
	ctx.beginPath();
    ctx.fillStyle = "red";
	ctx.strokeStyle = "white";
	ctx.strokeWidth = "2";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
	ctx.stroke();
    ctx.closePath();
	Entity.prototype.draw.call(this);
};

function Sentinel(gameEngine, canvas, planet, speed, distanceMultiplier, hasWeapon){
    this.game = gameEngine;
    this.canvas = canvas;
    this.planet = planet;
	this.radius = this.planet.radius / 3;
    this.x = this.planet.x -  this.planet.radius * distanceMultiplier - this.radius / 2;
    this.y = this.planet.y - this.planet.radius * distanceMultiplier - this.radius / 2;
    this.mass = 10;
    this.rotationTime = 2;
	this.angularSpeed = speed;
	this.initialSpeed = speed;
	this.distanceMultiplier = distanceMultiplier;
	this.hasWeapon = hasWeapon;
	this.removeFromWorld = false;
	this.reloadTime = 1;
	this.shoot = false;
	this.projectiles = [];
	this.angle = 0;
	this.target = null;
	this.fullAmmo = false;
	Entity.call(this, this.game, this.x, this.y);

};
Sentinel.prototype = new Entity();
Sentinel.prototype.constructor = Sentinel;

function shootTarget(source, game, target, angle) {
	var bullet = new Projectile(source, game, target, angle);
	source.projectiles.push(bullet);
};
Sentinel.prototype.update = function() {	
	if (this.game.space == false) {
		if (this.hasWeapon) {
			var difX = Math.abs(this.x - this.planet.x);
			var difY =  Math.abs(this.y - this.planet.y);
			var tan = difY / difX;
			angle = Math.atan(tan);
			this.angle = angle;
			this.reloadTime -= this.game.clockTick % 10;
			if (this.reloadTime <= 0) {
				this.fullAmmo = true;
			}
			for (var i = 0; i < this.game.entities.length; i++) {
				var target = this.game.entities[i];
				var dist = distance(this, target, false);
				if (dist > SHOOTABLE_DISTANCE && target != this && target.actualColor != this.actualColor 
						&& target instanceof Planet) {

					var difXTarget = target.x - this.planet.x;
					var difYTarget = target.y - this.planet.y;
					var tanT = difYTarget / difXTarget;
					var angleTarget = Math.atan(tanT);
					
					var targetQ = quadrant(this.planet, target);
					var thisQ = quadrant(this.planet, this);
					if (thisQ == targetQ) {
						//console.log("ID: " + this.planet.actualColor + " Angle: " + this.angle * 180 / Math.PI + "\nTarget: " + target.actualColor + 
						//	" TargetAngle: " + angleTarget * 180 / Math.PI);
						//console.log("Quadrant: " + thisQ + " TargetQuadrant: " + targetQ);
						if (Math.abs((angleTarget - angle) * 180 / Math.PI) < ACCURACY && this.fullAmmo){
							//console.log("difAngle: " + Math.abs((angleTarget - angle) * 180) / Math.PI + " shooting");
							this.shoot = true;
							//this.game.space = true;
							shootTarget(this, this.game, target, this.angle);
							this.reloadTime = 1;
							this.fullAmmo = false;
							//console.log("shot target " + target.actualColor);
						}
					}
				} 
			}
			if (this.shoot) {
				for (var i = 0; i < this.projectiles.length; i++) {
				if (this.projectiles[i] != null && this.projectiles[i].removeFromWorld == false)
					this.projectiles[i].update();
				else 
					this.projectiles.splice(i, 1);
				}	
		
			}
		}
		this.angularSpeed += this.initialSpeed;
		this.x = this.planet.radius * this.distanceMultiplier * Math.cos(this.angularSpeed) + this.planet.x;
		this.y = this.planet.radius * this.distanceMultiplier * Math.sin(this.angularSpeed) + this.planet.y;
		this.radius = this.planet.radius / 3;
		if (this.radius <= 1) {
			this.removeFromWorld = true;
		}	
	}
	Entity.prototype.update.call(this);
};

Sentinel.prototype.draw = function(ctx) {
	ctx.beginPath();
    ctx.strokeStyle = "silver";
    ctx.arc(this.planet.x, this.planet.y, this.planet.radius * this.distanceMultiplier, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
	if (this.hasWeapon) {
		ctx.fillStyle = "white";
		
	} else {
		ctx.fillStyle = "blue";
	}
	ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
	if (this.shoot) {
		for (var i = 0; i < this.projectiles.length; i++) {			
			this.projectiles[i].draw(ctx);
		}
	}
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
    //this.setNotIt();
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
	//this.Sentinel = new Sentinel(this.game, canvas, this);
	this.sentinels = [];
	this.removeFromWorld = false;
	//Entity.call(this, game, this.x, this.y);
    Entity.call(this, game, this.radius + Math.random() * (this.canvas.clientWidth - this.radius * 2), this.radius + Math.random() * (this.canvas.clientHeight - this.radius * 2));

};

Planet.prototype = new Entity();
Planet.prototype.constructor = Planet;

Planet.prototype.addSentinels = function(sentinels) {
	this.sentinels = sentinels;
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
	if (!this.game.space) {
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
			if (ent != this && !(ent instanceof Background) && !(ent instanceof Projectile) && ent.radius <= 2) {
				ent.removeFromWorld = true;
			}
			
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
				
			}
			
				if (ent !== this && this.collide(ent)) {
				
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
				}
				this.gravityField -= 4;
		}
		if (this.collideCount == this.game.entities.length - 1) {
			this.okToCollide = true;
		} else {
			this.okToCollide = false;
		}
		this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
		this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;

		for (var i = 0; i < this.sentinels.length; i++) {
			this.sentinels[i].update();
		};
	} 
};

Planet.prototype.draw = function (ctx) {

    ctx.beginPath();
    ctx.fillStyle = this.actualColor;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
	for (var i = 0; i < this.sentinels.length; i++) {
		this.sentinels[i].draw(ctx);
		/* if (this.sentinels[i].hasWeapon) {
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.strokeStyle = "white";
			ctx.lineTo(this.sentinels[i].x, this.sentinels[i].y);
			ctx.closePath();
			ctx.stroke();
		}		 */	
	};
	/* for (var i = 0; i < this.game.entities.length; i++) {
			var ent = this.game.entities[i];
			if (ent != this && (ent instanceof Sentinel) && ent.radius <= 2) {
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.strokeStyle = "white";
				ctx.lineTo(this.ent.x, this.ent.y);
				ctx.closePath();
				ctx.stroke();
			}		
	} */
};

