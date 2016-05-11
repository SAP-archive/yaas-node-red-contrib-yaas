module.exports = function(RED) {
    var recommenderBasePath = '/icn/recommender/v1/{{projectId}}/recommendations';

    var YaaS = require("yaas.js");

    function YaasRecommendationGetNode(config) {
        RED.nodes.createNode(this, config);

        this.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        this.tenant_id = config.tenantId;
        this.status({fill: "yellow", shape: "ring", text: "idle"});

        var yaas = new YaaS();
        yaas.init(this.yaasCredentials.client_id, this.yaasCredentials.client_secret, 'ml.recommender_view', this.tenant_id)
        .then(() => {
            this.on("input", msg => {
                var productCode = msg.payload.code || msg.payload;
                    
                this.status({fill: "yellow", shape: "dot", text: "Getting recommendations for " + productCode});

                var params = {
                    productCode : productCode,
                    recommendationCount : 2
                };

                yaas.requestHelper.get(recommenderBasePath, params)
                .then(response => {
                    this.status({fill: "green", shape: "dot", text: "Received " + response.body.length + " recommendations"});
                    this.send({payload: response.body});
                })
                .catch(error => {
                    this.error("Error while getting recommendations for " + productCode);
                    this.status({fill: "red", shape: "dot", text: "Error while getting recommendations for " + productCode});
                    console.error(JSON.stringify(error));
                });
            });
        });
    }

    RED.nodes.registerType("get recommendation", YaasRecommendationGetNode);

};
