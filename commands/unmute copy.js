module.exports = {
    name: 'unban',
    description: 'Unbans a player in-game and in Discord',
    usage: '<username/Discord tag/Discord id/uuid>',
    aliases: ['pardon'],
    example: 'unban Captain_Sisko',
    args: true,
    cooldown: 3,
    guildOnly: true,
    staffOnly: true,
    async execute(message, args, depend) {
        const log = depend['log'];
        const redis_client = depend['redis_client'];
        const config = depend['config'];
        const Discord = depend['discord_lib'];
        const pool = depend['sql_pool'];
        const player_util = depend['player_util'];

        player_util.get_uuid(args[0], pool, log, (uuid) => {
            if(uuid === null) {
                message.channel.send(new Discord.MessageEmbed()
                .setColor("#E74C3C")
                .setDescription(`\n:x: **Could not find player by \`${args[0]}\`.`
                 + ` Please use a Minecraft username, Minecraft UUID, Discord tag, or Discord user id**`));    
            } else {
                player_util.get_player_info(uuid, pool, redis_client, log, (player_data) => {
                    if(player_data === null) {
                        message.channel.send(new Discord.MessageEmbed()
                        .setColor("#E74C3C")
                        .setDescription(`\n:x: **Error getting data for uuid \`${uuid}\`.`));
                    } else {
                        if(player_data['banned']) {
                            redis_client.publish('minecraft.console.hub.in', 'unban ' + uuid);
                            message.channel.send(new Discord.MessageEmbed()
                            .setColor(config.colour)
                            .setDescription(`:white_check_mark: ** ${player_data['username']} has been unbaned.**`)
                            .setTimestamp());
                        } else {
                            message.channel.send(new Discord.MessageEmbed()
                            .setColor("#E74C3C")
                            .setDescription(`\n:x: **Error: \`${player_data['username']}\` is not banned.**`));    
                        }
                    }
                });
            }
        });
}
}