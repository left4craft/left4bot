module.exports = {
	name: 'mute',
	description: 'Mutes a player in-game and in Discord',
	usage: '<username/Discord tag/Discord id/uuid> [time] <reason>',
	aliases: ['tempmute'],
	example: 'mute Captain_Sisko 1m test',
	args: true,
    
	guildOnly: true,
	staffOnly: true,
	async execute(message, args, depend) {

		const {
			config,
			discord_lib: Discord,
			log,
			sql_pool: pool,
			player_util,
			redis_client,
		} = depend;

		const timeRegex = new RegExp('[1-9]+(?:\\.\\d+)?\\s*[s|sec|seconds|m|min|minutes|h|hours|d|days]');

		if(message.content.length > 200) {
			message.channel.send({embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setDescription('\n❌ **Please limit your mute command to 200 characters or less.**')]});
		} else if (args.length < 2) {
			message.channel.send({embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setDescription('\n❌ **You must specify a time and/or reason for punishment.**')]});
		} else if (args.length === 2 && timeRegex.test(args[1])) {
			message.channel.send({embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setDescription('\n❌ **You must specify a reason for punishment.**')]});
		} else {
			player_util.get_uuid(args[0], pool, log, (uuid) => {
				if(uuid === null) {
					message.channel.send({embeds: [new Discord.EmbedBuilder()
						.setColor(config.color.fail)
						.setDescription(`\n❌ **Could not find player by \`${args[0]}\`.`
                     + ' Please use a Minecraft username, Minecraft UUID, Discord tag, or Discord user id**')]});    
				} else {
					player_util.get_player_info(uuid, pool, redis_client, log, (player_data) => {
						if(player_data === null) {
							message.channel.send({embeds: [new Discord.EmbedBuilder()
								.setColor(config.color.fail)
								.setDescription(`\n❌ **Error getting data for uuid \`${uuid}\`.`)]});
						} else {
							redis_client.publish('minecraft.console.hub.in', 'mute ' + uuid + ' ' + args.slice(1).join(' ') + ' via Discord by ' + message.member.displayName);
							message.channel.send({embeds: [new Discord.EmbedBuilder()
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