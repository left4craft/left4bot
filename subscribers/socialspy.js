module.exports = {
    channels: ['minecraft.chat.messages'],

    execute(channel, message, depend) {
        const log = depend['log'];
        const config = depend['config'];
        const discord_client = depend['discord_client'];

        // log.basic('[MESSAGE] ' + message);

		const parts = message.split(',');
		const msg = parts.slice(2).join(',').replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here');
		
		log.basic(`[MESSAGE] ${parts[0]} -> ${parts[1]}: ${msg}`);

        const chat = '**' + parts[0] + ' -> ' + parts[1] + '** ' + msg;
        discord_client.channels.fetch(config.socialspy_chan_id).then(channel => {
            channel.send(chat);
        });


    }
};