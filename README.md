# bluesky-client-libnodejs

The testing package version 0.0.0 of client library connecting [blue-sky server](https://github.com/Bluesky-CPS/BlueSkyLoggerCloudBINResearchVer1.0) (The library responds as a browser HTTP client).

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
 var listEd = conn.list_ed();
 listEd.on('list_ed', function(listingED){
	 console.log(listingED);
 });
 ```
* running the code 

 ```shell
 node listed.js
 ```
 
***Author***: *Praween AMONTAMAVUT*
