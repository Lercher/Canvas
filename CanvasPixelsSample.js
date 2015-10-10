"use strict";

(function() {
	var canvas = document.getElementById("c");
	var lc = lockContext(canvas);
	for(var i=0; i<lc.w; i++) {
		lc.putPixel(i,i/2, 255,0,0);
		lc.putPixel(i,i,0,255,0);
		lc.putPixel(i/2,i,0,0,255);
	}
	lc.show();
}) ();