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
			let clean_content = message.content_stripped
				.replace(/@(everyone|here)/gmi, '@\u200b$1')
				.replace(/§|&[0-9A-FK-ORa-fk-or]/g, '');

			switch (message.type) {
			case 'chat':
				log.console(`[CHAT IN] ${message.name}: ${clean_content}`);
				webhook.send(clean_content, {
					avatarURL: 'https://crafatar.com/avatars/' + message.uuid,
					username: message.webhook_name
				});
				break;

			case 'pm':
				log.console(`[PM] ${message.from_name} -> ${message.to_name}: ${clean_content}`);
				client.channels.fetch(config.socialspy_chan_id).then(channel => {
					channel.send(`**${message.from_name} -> ${message.to_name}:** ${clean_content}`);
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
				log.console(`[CHAT IN] ${clean_content}`);
				chan.send(`:exclamation: **${clean_content}**`);
				break;

			case 'discord_chat':
				break;

			default:
				log.console(`[CHAT IN] ${clean_content}`);
				chan.send(clean_content);
			}

		} catch (e) {
			log.warn(`[RAW?] ${message}`);
			log.warn(e);
			chan.send(message);
		}

	}
};