module.exports = function(RED) {
   
    var request = require("request");
    var oauth2 = require('./lib/oauth2.js');
    var document = require('./lib/document.js');

    function YaasDocumentWriteNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.tenant_id = config.tenantId;
        node.document_type = config.documentType;

        node.status({fill: "red", shape: "ring", text: "disconnected"});

        oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, ['hybris.repository_manage'])
            .then(function(authData) {
                node.status({fill: "green", shape: "dot", text: "connected"});
                node.access_token = authData.access_token;
            }, console.log);

        node.on("input",function(msg) {
            if (!node.access_token) {
                node.error("No access_token, no writing to the document repository!");
                return;
            }

            node.log('Writing: ' + msg.payload);

            document.write(node.access_token, node.tenant_id, node.yaasCredentials.application_id, node.document_type, msg.payload)
                .then(function() {
                    node.log("Message published.");
                }, console.log);
        });

        node.on('close', function() {
            
        });
    }

    RED.nodes.registerType("write", YaasDocumentWriteNode);
}
