module.exports = {
    name: 'lookup',
    description: 'Mutes a player in-game and in Discord',
    usage: '<username/Discord tag/Discord id/uuid>',
    aliases: ['history', 'punishments'],
    example: 'mute Captain_Sisko 1m test',
    args: true,
    cooldown: 3,
    guildOnly: true,
    adminOnly: true,
    async execute(message, args, depend) {
        const client = message.client;
        const log = depend['log'];
        const redis_client = depend['redis_client'];
        const config = depend['config'];
        const Discord = depend['discord_lib'];
        const pool = depend['sql_pool'];

        const lookup_query = args[0];



       
    }
}