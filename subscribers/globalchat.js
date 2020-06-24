const config = require('../config.js');
const axios = require('axios');

module.exports = {
    channels: ['minecraft.chat.global.out'],

    execute(discord_client, channel, message) {
        console.log('[CHAT] ' + message);

        try {
            message = JSON.parse(message);
            axios.post(config.chat_webhook_url, {
                'username': message['name'],
                'avatar_url': 'https://crafatar.com/avatars/' + message['uuid'],
                'content': message['message'].replace('@everyone', '@ everyone').replace('@here', '@ here')
            });
        } catch (e) { // when not a json object, message is supposed to be directly sent
            // TODO make this less crappy (requies Left4Chat edit)
            discord_client.channels.fetch(config.chat_bridge_chan_id, true).then((channel) => {
                channel.send(message);
            });
        }
    }
};