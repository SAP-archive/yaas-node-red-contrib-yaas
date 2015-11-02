module.exports = function(RED) {
   
    var request = require('request');
    var oauth2 = require('./lib/oauth2.js');
    var cart = require('./lib/cart.js');
    var customer = require('./lib/customer.js');

    function YaasAddToCart(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.on('input', function(msg) {


            var productdetails = (msg.payload.constructor === Array) ? msg.payload[0] : msg.payload;
            var product = productdetails.product;
            product.images = product.media;

            /*
            product.images = [
                { 
                    id : '55e6fb084dceaa411edea73e',
                    url : 'http://i.imgur.com/c5tATL3.jpg\"></img> asdf <h1 style="z-index:1">YAAS BUERSTE</h1><img src="http://i.imgur.com/c5tATL3.jpg" '}
            ];
            */

            var price = productdetails.prices[0];

            /*
            price.originalAmount = 2;
            price.effectiveAmount = 3.2;
            */

            var quantity = Math.round(node.quantity);
            var currency = config.currency;
            var siteCode = config.siteCode;
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('got customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customerId){
                    console.log('got customer id:  ' + customerId);
                    return cart.getCartOrCreateForCustomer(authData.tenant, customerToken, customerId, siteCode, currency);
                })
                .then(function(cartId){
                    console.log('got cart id: ' + cartId);
                    return cart.addProductToCart(authData.tenant, customerToken, cartId, product, price, quantity);
                });
            })
            .then(function(zeug){
                console.log(zeug);
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }

    RED.nodes.registerType('add to cart', YaasAddToCart);

};
