'use strict';

module.exports = function(RED) {

    var YaaS = require('yaas.js');

    function YaasProductDetailsByIDNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.status({fill:'yellow',shape:'dot',text:'idle'});

        node.on('input',function(msg) {
            node.status({fill:'green',shape:'dot',text:'retrieve product'});

            var yaas = new YaaS();
            yaas.init(
                node.yaasCredentials.client_id, // theClientId
                node.yaasCredentials.client_secret, // theClientSecret
                'hybris.pcm_read', // theScope
                node.yaasCredentials.application_id // theProjectId
            )
            .then(function() {
                return yaas.product.getProduct(msg.payload);
            })
            .then(function(result){
                msg.payload = result
                node.send(msg);
                node.status({fill:'yellow',shape:'dot',text:result.body.name.en || 'found'});
            })
            .catch( function(e) {
                console.error(e);
                node.status({fill:'red',shape:'dot',text:'error'});
            });
        });
    }

    function YaasProductDetailsByQueryNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.on('input',function(msg) {

            var yaas = new YaaS();
            yaas.init(
                node.yaasCredentials.client_id, // theClientId
                node.yaasCredentials.client_secret, // theClientSecret
                'hybris.pcm_read', // theScope
                node.yaasCredentials.application_id // theProjectId
            )
            .then(function() {
                var query = {
                    "q" : msg.payload
                };
                return yaas.product.getProducts(query);
            })
            .then(function(result){
                node.send({payload:result});
                node.status({fill:'yellow',shape:'dot',text:'found ' + result.body.length + ' items.'});
            })
            .catch( function(e) {
                console.error(e);
                node.status({fill:'red',shape:'dot',text:'error'});
            });
        });
    }

    RED.nodes.registerType('get product details by ID', YaasProductDetailsByIDNode);
    RED.nodes.registerType('get product details by query', YaasProductDetailsByQueryNode);
};
