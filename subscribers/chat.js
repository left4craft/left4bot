module.exports = {
	channels: ['minecraft.chat'],
	async execute(channel, message, depend) {
		const {
			config,
			discord_client: client,
			log,
			webhook,
		} = depend;

		const minecraft_chat = await client.channels.fetch(config.chat_bridge_chan_id);
		const admin_chat = await client.channels.fetch(config.admin_chan_id);
		const ssonly = await client.channels.fetch(config.socialspy_chan_id);

		const sendToBoth = async (content) => {
			await minecraft_chat.send(content);
			await admin_chat.send(content);
		};

		const strip = (content) => {
			if (!content) return '';
			return content
				.replace(/@(everyone|here)/gmi, '@\u200b$1')
				.replace(/(§|&)[0-9A-FK-ORa-fk-or]/g, '')
				.replace(/&#[0-9A-Fa-f]{3,6}/g, '');
		};

		try {
			// console.log(message);
			message = JSON.parse(message);
			let clean_content = strip(message.content_stripped);

			switch (message.type) {
			case 'chat':
				log.console(`[CHAT IN] ${message.name}: ${clean_content}`);
				webhook.send(clean_content, {
					avatarURL: 'https://crafatar.com/avatars/' + message.uuid,
					username: strip(message.webhook_name)
				});
				admin_chat.send(`[MC] **${strip(message.nick)}** said: \`${clean_content.replace(/`/g, '\\`')}\``);
				break;

			case 'pm':
				log.console(`[PM] ${message.from_name} -> ${message.to_name}: ${clean_content}`);
				admin_chat.send(`[MC:PM] **${message.from_name}** said to **${message.to_name}**: \`${clean_content.replace(/`/g, '\\`')}\``);
				ssonly.send(`**${message.from_name}** to **${message.to_name}** » \`${clean_content.replace(/`/g, '\\`')}\``);
				break;

			case 'afk':
				if (message.afk == true) {
					log.console(`[CHAT IN] ${message.name} is now AFK`);
					sendToBoth(`:exclamation: ${message.name} is now AFK`);
				} else {
					log.console(`[CHAT IN] ${message.name} is no longer AFK`);
					sendToBoth(`:exclamation: ${message.name} is no longer AFK`);
				}
				break;

			case 'join':
				log.console(`[CHAT IN] ${message.name} joined`);
				sendToBoth(`<:plus:429331570625871873> **${message.name} joined**`);
				break;

			case 'leave':
				log.console(`[CHAT IN] ${message.name} left`);
				sendToBoth(`<:minus:429331570583797790> **${message.name} left**`);
				break;

			case 'welcome':
				log.console(`[CHAT IN] ${message.name} joined ${config.name} for the first time!`);
				sendToBoth(`<:l4c:429327878879182849> :tada: **${message.name} joined ${config.name} for the first time!**`);
				break;

			case 'broadcast':
				log.console(`[CHAT IN] ${clean_content}`);
				sendToBoth(`:exclamation: **${clean_content}**`);
				break;

			case 'discord_chat':
				break;

			default:
				log.console(`[CHAT IN] ${clean_content}`);
				sendToBoth(clean_content);
			}

		} catch (e) {
			log.warn(`[RAW?] ${message}`);
			log.warn(e);
			sendToBoth(message);
		}

	}
};