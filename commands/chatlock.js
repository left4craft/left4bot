const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'chatlock',
	description: 'Locks in-game chat and require unverified players to verify',
	usage: '',
	example: 'chatlock',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description),
	args: false,
	guildOnly: true,
	staffOnly: true,
	async execute(interaction, depend) {
		const client = interaction.client;

		const {
			config,
			discord_lib: Discord,
			log,
			redis_client,
		} = depend;

		
		redis_client.publish('minecraft.console.hub.in', 'chatlock');
		log.info(`${interaction.member.displayName} has locked/unlocked chat`);
		interaction.reply({
			embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('✅ Sent chatlock command')
				.setDescription('Chat has been locked/unlocked')
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()]
		});

	}
};