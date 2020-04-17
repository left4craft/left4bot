const Discord = require("discord.js");
const config = require("../config.js");
const log = require("leekslazylogger");
const query = require('minecraft-server-util');
module.exports = {
    name: 'status',
    description: 'Get server status information',
    usage: '',
    aliases: ['info', 'serverInfo'],
    example: 'status',
    args: false,
    cooldown: 60,
    guildOnly: true,
    adminOnly: false,
    async execute(message, args) {
        const client = message.client;
        // command starts here
        if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
            message.delete()
        };

        query(config.ip, config.port)
            .then((res) => {
                // console.log(res);
                log.console(`${config.name} is ${log.colour.greenBright(`online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? "player" : "players"}`)}${log.colour.white(", updating status category")}`); // log status - online

                client.channels.cache.get(config.status_cat_id).setName(`online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? "player" : "players"}`); // cat name

                client.user.setStatus("online"); // green status

                message.channel.send(
                    new Discord.MessageEmbed()
                    .setColor(config.colour)
                    .setTitle(`${config.name} is online`)
                    .setDescription(`**${res.onlinePlayers}** ${res.onlinePlayers === 1 ? "person" : "people"} are playing on **${config.ip}**\n\nType \`list\` in <#${config.chat_bridge_chan_id}> for a list of online players.`)
                    .setFooter(config.name, client.user.avatarURL())
                    .setTimestamp()
                );

            })
            .catch((err) => {
                log.console(`${config.name} is ${log.colour.redBright("offline")}`); // log status - offline

                client.channels.cache.get(config.status_cat_id).setName('server is offline (!status)'); // cat name

                client.user.setStatus("dnd"); // red status

                message.channel.send(
                    new Discord.MessageEmbed()
                    .setColor(config.colour)
                    .setTitle(`${config.name} is offline`)
                    .setDescription(`${config.name} is currently offline. Check the status page [here](${config.status_page}) and alert staff if there are no incidents reported.`)
                    .setFooter(config.name, client.user.avatarURL())
                    .setTimestamp()
                );

                // throw err;
            });


    }
}