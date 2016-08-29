'use strict';

module.exports = function(RED) {
   
    var YaaS = require('yaas.js');

    var poll = {};
    poll.count = 5;
    poll.delta = 1;
    poll.max = 10;
    poll.toString = function() {
      var str = '';
      for (var i = 0; i < this.max; i++) {
        if (this.count === i) {
          str += (this.delta > 0) ? '>' : '<';
        } else {
          str += '-';
        }
      }
      this.count += this.delta;
      if (this.count >= this.max || this.count < 0) {
        this.delta *= -1;
        this.count += this.delta * 2;
      }
      return str;
    };

    function YaasPubsubReadNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);

        node.topic_owner_client = config.topic_owner_client;
        if (config.topic_owner_client === '') {
            node.topic_owner_client = node.yaasCredentials.application_id;
        }

        node.event_type = config.event_type;
        node.topic = node.topic_owner_client + '.' + node.event_type;

        node.interval = config.interval;
        node.number_of_events = config.number_of_events || 1;
        node.auto_commit = config.auto_commit;

        node.status({fill:'red',shape:'ring',text:'disconnected (' + node.topic + ')'});
        console.log('hybris.pubsub.topic=' + node.topic);

        //get oauth2 access token
        var yaas = new YaaS();
        yaas.init(
          node.yaasCredentials.client_id, // theClientId
          node.yaasCredentials.client_secret, // theClientSecret
          'hybris.pubsub.topic=' + node.topic, // theScope,
          node.yaasCredentials.application_id // theProjectId
        )
        .then(function() {
            node.status({fill:'yellow',shape:'dot',text:'polling'});

            //start inteval polling
            node.intervalID = setInterval(function() {
                node.status({fill:'green',shape:'dot',text:'polling ' + poll.toString()});
                yaas.pubsub.read(node.topic_owner_client, node.event_type, node.number_of_events, node.auto_commit)
                .then(function(evt) {
                    if (evt !== undefined) {
                        console.log('received event: ' + JSON.stringify(evt));
                        var theFirstEvent = evt.events[0];
                        theFirstEvent.token = evt.token;
                        node.send(theFirstEvent);
                    }
                }, function(err) {
                    node.status({fill:'red',shape:'dot',text:'error: ' + err});
                    console.error('ERROR pubsub read:', err);
                });

            }, node.interval);

        }, console.log);

        node.on('close', function() {
            if (node.intervalID) {
                clearInterval(node.intervalID);
            }
        });
    }
    RED.nodes.registerType('pubsub_read',YaasPubsubReadNode);

    function YaasPubsubPublishNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.application_id = node.yaasCredentials.application_id;
        node.event_type = config.event_type;
        node.topic = node.application_id + '.' + node.event_type;
        
        node.status({fill:'red',shape:'ring',text:'disconnected'});

        var yaas = new YaaS();
        yaas.init(
          node.yaasCredentials.client_id, // theClientId
          node.yaasCredentials.client_secret, // theClientSecret
          'hybris.pubsub.topic=' + node.topic, // theScope,
          node.application_id // theProjectId
        )
        .then(function() {
            yaas.pubsub.createTopic(node.event_type)
            .then(function() {
                console.log('topic', node.topic, 'created.');
            }, function(error) {
              if(error.statusCode === 409) {
                console.log('INFO: topic', node.topic, 'exists.');
              } else {
                console.log('error pubsub publish:', JSON.stringify(error));
                try {
                    node.status({fill:'red',shape:'ring',text:'error: ' + error.body.details[0].message});
                } catch(e) {
                    node.status({fill:'red',shape:'ring',text:'error: ' + JSON.stringify(error)});
                }
              }
            });

            node.on('input',function(msg) {
              node.log('Publishing', node.topic, ':', msg.payload);
              yaas.pubsub.publish(node.application_id, node.event_type, msg.payload)
              .then(function() {
                node.log('published:', msg.payload);
                node.status({fill:'green',shape:'dot',text:'published: ' + msg.payload}); 
              }, console.log);
            });

            node.status({fill:'green',shape:'dot',text:'ready'});  
        });
    }
    RED.nodes.registerType('pubsub_publish',YaasPubsubPublishNode);

    function YaasPubsubCommitNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.yaasCredentials = RED.nodes.getNode(config.yaasCredentials);
        node.application_id = node.yaasCredentials.application_id;
        node.event_type = config.event_type;
        node.topic = node.application_id + '.' + node.event_type;

        node.status({fill:'red',shape:'ring',text:'disconnected'});

        node.on('input',function(msg) {

            node.log('Committing', node.topic, ':', msg.token);

            var yaas = new YaaS();
            yaas.init(
              node.yaasCredentials.client_id, // theClientId
              node.yaasCredentials.client_secret, // theClientSecret
              'hybris.pubsub.topic=' + node.topic, // theScope,
              node.application_id // theProjectId
            )
            .then(function() {
                node.status({fill:'green',shape:'dot',text:'event received'});
                yaas.pubsub.commit(node.application_id, node.event_type, msg.token)
                .then(function(){
                  node.log('Message committed:', msg.token);
                }, function(err) {
                    node.status({fill:'red',shape:'dot',text:'error: ' + err});
                    console.error('ERROR pubsub commit:', err);
                });
            });
        });
    }
    RED.nodes.registerType('pubsub_commit',YaasPubsubCommitNode);
};
