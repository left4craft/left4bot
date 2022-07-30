const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'realname',
	description: 'Identifies the possible real names of a given search query',
	usage: '<nickname/username/Discord tag/Discord id/uuid>',
	example: 'realname Captain_Sisko',
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


		const search = interaction.options.getString('player');

		await interaction.deferReply();

		// step 1: try to get uuid from discord tags or perfect username match
		player_util.get_uuid(search, pool, log, async (uuid) => {
			if(uuid === null) {
				pool.query('SELECT nick, uuid FROM nicky', async (err, res) => {
					if(err) log.err(err);
					let uuids = [];
					for (let item of res) {
						const nick = item['nick'].replace(/§[0-9A-FK-ORa-fk-or]/g, '').replace(/&[0-9A-FK-ORa-fk-or]/g, ''); // strip color codes
						if(nick.toLowerCase().startsWith(search.toLowerCase())) uuids.push(item['uuid']);
					}
					if(uuids.length === 0) {
						await interaction.editReply({embeds: [new Discord.EmbedBuilder()
							.setColor(config.color.fail)
							.setDescription(`\n❌ **Could not find player by \`${search}\`.`
                        + ' Please use a nickname, Minecraft username, Minecraft UUID, Discord tag, or Discord user id**')]});   
					} else {
						await show_results(interaction, uuids, player_util, pool, redis_client, search, config, log, Discord);
					}
				});
			} else {
				await show_results(interaction, [uuid], player_util, pool, redis_client, search, config, log, Discord);
			}
		});
	}
};

async function show_results(interaction, uuids, player_util, pool, redis_client, search, config, log, Discord) {
	let embed = new Discord.EmbedBuilder()
		.setColor(config.color.success)
		.setTitle('Nickname Search')
		.setDescription(`Players matching ${search}`);

	// collect info up to 3 times, depending on how many uuids are defined.
	player_util.get_player_info(uuids[0], pool, redis_client, log, async (player_data) => {
		embed.addFields({name: player_data['username'], value: 'Nickname: ' + player_data['nick']})
			.addFields({name: 'Online (Minecraft)', value: player_data['online'] ? 'Yes' : 'No', inline: true})
			.addFields({name: 'Muted', value: player_data['muted'] ? 'Yes' : 'No', inline: true})
			.addFields({name: 'Banned', value: player_data['banned'] ? 'Yes' : 'No', inline: true});
		if(uuids[1] !== undefined) {
			// collect info up to 3 times, depending on how many uuids are defined.
			player_util.get_player_info(uuids[1], pool, redis_client, log, async (player_data) => {
				embed.addFields({name: '\u200b', value: '\u200b'})
					.addFields({name: player_data['username'], value: 'Nickname: ' + player_data['nick']})
					.addFields({name: 'Online (Minecraft)', value: player_data['online'] ? 'Yes' : 'No', inline: true})
					.addFields({name: 'Muted', value: player_data['muted'] ? 'Yes' : 'No', inline: true})
					.addFields({name: 'Banned', value: player_data['banned'] ? 'Yes' : 'No', inline: true});
				if(uuids[2] !== undefined) {
					// collect info up to 3 times, depending on how many uuids are defined.
					player_util.get_player_info(uuids[2], pool, redis_client, log, async (player_data) => {
						embed.addFields({name: '\u200b', value: '\u200b'})
							.addFields({name: player_data['username'], value: 'Nickname: ' + player_data['nick']})
							.addFields({name: 'Online (Minecraft)', value: player_data['online'] ? 'Yes' : 'No', inline: true})
							.addFields({name: 'Muted', value: player_data['muted'] ? 'Yes' : 'No', inline: true})
							.addFields({name: 'Banned', value: player_data['banned'] ? 'Yes' : 'No', inline: true});
						if(uuids[3] !== undefined) {
							embed.addFields({name: '\u200b', value: '\u200b'})
								.addFields({name: 'Note', value: `There were ${uuids.length} matches, but only the top 3 are shown.`});
							await interaction.editReply({embeds: [embed]});
						} else {
							await interaction.editReply({embeds: [embed]});
						}
					});
				} else {
					await interaction.editReply({embeds: [embed]});
				}
			});
		} else {
			await interaction.editReply({embeds: [embed]});
		}
	});

}