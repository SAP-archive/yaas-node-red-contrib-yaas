var Minecraft = require('minecraft-pi-promise');


var mc = new Minecraft('192.168.1.11', 4711);
//var mc = new Minecraft('192.168.2.113', 4711);

exports.blockId = function(payload) {


	var promise = new Promise(function(resolve, reject) {

		mc.eventsBlockHits()

		//mc.getBlockWithData(0,-1,0)
		.then(function(e) {

		var events = parseEvents(e);
		for(var i = 0; i < events.length; i++) {
			var b = events[i];
			//console.log('block: ' + JSON.stringify(b));
			//console.log(b.y);

			//console.log(""+(b.x)+","+b.y+","+b.z);
			if(isNaN(b.x) || b.x == null || b.y == null || b.z == null) {
			// ???
			} else {
				console.log(""+b.x+","+b.y+","+b.z);
				mc.getBlockWithData(b.x, b.y, b.z)
					.then(function(d) {
					console.log("d=" + d);
					resolve(d.toString());
				});

			}

		} // for

		})
	});

	return promise;
};


function parseEvents(eventStr) {
//if (eventStr.length < 2) return;
	var eventsArr = eventStr.toString().split("|");
//        if (eventsArr) { 
//console.log("arr:" + eventsArr);
	var events = new Array(eventsArr.length);
	for (var i = 0; i < events.length; i++) {
		var breakYourHeart = eventsArr[i].split(",");
		events[i] = new BlockHitEvent(parseInt(breakYourHeart[0]), parseInt(breakYourHeart[1]),
			parseInt(breakYourHeart[2]), parseInt(breakYourHeart[3]), parseInt(breakYourHeart[4]));
	}
	return events;
//}
}

function BlockHitEvent(x, y, z, face, entityId) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.face = face;
	this.entityId = entityId;
}

