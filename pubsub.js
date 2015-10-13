module.exports = function(RED) {
   
    var request = require("request");
    var oauth2 = require('./lib/oauth2.js');
    var pubsub = require('./lib/pubsub.js');


    function YaasPubsubSubscribeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);


        node.topic = config.topic;
        node.interval = config.interval;

        node.status({fill:"red",shape:"ring",text:"disconnected"});
        
        //get oauth2 access token
        oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
        .then(function(access_token) {
            node.status({fill:"green",shape:"dot",text:"polling"});  

            //start inteval polling
            node.intervalID = setInterval(function(){
                node.log("Polling for " + node.yaasCredentials.application_id + '/' + node.topic);
                pubsub.readNext(access_token, node.yaasCredentials.application_id, node.topic)
                .then(function(evt){
                    if (evt != undefined)
                    {
                        node.send(evt.events[0]); 
                    }
                    else
                    {

                    }
                }, console.log);
                

                
            }, node.interval);            

        }, console.log);        

        node.on('close', function() {
            if (node.intervalID) {
                clearInterval(node.intervalID);
            }
        });
    }

    RED.nodes.registerType("subscribe",YaasPubsubSubscribeNode);

    function YaasPubsubPublishNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.topic = config.topic;
        
        node.status({fill:"red",shape:"ring",text:"disconnected"});

        oauth2.getClientCredentialsToken(node.yaasCredentials.client_id, node.yaasCredentials.client_secret, [])
        .then(function(access_token) {
            node.access_token = access_token;

            pubsub.createTopic(node.access_token, node.topic)
            .then(function(createTopicBody){
                if (createTopicBody.status != 409) {
                    node.log("topic " + node.yaasCredentials.application_id + '/' + node.topic + " created.");
                }
            }, console.log);

            node.status({fill:"green",shape:"dot",text:"ready"});  
        }, console.log);     
       
        node.on("input",function(msg) {

            if (!node.access_token)
            {
                node.error("No access_token, no publish!");
                return;
            }

            node.log('Publishing ' + node.yaasCredentials.application_id + '/' + node.topic + ': ' + msg.payload);

            pubsub.publish(node.access_token, node.yaasCredentials.application_id, node.topic, msg.payload)
            .then(function(){
                node.log("Message published.");
            }, console.log);

        });


        node.on('close', function() {
            
        });
    }

    RED.nodes.registerType("publish",YaasPubsubPublishNode);


}
