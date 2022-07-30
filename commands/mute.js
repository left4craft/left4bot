const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'mute',
	description: 'Mutes a player in-game and in Discord',
	usage: '<username/Discord tag/Discord id/uuid> [time] <reason>',
	example: 'mute Captain_Sisko 1m test',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => 
			option.setName('player')
				.setDescription('Enter a Username, Discord Tag, Discord ID, or UUID')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('reason')
				.setDescription('Enter the mute reason')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('duration')
				.setDescription('Enter the mute duration')
				.setRequired(false)),
	args: true,
	guildOnly: true,
	staffOnly: true,
	async execute(interaction, depend) {

		const {
			config,
			discord_lib: Discord,
			log,
			sql_pool: pool,
			player_util,
			redis_client,
		} = depend;

		const player = interaction.options.getString('player');
		const reason = interaction.options.getString('reason');
		const duration = interaction.options.getString('duration');

		const timeRegex = new RegExp('[1-9]+(?:\\.\\d+)?\\s*[s|sec|seconds|m|min|minutes|h|hours|d|days]');

		if(reason.length > 180) {
			interaction.reply({embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setDescription('\n❌ **Please limit your mute reason to 180 characters or less.**')]});
		} else if (duration && !timeRegex.test(duration)) {
			interaction.reply({embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setDescription('\n❌ **Your mute duration is invalid.**')]});
		} else {
			await interaction.deferReply();
			player_util.get_uuid(player, pool, log, async (uuid) => {
				if(uuid === null) {
					await interaction.editReply({embeds: [new Discord.EmbedBuilder()
						.setColor(config.color.fail)
						.setDescription(`\n❌ **Could not find player by \`${player}\`.`
                     + ' Please use a Minecraft username, Minecraft UUID, Discord tag, or Discord user id**')]});    
				} else {
					player_util.get_player_info(uuid, pool, redis_client, log, async (player_data) => {
						if(player_data === null) {
							await interaction.editReply({embeds: [new Discord.EmbedBuilder()
								.setColor(config.color.fail)
								.setDescription(`\n❌ **Error getting data for uuid \`${uuid}\`.`)]});
						} else {
							redis_client.publish('minecraft.console.hub.in', 'mute ' + uuid + ' ' + (duration || '') + ' ' + reason + ' via Discord by ' + interaction.member.displayName);
							await interaction.editReply({embeds: [new Discord.EmbedBuilder()
								.setColor(config.color.success)
								.setDescription(`✅ ** ${player_data['username']} has been muted.**`)
								.setTimestamp()]});
						}
					});
				}
			});
		}
	}
};