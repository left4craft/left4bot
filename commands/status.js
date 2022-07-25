module.exports = {
	name: 'status',
	description: 'Get server status information',
	usage: '',
	aliases: ['info', 'serverInfo'],
	example: 'status',
	args: false,
	cooldown: 60,
	guildOnly: true,
	adminOnly: false,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
			log,
			fetch,
			minecraft_server_util: query,
		} = depend;


		// command starts here
		// const guild_self = await message.guild.members.fetch(client.user.id);
		// if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
		//     message.delete()
		// };

		// query bungee to update the status category        
		query(config.ip, config.port)
			.then(async (res) => {
				// console.log(res);
				log.console(log.f(`${config.name} is &aonline with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? 'player' : 'players'}&f, updating status category`)); // log status - online

				(await client.channels.fetch(config.status_cat_id)).setName(`online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? 'player' : 'players'}`); // cat name

				client.user.setStatus('online'); // green status
			})
			.catch(async () => {
				log.console(log.f(`${config.name} is &coffline`)); // log status - offline

				(await client.channels.fetch(config.status_cat_id)).setName('server is offline (!status)'); // cat name

				client.user.setStatus('dnd'); // red status

				// throw err;
			});



		// get data from api for embed
		fetch('https://status.left4craft.org/api/status')
			.then(res => res.json())
			.then(json => {

				let servers = json.services.minecraft;
				let players = servers.proxy.player_count;
				// Type \`list\` in <#${config.chat_bridge_chan_id}> for a list of online players.
				let player_list = json.services.minecraft.proxy.players.replace(/,/g, ', ').trim();

				let description = [
					`**${players}** ${players === 1 ? 'person' : 'people'} ${players === 1 ? 'is' : 'are'} currently playing on **${config.ip}**:`,
					`\`${player_list || 'no one is online'}\`.\nCommunicate with these players in <#${config.chat_bridge_chan_id}>.`,
					`\nYou can subscribe to status update notifications by using \`${config.prefix}subscribe status\`.`,
					`View full system status at [${config.status_page_pretty}](${config.status_page}).`
				];

				let embed = new Discord.EmbedBuilder()
					.setAuthor({name: json.summary.description, iconURL: `https://status.left4craft.org/img/${json.summary.status.short}.png`, url: config.status_page})
					.setColor(config.color.success)
					.setTitle(`${config.name} is ${json.services.minecraft.proxy.status === 'operational' ? 'online' : 'offline'}`, config.status_page)
					.setDescription(description[0] + '\n' + description[1] + '\n' + description[2] + '\n' + description[3])
					.setFooter({text: `${config.name} | Data could be up to 1 minute old`, iconURL: client.user.avatarURL()})
					.setTimestamp();


				for (let server in servers) {
					let colour = servers[server].status === 'operational' ? 'green' : servers[server].status === 'degraded' ? 'orange' : 'red';
					let status = servers[server].status === 'operational' ? 'online' : servers[server].status === 'degraded' ? 'degraded' : 'offline';
					if (servers[server].id === 'proxy') servers[server].name = 'Bungee';
					let tps = '';
					if (servers[server].id !== 'proxy') tps = `**TPS:** \`${servers[server].tps}\`\n`;
					let info = `**Status:** \`${status}\`\n${tps}**Players:** \`${servers[server].player_count}\``;
					embed.addFields({name: `:${colour}_square: **${servers[server].name}**`, value: info, inline: true});
				}




				message.channel.send({embeds: [embed]});


			});

	}
};