module.exports = {
	name: 'links',
	description: 'Useful pages',
	usage: '',
	aliases: ['web', 'website', 'shop', 'store', 'donate', 'forums', 'invite', 'discord', 'bans'],
	example: 'links',
	args: false,
	cooldown: 10,
	guildOnly: true,
	adminOnly: false,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
		} = depend;

		// command starts here
		// if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
		//     message.delete()
		// };

		const links = config.links; 


		let embed = new Discord.EmbedBuilder()
			.setColor(config.color.success)
			.setTitle('Links')
			.setFooter({text: config.name, iconURL: client.user.avatarURL()})
			.setTimestamp();

		for (let link of links) {
			embed.addFields({name: link.name, value: `[${link.pretty}](${link.url})`, inline: true});
		}


		message.channel.send({embeds: [embed]});



	}
};