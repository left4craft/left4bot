module.exports = {
    name: 'suggest',
    description: 'Make a suggestion',
    usage: '<suggestion>',
    aliases: ['request'],
    example: 'suggest add this feature',
    args: true,
    cooldown: require('../config.js').cooldown,
    guildOnly: true,
    adminOnly: false,
    async execute(message, args, depend) {
        const client = message.client;

        const config = depend.config;
        const Discord = depend.discord_lib;
        const log = depend.log;

		let suggestion = args.join(' '); // make it a string again

		const channel = client.channels.cache.get(config.suggestion_chan_id);

 
            // basic with thumbs up and down
            log.info(`${message.author.username} submitted a suggestion`);

            const poll = await channel.send(
                new Discord.MessageEmbed()
                .setColor(config.colour)
                .setTitle(suggestion)
                .setAuthor(message.author.username + '\'s suggestion', message.author.avatarURL())
                .setDescription(`Do you like this idea? \n\n:thumbsup: Yes\n\n:thumbsdown: No`)
                .setFooter(config.name, client.user.avatarURL())
                .setTimestamp()
            );

            await poll.react('👍');
            await poll.react('👎');


        message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle(':thumbsup: Suggestion submitted')
            .setDescription(`**»** Go to <#${config.suggestion_chan_id}> to view`)
            .addField("Suggestion", suggestion, false)
        ); // success message


        client.channels.cache.get(config.log_chan_id).send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle('Suggestion submitted')
            .setAuthor(message.author.username, message.author.avatarURL())
            .addField("By", message.author.tag, true)
            .addField("Suggestion", suggestion, false)
            .addField("Options", options.length, true)
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp()
        ); // log channel message

    }
}