module.exports = {
    name: 'mute',
    description: 'Mutes a player in-game and in Discord',
    usage: '<player> [time] <reason>',
    aliases: ['tempmute'],
    example: 'mute Captain_Sisko 1m test',
    args: true,
    cooldown: 3,
    guildOnly: true,
    staffOnly: true,
    async execute(message, args, depend) {
        const log = depend['log'];
        const redis_client = depend['redis_client'];
        const config = depend['config'];
        const Discord = depend['discord_lib'];
        const pool = depend['sql_pool'];

        const timeRegex = new RegExp('[1-9]+(?:\\.\\d+)?\\s*[s|sec|seconds|m|min|minutes|h|hours|d|days]');

        if(message.content.length > 200) {
            message.channel.send(new Discord.MessageEmbed()
            .setColor("#E74C3C")
            .setDescription(`\n:x: **Please limit your mute command to 200 characters or less.**`));
        } else if (args.length < 2) {
            message.channel.send(new Discord.MessageEmbed()
            .setColor("#E74C3C")
            .setDescription(`\n:x: **You must specify a time and/or reason for punishment.**`));
        } else if (args.length === 2 && timeRegex.test(args[1])) {
            message.channel.send(new Discord.MessageEmbed()
            .setColor("#E74C3C")
            .setDescription(`\n:x: **You must specify a reason for punishment.**`));
        } else {
            pool.query('SELECT uuid FROM litebans_history WHERE name = ?', args[0], (err, res) => {
                if(err) log.error(err);
                if(res[0] === undefined) {
                    message.channel.send(new Discord.MessageEmbed()
                    .setColor("#E74C3C")
                    .setDescription(`\n:x: **Player ${args[0]} was not found.**`));        
                } else {
                    redis_client.publish('minecraft.console.hub.in', 'mute ' + args.join(' ') + ' via Discord by ' + message.member.displayName);
                    message.channel.send(new Discord.MessageEmbed()
                    .setColor(config.colour)
                    .setDescription(`:white_check_mark: ** ${args[0]} has been muted.**`)
                    .setTimestamp());
        
                }
            });
        }

       
    }
}