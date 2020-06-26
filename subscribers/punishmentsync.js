module.exports = {
    channels: ['minecraft.punish'],

    execute(unused, webhook, channel, message, depend) {
        const sql_pool = depend['sql_pool'];
        const log = depend['log'];
        const config = depend['config'];
        const discord_client = depend['discord_client'];

        //step 1: get list of punished UUIDs
        sql_pool.query('SELECT uuid FROM litebans_mutes WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1 UNION SELECT uuid FROM litebans_bans WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1', (err, res) => {
            if(err) log.error(err);
            log.info(`Attempting to find Discord ids for ${res.length} punished players.`);

            const muted = config.special_ranks['muted'];
            for(i in res) {

                // step 2: for each uuid, check for applicable discord account
                const uuid = res[i]['uuid'].split('-').join(''); 
                sql_pool.query('SELECT discordID FROM discord_users WHERE uuid = UNHEX( ? )', [uuid], (err, res) => {
                    if(err) log.error(err);
                    if(res[0] !== undefined) {
                        const discordId = res[0]['discordID'];
                        discord_client.guilds.cache.get(config.guild_id).members.fetch(discordId).then((member) => {

                            // step 3: add muted role and remove all other roles
                            log.info(`Ensuring ${member.displayName} is muted.`);

                            member.roles.set([muted]);

                        });
                    }
                });
            }
        });
    }
};