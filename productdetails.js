module.exports = function(RED) {
   
    var request = require('request');
    var oauth2 = require('./lib/oauth2.js');
    var productdetails = require('./lib/productdetails.js');

    function YaasProductDetailsByIDNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.on('input',function(msg) {
            console.log('got id: ' + msg.payload);
            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(access_token) {
                return productdetails.getDetailsByID(node.yaasCredentials.tenant, access_token, msg.payload);
            })
            .then(function(product){
                console.log(JSON.stringify(product));
                node.send(product);
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }

    function YaasProductDetailsByQueryNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.on('input',function(msg) {
            console.log('got query: ' + msg.payload);
            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(access_token) {
                return productdetails.getDetailsByQuery(node.yaasCredentials.tenant, access_token, msg.payload);
            })
            .then(function(products){
                console.log('got ' + products.length + ' products for query: ' + msg.payload);
                node.send(products);
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }

    RED.nodes.registerType('get product details by ID', YaasProductDetailsByIDNode);
    RED.nodes.registerType('get product details by query', YaasProductDetailsByQueryNode);

};
