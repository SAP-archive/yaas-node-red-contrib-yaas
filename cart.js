'use strict';

var uglycart = require('./lib/UGLYCART.js');

module.exports = function(RED) {

    var YaaS = require('yaas.js');

    function YaasAddToCart(config) {
        RED.nodes.createNode(this, config);

        var yaas = new YaaS();

        this.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);

        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.status({fill:'yellow',shape:'dot',text:'idle'});

        this.tenant_id = this.yaasCredentials.application_id.split('.')[0];
        this.on('input', msg => {

            var storedCustomer = this.context().flow.get('storedCustomer');
            this.yaasCustomerCredentials = storedCustomer || this.yaasCustomerCredentials;
            var product = (msg.payload.body.constructor === Array) ? msg.payload.body[0] : msg.payload.body;
            product.images = product.media;

            // FIXME find correct language values
            product.name = product.name.en;
            product.description = product.description.en;

            var quantity = Math.round(config.quantity);
            var productname = product.name.en || 'item';

            this.status({fill:'yellow', shape:'dot', text: 'adding ' +quantity + 'x ' + productname + ' to cart'});

            yaas.init(this.yaasCredentials.client_id, 
              this.yaasCredentials.client_secret, 
              'hybris.customer_read hybris.cart_manage', 
              this.tenant_id)
            .then(() => uglycart.getCartByCustomerEmail(yaas, 
              this.yaasCustomerCredentials.email, 
              config.siteCode, 
              config.currency))
            .then(response => {
              this.cartId = response.cartId;
              return yaas.price.getPricesForProducts([product.id], 'USD')
            })
            .then(p_response => {
              product.price = p_response.body[0];
              return yaas.cart.addProduct(this.cartId, product, quantity, product.price)
            })
            .then(cart => {
                this.send({payload:cart.body});
                this.status({fill:'green',shape:'dot',text:quantity + 'x ' + productname+ ' added'});  
            })
            .catch(e => {
                console.error('addToCart', e);
                if (e.body && e.body.details) console.log('...', e.body.details[0]);
                this.error('error in addToCart');
                this.status({fill:'red',shape:'dot', text: 'error in addToCart'});
            });
        });
    }

    RED.nodes.registerType('add to cart', YaasAddToCart);

    function YaasApplyDiscount(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({fill:'yellow',shape:'dot',text:'idle'});

        node.tenant_id = node.yaasCredentials.application_id.split('.')[0];

        var yaas = new YaaS();

        node.on('input', function(msg) {

          yaas.init(node.yaasCredentials.client_id,
              node.yaasCredentials.client_secret,
              'hybris.customer_read hybris.cart_manage',
              node.tenant_id)
          .then(function() {
            return uglycart.getCartByCustomerEmail(yaas, 
            node.yaasCustomerCredentials.email, 
            config.siteCode, 
            config.currency);
          })
          .then(function(response) {
            var coupon = msg.payload;
            // Fixing glitches in YaaS API, adding missing fields
            if(coupon.discountType === 'PERCENT') {
              coupon.discountRate = coupon.discountPercentage;
            } else {
              coupon.amount = coupon.discountAbsolute.amount;
            }
            coupon.currency = config.currency;
            node.status({fill:'green',shape:'dot',text: coupon.code});
            return yaas.cart.addDiscount(response.cartId, coupon);
          })
          .then(function(response) {
            node.status({fill:'yellow',shape:'dot',text: 'discountId: ' + response.body.discountId});
            node.send({payload: response.body});
          })
          .catch(function(error) {
            console.error(JSON.stringify(error));
          });

        });

    }

    RED.nodes.registerType('apply discount', YaasApplyDiscount);

};
