const yourls = require('../util/yourls.js');

module.exports = {
	name: 'shorten',
	description: 'Shorten a URL',
	usage: '<url>',
	aliases: ['short', 'url'],
	example: 'shorten https://www.google.com/',
	args: true,
	cooldown: 10,
	guildOnly: true,
	adminOnly: true,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
		} = depend;

		const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

		if (!args[0].match(regex)) return message.channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setTitle('❌ Invalid URL')
				.setDescription('You need to provide a valid URL to shorten')
				.addFields({name: 'Usage', value: `\`${config.prefix}${this.name} ${this.usage}\`\n`})
				.addFields({name: 'Help', value: `Type \`${config.prefix}help ${this.name}\` for more information`})
		]});

		let url = args[0];

		let safe = false;
		if (message.member.roles.cache.some(r => config.staff_ranks.includes(r.name.toLowerCase()))) safe = true;

		yourls.shorten(url, safe, depend).then(short => {
			message.channel.send({embeds: [
				new Discord.EmbedBuilder()
					.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
					.setColor(config.color.success)
					.setTitle('✅ Shortened', short)
					.setDescription('Your URL has been shortened')
					.addFields({name: 'Long URL', value: url})
					.addFields({name: 'Short URL', value: short})
					.setFooter({text: `${config.name} | ${config.yourls.name}`, iconURL: client.user.avatarURL()})
					.setTimestamp()
			]});
		});


	}
};