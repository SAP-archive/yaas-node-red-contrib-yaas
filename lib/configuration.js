'use strict'

var
	request = require('request');


var getConfiguration = function(token, tenant, key) {
	return new Promise(function(resolve, reject) {

	        request({
	            url : 'https://api.yaas.io/hybris/configuration/b1/' + tenant + '/configurations/' + key,
	            method : 'GET',
	            headers : {'Authorization' : 'Bearer ' + token},
	            json:true
	        }, function(error, response, body) {
	           if (error)
	           	reject({error:error, response:response, body:body});
	           else
	           	resolve(body);
	        });

	});	
};

var setConfiguration = function(token, tenant, key, value) {
	return new Promise(function(resolve, reject) {

	        request({
	            url : 'https://api.yaas.io/hybris/configuration/b1/' + tenant + '/configurations',
	            method : 'POST',
	            headers : {'Authorization' : 'Bearer ' + token},
	            json:true,
	            body: {
	                    "key" : key,
        				"value" : value
	            }
	        }, function(error, response, body) {
	           if (error)
	           	reject({error:error, response:response, body:body});
	           else
	           	resolve(body);
	        });

	});	
};


var updateConfiguration = function(token, tenant, key, value) {
	return new Promise(function(resolve, reject) {

	        request({
	            url : 'https://api.yaas.io/hybris/configuration/b1/' + tenant + '/configurations/' + key,
	            method : 'PUT',
	            headers : {'Authorization' : 'Bearer ' + token},
	            json:true,
	            body: {
        				"value" : value
	            }	            
	        }, function(error, response, body) {
	           if (error)
	           	reject({error:error, response:response, body:body});
	           else
	           	resolve(body);
	        });

	});	
};

var setOrUpdateConfiguration = function(token, tenant, key, value) {
	getConfiguration(token, tenant, key)
	.then(function(response){
		if (response.status && response.status == 404)
		{
			//create
			console.log("Configuration property " + key +" not yet set - setting to " + value);
			return setConfiguration(token, tenant, key, value);
		}
		else 
		{
			//update if necessary
			if (value != response.value)
			{
				console.log("Configuration property " + key +" already set - currently: " + response.value + ", new value: " + value);
				return updateConfiguration(token, tenant, key, value);
			}
			else {
				console.log("Configuration property " + key +" already set to same value - currently: " + response.value);
				return new Promise(function(resolve, reject) {
					resolve();
				});
			}
		}
	});
};



module.exports = {
	getConfiguration : getConfiguration,
	setConfiguration : setConfiguration,
	updateConfiguration : updateConfiguration,
	setOrUpdateConfiguration : setOrUpdateConfiguration
};
