module.exports = function(RED) {
   
    var request = require('request');
    var oauth2 = require('./lib/oauth2.js');
    var cart = require('./lib/cart.js');
    var customer = require('./lib/customer.js');
    var checkout = require('./lib/checkout.js');
    var payment = require('./lib/payment.js');

    function YaasCheckout(config) {

        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.stripeCredentials = RED.nodes.getNode(config.stripeCredentials);

        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.on('input', function(msg) {
            var currency = config.currency;
            var siteCode = config.siteCode;
            var customerToken;
            var customerVar;
            var cartId = msg.payload;

            var authData;

            node.status({fill:"green",shape:"dot",text:"placing order"});

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(data) {
                authData = data;
                return customer.login(authData.tenant, authData.access_token,
                    node.yaasCustomerCredentials.email,
                    node.yaasCustomerCredentials.password);
            }, console.error)
            .then(function(token){
                console.log('checkout got customer token: ' + token);
                customerToken = token;
                return customer.me(authData.tenant, customerToken);
            }, console.error)
            .then(function(cust){
                customerVar = cust;
                console.log('checkout got customer id:  ' + customerVar.customerNumber); 
                return cart.getCartOrCreateForCustomer(authData.tenant, customerToken, customerVar.customerNumber, siteCode, currency);
            }, console.error)
            .then(function(cId){
                cartId = cId;
                console.log('checkout got cart id: ' + cartId);
                return payment.getToken(node.stripeCredentials);
            }, console.error)
            .then(function(stripeToken) {
                console.log("checkout got stripe token: " + stripeToken);
                node.status({fill:"green",shape:"dot",text:"Stripe"});
                return checkout.checkoutCart(customerToken, authData.tenant, cartId, customerVar, stripeToken);
            }, console.error)
            .then(function(order){
                console.log(order);
                node.status({fill:"yellow",shape:"dot",text:order.orderId});
                node.log("Order placed: " + order.orderId);
            }, console.error);
        });

    }
    
    function Salesorders(config, orderId) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        var tenant = config.tenant;

        node.status({ fill: "yellow", shape: "ring", text: "disconnected " + tenant });

        var yaas = require("yaas.js");

        node.on('input', function(msg) {

            yaas.oauth.token(
                node.yaasCredentials.client_id, // theClientId
                node.yaasCredentials.client_secret, // theClientSecret
                "hybris.order_read" // theScope,
                //node.application_id // theProjectId
            )
                .then(function(token) {
                    console.log("RH: ", token.access_token,
                        ":", msg.payload,
                        ">", tenant); //JSON.stringify(rh));

                    node.status({ fill: "green", shape: "dot", text: "verbunden" });
                    yaas.order.salesorders_orderId(token.access_token, msg.payload, tenant)
                        .then(function(order) {
                            node.send({ payload: order.body });
                        });
                });

        });
    }

    RED.nodes.registerType('checkout', YaasCheckout);
    RED.nodes.registerType('salesorders', Salesorders);
};
