'use strict'

var
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
            "contactName": "Sven Haiges",
            "companyName": "hybris",
            "street": "15 2nd Ave",
            "streetAppendix": "",
            "city": "Brooklyn",
            "state": "NY",
            "zipCode": "11231",
            "country": "US",
            "account": "sven.haiges+spam@gmail.com",
            "contactPhone": "",
            "type": "BILLING"
        },
        {
            "contactName": "Sven Haiges",
            "companyName": "hybris",
            "street": "15 2nd Ave",
            "streetAppendix": "",
            "city": "Brooklyn",
            "state": "NY",
            "zipCode": "11231",
            "country": "US",
            "account": "sven.haiges+spam@gmail.com",
            "contactPhone": "",
            "type": "SHIPPING"
        }
    ];

    var paymentCustomer = {
        "id": customer.customerNumber,
        "firstName": "Sven",
        "lastName": "Haiges",
        "email": customer.contactEmail
    };

      var body = {
				    "payment": {
				        "paymentId":"stripe",
				        "customAttributes": {
				          "creditCardToken":creditCardToken
				        }
				    },
				    "shippingCost": 0,
            "totalPrice": 0,
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
