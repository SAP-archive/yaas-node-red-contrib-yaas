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
            console.log(msg.payload);
            yaas.coupon.get(msg.payload)
            .then(function(response) {
              console.log(response);
              node.send({payload: response.body});
            }, console.error);
          });
        });

        node.on('close', function() {});
    }

    RED.nodes.registerType("get", YaasCouponGetNode);


    function YaasCouponCreateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.tenant_id = config.tenantId;
        node.couponType = config.couponType;
        node.currency = config.currency;

        console.log(config.couponType);

        node.status({fill: "red", shape: "ring", text: "disconnected"});

        var yaas = new YaaS();
        yaas.init(node.yaasCredentials.client_id,
            node.yaasCredentials.client_secret,
            'hybris.coupon_manage',
            node.tenant_id)
        .then(function() {
          node.status({fill: "green", shape: "dot", text: "connected"});
          node.on("input",function(msg) {
            var amount = msg.payload + "";
            var coupon = {
              // TO BE IMPLEMENTED: "code":"???",
              "name":config.name,
              "description":config.name,
              "discountType": config.couponType,
              "restrictions": { "validFrom":new Date().toISOString() },
              "allowAnonymous":true
            };
            if(config.couponType === "PERCENT") {
              coupon.discountPercentage = amount;
            } else {
              coupon.discountAbsolute = {
                "amount":amount,
                "currency":config.currency
              };
            }
            console.log(coupon);
            yaas.coupon.post(coupon)
            .then(function(response) {
              node.send({payload: response.body.id});
            }, function(error) {
              console.error(JSON.stringify(error));
            });
          });
        });

        node.on('close', function() {});
    }

    RED.nodes.registerType("create coupon", YaasCouponCreateNode);

};
