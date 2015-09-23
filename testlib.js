var blueskyconn = require('./bluesky-cli.js');

var conn = new blueskyconn('http://127.0.0.1:8189', 'guest', 'guest');
conn.test();
var listEd = conn.list_ed();
console.log(listEd._events.body);
listEd.on('list_ed', function(listingED){
	console.log(listingED + '\r\n');
	var ed_arr = JSON.parse(listingED).ETLog.EDConnStatement;
	console.log(ed_arr);
	console.log();
	
	for(var i = 0; i < ed_arr.length; i++){
		console.log(ed_arr[i].EDCNAME + " (" + ed_arr[i].EDIP + ") ");
	}
});



