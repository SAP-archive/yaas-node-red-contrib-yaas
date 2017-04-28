'use strict';

module.exports = function (RED) {

    var YaaS = require('yaas.js');
    var yaas = new YaaS();

    function ReadOrderstatus(config, orderId) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({ fill: 'yellow', shape: 'dot', text: 'idle' });
        node.tenant_id = node.yaasCredentials.application_id.split('.')[0];

        node.on('input', function (msg) {

            yaas.init(node.yaasCredentials.client_id,
                node.yaasCredentials.client_secret,
                'hybris.order_read',
                node.tenant_id)

                .then(function () {
                    var orderId = msg.payload.orderId || msg.payload.orderid || msg.payload;
                    yaas.order.getSalesorderDetails(orderId)
                        .then(result => {
                            //console.log('result:', result);
                            var status = result.body.status;
                            node.status({ fill: 'green', shape: 'dot', text: orderId + ' ' + status });
                            node.send({ payload: result.body.status, body: result.body });
                        }).catch(error => {
                            _error(node, error);
                        });
                })
                .catch(error => {
                    _error(node, error);
                });
        });
    }

    function ChangeOrderstatus(config, orderId, status) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({ fill: 'yellow', shape: 'dot', text: 'idle' });
        node.tenant_id = node.yaasCredentials.application_id.split('.')[0];

        node.on('input', function (msg) {

            yaas.init(node.yaasCredentials.client_id,
                node.yaasCredentials.client_secret,
                'hybris.order_update',
                node.tenant_id)

                .then(function () {
                    var orderId = msg.payload.orderId || msg.payload.orderid;
                    var status = msg.payload.status;
                    yaas.order.transitionSalesorder(orderId, status)
                        .then(result => {
                            //console.log('result:', result);
                            node.status({ fill: 'green', shape: 'dot', text: orderId + ' ' + status });
                            node.send({ payload: result.body });
                        }).catch(error => {
                            _error(node, error);
                        });
                })
                .catch(error => {
                    _error(node, error);
                });
        });
    }

    function _error(node, error) {
        var message = error.body.message || 'error order status';
        node.status({ fill: 'red', shape: 'dot', text: message });
        node.error(error);
        console.error(JSON.stringify(error));
    }

    RED.nodes.registerType('readorderstatus', ReadOrderstatus);
    RED.nodes.registerType('changeorderstatus', ChangeOrderstatus);
};
