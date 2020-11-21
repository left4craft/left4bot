module.exports = {
	channels: ['minecraft.chat'],

	execute(channel, message, depend) {
		const {
			config,
			discord_client: client,
			log,
			webhook,
		} = depend;

		const chan = client.channels.cache.get(config.chat_bridge_chan_id);

		try {
			//console.log(message);
			message = JSON.parse(message);

			switch (message.type) {
			case 'chat':
				log.console(`[CHAT IN] ${message.name}: ${message.content_stripped}`);
				webhook.send(message.content_stripped.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here'), {
					avatarURL: 'https://crafatar.com/avatars/' + message.uuid,
					username: message.webhook_name.replace(/§[0-9A-FK-ORa-fk-or]/g, '').replace(/&[0-9A-FK-ORa-fk-or]/g, '')
				});
				break;

			case 'pm':
				log.console(`[PM] ${message.from_name} -> ${message.to_name}: ${message.content_stripped}`);
				client.channels.fetch(config.socialspy_chan_id).then(channel => {
					channel.send(`** ${message.from_name} -> ${message.to_name}:** ${message.content_stripped
						.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here')}`);
				});
				break;

			case 'afk':
				if (message.afk == true) {
					log.console(`[CHAT IN] ${message.name} is now AFK`);
					chan.send(`:exclamation: ${message.name} is now AFK`);
				} else {
					log.console(`[CHAT IN] ${message.name} is no longer AFK`);
					chan.send(`:exclamation: ${message.name} is no longer AFK`);
				}
				break;

			case 'join':
				log.console(`[CHAT IN] ${message.name} joined`);
				chan.send(`<:plus:429331570625871873> **${message.name} joined**`);
				break;

			case 'leave':
				log.console(`[CHAT IN] ${message.name} left`);
				chan.send(`<:minus:429331570583797790> **${message.name} left**`);
				break;

			case 'welcome':
				log.console(`[CHAT IN] ${message.name} joined ${config.name} for the first time!`);
				chan.send(`<:l4c:429327878879182849> :tada: **${message.name} joined ${config.name} for the first time!**`);
				break;

			case 'broadcast':
				log.console(`[CHAT IN] ${message.content_stripped}`);
				chan.send(`:exclamation: **${message.content_stripped}**`);
				break;

			case 'discord_chat':
				break;

			default:
				log.console(`[CHAT IN] ${message.content_stripped}`);
				chan.send(message.content_stripped);
			}

		} catch (e) {
			log.warn(`[RAW?] ${message}`);
			log.warn(e);
			chan.send(message);
		}

	}
};