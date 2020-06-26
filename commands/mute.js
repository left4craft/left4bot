const Discord = require("discord.js");
const config = require("../config.js");
const log = require("leekslazylogger");

module.exports = {
    name: 'mute',
    description: 'Mutes a player in-game and in Discord',
    usage: '<player> [time] <reason>',
    aliases: ['tempmute'],
    example: 'mute Captain_Sisko 1m test',
    args: true,
    cooldown: config.cooldown,
    guildOnly: true,
    adminOnly: true,
    async execute(message, args, depend) {
        const client = message.client;
        const timeRegex = new RegExp('[1-9]+(?:\\.\\d+)?\\s*[s|sec|seconds|m|min|minutes|h|hours|d|days]');
        const log = depend['log'];

        if(message.content.length > 200) {
            message.channel.send(new Discord.MessageEmbed()
            .setColor("#E74C3C")
            .setDescription(`\n:x: **Please limit your mute command to 200 characters or less.**`));
        } else if (args.length < 2) {
            message.channel.send(new Discord.MessageEmbed()
            .setColor("#E74C3C")
            .addField("Usage", `\`${config.prefix}mute <player> [time] <reason>\`\n`)
            .addField("Help", `Type \`${config.prefix}help mute\` for more information`));
        } else if (args.length === 2 && timeRegex.test(args[1])) {
            message.channel.send(new Discord.MessageEmbed()
            .setColor("#E74C3C")
            .setDescription(`\n:x: **You must specify a reason for punishment.**`));
        } else {
            const pool = depend['sql_pool'];
            pool.query('SELECT uuid FROM litebans_history WHERE name = ?', args[0], (err, res) => {
                if(err) log.error(err);
                if(res[0] === undefined) {
                    message.channel.send(new Discord.MessageEmbed()
                    .setColor("#E74C3C")
                    .setDescription(`\n:x: **Player ${args[0]} was not found.**`));        
                } else {
                    depend['redis_client'].publish('minecraft.console.hub.in', 'mute ' + args.join(' ') + ' via Discord by ' + message.member.displayName);
                }
            });
        }

       
    }
}