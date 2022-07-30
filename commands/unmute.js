const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'unmute',
	description: 'Unmutes a player in-game and in Discord',
	usage: '<username/Discord tag/Discord id/uuid>',
	example: 'unmute Captain_Sisko',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => 
			option.setName('player')
				.setDescription('Enter a Username, Discord Tag, Discord ID, or UUID')
				.setRequired(true)),
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

		const player_query = interaction.options.getString('player');

		await interaction.deferReply();
		player_util.get_uuid(player_query, pool, log, async (uuid) => {
			if(uuid === null) {
				await interaction.editReply({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.fail)
						.setDescription(`\n❌ **Could not find player by \`${player_query}\`.`
						+ ' Please use a Minecraft username, Minecraft UUID, Discord tag, or Discord user id**')
				]});    
			} else {
				player_util.get_player_info(uuid, pool, redis_client, log, async (player_data) => {
					if(player_data === null) {
						await interaction.editReply({embeds: [
							new Discord.EmbedBuilder()
								.setColor(config.color.fail)
								.setDescription(`\n❌ **Error getting data for uuid \`${uuid}\`.`)
						]});
					} else {
						if(player_data['muted']) {
							redis_client.publish('minecraft.console.hub.in', 'unmute ' + uuid);
							await interaction.editReply({embeds: [
								new Discord.EmbedBuilder()
									.setColor(config.color.success)
									.setDescription(`✅ ** ${player_data['username']} has been unmuted.**`)
									.setTimestamp()
							]});
						} else {
							await interaction.editReply({embeds: [
								new Discord.EmbedBuilder()
									.setColor(config.color.fail)
									.setDescription(`\n❌ **Error: ${player_data['username']} is not muted.**`)
							]}); 
						}
					}
				});
			}
		});
	}
};