//How to fire up your dev environment, for easier coding :)
//browser-sync start --server --files "*.html, css/*.css, js/*.js"

//Where we hold our "global" data on animation / visualization state
var timeout;
var frameTime = 225;
var hysteresis = 300; 
var armed = true;
var generation = 0;
var aCtx;
var analyser;
var microphone;

var svg;
var rc;
var curPos = 10;
var curGen = 0;
var vb = 0;

const deleteRandom = true;
const compWidth = 1280;
const lineWidth = 0.8;

var plockedin = undefined;
var ulockedin = undefined;
var alockedin = undefined;
var slockedin = undefined;

var channel;

var fns = ["createBox", "createTriSet", "createLineSet", "createHalfCircleSet"];
var fns_single = ["createBox", "createTriSet", "createLineSet", "createHalfCircleSet", "createSquirrel"];

//Where we define stuff (similar to Processing setup())
function init() {
	//audio
	console.log("Pre Audio Assign");
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
	} catch(err) {
		console.log(err);
	}
	console.log("Post Audio Assign");

	//Rough init
	svg = document.getElementById("test");
	rc = rough.svg(svg);

	//Audio init
	console.log("Pre Audio Init");
	if (navigator.getUserMedia) {
		console.log("Pre Audio Init User Media true");
		navigator.getUserMedia({audio: true}, function(stream) {
			console.log("In Audio Init Error");
			aCtx = new AudioContext();
			analyser = aCtx.createAnalyser();
			analyser.smoothingTimeConstant = 0.1;
    		analyser.fftSize = 64;
			microphone = aCtx.createMediaStreamSource(stream);
			microphone.connect(analyser);
			setInterval(analyse, 16);
			setInterval(fastRedraw, 100);
		}, function(e){
			console.log("Post Audio Init Error");
			console.log("Err"+e.name);
		});
		console.log("Post Audio Init");
	};
	//recreate();

	$("body").on("click", function(){
		advance();
	});

	$("body").on("keydown", function(e){
		advance();
	});
}

function analyse() {
	if(analyser) {		
		FFTData = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(FFTData);
        //console.log("Get FFT, max "+FFTData[10]);
        //console.log(FFTData);
        //TweenMax.to($("svg"),0.1,{opacity:1+FFTData[0]/100});
        /*$("svg g").each(function(idx){
        	if(-FFTData[idx]/100 > 1.3) $(this).css("transform","scale("+(-FFTData[idx]/100)+")");
        	else TweenMax.to($(this),0.5,{scale:1.0});
        });*/ 
        if(FFTData[0] > -20 && armed) {
        	armed = false;
        	advance();        	
        	setTimeout(function(){ armed = true}, hysteresis);
        }
        if(FFTData[18] > -110 && deleteRandom && Math.random() < 0.9) {
        	var elem = $("svg g").random()[0];
        	TweenMax.to(elem, 0.3, {opacity:0.0, yoyo:true});
        }  
	}
}

function fastRedraw() {
	/*if(plockedin != undefined) {
		$(plockedin).empty();
		createP($(plockedin).get()[0],1,0,9,true, false);
	} 

	if(ulockedin != undefined) {
		$(ulockedin).empty();
		createU($(ulockedin).get()[0],1,0,9,true, false);
	}

	if(alockedin != undefined) {
		$(alockedin).empty();
		createAnd($(alockedin).get()[0],1,0,9,true, false);
	}

	if(slockedin != undefined) {
		$(slockedin).empty();
		createSquirrel($(slockedin).get()[0],1,0,9,true, false);
	}*/

	//P&U Fields
	$("#single7").empty();
	createP($("#single7").get()[0],1,0,9,true, false);

	$("#single8").empty();
	createAnd($("#single8").get()[0],1,0,9,true, false);

	$("#single9").empty();
	createU($("#single9").get()[0],1,0,9,true, false);

	$("#single10").empty();
	createSquirrel($("#single10").get()[0],1,0,9,true, false);

}

