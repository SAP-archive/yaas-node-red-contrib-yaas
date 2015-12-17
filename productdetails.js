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
            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, ['hybris.pcm_read'])
            .then(function(authData) {
                return productdetails.getDetailsByID(authData.tenant, authData.access_token, msg.payload);
            })
            .then(function(body){
                node.send({payload:body});
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
            .then(function(authData) {
                return productdetails.getDetailsByQuery(authData.tenant, authData.access_token, msg.payload);
            })
            .then(function(products){
                console.log('got ' + products.length + ' products for query: ' + msg.payload);
                node.send({payload:products});
            })
            .catch(function(e){
                console.error(e);
            });
        });
    }

    RED.nodes.registerType('get product details by ID', YaasProductDetailsByIDNode);
    RED.nodes.registerType('get product details by query', YaasProductDetailsByQueryNode);

};
