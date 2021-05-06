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

		if (!args[0].match(regex)) return message.channel.send(
			new Discord.MessageEmbed()
				.setColor('RED')
				.setTitle('❌ Invalid URL')
				.setDescription('You need to provide a valid URL to shorten')
				.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
				.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
		);

		let url = args[0];

		let safe = false;
		if (message.member.roles.cache.some(r => config.staff_ranks.includes(r.name.toLowerCase()))) safe = true;

		yourls.shorten(url, safe, depend).then(short => {
			message.channel.send(
				new Discord.MessageEmbed()
					.setAuthor(message.author.username, message.author.avatarURL())
					.setColor(config.colour)
					.setTitle('✅ Shortened', short)
					.setDescription('Your URL has been shortened')
					.addField('Long URL', url)
					.addField('Short URL', short)
					.setFooter(`${config.name} | ${config.yourls.name}`, client.user.avatarURL())
					.setTimestamp()
			);
		});


	}
};