'use strict';

module.exports = function (RED) {

  var YaaS = require('yaas.js');
  var helper = require('./lib/helper');

  function YaasCouponCreateNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
    node.tenant_id = config.tenantId || helper.tenantId(node.yaasCredentials);
    node.couponType = config.couponType;
    node.currency = config.currency;

    console.log(config.couponType);

    node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });

    var yaas = new YaaS();
    yaas.init(node.yaasCredentials.client_id,
      node.yaasCredentials.client_secret,
      'hybris.coupon_manage',
      node.tenant_id)
      .then(function () {
        node.status({ fill: 'yellow', shape: 'ring', text: 'idle' });
        node.on('input', function (msg) {
          var amount = msg.payload + '';
          var coupon = {
            // TO BE IMPLEMENTED: 'code':'???',
            'name': config.name,
            'description': config.name,
            'discountType': config.couponType,
            'restrictions': { 'validFrom': new Date().toISOString() },
            'allowAnonymous': true
          };
          if (config.couponType === 'PERCENT') {
            coupon.discountPercentage = amount;
          } else {
            coupon.discountAbsolute = {
              'amount': amount,
              'currency': config.currency
            };
          }
          console.log(coupon);
          yaas.coupon.post(coupon)
            .then(function (response) {
              var info;
              if (config.couponType === 'PERCENT') {
                info = coupon.discountPercentage + '%';
              } else {
                info = coupon.discountAbsolute.currency + ' ' + coupon.discountAbsolute.amount;
              }
              node.status({ fill: 'green', shape: 'dot', text: response.body.id + ' (' + info + ')' });
              node.send({ payload: response.body });
            }, function (error) {
              console.error(JSON.stringify(error));
            });
        });
      });

    node.on('close', function () { });
  }
  RED.nodes.registerType('create coupon', YaasCouponCreateNode);

  function YaasCouponGetNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
    node.tenant_id = config.tenantId || helper.tenantId(node.yaasCredentials);

    node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });

    var yaas = new YaaS();
    yaas.init(node.yaasCredentials.client_id,
      node.yaasCredentials.client_secret,
      'hybris.coupon_redeem',
      node.tenant_id)
      .then(function () {
        node.status({ fill: 'yellow', shape: 'ring', text: 'idle' });
        node.on('input', function (msg) {
          var couponId = msg.payload.id || msg.payload;
          node.status({ fill: 'green', shape: 'dot', text: couponId });
          console.log(couponId);
          yaas.coupon.get(couponId)
            .then(function (response) {
              console.log(response);
              var statusText = response.body.code + ' (' + response.body.status + ')';
              node.status({ fill: 'green', shape: 'dot', text: statusText });
              node.send({ payload: response.body });
            }, console.error);
        });
      });

    node.on('close', function () { });
  }
  RED.nodes.registerType('get', YaasCouponGetNode);
};
