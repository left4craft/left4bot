module.exports = {
    name: 'say',
    description: 'Make the bot say something',
    usage: '<message>',
    aliases: ['echo'],
    example: 'say ok',
    args: true,
    cooldown: require('../config.js').cooldown,
    guildOnly: true,
    adminOnly: true,
    async execute(message, args, depend) {
        const client = message.client;

        const config = depend.config;
        const Discord = depend.discord_lib;
        const log = depend.log;

        // command starts here
        if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
            message.delete()
        };

        const text = args.join(" "); 

        message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(text)
        );

        client.channels.cache.get(config.log_chan_id).send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle(`${message.author.username} said`)
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(text)
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp()
        ); // log channel message

       
    }
}