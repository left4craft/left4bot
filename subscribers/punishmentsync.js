module.exports = {
	channels: ['minecraft.punish'],

	execute(channel, message, depend) {

		const {
			config,
			discord_client: client,
			log,
			sql_pool: pool,
		} = depend;

		const guild = client.guilds.cache.get(config.guild_id);
		const muted = config.special_ranks['muted'];

		//step 1: get list of punished discord
		pool.query('SELECT CONVERT(discordID, CHAR) FROM discord_users WHERE uuid IN (SELECT UNHEX(REPLACE(uuid, \'-\', \'\')) FROM litebans_mutes WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1 UNION SELECT UNHEX(REPLACE(uuid, \'-\', \'\')) FROM litebans_bans WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1)', (err, res) => {
			if(err) log.error(err);
			let ids = [];
			res.forEach(e => ids.push(e['CONVERT(discordID, CHAR)']));

			guild.members.fetch().then(members => {
				members.forEach(member => {
					if(ids.includes(member.id) && member.roles.cache.get(muted) === undefined) {
						log.console('Muted ' + member.id);
						member.roles.set([muted]);

						const muted_chan = client.channels.fetch(config.muted_channel_id);
						muted_chan.then(chan => {
							chan.send(`<@${member.id}>, you have been muted in Discord because of an in-game punishment.`);
						});
					} else if (!ids.includes(member.id) && member.roles.cache.get(muted) !== undefined) {
						member.roles.remove([muted]);

						const muted_chan = client.channels.fetch(config.muted_channel_id);
						muted_chan.then(chan => {
							chan.send(`${member.displayName}'s punishment has expired.`);
						});

						const support_chan = client.channels.fetch(config.support_channel_id);
						support_chan.then(chan => {
							chan.send(`<@${member.id}>, your punishment has expired, so you have been unmuted from the Discord server. You will need to rejoin the Minecraft server to regain your Discord rank.`);
						});
					}
				});
			});

            
		});
	}
};