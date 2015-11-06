'use strict'

/*
DONE Configure email in the Configuration service by entering the email address for the value and naming the key selleremail (using the Configuration service, POST /configurations).
DONE BUILDER FLATRATE Configure the tax provider (using the Site service, POST /sites).
DONE BUILDER STRIPE TEST ACCOUNT Configure the payment provider (using the Site service, POST /sites).
DONE BUILDER Create products for the customer to purchase (using the Product service, POST /products).
DONE BUILDER Create prices for these products (using the Price service, POST /prices).
DONE OPTIONAL Create tax codes for these products if you want to use a different tax rate than what is configured in the site code (using the Tax service, POST /tax/codes)
WE CAN DO THAT, AWESEOMEAdd products to the cart (using the Cart service, POST /cartItems).
DONE OPTIONAL Create discounts to apply to the cart (using the Coupon service, POST /coupons).
DONE OPTIONAL Add the discount(s) to the cart (using the Cart service, POST /carts/{cartId}/discounts).

{ code: 'main',
  name: 'INFINITECART',
  active: true,
  default: true,
  defaultLanguage: 'en',
  languages: [ 'en', 'de' ],
  currency: 'USD',
  homeBase: { address: { zipCode: 'unknown', country: 'US' } },
  shipToCountries: [ 'US' ],
  shipping: [],
  payment: 
   [ { id: 'stripe',
       name: 'Stripe Payment Service',
       serviceType: 'urn:x-yaas:service:payment',
       serviceUrl: 'https://api.yaas.io/hybris/payment-stripe/b1',
       active: true } ],
  tax: 
   [ { id: 'FLATRATE',
       name: 'Tax Flat Rate Service',
       serviceType: 'urn:x-yaas:service:tax',
       serviceUrl: 'https://api.yaas.io/hybris/tax/b1',
       active: true } ] }

*/

const
	checkout = require('../lib/checkout'),
	oauth2 = require('../lib/oauth2'),
	site = require('../lib/site'),
	customer = require('../lib/customer'),
	cart = require('../lib/cart');


var client_id = 'PZY5jXrCxVkVUDHXWi2opbrJlBI6qLIP';
var client_secret = '0pGvIlr18ZfGys05';
var email = 'labs@hybris.com';
var ctx = {};

oauth2.getClientCredentialsToken(client_id, client_secret, ['hybris.cart_manage'])
.then(function(auth_data) { 
	console.log(auth_data)
	ctx.auth_data = auth_data;
	return customer.login(auth_data.tenant, auth_data.token, 'sven.haiges+spam@gmail.com', 'futzelbreak');	
}, console.error)
.then(function(customer_token) {
	ctx.customer_token = customer_token;
	console.log(customer_token);

	var stripe = require("stripe")(
	  'sk_test_IKEnGcAh5Jyr0WjsZag7m7Pq'
	);

	stripe.tokens.create({
	  card: {
	    "number": '4242424242424242',
	    "exp_month": 12,
	    "exp_year": 2016,
	    "cvc": '123'
	  }
	}, function(err, token) {
	  // asynchronously called
	  console.log('Stripe card token: ' + token.id);
	  //checkout.checkoutCart(auth_data.access_token, auth_data.tenant, '562f2860580e22ae1b90fc6b', 'C3659910698', token.id)

	});

	
}, console.error);

/*
oauth2.getClientCredentialsToken(client_id, client_secret, ['hybris.configuration_manage'])
.then(function(auth_data) { 
	return checkout.setSellerEmail(auth_data.access_token, auth_data.tenant, email);
}, console.error)
.then(function(res) {
	
}, console.error);
*/