const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'links',
	description: 'Useful pages',
	usage: '',
	example: 'links',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description),

	args: false,
	cooldown: 10,
	guildOnly: true,
	adminOnly: false,
	async execute(interaction, depend) {
		const client = interaction.client;

		const {
			config,
			discord_lib: Discord,
		} = depend;

		// command starts here
		// const guild_self = await message.guild.members.fetch(client.user.id);
		// if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
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


		interaction.reply({embeds: [embed]});



	}
};