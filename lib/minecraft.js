var Minecraft = require('minecraft-pi-promise');


//var mc = new Minecraft('192.168.1.11', 4711);
//var mc = new Minecraft('192.168.2.113', 4711);


//var mc = new Minecraft('localhost', 3333);

// test socket : nc -l 3333 | nc 192.168.1.11 4711

//var mc_server;

exports.connect = function(host, port) {


	var promise = new Promise(function(resolve, reject) {

		if (!host || !port) {
			var msg = 'Minecraft server not defined.';
			console.log(msg);
			reject(msg);
		}

		console.log('start connecting to ' + host + ":" + port);
		
		new Minecraft(host, port)
		.then(function(mc_connection) {
			//mc_server = mc_connection;
			resolve(mc_connection);
		});
//		.then(function() {
//			resolve('CONNECT TO ' + host + ":" + port);
//		});
	});

	return promise;
}

exports.close = function(mc_connection) {

	mc_connection.end();

}

exports.blockId = function(mc_connection) {

    //console.log("mc_connection=" + mc_connection);

	var promise = new Promise(function(resolve, reject) {

		mc_connection.eventsBlockHits()
		.then(function(eventStr) {

		var events = parseEvents(eventStr);
		for(var i = 0; i < events.length; i++) {
			var b = events[i];

			//console.log(""+(b.x)+","+b.y+","+b.z);
			if(isNaN(b.x) || b.x == null || isNaN(b.y) || b.y == null || isNaN(b.z) || b.z == null) {
			// ???
			} else {
				console.log(""+b.x+","+b.y+","+b.z);
				mc_connection.getBlockWithData(b.x, b.y, b.z)
				.then(function(data) {
					console.log("data=" + data);
					var dataValues = data.toString().split(",");
					var block_id = new BlockId(parseInt(dataValues[0]), parseInt(dataValues[1]), b);
					console.log("block_id=" + block_id.blockId);
					resolve(block_id); //.toString());
				});
			}

		} // for

		})
	});

	return promise;
};


function parseEvents(eventStr) {
	var eventsArr = eventStr.toString().split("|");
	var events = new Array(eventsArr.length);
	for (var i = 0; i < events.length; i++) {
		var eventValues = eventsArr[i].split(",");
		events[i] = new BlockHitEvent(parseInt(eventValues[0]), parseInt(eventValues[1]),
			parseInt(eventValues[2]), parseInt(eventValues[3]), parseInt(eventValues[4]));
	}
	return events;
}

function BlockHitEvent(x, y, z, face, entityId) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.face = face;
	this.entityId = entityId;
}

function BlockId(blockId, typeId, blockData) {
	this.blockId = blockId;
	this.typeId = typeId;
	this.blockData = blockData;
}

