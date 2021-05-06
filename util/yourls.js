const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

module.exports.shorten = async (url, safe, depend) => {
	const {
		config,
		fetch
	} = depend;

	const api = `${config.yourls.api}/?signature=${process.env.YOURLS_TOKEN}&action=shorturl&url=${url}&format=json`;
	let { shorturl: short } = await(await fetch(api)).json();
	if (!safe) short += '~';
	return short;
};

module.exports.replace = (str, safe, depend) => str.replace(regex, async url =>
	await module.exports.shorten(url, safe, depend));


module.exports.conditionalReplace = (str, depend) => str.replace(regex, async url => {
	if (url.length < depend.config.yourls.max_length) return url;
	else return await module.exports.shorten(url, false, depend);
});
