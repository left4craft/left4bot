module.exports = {
    name: 'chatlock',
    description: 'Lock in-game chat and require unverified players to verify',
    usage: '',
    aliases: ['lockdown'],
    example: 'chatlock',
    args: false,
    cooldown: 3,
    guildOnly: true,
    staffOnly: true,
    async execute(message, args, depend) {
		const client = message.client;

		const log = depend['log'];
		const config = depend.config;
		const redis_client = depend['redis_client'];
		const Discord = depend.discord_lib;
		
		redis_client.publish('minecraft.console.hub.in', 'chatlock');
		log.info(`${message.author.username} has locked/unlocked chat`);
		message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle(':white_check_mark: Sent chatlock command')
            .setDescription('Chat has been locked/unlocked')
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp()
        );

    }
}