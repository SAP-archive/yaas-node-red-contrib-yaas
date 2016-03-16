module.exports = function(RED) {

    var YaaS = require("yaas.js");

    function YaasCouponGetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.tenant_id = config.tenantId;

        node.status({fill: "red", shape: "ring", text: "disconnected"});

        var yaas = new YaaS();
        yaas.init(node.yaasCredentials.client_id,
            node.yaasCredentials.client_secret,
            'hybris.coupon_manage',
            node.tenant_id)
        .then(function() {
          node.status({fill: "green", shape: "dot", text: "connected"});
          node.on("input",function(msg) {
            yaas.coupon.get(msg.payload)
            .then(function(response) {
              node.send({payload: response.body});
            }, console.error);
          });
        });

        node.on('close', function() {});
    }

    RED.nodes.registerType("get", YaasCouponGetNode);
};
