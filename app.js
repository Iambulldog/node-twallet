var https = require('https');
var url = require('url');
var qstr = require('querystring');

cookie = "";

var api = function(){
};

function request(path,method,data,content,callback){
	var content = typeof content !== 'undefined' ?  content : 'application/json';
	var headers = {};
	headers['cache-control'] = "no-cache";
	if(method == "POST"){
		headers['Content-Type'] = content;
		//headers['Content-Length'] = Buffer.byteLength(data);
	}
	if(cookie!="") headers["Cookie"] = cookie;
	var options = {
  		host: 'wallet.truemoney.com',
  		port: 443,
  		path: path,
  		method: method,
  		secureOptions: require('constants').SSL_OP_NO_TLSv1_2, //important
  		headers: headers
	};
	//console.log(JSON.stringify(options));
	var req = https.request(options,function(res){
		var result = '';
		var ret = 0;
		
		res.on('data',function(chunk){
			result += chunk;
		});
		res.on('end',function(){
			ret = callback(res.headers,result);
		});
	});
	if(method == "POST") req.write(data);
	req.end();
}

api.prototype.login = function(email,password,callback){
	request('/user/login',"POST",qstr.stringify({email:email,password:password}),'application/x-www-form-urlencoded',function(headers,body){
		if(body.search(/Whoops/) == -1){
			cookie = headers["set-cookie"][0].split(';')[0];
			callback(true);
		}else{
			callback(false);
		}
	});
}
api.prototype.log = function(callback){
	request('/api/transaction_history',"GET",null,null,function(header,body){
		body = body.replace(/\\u([\d\w]{4})/gi, function (match, grp){
    		return String.fromCharCode(parseInt(grp, 16));
    	});
    	body = unescape(body);
		//console.log(qstr.unescape(JSON.stringify(body, null, 2)));
	});
}
exports = new api();
var plugin = new api(); //Just test
plugin.login('user@email.com','password',function(res){
	plugin.log(function(){

	});
});

