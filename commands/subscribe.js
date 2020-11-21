module.exports = {
	name: 'subscribe',
	description: 'Subscribe to a role',
	usage: '<role>',
	aliases: ['unsubscribe', 'role', 'roles'],
	example: 'subscribe status',
	args: false,
	cooldown: 5,
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
		let roles = config.subscription_roles;


		if (args.length < 1) {
			let list = new Discord.MessageEmbed()
				.setColor(config.colour)
				.setTitle('Subscribe to notifications')
				.setDescription('**»** Subscribe to specific notifications by giving yourself a role that will be mentioned (by staff or bots, not players).')
				.setFooter(config.name, client.user.avatarURL())
				.setTimestamp();



			for (let role in roles) {
				console.log(role);
				list.addField(`:white_small_square: **${roles[role].title}**: ${roles[role].id}`, roles[role].description + `\n\n**Type \`${config.prefix}subscribe ${roles[role].id}\` to subscribe**`);
			}
			return message.channel.send(list);
		}


		if (roles[args[0]]) {
			const role = message.guild.roles.cache.find(r => r.id === roles[args[0]].role);

			if (message.member.roles.cache.some(r => r.id === roles[args[0]].role)) {
				message.member.roles.remove(role);
				message.channel.send(
					new Discord.MessageEmbed()
						.setColor(config.colour)
						.setTitle(':thumbsup: Unsubscribed')
						.setDescription(`**»** ${message.author}, you are no longer subscribed to **${roles[args[0]].title.toLowerCase()}**.\nYou can use \`${config.prefix}subscribe ${roles[args[0]].id}\` to resubscribe.`)
				);
			} else {
				message.member.roles.add(role);
				message.channel.send(
					new Discord.MessageEmbed()
						.setColor(config.colour)
						.setTitle(':thumbsup: Subscribed')
						.setDescription(`**»** ${message.author}, you are now subscribed to **${roles[args[0]].title.toLowerCase()}**.\nYou can use \`${config.prefix}unsubscribe ${roles[args[0]].id}\` to unsubscribe.`)
				);
			}


		} else {
			message.channel.send(
				new Discord.MessageEmbed()
					.setTitle('Error')
					.setColor('#E74C3C')
					.addField('Unkown role', `Type \`${config.prefix}${this.name}\` for a list of roles`)
					.addField('Information', `\`${config.prefix}help ${this.name}\` for more information`)
			);
		}




	}
};