//Where we define how our content changes (over time / on interaction)
function advance() {
	curGen++;	

	//check viewbox
	if(curPos > vb+900) {
		var target = (curPos-720);
		//console.log("CUR "+target);		
		TweenMax.to($("svg#test"),0.5,{attr:{viewBox:"0 "+target+" 1280 720"}});
	}	

	//cleanup
	$("svg#test g").each(function(idx, elem){
		var yPos = elem.getBoundingClientRect().y;
		if(yPos < -20) elem.remove();
		if(deleteRandom && Math.random() < 0.05 && yPos < 400) TweenMax.to(elem, 0.1, {opacity:0.0});
	});
	//console.log("LENGTH: "+$("svg g").length);

	//create sth
	var rand = fns[Math.floor(Math.random() * fns.length)];
	window[rand]($("#test").get()[0], Math.floor(Math.random() * 30)+10, Math.floor(Math.random() * 20), Math.floor(Math.random() * 8), !!Math.floor(Math.random() * 2), true);

	//Single fields
	$("svg.single").each(function(){
		//Skip rotations randomly
		if(Math.random() < 0.3) return true;
		//Decide if only rotate or regenerate
		if(!!Math.floor(Math.random() * 2)) {
			//new content
			$(this).empty();
			var rand = fns_single[Math.floor(Math.random() * fns_single.length)];
			if(plockedin && ulockedin && alockedin && slockedin) plockedin = ulockedin = alockedin = slockedin = undefined;
			if(rand == "createP") plockedin = $(this);
			if(rand == "createU") ulockedin = $(this);
			if(rand == "createA") alockedin = $(this);
			if(rand == "createS") slockedin = $(this);
			window[rand]($(this).get()[0], Math.floor(Math.random() * 3)+1, Math.floor(Math.random() * 20), Math.floor(Math.random() * 8), !!Math.floor(Math.random() * 2), false);
		} else {
			//just transform
			var posneg = !!Math.floor(Math.random() * 2) ? "+" : "-";
			var angle = !!Math.floor(Math.random() * 2) ? "90" : "180";
			TweenMax.to($(this),0.2,{rotation:posneg+"="+angle, transformOrigin:"center"});
		}		
	});

	var posneg = !!Math.floor(Math.random() * 2) ? "+" : "-";
	var angle = !!Math.floor(Math.random() * 2) ? "90" : "180";

	$("svg.singleChar").each(function(){
		if(!!Math.floor(Math.random() * 2)) TweenMax.to($(this),0.2,{rotation:posneg+"="+angle, transformOrigin:"center"});
	});


	$("#single1").empty();
	createTriSet($("#single1").get()[0],1,0,4,true, false);	

	//VSync Animation (fast)
	//requestAnimationFrame(advance);

	//Timeout Animation (slow)
	//timeout = setTimeout(advance, frameTime);
}

function createBox(target, count, strength, concentric, centered, addsUp) {
	var w = Math.floor(target.scrollWidth / count+1); // width
	var s = 0.1*(target.scrollWidth/count); // spacing
	//console.log("W: "+w+ " S:"+s);
	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	for (var i = 0; i < count; i++) {
		for (var j = 1; j <= concentric; j++) {
			if(centered == true) {
				var x = ((i*w) + ((i-1)*s)) + ((w - w/j)/2);
				var y = curPos + ((w - w/j)/2);
			} else {
				var x = (i*w) + ((i-1)*s)
				var y = curPos;
			}
			var node = rc.rectangle(x, y, w/j, w/j, {
				fill: 'rgb(0,0,0)',
			    fillStyle: 'solid', // solid fill
			    stroke: 'rgb(255,255,255)',
			    strokeWidth: lineWidth    
			});
		
			target.appendChild(node);
			TweenMax.from(node, 0.3,{scale:0.01});
			
		}		
	}
	if(addsUp) curPos = curPosSave + w + 10;
	else curPos = curPosSave;
}

