module.exports = function(RED) {

    var uglycart = require('./lib/UGLYCART.js');
    var YaaS = require("yaas.js");

    function Salesorders(config, orderId) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({ fill: "yellow", shape: "dot", text: "idle" });
        node.tenant_id = node.yaasCredentials.application_id.split(".")[0];

        var YaaS = require("yaas.js");
        var yaas = new YaaS();

        node.on('input', function(msg) {
            
            yaas.init(node.yaasCredentials.client_id,
                node.yaasCredentials.client_secret,
                'hybris.order_read',
                node.tenant_id)

                .then(function() {
                    var orderId = msg.payload.orderId || msg.payload;
                    node.status({ fill: "green", shape: "dot", text: orderId });
                    yaas.order.getSalesorderDetails(orderId)
                        .then(function(order) {
                            console.log("order:", order);
                            node.send({ payload: order.body });
                        });
                });
        });
    }

    RED.nodes.registerType('salesorders', Salesorders);
};
