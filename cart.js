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
        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.on('input', function(msg) {

            var productdetails = (msg.payload.constructor === Array) ? msg.payload[0] : msg.payload;
            var product = productdetails.product;
            product.images = product.media;

            var price = productdetails.prices[0];
            
            node.status({fill:"green", shape:"dot", text:product.name});

            var quantity = Math.round(node.quantity);
            var currency = config.currency;
            var siteCode = config.siteCode;
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('cart got customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customer){
                    console.log('cart got customer id:  ' + customer.customerNumber);
                    return cart.getCartOrCreateForCustomer(authData.tenant, customerToken, customer.customerNumber, siteCode, currency);
                })
                .then(function(cartId){
                    console.log('cart got cart id: ' + cartId);
                    return cart.addProductToCart(authData.tenant, customerToken, cartId, product, price, quantity);
                });
            })
            .then(function(cart){
                node.send({payload:cart.cartId});
                node.status({fill:"yellow",shape:"dot",text:"idle"});
            })
            .catch(function(e){
                console.error(e);
                node.status({fill:"red",shape:"dot",text:"error"});
            });
        });
    }

    RED.nodes.registerType('add to cart', YaasAddToCart);

};
