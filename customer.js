module.exports = function(RED) {

    var YaaS = require("yaas.js");

    function YaasCustomerSignupNode(config) {
        RED.nodes.createNode(this, config);
        
        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.tenant_id = config.tenantId;

        this.status({fill: "red", shape: "ring", text: "disconnected"});

        var yaas = new YaaS();
        yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret,
            '', this.tenant_id)
        .then(() => {
          this.status({fill: "yellow", shape: "dot", text: "request sent"});
          this.on("input", msg => {
            if(!msg.payload.email || !msg.payload.password || msg.payload.password.length < 6) {
              this.warn("Missing or wrong customer credentials, please supply email and password (6 or more characters).");
              this.status({fill: "red", shape: "dot", text: "error during signup"});
            } else {
              yaas.customer.signup(msg.payload)
                .then(response => {
                  this.status({fill: "green", shape: "dot", text: response.body.id});
                  msg.payload = response.body.id;
                  this.send(msg);
                })
                .catch(error => {
                  this.status({fill: "red", shape: "dot", text: "error during signup"});
                  console.error(JSON.stringify(error));
                });
            }
          });
        });
    }

    RED.nodes.registerType("customer signup", YaasCustomerSignupNode);

    function YaasUpdateCustomerNode(config) {
        RED.nodes.createNode(this, config);
        
        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.tenant_id = config.tenantId;

        this.status({fill: "red", shape: "ring", text: "disconnected"});

        var yaas = new YaaS();
        yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret,
            'hybris.customer_update', this.tenant_id)
        .then(() => {
          this.status({fill: "yellow", shape: "dot", text: "request sent"});
          this.on("input", msg => {
            if(!msg.payload.firstName || !msg.payload.lastName) {
              this.warn("Missing customer firstName and/or lastName.");
              this.status({fill: "red", shape: "dot", text: "error during customer update"});
            } else {
              msg.payload.preferredSite = msg.payload.preferredSite || "main";
              var customerNumber = msg.payload.customerNumber;
              delete msg.payload.customerNumber;
              yaas.customer.updateCustomer(customerNumber, msg.payload)
                .then(response => {
                  this.status({fill: "green", shape: "dot", text: "customer " +
                    customerNumber + " updated"});
                  msg.payload = customerNumber;
                  this.send(msg);
                })
                .catch(error => {
                  this.status({fill: "red", shape: "dot", text: "error during customer update"});
                  console.error(JSON.stringify(error));
                });
            }
          });
        });
    }

    RED.nodes.registerType("update customer", YaasUpdateCustomerNode);
};
