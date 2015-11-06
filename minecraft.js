module.exports = function(RED) {
   
    var request = require('request');
    var oauth2 = require('./lib/oauth2.js');
    var productdetails = require('./lib/productdetails.js');
    var minecraft = require('./lib/minecraft.js');

    function MinecraftBlockId(config) {

        RED.nodes.createNode(this, config);
        var node = this;

        node.minecraftConfig = RED.nodes.getNode(config.server);
        if (!node.minecraftConfig) {
            console.log('A MinecraftBlockId server is not defined :(');
            return;
        }
        minecraft.connect(node.minecraftConfig.host, node.minecraftConfig.port)
        .then(function(mc_connection) {
        //    console.log(str)});

            node.intervalID = setInterval(function(){
                //console.log('NODE mc=' + mc_connection);
                minecraft.blockId(mc_connection)
                .then(function(blockId) {
                    node.send({payload: blockId});
                })
                .catch(function(err) {
                    console.error('minecraft blockid error: ' + err);
                });
            }, config.interval);

            node.on('close', function() {
                console.log('NODE Minecraft close');
                minecraft.close(mc_connection);
              // TODO close node.intervalID
            });
        })
        .catch(function(err) {
            console.error('minecraft connect error: ' + err);
        });

    }

    RED.nodes.registerType('blockid', MinecraftBlockId);

    function MinecraftSetBlock(config) {

        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            console.log('set block for this payload: ' + JSON.stringify(msg.payload));

            node.minecraftConfig = RED.nodes.getNode(config.server);
            if (!node.minecraftConfig) {
                console.log('A MinecraftBlockId server is not defined :(');
                return;
            }
            minecraft.connect(node.minecraftConfig.host, node.minecraftConfig.port)
            .then(function(mc_connection) {

//console.log("node=" + JSON.stringify(node));
//console.log("config=" + JSON.stringify(config));
                console.log("setblock with blockid=" +  config.blocktype + " data=" + config.blockdata + " payload=" + JSON.stringify(msg.payload));
                minecraft.setBlock(mc_connection, config.blocktype, config.blockdata, msg.payload);
            });

        });

    }

    RED.nodes.registerType('setblock', MinecraftSetBlock);



};
