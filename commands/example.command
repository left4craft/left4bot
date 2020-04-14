const Discord = require("discord.js");
const config = require("../config.js");
const log = require("leekslazylogger");
module.exports = {
    name: 'example',
    description: 'desc',
    usage: 'dont include cmd',
    aliases: ['none'],
    example: 'example usage',
    args: false,
    cooldown: config.cooldown,
    guildOnly: true,
    adminOnly: false,
    async execute(message, args) {
        const client = message.client;
        // command starts here
        // if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
        //     message.delete()
        // };

       
    }
}