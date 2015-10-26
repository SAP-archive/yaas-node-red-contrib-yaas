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
            console.log('got productdetails: ' + msg.payload);

            var productdetails = msg.payload[0]; // FIXME VERY UGLY
            var product = productdetails.product; // FIXME VERY UGLY
            var price = productdetails.prices[0]; // FIXME VERY UGLY
            var quantity = Math.round(node.quantity);


            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(access_token) {

                var customer_access_token;
                return customer.login(node.yaasCredentials.tenant, access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('got customer token');
                    customer_access_token = token; // FIXME VERY UGLY
                    return customer.me(node.yaasCredentials.tenant, customer_access_token);
                })
                .then(function(customerNumber){
                    console.log('got customer number');
                    return cart.getCartOrCreateForCustomer(node.yaasCredentials.tenant, customer_access_token, customerNumber);
                })
                .then(function(cartId){
                    console.log('got cart id');
                    return cart.addProductToCart(node.yaasCredentials.tenant, customer_access_token, cartId, product, price, quantity);
                });
            })
            .then(function(){
                console.log("hopefully worked");
            });
        });
    }

    RED.nodes.registerType('add to cart', YaasAddToCart);

};
