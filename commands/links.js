const Discord = require("discord.js");
const config = require("../config.js");
const log = require("leekslazylogger");
const fetch = require('node-fetch');
module.exports = {
    name: 'links',
    description: 'Useful pages',
    usage: '',
    aliases: ['web', 'website', 'shop', 'store', 'donate', 'forums', 'invite', 'discord', 'bans'],
    example: 'links',
    args: false,
    cooldown: 10,
    guildOnly: true,
    adminOnly: false,
    async execute(message, args) {
        const client = message.client;
        // command starts here
        // if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
        //     message.delete()
        // };

        const links = config.links; 


        let embed = new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle(`Links`)
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp();

        for (link of links) {
            embed.addField(link.name, `[${link.pretty}](${link.url})`, true)
        };


        message.channel.send(embed);



    }
}