const cryptoRandomString = require('crypto-random-string');

exports.sync_message = (redis_client, discord_channel, id) => {
    const code = cryptoRandomString({length: 12, type: 'base64'});

    redis_client.get('discord.synccodes', (err, res) => {
        if(err) console.log(err);
        if(res === null) res = '{}';
        let codes = JSON.parse(res);
        codes[id] = {code: code, expires: Date.now() + 30 * 60 * 1000};
        redis_client.set('discord.synccodes', JSON.stringify(codes));
        discord_channel.send('Go in-game and type `/discord ' + code + '` to sync your account.\n'
        + 'This code expires in 30 minutes. Your previous codes are now invalid.');
    });

};

exports.expire_tokens = (redis_client, discord_client) => {
    redis_client.get('discord.synccodes', (err, res) => {
        if(err) console.log(err);
        if(res === null) res = '{}';
        let codes = JSON.parse(res);

        let expired = [];
        for(id in codes) {
            if(codes[id]['expires'] < Date.now()) expired.push(id);
        }
        for(id of expired) {
            delete codes[id];
            discord_client.users.fetch(id).then(user => {
                user.createDM().then(dm => {
                    dm.send("Your sync code has expired. Reply to this message to generate a new one.")
                });
            });
        }
        redis_client.set('discord.synccodes', JSON.stringify(codes));
    });

}