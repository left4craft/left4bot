module.exports = {
	channels: ['minecraft.chat.global.out'],

	execute(channel, message, depend) {
		const log = depend['log'];
		const config = depend['config'];
		const discord_client = depend['discord_client'];
		const webhook = depend['webhook'];

		const chan = discord_client.channels.cache.get(config.chat_bridge_chan_id);

		try {

			message = JSON.parse(message);

			switch (message.type) {
				case 'message':
					log.basic(`[CHAT IN] ${message.name}: ${message.message}`);
					webhook.send(message.message.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here'), {
						avatarURL: 'https://crafatar.com/avatars/' + message.uuid,
						username: message.name
					});
					break;

				case 'afk':
					if (message.afk == true) {
						log.basic(`[CHAT IN] ${message.name} is now AFK`);
						chan.send(`:exclamation: ${message.name} is now AFK`);
					} else {
						log.basic(`[CHAT IN] ${message.name} is no longer AFK`);
						chan.send(`:exclamation: ${message.name} is no longer AFK`);
					}
					break;

				case 'join':
					log.basic(`[CHAT IN] ${message.name} joined`);
					chan.send(`<:plus:429331570625871873> **${message.name} joined**`);
					break;

				case 'leave':
					log.basic(`[CHAT IN] ${message.name} left`);
					chan.send(`<:minus:429331570583797790> **${message.name} left**`);
					break;

				case 'welcome':
					log.basic(`[CHAT IN] ${message.name} joined ${config.name} for the first time!`);
					chan.send(`<:l4c:429327878879182849> :tada: **${message.name} joined ${config.name} for the first time!**`);
					break;

				case 'broadcast':
					log.basic(`[CHAT IN] ${message.message}`);
					chan.send(`:exclamation: **${message.message}**`);
					break;

				default:
					chan.send(message.message);
			}

		} catch (e) { 

			discord_client.channels.fetch(config.chat_bridge_chan_id, true).then((channel) => {
				log.basic(`[RAW TXT] ${message}`)
				chan.send(message);
			});
		}


	}
}