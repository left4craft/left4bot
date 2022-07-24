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
		message.channel.send({
			embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('✅ Sent chatlock command')
				.setDescription('Chat has been locked/unlocked')
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()]
		});

	}
};