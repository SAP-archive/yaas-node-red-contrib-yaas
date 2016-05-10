module.exports = function(RED) {

    var YaaS = require("yaas.js");

    function YaasRecommendationGetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.tenant_id = config.tenantId;

        node.status({fill: "red", shape: "ring", text: "disconnected"});

        var yaas = new YaaS();
        yaas.init(node.yaasCredentials.client_id,
            node.yaasCredentials.client_secret,
            'ml.recommender_view',
            node.tenant_id)
        .then(function() {
          node.on("input",function(msg) {
            var productId = msg.payload.id || msg.payload;
            node.status({fill: "green", shape: "dot", text: couponId});
            console.log(productId);
            yaas.recommendation.get(productId)
            .then(function(response) {
              console.log(response);
              node.status({fill: "yellow", shape: "dot", text: response.body.code + " (" + response.body.status + ")"});
              node.send({payload: response.body});
            }, console.error);
          });
        });

        node.on('close', function() {});
    }

    RED.nodes.registerType("get recommendation", YaasRecommendationGetNode);

};
