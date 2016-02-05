module.exports = function(RED) {

    var YaaS = require("yaas.js");

    function YaasDocumentWriteNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.tenant_id = config.tenantId;
        node.document_type = config.documentType;

        node.status({fill: "red", shape: "ring", text: "disconnected"});

        var yaas = new YaaS();
        yaas.init(node.yaasCredentials.client_id,
            node.yaasCredentials.client_secret,
            'hybris.document_manage',
            node.tenant_id)
        .then(function() {
          node.status({fill: "green", shape: "dot", text: "connected"});
          node.on("input",function(msg) {
            node.log('Writing: ' + msg.payload);
            yaas.document.write(node.yaasCredentials.application_id, node.document_type, msg.payload)
            .then(function() {
              node.log("Message published.");
            }, console.log);
          });
        });

        node.on('close', function() {});
    }

    RED.nodes.registerType("write", YaasDocumentWriteNode);
};
