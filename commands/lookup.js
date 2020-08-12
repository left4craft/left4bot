module.exports = {
	name: 'lookup',
	description: 'Lookup a player\'s history',
	usage: '<username/Discord tag/Discord id/uuid>',
	aliases: ['history', 'punishments'],
	example: 'lookup Captain_Sisko',
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
				message.channel.send(new Discord.MessageEmbed()
					.setColor('#E74C3C')
					.setDescription(`\n:x: **Could not find player by \`${lookup_query}\`.`
                 + ' Please use a Minecraft username, Minecraft UUID, Discord tag, or Discord user id**'));    
			} else {
				player_util.get_player_info(uuid, pool, redis_client, log, (player_data) => {
					if(player_data === null) {
						message.channel.send(new Discord.MessageEmbed()
							.setColor('#E74C3C')
							.setDescription(`\n:x: **Error getting data for uuid \`${uuid}\`.`));
					} else {
						let embed = new Discord.MessageEmbed()
							.setColor(config.colour)
							.setTitle('Player Information')
							.setURL(player_data['history_url'])
							.setAuthor(player_data['username'], 'https://crafatar.com/avatars/' + uuid, player_data['history_url'])
							.setThumbnail(`https://crafatar.com/avatars/${uuid}`)
							.setDescription('Click name for detailed punishment history')
							.addField('Online (Minecraft)', player_data['online'] ? 'Yes' : 'No', true)
							.addField('Muted', player_data['muted'] ? 'Yes' : 'No', true)
							.addField('Banned', player_data['banned'] ? 'Yes' : 'No', true);

						if(player_data['nick'] !== null) embed.addField('Nickname', player_data['nick']);

						embed.addField('UUID', uuid, false)
							.setTimestamp()
							.setFooter('', message.client.user.avatarURL);

						message.channel.send(embed);
					}
				});
			}
		});

       
	}
};