module.exports = function(RED) {
   
    var request = require('request');
    var oauth2 = require('./lib/oauth2.js');
    var productdetails = require('./lib/productdetails.js');
    var minecraft = require('./lib/minecraft.js');

    function MinecraftBlockId(config) {

        RED.nodes.createNode(this, config);
        var node = this;

        node.minecraftConfig = RED.nodes.getNode(config.server);
        minecraft.connect(node.minecraftConfig.host, node.minecraftConfig.port);

        node.intervalID = setInterval(function(){
            minecraft.blockId("")
            .then(function(blockId) {
                node.send({payload: blockId});
            })
            .catch(function(e){
                console.error(e);
            });
        }, config.interval);

        node.on('close', function() {
          minecraft.close();
        });
        
    }

    RED.nodes.registerType('blockid', MinecraftBlockId);
};
