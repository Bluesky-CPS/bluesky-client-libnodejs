/**
 * This is bluesky-cli connector library for nodejs programming user.
 * 
 * Author: Praween AMONTAMAVUT (Hayakawa Laboratory)
 * E-mail: praween@hykwlab.org
 * Create date: 2015-09-18
 *
 * NOTE: Need fix again. (Problem is the callback feature of 'request' 
 *       and 'http' library cause the random (out of control the sequence of 
 *       request the login-logout package to the system.))
 */

/**
 * Declaration of nodejs library
 */
var querystring = require('querystring');
var http = require('http');
var url = require("url");
var request = require('request');

/**
 * Declaration of class variable.
 */
var blueskyGateway = '127.0.0.1';
var blueskyPort = 8189;
var username = 'guest';
var password = 'guest';
var loginParams;
var logoutParams;
var loginOption;
var logoutOption;

var retChunk, v;

/**
 * blueskyconn Constructor.
 */
function blueskyconn(blueskyGateway, username, password){
	var gatewayUrlParse = url.parse(blueskyGateway);

	if(typeof gatewayUrlParse.port !== 'undefined' && gatewayUrlParse.port !== null){
		this.blueskyPort = gatewayUrlParse.port;
	}else{
		this.blueskyPort = 8189;
	}

	if(gatewayUrlParse.hostname){
		this.blueskyGateway = gatewayUrlParse.hostname;
	}else{
		this.blueskyGateway = '127.0.0.1';
	}

	this.username = username;
	this.password = password;

	this.loginParams = querystring.stringify({
		username: this.username,
		password: this.password,
		mode: 'signin'
    	});
	this.loginOption = {
		host: this.blueskyGateway,
		port: this.blueskyPort,
		path: '/doLogin.ins',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(this.loginParams)
		}
	};
	this.logoutParams = querystring.stringify({
		username: this.username,
		mode: 'signout'
	});
	this.logoutOption = {
		host: this.blueskyGateway,
		port: this.blueskyPort,
		path: '/doLogout.ins',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(this.logoutParams)
		}
	};
}

/**
 * Blueskyconn Class testing method.
 */
blueskyconn.prototype.test = function(){
	console.log("test . . .");
	/*console.log(this.blueskyGateway);
	console.log(this.blueskyPort);
	console.log(this.username);
	console.log(this.password);
	console.log(this.loginOption);
	console.log(this.loginParams);
	console.log(this.logoutOption);
	console.log(this.logoutParams);*/

	console.log(this.createBlueskyParam('ls', ["noneFix", "edconnected"]));

	var gpiotest_opts = ["172.16.4.105", "gpio", "set", "21", "1"];
	this.sensornetwork(gpiotest_opts);

	//gpiotest_opts = ["172.16.4.105", "gpio", "set", "21", "0"];
	//this.sensornetwork(gpiotest_opts);
}

function get(url, callback) {
	request({
		url: url
	}, function (error, res, body) {
		if (!error && res.statusCode === 200) {
			callback(body);
		}
	});
}

blueskyconn.prototype.sensornetwork = function(opts){
	var params = this.createBlueskyParam("sensornetwork", opts);
	this.login();

	get('http://' + this.blueskyGateway + ':' + this.blueskyPort + params, function (body) {
		console.log(body);
	});

	this.logout();
}

/**
 * Return the list of connecting embedded devices information.
 */
blueskyconn.prototype.list_ed = function(){
	var params = this.createBlueskyParam("ls", ["noneFix", "edconnected"]);

	var getOption = {
		host: this.blueskyGateway,
		port: this.blueskyPort,
		path: params,
		method: 'GET',
		headers: {
			'Content-Type': 'text/html'
		}
	};

	var listED = http.request(getOption, function(res) {
		res.setEncoding('utf8');
		var body = '';
	        var jsonBody = '';
		u = res.on('data', t = function (chunk) {
			body += chunk;
			return;
		});

		h = res.on('end', function(res){
			ret = JSON.parse(body);
		        return console.log(ret);
		});
	        return h;
	});

	listED.write(this.logoutParams);
	var end = listED.end();
}

/**
 * Convert to parameter of HTTP
 */
blueskyconn.prototype.createBlueskyParam = function(instruction, opts){
	var ret;
	if(Array.isArray(opts)){
		ret = "/etLog?instruction=" + instruction;
		for(var i = 0; i < opts.length; i++){
			ret += "&opt" + (i+1) + "=" + opts[i];
		}
	}
	return ret;
} 

/**
 * Do something with Bluesky API (Underconstruction)
 */
blueskyconn.prototype.blueskyGet = function(blueskyParam){
	this.login();
	this.login();

	var getOption = {
		host: this.blueskyGateway,
		port: this.blueskyPort,
		path: blueskyParam,
		method: 'GET',
		headers: {
			'Content-Type': 'text/html'
		}
	};
	var req = http.request(getOption, function(res, callback) {
		res.setEncoding('utf8');
		var u, t;
		var body = '';
		u = res.on('data', t = function (chunk, callback) {
			//console.log(chunk);
			body += chunk;
			return;
		});

		/*res.on('end', function(res){
			//ret = JSON.parse(body);
			//console.log(ret);
		});*/
		return res;
	});

	req.write(this.logoutParams);
	req.end();

	//console.log("blueskyGet: " + req.res);

	this.logout();
	this.logout();

	return req;
}

/**
 * To login the API.
 */
blueskyconn.prototype.login = function(){
	var req = http.request(this.loginOption, function(res) {
		var t,u;
		res.setEncoding('utf8');
		u = res.on('data', t = function (chunk) {
			//var chunk = chunk;
			//console.log(chunk);
			return;
		});
	
	});

	req.write(this.loginParams);
	req.end();
}

/**
 * To logout the API.
 */
blueskyconn.prototype.logout = function(){
	var req = http.request(this.logoutOption, function(res) {
		var t,u;
		res.setEncoding('utf8');
		u = res.on('data', t = function (chunk) {
			//console.log(chunk);
			return;
		});
	});

	req.write(this.logoutParams);
	req.end();
}

module.exports = blueskyconn;
