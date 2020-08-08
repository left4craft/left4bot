require('dotenv').config();
const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

module.exports.shorten = (url, safe, depend) => {
	const config = depend.config;
	const fetch = depend.fetch;
	const log = depend.log;

	return new Promise((resolve) => {
		fetch(`${config.yourls.api}/?signature=${process.env.YOURLS_TOKEN}&action=shorturl&url=${url}&format=json`)
			.then(res => res.json())
			.then(json => {
				let short = json.shorturl
				if (!safe) short += '~';
				resolve(short);
			});
	});
}

// module.exports.replace = (str, safe, depend) => new Promise(resolve => resolve(str.replace(regex, async url =>
// 	await module.exports.shorten(url, safe, depend))));


// module.exports.conditionalReplace = (str, depend) => new Promise(resolve => resolve(str.replace(regex, async url => {
// 	if (url.length < depend.config.yourls.max_length) return url;
// 	else return await module.exports.shorten(url, false, depend);
// })));

// module.exports.conditionalReplace = async (str, depend) => new Promise(async resolve => {
// 	let urls = str.match(regex);
// 	if (urls === null) return resolve(str);
// 	let strArr = str.split(regex);
// 	depend.log.info(urls)
// 	depend.log.warn(strArr)

//     for (const i in urls) {
//         if (urls[i].length > depend.config.yourls.max_length) {
//             urls[i] = await module.exports.shorten(url, false, depend);
//         }
//     }
//     let finalStr = ''
//     for(const i in strArr) {
//         finalStr += strArr[i];
//         if (urls !== null && urls[i] !== undefined) finalStr += urls[i];
//     }
//     resolve(finalStr);
// });