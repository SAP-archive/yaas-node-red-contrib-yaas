'use strict'

var
	request = require('request'),
  _ = require('underscore'),
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

var makePaymentAddress = function(defaultAddress, contactEmail, type) {
    var address = _.extend({}, defaultAddress);
    delete address.id;
    delete address.tags;
    delete address.isDefault;
    address.type = type;
    address.account = contactEmail;
    return address;
};

var checkoutCart = function(token, tenant, cartId, customer, creditCardToken) {
	return new Promise(function(resolve, reject) {

    var paymentCustomer = {
        "id": customer.customerNumber,
        "firstName": customer.firstName,
        "lastName": customer.lastName,
        "middleName": customer.middleName,
        "email": customer.contactEmail
    };

    var billingAddress = makePaymentAddress(customer.defaultAddress,
        customer.contactEmail, "BILLING");
    var shippingAddress = makePaymentAddress(customer.defaultAddress,
        customer.contactEmail, "SHIPPING");

      var body = {
            "payment": {
                "paymentId":"stripe",
                "customAttributes": {
                  "token":creditCardToken
                }
            },
            "shippingCost": 0, // required
//            "totalPrice": 0, // optional
//            "currency": "USD", // optional
            "cartId": cartId,
            "addresses": [billingAddress, shippingAddress],
            "customer": paymentCustomer
        };
      console.log(JSON.stringify(body));

	        request({
	            url : 'https://api.yaas.io/hybris/checkout/v1/' + tenant + '/checkouts/order',
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