function createTriSet(target, count, strength, concentric, centered, addsUp) {
	var w = Math.floor(target.scrollWidth / count+1); // width
	var s = 0.1*(target.scrollWidth/count); // spacing
	//console.log("W: "+w+ " S:"+s);

	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	//random orientation
	var o = Math.random() < 0.5;
	
	for (var i = 0; i < count; i++) {
		var vertices = [[(i*w) + ((i-1)*s), curPos], [(i*w) + ((i-1)*s)+w, curPos], [(i*w) + ((i-1)*s)+w/2, curPos+w]];
		if(o) vertices = [[(i*w) + ((i-1)*s), curPos+w], [(i*w) + ((i-1)*s)+w, curPos+w], [(i*w) + ((i-1)*s)+w/2, curPos]];

		var fillStr = 'rgb(130,90,220)';
		if(Math.random() > 0.5) fillStr = 'rgb(20,255,80)';

		var node = rc.polygon(vertices, {
			fill: fillStr,
		    fillStyle: 'hachure', // solid fill
		    stroke: 'rgb(255,255,255)',
		    hachureGap: 10,
		    hachureAngle: 90,
		    strokeWidth: lineWidth,
		    fillWeight: 3    
		});

		target.appendChild(node);
	}
	if(addsUp) curPos = curPosSave + w + 10;
	else curPos = curPosSave;
}

function createLineSet(target, count, strength, concentric, centered, addsUp) {
	if(addsUp) count = count / 16;
	//console.log("LINE COUNT "+count);
	var w = Math.floor(strength / count+1); // width
	var s = 0.1*(strength/count); // spacing
	if(addsUp) s = strength/count;
	var march = 0;
	//console.log("W: "+w+ " S:"+s);
	
	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	for (var i = 0; i < count; i++) {
		var offs = Math.random()*2;
		var node = rc.line(0,curPos+march,target.scrollWidth,curPos+march, {
		    stroke: 'rgb(255,255,255)',
		    strokeWidth: offs     
		});
		march += offs*10;
		//console.log("M "+march);
		target.appendChild(node);
	}
	if(addsUp) curPos = curPosSave + march;
	else curPos = curPosSave;
}

function createHalfCircleSet(target, count, strength, concentric, centered, addsUp) {
	var w = Math.floor(target.scrollWidth / count+1); // width
	var s = 0.1*(target.scrollWidth/count); // spacing
	//console.log("W: "+w+ " S:"+s);
	//concentric = 1;

	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	for (var i = 0; i < count; i++) {
		for (var j = 1; j <= concentric; j++) {
			if(centered == true) {
				var x = ((i*w) + ((i-1)*s)) + ((w - w/j)/2);
				var y = curPos;// + ((w - w/j)/2);
			} else {
				var x = (i*w) + ((i-1)*s)
				var y = curPos;
			}
			var node = rc.path('M'+x+','+y+' a1,1 135 0,0 '+w/j+',0', { 
				stroke: 'rgb(255,255,255)',
				strokeWidth: lineWidth			
			});
		
			target.appendChild(node);	
		}		
	}
	if(addsUp) curPos = curPosSave + w - 10;
	else curPos = curPosSave;
}

function createP(target, count, strength, concentric, centered, addsUp) {
	var w = Math.floor(target.scrollWidth / count+1); // width
	var s = 0.1*(target.scrollWidth/count); // spacing
	//console.log("W: "+w+ " S:"+s);
	//concentric = 1;

	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	for (var i = 0; i < count; i++) {
		for (var j = 1; j <= concentric; j++) {
			if(centered == true) {
				var x = ((i*w) + ((i-1)*s)) + ((w - w/j)/2);
				var y = curPos + ((w - w/j)/2);
			} else {
				var x = (i*w) + ((i-1)*s)
				var y = curPos;
			}
			var node = rc.path("M65.5,179V31.7168c9.2881-1.5479,21.4512-2.8745,36.9312-2.8745c19.0186,0,32.9507,4.4229,41.7964,12.3838c8.1826,7.0767,13.0479,17.9131,13.0479,31.1816c0,13.4897-3.9805,24.105-11.4995,31.8452c-10.1729,10.8359-26.7588,16.3647-45.5562,16.3647c-5.7495,0-30.2969-0.0117-34.7197-1.1177", { 
				stroke: 'rgb(255,255,255)',
				strokeWidth: lineWidth			
			});
		
			target.appendChild(node);	
		}		
	}
	if(addsUp) curPos = curPosSave + w - 10;
	else curPos = curPosSave;
}

