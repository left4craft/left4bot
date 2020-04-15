const Discord = require("discord.js");
const config = require("../config.js");
const log = require("leekslazylogger");
const fetch = require('node-fetch');
module.exports = {
    name: 'ping',
    description: 'Calculate latency',
    usage: '',
    aliases: ['none'],
    example: 'ping',
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

        message.channel.startTyping();
        const m = await message.channel.send("Calculating ping...");
        m.edit("...");
        m.delete();

        message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle(`Pong!`)
            .addField("Latency", `\`${m.createdTimestamp - message.createdTimestamp}ms\``, true)
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp()
        );
        message.channel.stopTyping();


    }
}