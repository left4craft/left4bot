const config = require('../config.js');
const log = require("leekslazylogger");

module.exports = {
    channels: ['minecraft.chat.global.out'],

    execute(discord_client, webhook, channel, message) {
        log.basic('[CHAT] ' + message);

        try {
            message = JSON.parse(message);

			webhook.send(message.message.replace('@everyone', '@ everyone').replace('@here', '@ here'), {
				avatarURL: 'https://crafatar.com/avatars/' + message.uuid,
				username: message.name
			});

        } catch (e) { // when not a json object, message is supposed to be directly sent
            // TODO make this less crappy (requies Left4Chat edit)
            discord_client.channels.fetch(config.chat_bridge_chan_id, true).then((channel) => {
                channel.send(message);
            });
        }
    }
};