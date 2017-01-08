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
    	var raw = JSON.parse(body);
    	//console.log(raw);
    	var detail = {};
    	for(var i=0;i<raw['data']['activities'].length;i++){
    		//console.log("a");
    		detail[i] = {};
    		detail[i]['reportID'] = raw['data']['activities'][i]['reportID'];
    		detail[i]['date'] = raw['data']['activities'][i]['text2En'];
    		detail[i]['phone'] = raw['data']['activities'][i]['text5En'];
    		detail[i]['amount'] = Number(raw['data']['activities'][i]['text4En'].substr(1));
    		detail[i]['status'] = raw['data']['activities'][i]['text3En'] === "debtor"? false:true;
    	}
    	callback(detail);
	});
}
api.prototype.detail = function(rid,callback){
	request('/api/transaction_history_detail?reportID='+rid,"GET",null,null,function(header,body){
		body = body.replace(/\\u([\d\w]{4})/gi, function (match, grp){
    		return String.fromCharCode(parseInt(grp, 16));
    	});
    	body = unescape(body);
    	var raw = JSON.parse(body);
    	var detail = {};
    	detail['reportID'] = rid;
    	detail['date'] = raw['data']['section4']['column1']['cell1']['value'].split(" ")[0];
    	detail['time'] = raw['data']['section4']['column1']['cell1']['value'].split(" ")[1];
	detail['fulldate'] = raw['data']['section4']['column1']['cell1']['value'];
    	detail['txid'] = raw['data']['section4']['column2']['cell1']['value'];
    	detail['status'] = raw['data']['serviceCode'] === "debtor"? false:true;
    	detail['signed-amount'] = raw['data']['amount'];
    	detail['total'] = Number(raw['data']['section3']['column1']['cell2']['value']);
    	detail['transfer-amount'] = Number(raw['data']['section3']['column1']['cell1']['value']);
    	detail['fee'] = Number(raw['data']['section3']['column2']['cell1']['value']);
    	detail['message'] = raw['data']['personalMessage']['value'];
    	detail['ref1'] = raw['data']['ref1'];
    	detail['phone'] = detail['ref1'];
    	detail['owner'] = raw['data']['section2']['column1']['cell2']['value'];
    	detail['signed-phone'] = raw['data']['section2']['column1']['cell1']['value'];
    	detail['operator'] = raw['data']['section2']['column2']['value'];
    	detail['type'] = raw['data']['serviceType'];
    	detail['Favorite'] = raw['data']['isFavorited'] === "no" ? false:true;
    	//console.log(detail['owner']);
    	callback(detail);
	});
}


module.exports = new api();

