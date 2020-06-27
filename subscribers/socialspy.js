module.exports = {
    channels: ['minecraft.chat.messages'],

    execute(channel, message, depend) {
        const log = depend['log'];
        const config = depend['config'];
        const discord_client = depend['discord_client'];

        log.basic('[MESSAGE] ' + message);

        const parts = message.split(',');

        const chat = '**' + parts[0] + ' -> ' + parts[1] + '** ' + parts.slice(2).join(',').replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here');
        discord_client.channels.fetch(config.socialspy_chan_id).then(channel => {
            channel.send(chat);
        });


    }
};