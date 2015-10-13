module.exports = function(RED) {
   
    var request = require("request");
    var oauth2 = require('./lib/oauth2.js');
    var pubsub = require('./lib/pubsub.js');
 

    function YaasPubsubSubscribeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.client_id = config.clientId;
        node.client_secret = config.clientSecret;
        node.application_id = config.applicationId;
        node.topic = config.topic;
        node.interval = config.interval;

        node.status({fill:"red",shape:"ring",text:"disconnected"});
        
        //get oauth2 access token
        oauth2.getClientCredentialsToken(node.client_id, node.client_secret, [])
        .then(function(access_token) {
            node.status({fill:"green",shape:"dot",text:"connected"});  

            //start inteval polling
            node.intervalID = setInterval(function(){
                pubsub.readNext(access_token, node.application_id, node.topic)
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

/*         
    function MotoOutNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.namespace = config.namespace || 'default';
        node.motoid = config.motoid || '1';
        node.broker = config.broker;
        node.brokerConfig = RED.nodes.getNode(node.broker);
        
        node.status({fill:"red",shape:"ring",text:"disconnected"});
        node.client = connectionPool.get(node.brokerConfig.broker,node.brokerConfig.port,node.brokerConfig.clientid,node.brokerConfig.username, node.brokerConfig.password);

        node.on("input",function(msg) {
            //node.log("R: " + config.r + " | G: " + config.g + " | B: " + config.b + " | MotorOnOff: " + config.motorOnOff + " | MotorDirection: " + config.motorDirection + " | motoSpeed: " + config.motorSpeed);
            console.log(msg.payload);

            msg.qos = 0;
            msg.retain = false;
            msg.topic = 'moto/' + node.namespace + '/' + node.motoid + '/command';
            
            if (msg.payload != null && msg.payload.mode == undefined)
                msg.payload = commandObj(config.r, config.g, config.b, config.motorOnOff ? 1 : 0, config.motorDirection, config.motorSpeed);
             
            node.client.publish(msg);  // send the message
        });

        node.client.on("connectionlost",function() {
            node.status({fill:"red",shape:"ring",text:"disconnected"});
        });

        node.client.on("connect",function() {
            node.status({fill:"green",shape:"dot",text:"connected"});
        });
        
        if (node.client.isConnected()) {
            node.status({fill:"green",shape:"dot",text:"connected"});
        } else {
            node.log("MQTT Client not connected, connecting...");
            node.client.connect();
        }

      

        node.on('close', function() {
            if (this.client) {
                console.log("Disconnecting from MQTT Client...");
                this.client.disconnect();
            }
        });
    }

    RED.nodes.registerType("moto out",MotoOutNode);
*/

}
