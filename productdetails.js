module.exports = function(RED) {
   
    var oauth2 = require('./lib/oauth2.js');
    var productdetails = require('./lib/productdetails.js');

    function YaasProductDetailsByIDNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.on('input',function(msg) {
            node.status({fill:"green",shape:"dot",text:"retrieve product"});
            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, ['hybris.pcm_read'])
            .then(function(authData) {
                return productdetails.getDetailsByID(authData.tenant, authData.access_token, msg.payload, config.currency);
            })
            .then(function(result){
                node.send({payload:result});
                node.status({fill:"yellow",shape:"dot",text:result.product.name});
            })
            .catch(function(e){
                console.error(e);
                node.status({fill:"red",shape:"dot",text:"error"});
            });
        });
    }

    function YaasProductDetailsByQueryNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        
        node.on('input',function(msg) {
            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {
                return productdetails.getDetailsByQuery(authData.tenant, authData.access_token, msg.payload, config.currency);
            })
            .then(function(products){
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
