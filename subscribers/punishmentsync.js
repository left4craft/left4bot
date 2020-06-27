module.exports = {
    channels: ['minecraft.punish'],

    execute(unused, webhook, channel, message, depend) {
        const sql_pool = depend['sql_pool'];
        const log = depend['log'];
        const config = depend['config'];
        const discord_client = depend['discord_client'];

        const guild = discord_client.guilds.cache.get(config.guild_id);
        const muted = config.special_ranks['muted'];

        //step 1: get list of punished UUIDs
        sql_pool.query(`SELECT CONVERT(discordID, CHAR) FROM discord_users WHERE uuid IN (SELECT UNHEX(REPLACE(uuid, '-', '')) FROM litebans_mutes WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1 UNION SELECT UNHEX(REPLACE(uuid, '-', '')) FROM litebans_bans WHERE (until < 1 OR until > unix_timestamp()*1000) AND active = 1)`, (err, res) => {
            if(err) log.error(err);
            ids = []
            res.forEach(e => ids.push(e['CONVERT(discordID, CHAR)']));

            guild.members.fetch().then(members => {
                members.forEach(member => {
                    if(ids.includes(member.id)) {
                        log.basic('Muted ' + member.id)
                        member.roles.set([muted]);

                        const muted_chan = discord_client.channels.fetch(config.muted_channel_id);
                        muted_chan.then(chan => {
                            chan.send(`@<${member.id}>, you have been muted in Discord because of an in-game punishment.`)
                        });
                    } else if (member.roles.cache.get(muted) !== undefined) {
                        console.log('Unmuted ' + member.id);
                        member.roles.remove([muted]);

                        const muted_chan = discord_client.channels.fetch(config.muted_channel_id);
                        muted_chan.then(chan => {
                            chan.send(`${member.displayName}'s punishment has expired.`)
                        });

                        member.createDM().then(dm => {
                            dm.send('Your punishment has expired, so you have been unmuted from the Discord server. You will need to rejoin the Minecraft server to regain your Discord rank.')
                        });
                    }
                })
            });

            
        });
    }
};