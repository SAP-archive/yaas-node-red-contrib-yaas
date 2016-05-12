var uglycart = require('./lib/UGLYCART.js');

module.exports = function(RED) {

    var YaaS = require("yaas.js");

    function YaasAddToCart(config) {
        RED.nodes.createNode(this, config);

        var yaas = new YaaS();

        this.yaasCustomerCredentials = RED.nodes.getNode(config.yaasCustomerCredentials);

        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.status({fill:"yellow",shape:"dot",text:"idle"});

        this.tenant_id = this.yaasCredentials.application_id.split(".")[0];
        this.on('input', msg => {

            // TODO : DE-HACK
            var storedCustomer = this.context().flow.get('storedCustomer');
            this.yaasCustomerCredentials = storedCustomer || this.yaasCustomerCredentials;
            
            var productdetails = (msg.payload.constructor === Array) ? msg.payload[0] : msg.payload;
            var product = productdetails.product;
            product.images = product.media;
            var price = productdetails.prices[0];
            var quantity = Math.round(config.quantity);

            this.status({fill:"yellow", shape:"dot", text: "adding " +quantity + "x " + product.name + " to cart"});

            yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret, 'hybris.customer_read hybris.cart_manage', this.tenant_id)
            .then(() => uglycart.getCartByCustomerEmail(yaas, this.yaasCustomerCredentials.email, config.siteCode, config.currency))
            .then(response => yaas.cart.addProduct(response.cartId, product, quantity, price))
            .then(cart => {
                this.send({payload:cart.body});
                this.status({fill:"green",shape:"dot",text:quantity + "x " + product.name + " added"});  
            })
            .catch(e => {
                console.error("addToCart", e);
                this.error("error in addToCart");
                this.status({fill:"red",shape:"dot", text: "error in addToCart"});
            });
        });
    }

    RED.nodes.registerType('add to cart', YaasAddToCart);

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
              'hybris.customer_read hybris.cart_manage',
              node.tenant_id)
          .then(function() {
            return uglycart.getCartByCustomerEmail(yaas, node.yaasCustomerCredentials.email, config.siteCode, config.currency);
          })
          .then(function(response) {
            var coupon = msg.payload;
            // Fixing glitches in YaaS API, adding missing fields
            if(coupon.discountType === "PERCENT") {
              coupon.discountRate = coupon.discountPercentage;
            } else {
              coupon.amount = coupon.discountAbsolute.amount;
            }
            coupon.currency = config.currency;
            console.log("coupon to cart", coupon);
            node.status({fill:"green",shape:"dot",text: coupon.code});
            return yaas.cart.addDiscount(response.cartId, coupon);
          })
          .then(function(response) {
            console.log("apply discount", response);
            node.status({fill:"yellow",shape:"dot",text: "discountId: " + response.body.discountId});
            node.send({payload: response.body});
          })
          .catch(function(error) {
            console.error(JSON.stringify(error));
          });

        });

        //node.status({fill:"green", shape:"dot", text:"yeah!"});
        //node.status({fill:"red",shape:"dot",text:"error"});
    }

    RED.nodes.registerType('apply discount', YaasApplyDiscount);

};
