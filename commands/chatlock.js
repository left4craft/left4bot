module.exports = {
	name: 'chatlock',
	description: 'Lock in-game chat and require unverified players to verify',
	usage: '',
	aliases: ['lockdown'],
	example: 'chatlock',
	args: false,
	guildOnly: true,
	staffOnly: true,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
			log,
			redis_client,
		} = depend;

		
		redis_client.publish('minecraft.console.hub.in', 'chatlock');
		log.info(`${message.author.username} has locked/unlocked chat`);
		message.channel.send(
			new Discord.MessageEmbed()
				.setColor(config.colour)
				.setTitle('✅ Sent chatlock command')
				.setDescription('Chat has been locked/unlocked')
				.setFooter(config.name, client.user.avatarURL())
				.setTimestamp()
		);

	}
};