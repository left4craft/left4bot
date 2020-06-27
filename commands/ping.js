module.exports = {
    name: 'ping',
    description: 'Calculate latency',
    usage: '',
    aliases: ['none'],
    example: 'ping',
    args: false,
    cooldown: 10,
    guildOnly: true,
    adminOnly: false,
    async execute(message, args) {
        const client = message.client;

        const config = depend.config;
        const Discord = depend.discord_lib;
        const log = depend.log;
        const fetch = depend.fetch

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