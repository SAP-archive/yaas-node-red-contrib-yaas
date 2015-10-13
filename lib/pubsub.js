var 
	request = require('request'),
	;


exports.createTopic = function(token, topic) {
	
	var promise = new Promise(function(resolve, reject){

		request({
			url : options.base + '/pubsub/b2/topics',
			method : 'POST',
			headers : {'Authorization' : 'Bearer ' + token},
			json : true,
			body: {
					"eventType": topic
			}
		}, function(error, response, body) {
			if (error)
				reject(error);
			else
				resolve(body);
		});
	

	});

	return promise;
};

exports.publish = function(token, topic, payload) {
	
	var promise = new Promise(function(resolve, reject){

		request({
			url : options.base + '/pubsub/b2/topics/'+options.projectAndApp+'/'+topic+'/publish',
			method : 'POST',
			headers : {'Authorization' : 'Bearer ' + token},
			json : true,
			body: {
					"payload" : JSON.stringify(payload)
			}
		}, function(error, response, body) {
			if (error || response.statusCode != 201)
			{
				reject(error);
			}
			else
				resolve();
		});
	

	});

	return promise;
};	

exports.readNext = function(token, topic) {
	
	var promise = new Promise(function(resolve, reject){

		request({
			url : options.base + '/pubsub/b2/topics/'+options.projectAndApp+'/'+topic+'/read',
			method : 'POST',
			headers : {'Authorization' : 'Bearer ' + token},
			json : true,
			body: {
					numEvents : 1,
					ttlMs : 1000,
					autoCommit : true
			}
		}, function(error, response, body) {
			if (error)
				reject(error);
			else
				resolve(body);
		});
	

	});

	return promise;
};

