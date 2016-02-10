module.exports = function(RED) {
   
    var request = require('request');
    var oauth2 = require('./lib/oauth2.js');
    var papr = require('./lib/papr.js');
    var customer = require('./lib/customer.js');

    function PaprAdd(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.on('input', function(msg) {

/*
            var productdetails = (msg.payload.constructor === Array) ? msg.payload[0] : msg.payload;
            var product = productdetails.product;
            product.images = product.media;



            var price = productdetails.prices[0];


            var quantity = Math.round(node.quantity);
            var currency = config.currency;
            var siteCode = config.siteCode;
*/           
            var quantity = Math.round(node.quantity);
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('add papr customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customer){
                    console.log('papr got customer id:  ' + customer.customerNumber);
                    return papr.add(customerToken, quantity);
                });
            })
            .then(function(body){
                node.send({payload:body});
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }
    
    function PaprDecrease(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.on('input', function(msg) {
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('decrease papr customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customer){
                    console.log('papr got customer id:  ' + customer.customerNumber);
                    return papr.decrease(customerToken);
                });
            })
            .then(function(body){
                node.send({payload:body});
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }

    RED.nodes.registerType('papr add', PaprAdd);
    RED.nodes.registerType('papr decrease', PaprDecrease);
};
