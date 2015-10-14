/* global xlockContext */
"use strict";

function createField(w, h){
	var field = new Array(h);
	field.w = w;
	field.h = h;
	for (var y=0; y<field.h; y++)
	{
		field[y] = new Array(w);
		for (var x=0; x<field.w; x++)
			field[y][x]={
				pheromone: 0.0, //0-1
				nutrient: 0.0 //0-1
			}
	}
	return field;
}

function createAntsAt(origin, n) {
	var ants = new Array(n);
	for(var i=0; i<n; i++)
	{
		ants[i] = {
			x: origin.x,
			y: origin.y,
			nutrient: 0,
			hungry: 0
		}
	}
	return ants;
}

function show(field, ants, origin, lc) {
	for (var y=0; y<field.h; y++)
		for (var x=0; x<field.w; x++)
			lc.putPixel(x, y, 255, 255, 255);
					
	for (var y=0; y<field.h; y++)
	{
		var arr = field[y];
		for (var x=0; x<field.w; x++)
		{
			var f = arr[x];
			if (f.nutrient > 0) {
				var green = 255.0 * f.nutrient;
				lc.putWhitePixel(x, y, 0, green, 64);
				lc.putWhitePixel(x+1, y, 0, green, 64);
				lc.putWhitePixel(x+1, y+1, 0, green, 64);
				lc.putWhitePixel(x, y+1, 0, green, 64);
			} else if (f.pheromone > 0) {
				var red = 255.0 * f.pheromone;
				lc.putWhitePixel(x, y, red, 0, 0);  				
			}
		}
	}
	lc.putPixel(origin.x, origin.y, 64, 64, 64); // dark gray origin
	for (var i=0; i<ants.length; i++)
	{
		var ant=ants[i];
		if (ant.nutrient > 0) {
			lc.putPixel(ant.x, ant.y, 0, 0, 0); // black ant
			lc.putPixel(ant.x+1, ant.y, 0, 0, 0); // black ant
			lc.putPixel(ant.x, ant.y+1, 0, 0, 0); // black ant
			lc.putPixel(ant.x+1, ant.y+1, 0, 0, 0); // black ant
		} else {
			lc.putPixel(ant.x, ant.y, 0, 0, ant.hungry*25); // black ant
		}
	}
	lc.show();
}

function randomInt(n) {
	return Math.floor(Math.random() * n);
}

function randomCoordinate(w, h) {
	return { x: randomInt(w), y: randomInt(h) }	
}

function fieldOf(ant, field) {
	return field[ant.y][ant.x];
}

function coord(ant, field, dx, dy) {
	var x = ant.x + dx; 
	var y = ant.y + dy;
	x = x < 0 ? 0 : x;
	y = y < 0 ? 0 : y;
	x = x >= field.w ? field.w - 1 : x;
	y = y >= field.h ? field.h - 1 : y;
	return {x: x, y: y};
}

function fieldNear(ant, field, dx, dy) {
	var c = coord(ant, field, dx, dy); 
	return field[c.y][c.x];	
}

function towardsOrigin(ant, origin) {
	var dx = origin.x - ant.x;
	var dy = origin.y - ant.y;
	var dd = Math.max(Math.abs(dx), Math.abs(dy));
	if (dd === 0) 
		return {x: 0, y: 0};
	return {x: Math.round(dx/dd), y: Math.round(dy/dd)};
}

function distSq(x, y, origin) {
	return (x-origin.x)*(x-origin.x) + (y-origin.y)*(y-origin.y);
}

function isOutside(ant, dx, dy, origin) {
	return distSq(ant.x + dx, ant.y + dy, origin) > distSq(ant.x, ant.y, origin);
}

function findPheromone(ant, field, origin) {
	var ar = [];
	for (var dx=-1; dx<=1; dx++) {
		for (var dy=-1; dy<=1; dy++) {
			if (dx !== 0 || dy !== 0) {
				var f = fieldNear(ant, field, dx, dy);
				if (f.pheromone > 0.0 && isOutside(ant, dx, dy, origin)) {
					ar.push({ x: dx, y: dy, pheromone: f.pheromone });
				}
			}						
		}
	}
	if (ar.length === 0) return null;
	var m = ar.pop();
	while(true) {
		var a = ar.pop();
		if (!a)
			return m;
		if (a.pheromone > m.pheromone)
			m = a; 
	}
}


function moveAnt(ant, field, origin, capacity, stinkyness) {
	var f = fieldOf(ant, field);
	
	ant.hungry += 0.01;
	
	var onNutrientWithCapacity = ((f.nutrient > 0.0) && (ant.nutrient < capacity));	
	if (onNutrientWithCapacity) {
		// don't move yet, but pickup nutrient;
		f.nutrient -= capacity;
		f.nutrient = Math.max(f.nutrient, 0.0);
		ant.nutrient += capacity;
	} 
	
	var onOrigin = (ant.x === origin.x && ant.y === origin.y);
	if (onOrigin) {
		ant.nutrient = 0.0;
		ant.hungry = 0.0;
	}
	
	var hasNutrient = (ant.nutrient > 0.0);
	if (hasNutrient) {
		var c = towardsOrigin(ant, origin);
		ant.x += c.x;
		ant.y += c.y;
		var nf = fieldOf(ant, field);
		nf.pheromone += stinkyness;
		if (nf.pheromone > 1.0)
			nf.pheromone = 1.0;
	} else {
		var isHungry = (ant.hungry * Math.random() > 4.0);
		if (isHungry) {
			var to = towardsOrigin(ant, origin);
			ant.x += to.x;
			ant.y += to.y;
		} else {
			var p = findPheromone(ant, field, origin);
			if (p) {
				ant.x += p.x;
				ant.y += p.y;
			} else {
				var rc = randomCoordinate(3, 3);
				var nc = coord(ant, field, rc.x - 1, rc.y - 1);
				ant.x = nc.x;
				ant.y = nc.y;
			}
		}				
	}
}

function moveAnts(ants, field, origin, capacity, stinkyness) {
	for(var i=0; i<ants.length; i++)
		moveAnt(ants[i], field, origin, capacity, stinkyness);
}

function unstink(field, stinkyness) {
	for (var y=0; y<field.h; y++)
	{
		var arr = field[y];
		for (var x=0; x<field.w; x++)
		{
			var f = arr[x];
			if (f.pheromone > 0.0) {
				f.pheromone = (f.pheromone > stinkyness) ? f.pheromone - stinkyness : 0.0;  
			}
		}
	}
}

var w=400, h=400, n=400, feed=500;
var field = createField(w, h);
var origin = {x: w/2, y: h/2};
var ants = createAntsAt(origin, n);

for(var i=0; i<feed; i++)
{
	var c = randomCoordinate(field.w, field.h);
	var f = field[c.y][c.x];
	f.nutrient = 0.5 * Math.random() + 0.5;
}

var canvas = document.getElementById("c");
canvas.width = field.w+1;
canvas.height = field.h+1;
var lc = lockContext(canvas);

function cycle() {
	moveAnts(ants, field, origin, 0.02, 0.1);
	unstink(field, 0.001);
	show(field, ants, origin, lc);
}

setInterval(cycle, 1000 / 60);
