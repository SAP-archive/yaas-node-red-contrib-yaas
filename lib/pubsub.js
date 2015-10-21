var request = require('request');

exports.createTopic = function(token, topic) {

	var promise = new Promise(function(resolve, reject){

		request({
			url : 'https://api.yaas.io/hybris/pubsub/b2/topics',
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

exports.publish = function(token, application_id, topic, payload) {
	
	var promise = new Promise(function(resolve, reject){

		request({
			url : 'https://api.yaas.io/hybris/pubsub/b2/topics/'+application_id+'/'+topic+'/publish',
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

exports.readNext = function(token, application_id, topic, autoCommit) {
	
	var promise = new Promise(function(resolve, reject){

		request({
			url : 'https://api.yaas.io/hybris/pubsub/b2/topics/'+application_id+'/'+topic+'/read',
			method : 'POST',
			headers : {'Authorization' : 'Bearer ' + token},
			json : true,
			body: {
					numEvents : 1,
					ttlMs : 1000,
					autoCommit : autoCommit
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

exports.commit = function(accessToken, topicOwnerClient, eventType, commitToken) {

	var promise = new Promise(function(resolve, reject){
		request({
			url : 'https://api.yaas.io/hybris/pubsub/b2/topics/' + topicOwnerClient + '/' + eventType + '/commit',
			method : 'POST',
			headers : {'Authorization' : 'Bearer ' + accessToken},
			json : true,
			body: {
				token: commitToken
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
