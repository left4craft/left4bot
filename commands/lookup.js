const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'lookup',
	description: 'Lookup a player\'s history',
	usage: '<username/Discord tag/Discord id/uuid>',
	example: 'lookup Captain_Sisko',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => 
			option.setName('player')
				.setDescription('Enter a Username, Discord Tag, Discord ID, or UUID')
				.setRequired(true)),
	args: true,
	guildOnly: true,
	adminOnly: false,
	async execute(message, args, depend) {
		
		const {
			config,
			discord_lib: Discord,
			log,
			sql_pool: pool,
			player_util,
			redis_client,
		} = depend;


		const lookup_query = args[0];

		player_util.get_uuid(lookup_query, pool, log, (uuid) => {
			if(uuid === null) {
				message.channel.send({embeds: [new Discord.EmbedBuilder()
					.setColor(config.color.fail)
					.setDescription(`\n❌ **Could not find player by \`${lookup_query}\`.`
                 + ' Please use a Minecraft username, Minecraft UUID, Discord tag, or Discord user id**')]});    
			} else {
				player_util.get_player_info(uuid, pool, redis_client, log, (player_data) => {
					if(player_data === null) {
						message.channel.send({embeds: [new Discord.EmbedBuilder()
							.setColor(config.color.fail)
							.setDescription(`\n❌ **Error getting data for uuid \`${uuid}\`.`)]});
					} else {
						let embed = new Discord.EmbedBuilder()
							.setColor(config.color.success)
							.setTitle('Player Information')
							.setURL(player_data['history_url'])
							.setAuthor({name: player_data['username'], iconURL: 'https://crafatar.com/avatars/' + uuid, url: player_data['history_url']})
							.setThumbnail(`https://crafatar.com/avatars/${uuid}`)
							.setDescription('Click name for detailed punishment history')
							.addFields({name: 'Online (Minecraft)', value: player_data['online'] ? 'Yes' : 'No', inline: true})
							.addFields({name: 'Muted', value: player_data['muted'] ? 'Yes' : 'No', inline: true})
							.addFields({name: 'Banned', value: player_data['banned'] ? 'Yes' : 'No', inline:  true});

						if(player_data['nick'] !== null) embed.addFields({name: 'Nickname', value: player_data['nick']});

						embed.addFields({name: 'UUID', value: uuid, inline: false})
							.setTimestamp()
							.setFooter({text: config.name, iconURL: message.client.user.avatarURL()});

						message.channel.send({embeds: [embed]});
					}
				});
			}
		});

       
	}
};