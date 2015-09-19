var blueskyconn = require('./bluesky-cli.js');

var conn = new blueskyconn('http://127.0.0.1:8189', 'guest', 'guest');
conn.test();
conn.list_ed();



