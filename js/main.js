//How to fire up your dev environment, for easier coding :)
//browser-sync start --server --files "*.html, css/*.css, js/*.js"

//Where we hold our "global" data on animation / visualization state
var timeout;
var frameTime = 100;
var generation = 0;
var positions = [];

//Where we define stuff (similar to Processing setup())
function init() {
	for (var i = 0; i < 20; i++) {
		positions.push({x: Math.random()*1000, y:Math.random()*1000});
	}
}

//Where we define how our content changes (over time / on interaction)
function advance() {
	$("#test").empty();
	var svg = document.getElementById("test");
	for (var i = 0; i < 20; i++) {
		const rc = rough.svg(svg);
		let node = rc.rectangle(positions[i].x, positions[i].y, 80, 80, {
			fill: 'rgb(255,0,200)',
		    fillStyle: 'solid', // solid fill		    
		});
		$("#test").attr("fill-opacity", 0.5);
		svg.appendChild(node);
	}
	
	

	//VSync Animation (fast)
	//requestAnimationFrame(advance);

	//Timeout Animation (slow)
	timeout = setTimeout(advance, frameTime);
}

$().ready(function(){
	//Sample Interaction: Manual generation creation
	$("body").click(function(){
		advance();
	});

	//Init
	init();

	//Aaaand....go!
	advance();
});
