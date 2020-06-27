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

        const config = depend.config;
        const Discord = depend.discord_lib;
        const log = depend.log;
        const fetch = depend.fetch;
        const query = depend.minecraft_server_util;

        // command starts here
        // if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
        //     message.delete()
        // };

        // query bungee to update the status category        
        query(config.ip, config.port)
            .then((res) => {
                // console.log(res);
                log.console(`${config.name} is ${log.colour.greenBright(`online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? "player" : "players"}`)}${log.colour.white(", updating status category")}`); // log status - online

                client.channels.cache.get(config.status_cat_id).setName(`online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? "player" : "players"}`); // cat name

                client.user.setStatus("online"); // green status
            })
            .catch((err) => {
                log.console(`${config.name} is ${log.colour.redBright("offline")}`); // log status - offline

                client.channels.cache.get(config.status_cat_id).setName('server is offline (!status)'); // cat name

                client.user.setStatus("dnd"); // red status

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
                    `**${players}** ${players === 1 ? "person" : "people"} ${players === 1 ? "is" : "are"} currently playing on **${config.ip}**:`,
                    `\`${player_list || 'no one is online'}\`.\nCommunicate with these players in <#${config.chat_bridge_chan_id}>.`,
                    `\nYou can subscribe to status update notifications by using \`${config.prefix}subscribe status\`.`,
                    `View full system status at [${config.status_page_pretty}](${config.status_page}).`
                ]

                let embed = new Discord.MessageEmbed()
                    .setAuthor(json.summary.description, `https://status.left4craft.org/img/${json.summary.status.short}.png`, config.status_page)
                    .setColor(config.colour)
                    .setTitle(`${config.name} is ${json.services.minecraft.proxy.status === 'operational' ? 'online' : 'offline'}`, config.status_page)
                    .setDescription(description[0] + '\n' + description[1] + '\n' + description[2] + '\n' + description[3])
                    .setFooter(`${config.name} | Data could be up to 1 minute old`, client.user.avatarURL())
                    .setTimestamp();


                for (server in servers) {
                    let colour = servers[server].status === 'operational' ? 'green' : servers[server].status === 'degraded' ? 'orange' : 'red';
                    let status = servers[server].status === 'operational' ? 'online' : servers[server].status === 'degraded' ? 'degraded' : 'offline';
                    if (servers[server].id === 'proxy') servers[server].name = 'Bungee';
                    let tps = '';
                    if (servers[server].id !== 'proxy') tps = `**TPS:** \`${servers[server].tps}\`\n`;
                    let info = `**Status:** \`${status}\`\n${tps}**Players:** \`${servers[server].player_count}\``;
                    embed.addField(`:${colour}_square: **${servers[server].name}**`, info, true);
                };




                message.channel.send(embed);


            });

    }
}