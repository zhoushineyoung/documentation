R = require('ramda');

var utils = {};

utils.cx = R.pipe(
	R.pickBy(R.identity),
	R.keys(),
	R.join(' ')
);

utils.pageHasPlatform = function(site_map, current_path, platform) {
	var path = current_path.split('/');
	path[0] = path[0].substring(0, path[0].length-1);
	path = [ path[0], path[1], 'platforms', platform ];

	return !!R.path(path, site_map);
}

utils.getUrlQuery = R.pipe(
	decodeURIComponent,
	R.substringFrom(1),
	R.split('&'),
	R.map(R.split('=')),
	R.reduce(function(acc, param) {
		return R.assoc(param[0], param[1], acc);
	},{})
);

utils.setUrl = function(url) {
	window.history.pushState(null, null, url);
}

utils.buildUrlQuery = R.pipe(
	R.toPairs,
	R.map(R.join('=')),
	R.join('&'),
	function(q) { return '?' + q; }
)

module.exports = utils;
