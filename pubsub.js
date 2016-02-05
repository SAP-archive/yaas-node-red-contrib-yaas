module.exports = function(RED) {
   
    var YaaS = require("yaas.js");

    function YaasPubsubSubscribeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.topic = config.topic;
        node.interval = config.interval;
        node.application_id = (config.application_id == "") ? node.yaasCredentials.application_id : config.application_id;
        node.auto_commit = config.auto_commit;

        node.status({fill:"red",shape:"ring",text:"disconnected"});

        console.log("hybris.pubsub.topic=" + node.application_id + "." + node.topic);

        //get oauth2 access token
        var yaas = new YaaS();
        yaas.init(
          node.yaasCredentials.client_id, // theClientId
          node.yaasCredentials.client_secret, // theClientSecret
          "hybris.pubsub.topic=" + node.application_id + "." + node.topic, // theScope,
          node.application_id // theProjectId
        )
        .then(function(response) {
            node.status({fill:"green",shape:"dot",text:"polling"});

            //start inteval polling
            node.intervalID = setInterval(function(){
                //node.log("Polling for " + node.yaasCredentials.application_id + '/' + node.topic);
                yaas.pubsub.read(node.application_id, node.topic, 1, node.auto_commit)
                .then(function(evt){
                    if (evt != undefined)
                    {
                        console.log("received event: " + JSON.stringify(evt));
                        var theFirstEvent = evt.events[0];
                        theFirstEvent.token = evt.token;
                        node.send(theFirstEvent);
                    }
                    else
                    {
                        // PubSub does not have a new event. All good!
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
        // node.status({fill:"green",shape:"dot",text:"polling"});

        var yaas = new YaaS();
        yaas.init(
          node.yaasCredentials.client_id, // theClientId
          node.yaasCredentials.client_secret, // theClientSecret
          "hybris.pubsub.topic=" + node.application_id + "." + node.topic, // theScope,
          node.application_id // theProjectId
        )
        .then(function(response) {
            yaas.pubsub.createTopic(node.topic)
            .then(function(createTopicBody) {
                console.log("topic " + node.yaasCredentials.application_id + '/' + node.topic + " created.");
            }, function(error) {
              if(error.statusCode == 409) {
                console.log("topic " + node.topic + " already exists.");
              } else {
                console.log("Error! " + JSON.stringify(error));
              }
            });
        
            node.on("input",function(msg) {
              node.log('Publishing ' + node.yaasCredentials.application_id + '/' + node.topic + ': ' + msg.payload);
              yaas.pubsub.publish(node.yaasCredentials.application_id, node.topic, msg.payload)
              .then(function(){
                node.log("Message published.");
              }, console.log);
            });

            node.status({fill:"green",shape:"dot",text:"ready"});  
        });

        node.on('close', function() {
            
        });
    }

    RED.nodes.registerType("publish",YaasPubsubPublishNode);

    function YaasPubsubCommitNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.topic = config.topic;
        node.application_id = node.yaasCredentials.application_id;

        node.status({fill:"red",shape:"ring",text:"disconnected"});
        node.status({fill:"yellow",shape:"dot",text:"no events"});

        node.on("input",function(msg) {

            node.log('Committing ' + node.application_id + '/' + node.topic + ': ' + msg['token']);

            var yaas = new YaaS();
            yaas.init(
              node.yaasCredentials.client_id, // theClientId
              node.yaasCredentials.client_secret, // theClientSecret
              "hybris.pubsub.topic=" + node.application_id + "." + node.topic, // theScope,
              node.application_id // theProjectId
            )
            .then(function(response) {
                node.status({fill:"green",shape:"dot",text:"event received"});
                yaas.pubsub.commit(node.application_id, node.topic, msg["token"])
                .then(function(){
                  node.log("Message committed.");
                }, console.log);
            });

        });

        node.on('close', function() {

        });
    }
    RED.nodes.registerType("commit",YaasPubsubCommitNode);
}
