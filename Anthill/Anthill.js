/* global lockContext */
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
			nutrient: 0
		}
	}
	return ants;
}

function show(field, ants, origin) {
	var canvas = document.getElementById("c");
	canvas.width = field.w;
	canvas.height = field.h;
	var lc = lockContext(canvas);
	for (var y=0; y<field.h; y++)
	{
		var arr = field[y];
		for (var x=0; x<field.w; x++)
		{
			var f = arr[x];
			if (f.pheromone <= 0.0 && f.nutrient <= 0.0) {
				lc.putPixel(x, y, 255, 255, 255); //white
			}
			else {
				var red = 255.0 * f.pheromone;
				var green = 255.0 * f.nutrient;
				lc.putPixel(x, y, red, green, 255); // red or green  				
			}
		}
	}
	lc.putPixel(origin.x, origin.y, 64, 64, 64); // dark gray origin
	for (var i=0; i<ants.length; i++)
	{
		var ant=ants[i];
		if (ant.nutrient > 0) {
			lc.putPixel(ant.x, ant.y, 0, 0, 0); // black ant
		} else {
			lc.putPixel(ant.x, ant.y, 0, 0, 255); // blue ant
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

function fieldNear(ant, field, dx, dy) {
	return field[(ant.y + dy) % field.h][(ant.x + dx) % field.w];
}

function towardsOrigin(ant, origin) {
	var dx = origin.x - ant.x;
	var dy = origin.y - ant.y;
	var dd = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy);
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
	for (var dx=-1; dx<=1; dx++) {
		for (var dy=-1; dy<=1; dy++) {
			if (dx !== 0 && dy !== 0) {
				var f = fieldNear(ant, field, dx, dy);
				if (f. pheromone > 0.0 && isOutside(ant, dx, dy, origin)) {
					return { x: dx, y: dy };
				}
			}						
		}
	}
	return null;
}


function moveAnt(ant, field, origin, capacity, stinkyness) {
	var f = fieldOf(ant, field);
	var onNutrientWithCapacity = f.nutrient > 0.0 && ant.nutrient < capacity;	
	if (onNutrientWithCapacity) {
		// don't move yet, but pickup nutrient;
		f.nutrient -= capacity;
		ant.nutrient += capacity;
	} 
	
	var onOrigin = (ant.x === origin.x && ant.y === origin.y);
	if (onOrigin) {
		ant.nutrient = 0.0;
	}
	
	var hasNutrient = (ant.nutrient > 0);
	if (hasNutrient) {
		var c = towardsOrigin(ant, origin);
		ant.x += c.x;
		ant.y += c.y;
		var nf = fieldOf(ant, field);
		nf.pheromone += stinkyness;
	} else {
		var p = findPheromone(ant, field, origin);
		if (p) {
			ant.x += p.x;
			ant.y += p.y;
		} else {
			var c = randomCoordinate(3, 3);
			ant.x += c.x - 1;
			ant.y += c.y - 1;
			ant.x = ant.x % field.w;
			ant.y = ant.y % field.h;
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

var w=100, h=100, n=10, feed=50;
var field = createField(w, h);
var origin = {x: w/2, y: h/2};
var ants = createAntsAt(origin, n);

for(var i=0; i<feed; i++)
{
	var c = randomCoordinate(field.w, field.h);
	var f = field[c.y][c.x];
	f.nutrient += 1.0;
}

moveAnts(ants, field, origin, 0.1, 0.1);
unstink(field, 0.05);
show(field, ants, origin);