function createAnd(target, count, strength, concentric, centered, addsUp) {
	var w = Math.floor(target.scrollWidth / count+1); // width
	var s = 0.1*(target.scrollWidth/count); // spacing
	//console.log("W: "+w+ " S:"+s);
	//concentric = 1;

	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	for (var i = 0; i < count; i++) {
		for (var j = 1; j <= concentric; j++) {
			if(centered == true) {
				var x = ((i*w) + ((i-1)*s)) + ((w - w/j)/2);
				var y = curPos + ((w - w/j)/2);
			} else {
				var x = (i*w) + ((i-1)*s)
				var y = curPos;
			}
			var node = rc.path("M158.7024,176.3614c-14.0458-13.7602-27.5278-28.0843-40.3548-42.9885c-12.8917-14.9793-26.4901-30.4307-36.666-47.4303 c-9.301-15.538-14.7134-40.8405,4.2998-51.8404c8.4682-4.8992,18.4474-3.716,25.0431,3.6387 c5.7498,6.4115,8.4211,15.715,9.238,24.1336c0.9259,9.5423-2.29,17.617-10.3787,22.892 c-6.2229,4.0583-13.5618,6.1254-20.5546,8.4227c-14.5014,4.7639-28.4781,12.0985-37.1102,25.1855 c-8.2568,12.518-10.1105,30.0767-1.3801,42.8618c8.5699,12.5499,24.7458,17.5255,39.3206,15.6558 c36.0966-4.6305,63.9271-39.3753,70.6312-73.4113c0.3714-1.8858-2.5195-2.693-2.8928-0.7975 c-3.3873,17.197-11.4519,33.2226-23.4198,46.0612c-12.803,13.7344-31.0448,25.4817-50.3741,25.5733 c-19.6044,0.0929-37.0132-13.8796-35.9698-34.4512c1.0311-20.3285,17.6315-34.7005,35.4924-41.5393 c12.0557-4.6161,27.5404-6.8747,35.5507-18.1649c8.3127-11.7163,3.8407-31.2297-4.0915-42.1285 c-8.2515-11.3376-22.9164-12.9035-33.8743-4.3147C68.0288,44.052,68.0976,62.9368,73.9199,77.2383 c3.7158,9.1273,9.5207,17.175,15.4337,24.9839c6.5676,8.6733,13.3443,17.1891,20.3178,25.5394 c14.7715,17.6877,30.4492,34.5953,46.9097,50.7212C157.9613,179.8349,160.0844,177.7153,158.7024,176.3614L158.7024,176.3614z", { 
				stroke: 'rgb(255,255,255)',
				strokeWidth: lineWidth			
			});
		
			target.appendChild(node);	
		}		
	}
	if(addsUp) curPos = curPosSave + w - 10;
	else curPos = curPosSave;
}

function createU(target, count, strength, concentric, centered, addsUp) {
	var w = Math.floor(target.scrollWidth / count+1); // width
	var s = 0.1*(target.scrollWidth/count); // spacing
	//console.log("W: "+w+ " S:"+s);
	//concentric = 1;

	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	for (var i = 0; i < count; i++) {
		for (var j = 1; j <= concentric; j++) {
			if(centered == true) {
				var x = ((i*w) + ((i-1)*s)) + ((w - w/j)/2);
				var y = curPos + ((w - w/j)/2);
			} else {
				var x = (i*w) + ((i-1)*s)
				var y = curPos;
			}
			var node = rc.path("M163.4399,30.6616v86.9102c0,45.7773-24.1045,64.5747-56.3921,64.5747c-30.5181,0-53.5171-17.4707-53.5171-63.6899V30.6616", { 
				stroke: 'rgb(255,255,255)',
				strokeWidth: lineWidth			
			});
		
			target.appendChild(node);	
		}		
	}
	if(addsUp) curPos = curPosSave + w - 10;
	else curPos = curPosSave;
}

