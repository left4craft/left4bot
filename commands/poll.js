const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'poll',
	description: 'Create a poll',
	usage: '<question> |OR| <question> <option1;option2;etc>',
	example: 'poll Which colour? Blue; Orange; Red',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => 
			option.setName('question')
				.setDescription('Enter a question')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('options')
				.setDescription('Enter options separated by semicolons')
				.setRequired(false)),
	args: true,
	guildOnly: true,
	adminOnly: true,
	async execute(interaction, depend) {
		const client = interaction.client;

		const {
			config,
			discord_lib: Discord,
			log,
		} = depend;

		const alphabet = 'abcdefghijklmnopqrstuvwxyz';
		// const unicode = "🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿";
		const unicode = '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(' ');

		// let joined = args.join(' '); // make it a string again

		// let split = joined.trim().split(';'); // array of question and options, no type, split at the ;


		// for (let i = 0; i < split.length; i++) {
		// 	let newStr = split[i].trim(); // remove whitespace
		// 	if (newStr[newStr.length - 1] == ';') newStr = newStr.substring(0, newStr.length - 1); // remove semicolons
		// 	split[i] = newStr;
		// 	if (newStr.length < 1) split.pop();
		// }

		let question = interaction.options.getString('question');
		let options = interaction.options.getString('options') && interaction.options.getString('options').split(';'); // array of the options


		if (options && options.length > 26) {
			await interaction.reply({embeds:[
				new Discord.EmbedBuilder()
					.setTitle('Error')
					.setColor(config.color.fail)
					.addFields({name: 'Too many options', value: 'Polls are limited to maximum of 26 options'})
					.addFields({name: 'Information', value: `\`/help ${module.exports.name}\` for more information`})
			]}
			);
			return;
		}

		await interaction.deferReply();
		const channel = await client.channels.fetch(config.poll_chan_id);

		if (!options || options.length < 1) {
			// basic with thumbs up and down
			log.info(`${interaction.member.displayName} created a basic poll`);

			channel.send(`<@&${config.subscription_roles.polls.role}>`);
			const poll = await channel.send({
				embeds: [new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle(question)
					.setAuthor({name: interaction.member.displayName, iconURL: interaction.user.avatarURL()})
					.setDescription('Please react with your choice: \n\n:thumbsup: Yes\n\n:thumbsdown: No\n\nPlease only react once.')
				// .addFields({name: "Options", value: `\n\n:thumbsup: Yes\n\n:thumbsdown: No\n\n`, inline: true})
					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
					.setTimestamp()]
			});

			await poll.react('👍');
			await poll.react('👎');



		} else {
			// advanced with A-Z (26 max options) 
			log.info(`${interaction.member.displayName} created an advanced poll with ${options.length} options`);

			let options_string = '';
			for (let i = 0; i < options.length; i++) {
				options_string += `:regional_indicator_${alphabet[i]}: ${options[i]}\n\n`;
			}
			channel.send(`<@&${config.subscription_roles.polls.role}>`);
			const poll = await channel.send({embeds: [
				new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle(question)
					.setAuthor({name: interaction.member.displayName, iconURL: interaction.user.avatarURL()})
					.setDescription(`Please react with your choice: \n\n${options_string}`)
					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
					.setTimestamp()]}
			);

			for (let i = 0; i < options.length; i++) {
				try {
					await poll.react(unicode[i]);
				} catch (e) {
					log.warn(`Failed to react to poll with ${unicode[i]} (${alphabet[i]})`);
				} 
			}


		}

		interaction.editReply({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(':thumbsup: Poll created')
				.setDescription(`**»** Go to <#${config.poll_chan_id}> to view`)
				.addFields({name: 'Question', value: question, inline: false})
		]}); // success message


		(await client.channels.fetch(config.log_chan_id)).send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('Poll created')
				.setAuthor({name: interaction.member.displayName, iconURL: interaction.user.avatarURL()})
				.addFields({name: 'By', value: interaction.member.displayName, inline: true})
				.addFields({name: 'Question', value: question, inline: false})
				.addFields({name: 'Options', value: options === null ? '2' : '' + options.length, inline: true})
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}); // log channel message

	}
};