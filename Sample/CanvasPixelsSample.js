"use strict";

(function () {
	var canvas = document.getElementById("c");
	var lc = lockContext(canvas);
	for (var i=0; i < 256; i++) {
		for (var j=0; j < 10; j++) {
			lc.putPixel(i+j+10, i, i, 0, 0);
			lc.putPixel(i+j+20, i, 0, i, 0);
			lc.putPixel(i+j+30, i, 0, 0, i);

			lc.putWhitePixel(i+j+40, i, i, 0, 0);
			lc.putWhitePixel(i+j+50, i, 0, i, 0);
			lc.putWhitePixel(i+j+60, i, 0, 0, i);

			lc.putPixel(i+j+10, 255-i, 255  , 255-i, 255-i);
			lc.putPixel(i+j+20, 255-i, 255-i, 255  , 255-i);
			lc.putPixel(i+j+30, 255-i, 255-i, 255-i, 255  );
		}
	}
	lc.show();
}) ();