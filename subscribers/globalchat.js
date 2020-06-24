const config = require('../config.js');
const axios = require('axios');

module.exports = {
    channels: ['minecraft.chat.global.out'],

    execute(channel, message) {
        console.log('[CHAT] ' + message);
        axios.post(config.chat_webhook_url, {
            'username': message['name'],
            'avatar_url': 'https://crafatar.com/avatars/' + message['uuid'],
            'content': message['message'].replace('@everyone', '@ everyone').replace('@here', '@ here')
        });
    }
};