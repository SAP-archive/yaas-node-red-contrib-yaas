var request = require('request');

exports.write = function(token, tenant_id, application_id, document_type, payload) {
	var promise = new Promise(function(resolve, reject){

		request({
			url: 'https://api.yaas.io/hybris/repository/b2/' + tenant_id + '/' + application_id + '/data/' + document_type,
			method: 'POST',
			headers: {'Authorization': 'Bearer ' + token},
			json: true,
			body: {'payload': JSON.stringify(payload)}
		}, function(error, response, body) {
			if (error || response.statusCode != 201)
			{
				reject(error);
			}
			else {
				console.log(body);
				resolve();
			}
		});
	

	});

	return promise;
};