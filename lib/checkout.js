'use strict'

const 
	request = require('request'),
	configuration = require('./configuration.js');


var updateSellerEmail = function(token, tenant, email) {
	return configuration.updateConfiguration(token, tenant, 'selleremail', email);
};

var getSellerEmail = function(token, tenant) {
	return configuration.getConfiguration(token, tenant, 'selleremail');	
};


var setSellerEmail = function(token, tenant, email) {
	return configuration.setConfiguration(token, tenant, 'selleremail', email)
};

var setOrUpdateSellerEmail  = function(token, tenant, email) {
	return configuration.setOrUpdateConfiguration(token, tenant, 'selleremail', email);
};

var checkoutCart = function(token, tenant, cartId, customer, creditCardToken) {
	console.log(customer);
	return new Promise(function(resolve, reject) {

			var addresses =  [
				        {
				            "contactName": "Peter Priceless",
				            "street": "999 de Maisonneuve Ouest",
				            "city": "Montreal",
				            "state": "Quebec",
				            "zipCode": "H3A 3L4",
				            "country": "CA",
				            "type": "BILLING",
				            "account": "user@example.com"
				        },
				        {
				            "contactName": "Peter Priceless",
				            "street": "999 de Maisonneuve Ouest",
				            "city": "Montreal",
				            "state": "Quebec",
				            "zipCode": "H3A 3L4",
				            "country": "CA",
				            "type": "SHIPPING",
				            "account": "user@example.com"
				        }
				    ];

			var paymentCustomer = {
				        "id": customer.customerNumber,
				        "name": "Peter O. Priceless",
				        "title": "Mr.",
				        "name": "Peter Priceless",
				        "firstName": "Peter",
				        "middleName": "O.",
				        "lastName": "Priceless",
				        "email": customer.contactEmail,
				        "company": "Hybris"
				    };
			
			var body = {
				    "payment": {
				        "paymentId":"stripe",
				        "customAttributes": {
				          "creditCardToken":creditCardToken
				        }
				    },
				    "shippingCost": "10",
				    "currency": "USD",
				    "cartId": cartId,
				    "addresses": addresses,
				    "customer": paymentCustomer
				};

			console.log(JSON.stringify(body));

	        request({
	            url : 'https://api.yaas.io/hybris/checkout/b1/' + tenant + '/checkouts/order',
	            method : 'POST',
	            headers : {'Authorization' : 'Bearer ' + token},
	            json:true,
	            body: body
	        }, function(error, response, body) {
	           if (error)
	           	reject({error:error, response:response, body:body});
	           else
	           	resolve(body);
	        });

	});	

};

module.exports = {
	setSellerEmail : setSellerEmail,
	getSellerEmail : getSellerEmail,
	updateSellerEmail : updateSellerEmail,
	setOrUpdateSellerEmail : setOrUpdateSellerEmail,
	checkoutCart : checkoutCart
};