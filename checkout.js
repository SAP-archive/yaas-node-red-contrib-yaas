module.exports = function(RED) {

    var uglycart = require('./lib/UGLYCART.js');
    var YaaS = require("yaas.js");

    var payment = require('./lib/payment.js');

    function YaasCheckoutNode(config) {
        RED.nodes.createNode(this, config);

        var yaas = new YaaS();

        this.yaasCustomerCredentials =  RED.nodes.getNode(config.yaasCustomerCredentials);

        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.stripeCredentials = RED.nodes.getNode(config.stripeCredentials);
        this.tenant_id = this.yaasCredentials.application_id.split(".")[0];

        this.currency = config.currency;
        this.siteCode = config.siteCode;

        this.status({fill:"yellow",shape:"dot",text:"idle"});

        this.on('input', msg => {
            var email = this.yaasCustomerCredentials.email;
            var inputEmail = "" + msg.payload;
            if (inputEmail.indexOf('@') > 0) {
                // the input seems to be an email (and not a twitter account)
                email = inputEmail;
            }
            var cartId;
            var customer;
            var addresses;

            yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret, 'hybris.checkout_manage hybris.customer_read hybris.cart_manage', this.tenant_id)
            .then(() => yaas.customer.getCustomers({q: 'contactEmail:"' + email + '"', expand: 'addresses'}))
            .then(response => {
                customer = response.body[0];
                customer.email = email; // TODO: uuh wow nice inconsistency here

                addresses = [
                    Object.assign({}, customer.addresses[0]),
                    customer.addresses.length > 1 ? Object.assign({}, customer.addresses[1]) : Object.assign({}, customer.addresses[0])
                ];
                delete customer.addresses;

                addresses[0].type = "BILLING";
                addresses[1].type = "SHIPPING";

                this.status({fill:"yellow", shape:"dot", text: "got customer with id " + customer.customerNumber});
                return uglycart.getCartByCustomerId(yaas, customer.customerNumber, this.siteCode, this.currency);
            })
            .then(cart => {
                cartId = cart.cartId;
                this.status({fill:"yellow", shape:"dot", text: "got cart id " + cartId});
                return payment.getToken(this.stripeCredentials);
            })
            .then(stripeToken => {
                this.status({fill:"yellow", shape:"dot", text: "got stripe token " + stripeToken});
                var obj = {
                    payment : {
                        paymentId : "stripe",
                        customAttributes : {
                            token : stripeToken
                        }
                    },
                    cartId : cartId,
                    customer : customer,
                    addresses : addresses,
                    currency : this.currency,
                    siteCode : this.siteCode
                };
                return yaas.checkout.checkout(obj);
            })
            .then(response => {
                this.send({payload : response.body.orderId});
                this.status({fill:"green", shape:"dot", text: "order created: " + response.body.orderId});
            })
            .catch(error => {
                console.log("error");
                error = error.body ? error.body.details[0].message : error;
                this.status({fill:"red", shape:"dot", text: "error: " + error});
                console.error(error);
            });
        });
    }
    RED.nodes.registerType('checkout', YaasCheckoutNode);



    // TODO: AAAHH WAS IST DAS
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
