module.exports = function(RED) {

    var YaaS = require("yaas.js");


    function missesRequirements(obj, req){
      var missing = [];
      for(var r of req){
        if(!obj[r]) {
          missing.push(r);
        }
      }
      return missing.length ? missing : false;
    }

    function YaasCustomerSignupNode(config) {
        RED.nodes.createNode(this, config);
        
        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.tenant_id = config.tenantId;

        this.status({fill: "yellow", shape: "ring", text: "idle"});

        var yaas = new YaaS();
        yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret, '', this.tenant_id)
        .then(() => {
          this.status({fill: "yellow", shape: "dot", text: "Token received"});
          this.on("input", msg => {
            var missingRequirements = missesRequirements(msg.payload, ["email", "password"]);
            if(missingRequirements){
              this.error("Missing required fields: " + JSON.stringify(missingRequirements));
              this.status({fill: "red", shape: "dot", text: "Missing fields (" +missingRequirements.length + ")"});
            }
            else if(msg.payload.password.length < 6) {
              this.error("Password too short (at least 6 characters)");
              this.status({fill: "red", shape: "dot", text: "Password too short"});
            } else {
              yaas.customer.signup(msg.payload)
                .then(response => {
                  this.status({fill: "green", shape: "dot", text: "Signed up as: " + response.body.id});
                  msg.payload = response.body.id;
                  this.send(msg);
                })
                .catch(error => {
                  this.status({fill: "red", shape: "dot", text: "error during signup"});
                  this.error("error during singup");
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

        this.status({fill: "yellow", shape: "ring", text: "idle"});

        var yaas = new YaaS();
        yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret,
            'hybris.customer_update', this.tenant_id)
        .then(() => {
          this.status({fill: "yellow", shape: "dot", text: "Token received"});
          this.on("input", msg => {
            var missingRequirements = missesRequirements(msg.payload, ["firstName", "lastName"]);
            if(missingRequirements){
              this.error("Missing required fields: " + JSON.stringify(missingRequirements));
              this.status({fill: "red", shape: "dot", text: "Missing fields (" +missingRequirements.length + ")"});
            }else {
              msg.payload.preferredSite = msg.payload.preferredSite || "main";
              var customerNumber = msg.payload.customerNumber;
              delete msg.payload.customerNumber;
              yaas.customer.updateCustomer(customerNumber, msg.payload)
                .then(response => {
                  this.status({fill: "green", shape: "dot", text: "Customer " + customerNumber + " updated"});
                  msg.payload = customerNumber;
                  this.send(msg);
                })
                .catch(error => {
                  this.error("error during customer update");
                  this.status({fill: "red", shape: "dot", text: "error during customer update"});
                  console.error(JSON.stringify(error));
                });
            }
          });
        });
    }

    RED.nodes.registerType("update customer", YaasUpdateCustomerNode);
    
    function YaasCustomerAddressNode(config) {
        RED.nodes.createNode(this, config);
        
        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.tenant_id = config.tenantId;

        this.status({fill: "yellow", shape: "ring", text: "idle"});

        var yaas = new YaaS();
        yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret, 'hybris.customer_update', this.tenant_id)
        .then(() => {
          this.status({fill: "yellow", shape: "dot", text: "Token received"});
          this.on("input", msg => {
            var missingRequirements = missesRequirements(msg.payload, ["street", "streetNumber", "zipCode", "city", "country"]);
            if(missingRequirements){
              this.error("Missing required fields: " + JSON.stringify(missingRequirements));
              this.status({fill: "red", shape: "dot", text: "Missing fields (" +missingRequirements.length + ")"});
            } else {
              var customerNumber = msg.payload.customerNumber;
              delete msg.payload.customerNumber;
              console.log("hier", msg.payload);
              yaas.customer.createCustomerAddress(customerNumber, msg.payload)
                .then(response => {
                  this.status({fill: "green", shape: "dot", text: "New address for customer " + customerNumber + " created"});
                  msg.payload = customerNumber;
                  this.send(msg);
                })
                .catch(error => {
                  this.error("error during customer address creation");
                  this.status({fill: "red", shape: "dot", text: "error during customer address creation"});
                  console.error(JSON.stringify(error));
                });
            }
          });
        });
    }

    RED.nodes.registerType("customer address", YaasCustomerAddressNode);
};
