module.exports = {
	channels: ['minecraft.chat'],

	execute(channel, message, depend) {
		const log = depend['log'];
		const config = depend['config'];
		const discord_client = depend['discord_client'];
		const webhook = depend['webhook'];

		const chan = discord_client.channels.cache.get(config.chat_bridge_chan_id);

		try {
			//console.log(message);
			message = JSON.parse(message);

			switch (message.type) {
				case 'chat':
					log.basic(`[CHAT IN] ${message.name}: ${message.content_stripped}`);
					webhook.send(message.content.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here'), {
						avatarURL: 'https://crafatar.com/avatars/' + message.uuid,
						username: message.webhook_name
					});
					break;

				case 'pm':
					log.basic(`[PM] ${message.from_name} -> ${message.to_name}: ${message.content_stripped}`);
					discord_client.channels.fetch(config.socialspy_chan_id).then(channel => {
						channel.send(`** ${message.from_name} -> ${message.to_name}:** ${message.content_stripped
							.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here')}`);
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
					log.basic(`[CHAT IN] ${message.content}`);
					chan.send(`:exclamation: **${message.content.replace(/&[0-9a-fi-or]|&![0-9a-f]/g, '')}**`);
					break;

				case 'discord_chat':
					break;

				default:
					log.basic(`[CHAT IN] ${message}`);
					chan.send(message.content);
			}

		} catch (e) {

			discord_client.channels.fetch(config.chat_bridge_chan_id, true).then((channel) => {
				log.warn(`[RAW?] ${message}`);
				log.warn(e);
				chan.send(message);
			});
		}


	}
}