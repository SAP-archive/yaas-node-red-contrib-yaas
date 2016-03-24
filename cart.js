module.exports = function(RED) {

    var YaaS = require("yaas.js");

    function YaasAddToCart(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        var yaas = new YaaS();

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.tenant_id = node.yaasCredentials.application_id.split(".")[0];

        node.on('input', function(msg) {

            var productdetails = (msg.payload.constructor === Array) ? msg.payload[0] : msg.payload;
            var product = productdetails.product;
            product.images = product.media;

            var price = productdetails.prices[0];

            node.status({fill:"green", shape:"dot", text:product.name});

            var quantity = Math.round(config.quantity);

            yaas.init(node.yaasCredentials.client_id,
                node.yaasCredentials.client_secret,
                'hybris.customer_read hybris.cart_manage',
                node.tenant_id)
            .then(function() {
              return getCartByCustomerEmail(yaas, node.yaasCustomerCredentials.email, config.siteCode, config.currency);
            }, console.error)
            .then(function(response) {
              return yaas.cart.addProduct(response.cartId, product, quantity, price);
            }, console.error)
            .then(function(cart){
              console.log(JSON.stringify(cart));
                node.send({payload:cart.cartId});
                node.status({fill:"yellow",shape:"dot",text:"idle"});
            })
            .catch(function(e){
                console.error(JSON.stringify(e));
                node.status({fill:"red",shape:"dot",text:"error"});
            });
        });
    }

    RED.nodes.registerType('add to cart', YaasAddToCart);

    function getCartByCustomerId(yaas, customerId, siteCode, currency) {
      // Get/create shopping cart
      return new Promise(function(resolve, reject) {
        var cart = undefined;
        return yaas.cart.getByCriteria({
            customerId : customerId,
            siteCode : siteCode,
            currency : currency
        })
        .then(function(response) {
          cart = response.body;
          cart.cartId = cart.id; // Fixing API inconsistency
          resolve(cart);
        })
        .catch(function(response) {
          if(response.statusCode === 404) {
            console.log("Cart doesn't exist, creating it");
            yaas.cart.create(customerId, currency, siteCode)
            .then(function(response) {
              cart = response.body;
              resolve(cart);
            }, function(response) {
              console.error(JSON.stringify(response));
            });
          } else {
            console.error(JSON.stringify(response));
            reject();
          }
        });
      });
    }

    function getCartByCustomerEmail(yaas, customerEmail, siteCode, currency) {
      return yaas.customer.getCustomers({q: 'contactEmail:"' + customerEmail + '"'})
        .then(function(response) {
          var customer = response.body[0];
          var customerId = customer.customerNumber;
          return getCartByCustomerId(yaas, customerId, siteCode, currency)
        })
    }

    function YaasApplyDiscount(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.tenant_id = node.yaasCredentials.application_id.split(".")[0];

        var yaas = new YaaS();

        node.on('input', function(msg) {

          yaas.init(node.yaasCredentials.client_id,
              node.yaasCredentials.client_secret,
              'hybris.coupon_manage hybris.coupon_redeem hybris.coupon_redeem_on_behalf hybris.customer_read hybris.cart_manage',
              node.tenant_id)
          .then(function() {
            return getCartByCustomerEmail(yaas, node.yaasCustomerCredentials.email, config.siteCode, config.currency);
          })
          .then(function(response) {
            var coupon = msg.payload;
            coupon.currency = config.currency;
            coupon.discountRate = coupon.discountPercentage;
            console.log("cart " + JSON.stringify(response));
            return yaas.cart.addDiscount(response.cartId, coupon);
          })
          .then(console.log)
          .catch(console.error);

        });

        //node.status({fill:"green", shape:"dot", text:"yeah!"});
        //node.status({fill:"red",shape:"dot",text:"error"});
    }

    RED.nodes.registerType('apply discount', YaasApplyDiscount);

};
