"use strict";
// access canvas 2d contexts pixel-wise
// exports the function lockContext() 
// Martin Lercher 2015

function lockContext(canvas) {
	var ctx = canvas.getContext("2d");
	var w = canvas.width;
	var h = canvas.height;
	var id = ctx.getImageData(0, 0, w, h);
	var data = id.data;
	
	function index(x, y) {
		return 4 * (w * y + x);
	}
	
	function putPixel(x, y, red, green, blue, alpha) {
		var i = index(x, y);
		data[i++] = red;
		data[i++] = green;
		data[i++] = blue;
		data[i++] = alpha || 255;
	}

	function putWhitePixel(x, y, red, green, blue, alpha) {
		var mr = Math.max(green, blue);
		var mg = Math.max(red, blue);
		var mb = Math.max(red, green);
		putPixel(x, y, 255-mr, 255-mg, 255-mb, alpha);
	}
	
	function getPixel(x, y) {
		var i = index(x, y);
		return data.slice(i, i + 4);
	}
	
	function show() {
		ctx.putImageData(id, 0, 0);
	}
	
	var lc = {
		w: w,
		h: h,
		canvas: canvas,
		ctx: ctx,
		putPixel: putPixel,
		putWhitePixel: putWhitePixel,
		getPixel: getPixel,
		show: show
	};
	return lc;
}