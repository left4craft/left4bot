module.exports = {
    name: 'lookup',
    description: 'Mutes a player in-game and in Discord',
    usage: '<username/Discord tag/Discord id/uuid>',
    aliases: ['history', 'punishments'],
    example: 'mute Captain_Sisko 1m test',
    args: true,
    cooldown: 3,
    guildOnly: true,
    adminOnly: false,
    async execute(message, args, depend) {
        const log = depend['log'];
        const pool = depend['sql_pool'];
        const config = depend['config'];
        const player_util = depend['player_util'];
        const redis_client = depend['redis_client'];
        const Discord = depend['discord_lib']

        const lookup_query = args[0];

        player_util.get_uuid(lookup_query, pool, log, (uuid) => {
            if(uuid === null) {
                message.channel.send(new Discord.MessageEmbed()
                .setColor("#E74C3C")
                .setDescription(`\n:x: **Could not find player by \`${lookup_query}\`.`
                 + ` Please use a Minecraft username, Minecraft UUID, Discord tag, or Discord user id**`));    
            } else {
                player_util.get_player_info(uuid, pool, redis_client, log, (player_data) => {
                    if(player_data === null) {
                        message.channel.send(new Discord.MessageEmbed()
                        .setColor("#E74C3C")
                        .setDescription(`\n:x: **Error getting data for uuid \`${uuid}\`.`));
                    } else {
                        message.channel.send(new Discord.MessageEmbed()
                        .setColor(config.colour)
                        .setTitle('Player Information')
                        .setURL(player_data['history_url'])
                        .setAuthor(player_data['username'], 'https://crafatar.com/avatars/' + uuid, player_data['history_url'])
                        .setDescription('Click name for detailed punishment history')
                        .addField("Online (Minecraft)", player_data['online'] ? "Yes" : "No", true)
                        .addField("Muted", player_data['muted'] ? "Yes" : "No", true)
                        .addField("Banned", player_data['banned'] ? "Yes" : "No", true)
                        .addField("UUID", uuid, false)
                        .setTimestamp()
                    );
                    }
                });
            }
        });

       
    }
}