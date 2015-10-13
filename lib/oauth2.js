var request = require('request');

exports.getClientCredentialsToken = function(client_id, client_secret, scopes) {
	
	var promise = new Promise(function(resolve, reject){

		request({
				url : 'https://api.yaas.io/hybris/oauth2/b1/token',
				method : 'POST',
				form : { 
					"grant_type" : 'client_credentials',
					"scope" : scopes.join(' '),
					"client_id" : client_id,
					"client_secret" : client_secret
				}
			}, function(error, response, body) {
				if (error)
				{
					reject(error);
				}
				else
				{
					console.log(body);
					resolve(JSON.parse(body).access_token);
				}
			});


	});

	return promise;
};