var request = require('request');

exports.getDetails = function(tenant, token, productID) {
	var promise = new Promise(function(resolve, reject){

		request({
			url : 'https://api.yaas.io/hybris/productdetails/b1/' + tenant + '/productdetails/' + productID,
			method : 'GET',
			headers : {
				'Authorization' : 'Bearer ' + token
			},
			json : true
		}, function(error, response, body) {
			if (error)
				reject(error);
			else
				resolve(body);
		});
	});

	return promise;
};
