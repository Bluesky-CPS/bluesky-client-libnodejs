/**
 * This is bluesky-cli connector library for nodejs programming user.
 * 
 * Author: Praween AMONTAMAVUT (Hayakawa Laboratory)
 * E-mail: praween@hykwlab.org
 * Create date: 2015-09-18
 *
 * NOTE: Need fix again. (Problem is the callback feature of 'request' 
 *       and 'http' library cause the random the request messages for 
 *       login-logout to the system (out of control the sequece of 
 *       the operation).) <-- Try to use async with util in order to 
 *       arrange the sequence of function execution but it was not
 *       absolutely resoved the problem. (Need more check it again.)
 *       (Update: 2015-09-23)
 */

//'use strict';
/**
 * Declaration of nodejs library
 */
var querystring = require('querystring');
var http = require('http');
var url = require("url");
var request = require('request');
var async = require('async');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var unirest = require('unirest');
var sleep = require('sleep');

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

var _e = {
	data : 'data',
	end : 'end',
	error: 'error',
	body: 'body',
	chunk: 'chunk',
	list_ed: 'list_ed',
	login_chunk: 'login_chunk',
	logout_chunk: 'logout_chunk',
	login_result: 'login_result',
	logout_result: 'logout_result',
	sensornetwork_result: 'sensornetwork_result'
};

/**
 * blueskyconn Constructor.
 */
function blueskyconn(blueskyGateway, username, password){
	EventEmitter.call(this);
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
util.inherits(blueskyconn, EventEmitter);

/**
 * Blueskyconn Class testing method.
 */
blueskyconn.prototype.test = function(){
	var self = this;
	console.log("test . . .");
	/*console.log(this.blueskyGateway);
	console.log(this.blueskyPort);
	console.log(this.username);
	console.log(this.password);
	console.log(this.loginOption);
	console.log(this.loginParams);
	console.log(this.logoutOption);
	console.log(this.logoutParams);*/

	//console.log(this.createBlueskyParam('ls', ["noneFix", "edconnected"]));

	/*var gpiotest_opts = ["172.16.4.105", "gpio", "set", "21", "1"];
	this.sensornetwork(gpiotest_opts);
	self.on('sensornetwork_result', function(result){
		console.log('call sensornetwork API: ' + result);
	});*/

}

//function get(url, callback) {
blueskyconn.prototype.get = function(url, callback){
	request({
		url: url
	}, function (error, res, body) {
		if (!error && res.statusCode === 200) {
			callback(body);
		}
		if (error){
			console.log(error);
		}
	});
}

blueskyconn.prototype.sensornetwork = function(opts){
	var self = this;
	var params = this.createBlueskyParam("sensornetwork", opts);

	async.series([
	function(callback){
		self.login();
		self.on('login_result', function(chunk){
			//console.log(chunk);
			
		});
		callback(null, "login");
	},function(callback){
		var uri = 'http://' + self.blueskyGateway + ':' + self.blueskyPort + params;
		var reqs = unirest.get(uri).header('Accept', 'text/html')
			.end(function (response) {
				var body = response.body;
				//console.log("GET: " + body);
				self.emit(_e.sensornetwork_result, response.body);
				
			});
		/*self.get('http://' + self.blueskyGateway + ':' + self.blueskyPort + params, function (body) {
			console.log(body);
		});*/

		/*var req = http.get('http://' + self.blueskyGateway + ':' + self.blueskyPort + params, function(res) {
			// output response body
			res.setEncoding('utf8');
			res.on('data', function(str) {
				console.log(str);
			});
		});
		// error handler
		req.on('error', function(err) {
			console.log("Error: " + err.message);
		});*/
		callback(null, "Calling API");
	},function(callback){
		self.logout();
		self.on('logout_result', function(chunk){
			//console.log(chunk);
		});
		callback(null, "logout");
	}], function(err, results){
		if(err){
			throw err;
		}
		//console.log('series all done. ' + results);
	});
}

/**
 * Return the list of connecting embedded devices information.
 */
blueskyconn.prototype.list_ed = function(){
	var self = this;
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
		res.on('data', function (chunk) {
			body += chunk;
			return;
		});

		res.on('end', function(res){
			var ret = JSON.parse(body);
		        self.emit(_e.body, body);
			self.emit(_e.list_ed, body);
		});

		res.on('error', function(err){
			self.emit(_e.error, err);
		});
		
	});
	
	listED.write(this.logoutParams);
	var end = listED.end();

	return self.on('list_ed', function(list_ed){});
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
	var self = this;
	
//	this.login();
//	this.login();

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
		var body = '';
		res.on('data', function (chunk, callback) {
			//console.log(chunk);
			body += chunk;
		});

		/*res.on('end', function(res){
			//ret = JSON.parse(body);
			//console.log(ret);
		});*/
		return res;
	});

	req.write("{}");
	req.end();

	//console.log("blueskyGet: " + req.res);

//	this.logout();
//	this.logout();

	return req;
}

/**
 * To login the API.
 */
blueskyconn.prototype.login = function(){
	var self = this;

	async.series([
	function(callback){

		var req = http.request(self.loginOption, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				//var chunk = chunk;
				//console.log(chunk);
				self.emit(_e.login_chunk, chunk);
				
			});
	
		});

		req.write(self.loginParams);
		req.end();

		callback();
	},function(callback){

		var req = http.request(self.loginOption, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				self.emit(_e.login_chunk, chunk);
				self.emit(_e.login_result, chunk);
			});
	
		});

		req.write(self.loginParams);
		req.end();

		callback();
	}], function(err, results){
		if(err){
			throw err;
		}
		//console.log('series all done. ' + results);
	});

	/*var req = http.request(this.loginOption, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			self.emit(_e.login_chunk, chunk);
		});
	
	});

	req.write(this.loginParams);
	req.end();*/
}

/**
 * To logout the API.
 */
blueskyconn.prototype.logout = function(){
	var self = this;

	async.series([
	function(callback){

		var req = http.request(self.logoutOption, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				self.emit(_e.logout_chunk, chunk);
				
			});
		});

		req.write(self.logoutParams);
		req.end();

		callback();
	},function(callback){

		var req = http.request(self.logoutOption, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				self.emit(_e.logout_chunk, chunk);
				self.emit(_e.logout_result, chunk);
			});
		});

		req.write(self.logoutParams);
		req.end();

		callback();
	}], function(err, results){
		if(err){
			throw err;
		}
		//console.log('series all done. ' + results);
	});

	/*var req = http.request(this.logoutOption, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			//console.log(chunk);
			self.emit(_e.logout_chunk, chunk);
		});
	});

	req.write(this.logoutParams);
	req.end();*/
}

module.exports = blueskyconn;
