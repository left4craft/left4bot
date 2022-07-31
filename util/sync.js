const cryptoRandomString = require('crypto-random-string');

exports.sync_message = async (redis_client, interaction) => {
	const code = cryptoRandomString({length: 12, type: 'base64'});

	await interaction.deferReply({ephemeral: true});

	redis_client.get('discord.synccodes', async (err, res) => {
		if(err) console.log(err);
		if(res === null) res = '{}';
		let codes = JSON.parse(res);
		codes[interaction.member.id] = {code: code, expires: Date.now() + 30 * 60 * 1000};
		redis_client.set('discord.synccodes', JSON.stringify(codes));
		await interaction.editReply('Go in-game and type `/discord ' + code + '` to sync your account.\n'
        + 'This code expires in 30 minutes. Your previous codes are now invalid.');
	});

};

exports.expire_tokens = (redis_client) => {
	redis_client.get('discord.synccodes', (err, res) => {
		if(err) console.log(err);
		if(res === null) res = '{}';
		let codes = JSON.parse(res);

		let expired = [];
		for(let id in codes) {
			if(codes[id]['expires'] < Date.now()) expired.push(id);
		}
		for(let id of expired) {
			delete codes[id];
		}
		redis_client.set('discord.synccodes', JSON.stringify(codes));
	});

};