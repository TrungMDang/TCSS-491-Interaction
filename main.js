function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game,canvas) {
	this.canvas = canvas;
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (this.canvas.clientWidth - this.radius * 2), 
	this.radius + Math.random() * (this.canvas.clientHeight - this.radius * 2));

    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = 3;
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > this.canvas.clientWidth;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > this.canvas.clientHeight;
};

Circle.prototype.update = function () {
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
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

function Background(game, image){
    this.x = 0;
	this.y = 0;
    this.imageWidth = image.width;
    this.imageHeight = image.height;
    this.image = image;
    this.game = game;
    this.ctx = game.canvas;
	Entity.call(this, game, this.x, this.y);

};
Background.prototype = new Entity();

Background.prototype.draw = function (ctx) {
	var canvas = document.getElementById("gameWorld");
	var ctx = canvas.getContext("2d");
    ctx.drawImage(this.image,
        this.x, this.y, canvas.clientWidth, canvas.clientHeight);
	Entity.prototype.draw.call(this);
};

Background.prototype.update = function () {
    
};


var friction = 1;
var acceleration = 1000000;
var maxSpeed = 150;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/universe.png");
ASSET_MANAGER.queueDownload("./img/laser.png");


ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    var gameEngine = new GameEngine();
	gameEngine.init(ctx);
    gameEngine.start();

	gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/universe.png")));
	//var circle = new Circle(gameEngine);
    //var planet = new Planet(gameEngine,canvas);
    //circle.setIt();
    //gameEngine.addEntity(circle);
    //gameEngine.addEntity(planet);
	var numbOfPlanet = Math.random() * 3 + 3;
	var colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"];
	var characteristics;
	var totalMass = Math.floor(Math.random() * 100);	//0 - 100
	var changingMass = totalMass;
	//console.log("Total mass: " + totalMass);
	characteristics = {id: 0, mass : totalMass, color: "white", planets: numbOfPlanet};
	//var bigBang = new BigBang(gameEngine, canvas, characteristics);
	//gameEngine.addEntity(bigBang);
    for (var i = 0; i < numbOfPlanet; i++) {
		var numbSent = Math.floor(Math.random() * 5);

		var sentinels = [];
		//console.log("i: " + i);
		var planetMass = Math.floor(Math.random() * totalMass / numbOfPlanet);
		changingMass -= planetMass;
		characteristics = {id: i, mass: planetMass, color: colors[Math.floor(Math.random() * colors.length)]};
        var planet = new Planet(gameEngine, canvas, characteristics);
		var temp = 2;
		 for (var j = 0; j < numbSent; j++) {
			var hasWeapon = false;
			if (j == numbSent - 1) {
				hasWeapon = true;
			}
			var distanceMultiplier = 0;
			do {
				distanceMultiplier = Math.floor(Math.random() * numbSent) + temp; //At least two times the radius of the planet.
			} while (distanceMultiplier <= temp * 0.5);
			temp = distanceMultiplier;
			//console.log("j: " + j);
			var sentinel = new Sentinel(gameEngine, canvas, planet, 0.1 / distanceMultiplier, distanceMultiplier, hasWeapon);
			sentinels.push(sentinel);
		 }
		 temp = 0;
		 planet.addSentinels(sentinels);
         gameEngine.addEntity(planet);
		//console.log("Planet mass: " + planetMass);
		//console.log("Changing mass: " + changingMass);

    }
});