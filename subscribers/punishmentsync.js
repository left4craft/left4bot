module.exports = {
    channels: ['minecraft.punish'],

    execute(unused, webhook, channel, message, depend) {
        const sql_pool = depend['sql_pool'];
        const log = depend['log'];
        const config = depend['config'];
        const discord_client = depend['discord_client'];

        //step 1: get list of punished UUIDs
        sql_pool.query(`SELECT discordID FROM discord_users WHERE uuid IN (SELECT UNHEX(REPLACE(uuid, '-', '')) FROM litebans_mutes WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1 UNION SELECT UNHEX(REPLACE(uuid, '-', '')) FROM litebans_bans WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1)`, (err, res) => {
            if(err) log.error(err);
            res.forEach(element => {
                const id = String(element['discordID']);
                log.basic(id);
            });
        });
    }
};