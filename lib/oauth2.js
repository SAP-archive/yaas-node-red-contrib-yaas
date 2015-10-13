var request = require('request');

exports.getClientCredentialsToken = function(clientId, clientSecret, scopes) {
	
	var promise = new Promise(function(resolve, reject){

		request({
				url : 'https://api.yaas.io/hybris/oauth2/b1/token',
				method : 'POST',
				form : { 
					"grant_type" : 'client_credentials',
					"scope" : scopes.join(' '),
					"clientId" : clientId,
					"clientSecret" : clientSecret
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