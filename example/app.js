var tw = require ('../app.js');

var database = {};//for test
var dbcount = 0;
function recive(){
	console.log("Getting new transaction...");
	var count = 0;
	tw.log(function(res){
		checkloop:
		for(i in res){
			for(j=0;j<dbcount;j++){
				if(res[i]["reportID"]==database[j]["reportID"]) continue checkloop;
			}
			count++;
			database[dbcount++]=res[i];
			tw.detail(res[i]['reportID'],function(deep){ //deepdetail
				console.log("New Transaction Detail");
				console.log("----------------------");
				console.log("ReportID: " + deep["reportID"]);
				console.log("TxID: " + deep["txid"]);
				console.log("Account Owner: " + deep['owner']);
				console.log("Status: "+ deep['status']?"deposit":"withdraw");
				console.log("Message: "+ deep['message']);
			});
			
			/*
				take order
			*/
		}
		console.log("Complete transaction: " + count + " New transaction");
	});
}

function loop(){
	setTimeout(function(){
		recive();
		loop();
	},6000);
}

console.log("Logging in...");
tw.login('user@email.com','password',function(res){
	if(!res) console.log("Login in fail");
	else{
		console.log("Login pass");
		recive();
		loop();
	}
});