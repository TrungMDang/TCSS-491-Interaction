window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function GameEngine() {
    this.entities = [];
    this.canvas = null;
	this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
	this.space = false;
	this.spaceCount = 0;
}

GameEngine.prototype.init = function (ctx) {
    this.canvas = ctx;
    this.surfaceWidth = this.canvas.canvas.width;
    this.surfaceHeight = this.canvas.canvas.height;
    this.timer = new Timer();
    this.startInput();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.canvas.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.canvas.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.canvas.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
    }

    var that = this;

    // event listeners are added here

    this.canvas.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
        console.log(e);
        console.log("Left Click Event - X,Y " + e.clientX + ", " + e.clientY);
    }, false);

    this.canvas.canvas.addEventListener("contextmenu", function (e) {
        that.click = getXandY(e);
        console.log(e);
        console.log("Right Click Event - X,Y " + e.clientX + ", " + e.clientY);
        e.preventDefault();
    }, false);

    this.canvas.canvas.addEventListener("mousemove", function (e) {
        //console.log(e);
        that.mouse = getXandY(e);
    }, false);

    this.canvas.canvas.addEventListener("mousewheel", function (e) {
        console.log(e);
        that.wheel = e;
        console.log("Click Event - X,Y " + e.clientX + ", " + e.clientY + " Delta " + e.deltaY);
    }, false);

    this.canvas.canvas.addEventListener("keydown", function (e) {
        //console.log(e);
        //console.log("Key Down Event - Char " + e.code + " Code " + e.keyCode);
		if (String.fromCharCode(e.which) === ' ') {
            that.space = true;
			if (that.spaceCount >= 1) {
				that.space = false;
				that.spaceCount = 0;
			} else {
				that.spaceCount++;
			}
        }
    }, false);

    this.canvas.canvas.addEventListener("keypress", function (e) {
        if (e.code === "KeyD") that.d = true;
        //that.chars[e.code] = true;
        console.log(e);
        console.log("Key Pressed Event - Char " + e.charCode + " Code " + e.keyCode);
    }, false);

    this.canvas.canvas.addEventListener("keyup", function (e) {
        console.log(e);
        console.log("Key Up Event - Char " + e.code + " Code " + e.keyCode);
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.canvas.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.canvas.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.canvas);
    }
    this.canvas.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        entity.update();
    }
	for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
		if (entity != null && entity.removeFromWorld) {
			this.entities.splice(i, 1);
		}
        
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.canvas.beginPath();
        this.game.canvas.strokeStyle = "green";
        this.game.canvas.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.canvas.stroke();
        this.game.canvas.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}



Entity.prototype.outsideWorld = function() {
    return (this.x > this.game.surfaceWidth || this.x < 0 ||
        this.y > this.game.surfaceHeight || this.y < 0);
};
function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