function createSquirrel(target, count, strength, concentric, centered, addsUp) {
	var w = Math.floor(target.scrollWidth / count+1); // width
	var s = 0.1*(target.scrollWidth/count); // spacing
	//console.log("W: "+w+ " S:"+s);
	//concentric = 1;

	var curPosSave = curPos;
	if(!addsUp) {
		curPos = 0;
	}

	for (var i = 0; i < count; i++) {
		for (var j = 1; j <= concentric; j++) {
			if(centered == true) {
				var x = ((i*w) + ((i-1)*s)) + ((w - w/j)/2);
				var y = curPos + ((w - w/j)/2);
			} else {
				var x = (i*w) + ((i-1)*s)
				var y = curPos;
			}
			var node = rc.path("M184.3636,124.2969c-8.359-2.8287-14.7436,1.0596-21.4715,5.7156 c-4.5855,3.1736-10.4682,4.9179-16.0251,6.1129c-5.0716,1.0912-9.2242-0.4961-12.603-5.8544 c-6.3796-10.1092-16.4306-14.6415-28.6106-14.2143c14.5899,2.9035,26.076,9.9695,28.5092,25.4694 c1.067,6.7968-1.5315,14.196-2.6384,21.2937c-0.4014,2.5703-1.3097,5.0591-1.987,7.5837c2.6484,0.3648,5.1689-2.2255,7.5572-3.4071 c5.4548-2.6991,12.2639-3.4703,15.4318,0.5875c0.4304,0.5517,0.1005,5.8328-0.0449,6.5183 c-20.1751,1.7592-40.3834,5.2212-60.512,4.8033c-20.4161-0.4246-36.4968-11.3008-44.2409-30.974 c-7.8173-19.8593-6.3111-38.9076,9.0583-55.3295c1.2162-1.2985,2.3251-2.6987,3.5338-4.0042 c6.5138-7.0311,10.1844-14.9232,5.5241-24.257c-4.3516-8.7197-12.1492-11.7537-21.7952-12.6213 c6.4569-0.563,12.9147-1.1264,19.4526-1.6964c-10.4598-7.5601-21.3893-4.1513-33.5136,10.3231 c1.7995-17.1353,15.3287-29.8729,33.4869-31.5328c18.7234-1.7111,35.2433,8.7691,39.9186,25.9668 c1.4384,5.2869,1.8032,11.0411,1.6188,16.5482c-0.2426,7.341-2.864,12.8336-10.6505,16.5727 c-19.8909,9.5494-30.4168,32.5766-25.0174,54.5142c-0.3698-14.9448,3.1083-26.8904,11.8268-36.9563 c7.5938-8.7692,17.0913-14.6731,28.6069-16.0858c11.4421-1.4047,20.9213-5.8444,28.5616-15.0004 c1.7384,2.0181,3.2767,3.8043,4.8173,5.5927c-2.3575-8.7513-3.4943-16.9201,2.8554-24.314c0.7753,0.2364,1.504,0.2348,1.6711,0.5406 c4.5888,8.4314,12.7468,12.7475,19.817,18.5655c6.4245,5.2876,10.1997,14.0215,14.4636,21.6152 c2.4514,4.369,0.1338,8.187-4.6113,9.2242c-7.8014,1.7052-15.7442,2.7431-23.524,4.0445 c5.0068,5.1148,11.2485,2.6102,17.4619,1.0986C181.8017,108.1862,186.8824,113.2305,184.3636,124.2969z", { 
				stroke: 'rgb(255,255,255)',
				strokeWidth: lineWidth			
			});
		
			target.appendChild(node);	
		}		
	}
	if(addsUp) curPos = curPosSave + w - 10;
	else curPos = curPosSave;
}

$().ready(function(){
	jQuery.fn.random = function() {
	    var randomIndex = Math.floor(Math.random() * this.length);  
	    return jQuery(this[randomIndex]);
	};

	//Init
	init();

	//Aaaand....go!
	advance();
});
