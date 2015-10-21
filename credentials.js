module.exports = function(RED) {
    function YaasCredentialsNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        node.client_id = n.client_id;
        node.application_id = n.application_id;

        if (node.credentials) {
            node.client_secret = node.credentials.client_secret;
        }

        var parts = node.application_id.split('.');

        node.tenant = parts[0];
        node.application = parts[1];
    }
    
    RED.nodes.registerType("yaas-credentials",YaasCredentialsNode,{
        credentials: {
            client_secret: {type: "password"}
        }
    }); 
}