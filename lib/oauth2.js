var request = require('request');

exports.getClientCredentialsToken = function(clientId, clientSecret, scopes) {
	
	var promise = new Promise(function(resolve, reject){

		request({
				url : 'https://api.yaas.io/hybris/oauth2/b1/token',
				method : 'POST',
				form : { 
					"grant_type" : 'client_credentials',
					"scope" : scopes.join(' '),
					"client_id" : clientId,
					"client_secret" : clientSecret
				}
			}, function(error, response, body) {
				if (error)
				{
					reject(error);
				}
				else
				{
					var authData = JSON.parse(body);
					authData.tenant = authData.scope.split('=')[1];
					resolve(authData);
				}
			});


	});

	return promise;
};