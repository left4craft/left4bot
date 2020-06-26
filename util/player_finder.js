exports.get_uuid = (input, sql_pool, callback) => {
    // step 1: check for exact username match
    sql_pool.query('SELECT uuid FROM litebans_history WHERE name = ?', input, (err, res) => {
        input = input.trim();

        if(err) log.error(err);
        if(res[0] !== undefined) {
            callback(res[0]);
            return;
        }

        // step 2: check for exact discord id match
        sql_pool.query('SELECT uuid FROM discord_users WHERE discordID = ?', [Number(input)], (err, res) => {
            if(err) log.error(err);
            if(res[0] !== undefined) {
                callback(res[0]);
                return;
            }

            // step 3: check for exact uuid match
            sql_pool.query('SELECT name FROM litebans_history WHERE uuid = ?', input, (err, res) => {
                if(err) log.error(err);
                if(res[0] !== undefined) {
                    callback(res[0]);
                    return;
                }

                // step 4: check for discord tag match
                input = input.slice(2, -1);
                if(input.startsWith('!')) input = input.slice(1);
                sql_pool.query('SELECT uuid FROM discord_users WHERE discordID = ?', [Number(input)], (err, res) => {
                    if(err) log.error(err);
                    if(res[0] !== undefined) {
                        callback(res[0]);
                        return;
                    }
                });
                callback(null);
                return;
            });
        });
    });
};