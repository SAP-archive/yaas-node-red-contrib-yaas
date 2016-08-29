'use strict';

module.exports = function(RED) {
    var configurationBasePath = '/hybris/configuration/v1/{{projectId}}/configurations/';

    var YaaS = require('yaas.js');

    function YaasConfigurationGetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.tenant_id = config.tenantId;

        node.status({fill: 'red', shape: 'ring', text: 'disconnected'});

        var yaas = new YaaS();
        yaas.init(node.yaasCredentials.client_id, 
            node.yaasCredentials.client_secret, 
            'hybris.configuration_admin', 
            node.tenant_id)
        .then(function() {
            node.on('input',function(msg) {
                
                var configurationKey = msg.payload.key || msg.payload;
                
                node.status({fill: 'green', shape: 'dot', text: configurationKey});

                yaas.requestHelper.get(configurationBasePath + configurationKey)
                .then(function(response) {
                    node.status({fill: 'yellow', shape: 'dot', text: response.statusCode});
                    node.send({payload: response.body});
                }, console.error);
            });
        });

        node.on('close', function() {});
    }

    RED.nodes.registerType('get configuration', YaasConfigurationGetNode);

};
