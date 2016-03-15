module.exports = function(RED) {
   
    var request = require('request');
    var oauth2 = require('./lib/oauth2.js');
    var cart = require('./lib/cart.js');
    var customer = require('./lib/customer.js');
    var YaaS = require("yaas.js");

    function YaasAddToCart(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);
        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.status({fill:"yellow",shape:"dot",text:"idle"});

        node.on('input', function(msg) {

            var productdetails = (msg.payload.constructor === Array) ? msg.payload[0] : msg.payload;
            var product = productdetails.product;
            product.images = product.media;

            var price = productdetails.prices[0];
            
            node.status({fill:"green", shape:"dot", text:product.name});

            var quantity = Math.round(node.quantity);
            var currency = config.currency;
            var siteCode = config.siteCode;
            var customerToken;

            oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
            .then(function(authData) {

                return customer.login(authData.tenant, authData.access_token, node.yaasCustomerCredentials.email, node.yaasCustomerCredentials.password)
                .then(function(token){
                    console.log('cart got customer token: ' + token);
                    customerToken = token;
                    return customer.me(authData.tenant, customerToken);
                })
                .then(function(customer){
                    console.log('cart got customer id:  ' + customer.customerNumber);
                    return cart.getCartOrCreateForCustomer(authData.tenant, customerToken, customer.customerNumber, siteCode, currency);
                })
                .then(function(cartId){
                    console.log('cart got cart id: ' + cartId);
                    return cart.addProductToCart(authData.tenant, customerToken, cartId, product, price, quantity);
                });
            })
            .then(function(cart){
                node.send({payload:cart.cartId});
                node.status({fill:"yellow",shape:"dot",text:"idle"});
            })
            .catch(function(e){
                console.error(e);
                node.status({fill:"red",shape:"dot",text:"error"});
            });
        });
    }

    RED.nodes.registerType('add to cart', YaasAddToCart);

    function getCartByCustomer(yaas, customerId, siteCode, currency) {
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
            }, console.error);
          } else {
            console.error(response);
            reject();
          }
        });
      });
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
            return yaas.customer.getCustomers({q: 'contactEmail:"' + node.yaasCustomerCredentials.email + '"'});
          })
          .then(function(response) {
            var customer = response.body[0];
            var customerId = customer.customerNumber;
            return getCartByCustomer(yaas, customerId, config.siteCode, config.currency)
            .then(function(response) {
              console.log(response);
              console.log(msg.payload);
              var coupon = msg.payload;
              coupon.currency = config.currency;
              coupon.discountRate = coupon.discountPercentage;
              coupon.links = [
                {
                  "title": coupon.code,
                  "rel": "validate",
                  "type": "application/json",
                  "href": "https://api.yaas.io/hybris/coupon/v1/" + node.tenant_id + "/coupons/" + coupon.code + "/validation"
                },
                {
                  "title": coupon.code + " redeem",
                  "rel": "redeem",
                  "type": "application/json",
                  "href": "https://api.yaas.io/hybris/coupon/v1/" + node.tenant_id + "/coupons/" + coupon.code + "/redemptions"
                }
              ];
              return yaas.cart.addDiscount(response.cartId, coupon);
            })
            .catch(function(error) {
              console.error("Bla! ");
              console.error(JSON.stringify(error));
            });
          })
          .then(console.log)
          .catch(console.error);

        });

        //node.status({fill:"green", shape:"dot", text:"yeah!"});
        //node.status({fill:"red",shape:"dot",text:"error"});
    }

    RED.nodes.registerType('apply discount', YaasApplyDiscount);

};
