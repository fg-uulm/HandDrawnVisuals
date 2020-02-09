//How to fire up your dev environment, for easier coding :)
//browser-sync start --server --files "*.html, css/*.css, js/*.js"

//Where we hold our "global" data on animation / visualization state
var timeout;
var frameTime = 100;
var generation = 0;
var numSquares = 32;
var positions = [];
var aCtx;
var analyser;
var microphone;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

//Where we define stuff (similar to Processing setup())
function init() {
	//Squares init
	for (var i = 0; i < numSquares; i++) {
		positions.push({x: Math.random()*1000, y:Math.random()*1000});
	}

	//Audio init
	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: true}, function(stream) {
			aCtx = new AudioContext();
			analyser = aCtx.createAnalyser();
			analyser.smoothingTimeConstant = 0.1;
    		analyser.fftSize = 64;
			microphone = aCtx.createMediaStreamSource(stream);
			microphone.connect(analyser);
		}, console.log);
	};
	recreate()
}

function recreate() {
	$("#test").empty();
	var svg = document.getElementById("test");
	for (var i = 0; i < numSquares; i++) {
		const rc = rough.svg(svg);
		let node = rc.rectangle(positions[i].x, positions[i].y, 80, 80, {
			fill: 'rgb(255,0,200)',
		    fillStyle: 'solid', // solid fill	    
		});
		
		svg.appendChild(node);
	}
	$("#test g").attr("fill-opacity", 0.5).css("transform-origin","center");
}

//Where we define how our content changes (over time / on interaction)
function advance() {
	
	recreate();

	//Audio
	if(analyser) {
		FFTData = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(FFTData);
        console.log(FFTData[0]);
        $("#test g").each(function(idx){
        	if(-FFTData[idx]/100 > 1.3) $(this).css("transform","scale("+(-FFTData[idx]/100)+")");
        	else TweenMax.to($(this),0.5,{scale:1.0});
        });    
	}

	//VSync Animation (fast)
	//requestAnimationFrame(advance);

	//Timeout Animation (slow)
	timeout = setTimeout(advance, frameTime);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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
