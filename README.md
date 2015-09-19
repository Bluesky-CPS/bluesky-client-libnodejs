# bluesky-client-libnodejs

The testing package version 0.0.0 of client library connecting blue-sky server (The library responds as a browser HTTP client).

How to
======
* install

 ```shell
 npm install bluesky-client-libnodejs
 ```

* write the code (for example)

 [ listed.js ]
 ```shell
 var blueskyconn = require('bluesky-client-libnodejs');
 var conn = new blueskyconn('http://127.0.0.1:8189', 'guest', 'guest');
 conn.list_ed();
 ```
* running the code 

 ```shell
 node listed.js
 ```
 
***Author***: *Praween AMONTAMAVUT*
