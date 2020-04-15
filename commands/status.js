const Discord = require("discord.js");
const config = require("../config.js");
const log = require("leekslazylogger");
const fetch = require('node-fetch');
module.exports = {
    name: 'status',
    description: 'Get server status information',
    usage: '',
    aliases: ['info', 'serverInfo'],
    example: 'status',
    args: false,
    cooldown: config.cooldown,
    guildOnly: true,
    adminOnly: false,
    async execute(message, args) {
        const client = message.client;
        // command starts here
        if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
            message.delete()
        };


        fetch(`https://mcapi.ca/ping/players/${config.ip}`).then(res => res.json())
            .then(json => {
                let status = json.status ? "online" : "offline";

                message.channel.send(
                    new Discord.MessageEmbed()
                    .setColor(config.colour)
                    .setTitle(`${config.name} is ${status}`)
                    .setDescription(`**${json.players.online}** people are playing on **${config.ip}**\n\nType \`list\` in <#${config.chat_bridge_chan_id}> for a list of online players.`)
                    .setFooter(config.name, client.user.avatarURL())
                    .setTimestamp()
                );
            });

    }
}