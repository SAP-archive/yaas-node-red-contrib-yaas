var request = require('request');

exports.getDetailsByID = function(tenant, token, productID, currency) {
	var promise = new Promise(function(resolve, reject){

		request({
			url : 'https://api.yaas.io/hybris/productdetails/v1/' + tenant + '/productdetails/' + productID,
			method : 'GET',
			headers : {
				'Authorization' : 'Bearer ' + token,
        'hybris-currency' : currency
			},
			qs : {
				expand : 'media'
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


exports.getDetailsByQuery = function(tenant, token, query, currency) {
	var promise = new Promise(function(resolve, reject){

		request({
			url : 'https://api.yaas.io/hybris/productdetails/v1/' + tenant + '/productdetails',
			method : 'GET',
			headers : {
				'Authorization' : 'Bearer ' + token,
        'hybris-currency' : currency
			},
			qs : {
				q : query,
				expand : 'media'
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
