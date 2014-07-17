var URLManager = require('./URLManager');  
var Request = require('./Request'); 
var CookieMessages= require('./CookieMessages'); 
var CookieManager = require('./CookieManager'); 
var _ = require('underscore');
var q = require('q');


var Trooper = function(config){
	this.urlManager = new URLManager(config);
	var promise, that= this;
	this.req = new Request();
	this.config = _.extend({}, config);
	this.chk;
};



Trooper.prototype.auth= function(){
var that = this;
var defer= q.defer();
if(this.config.pass){
	var data = {
		login: this.config.name,
		pass: this.config.pass
	};
	promise= this.req.post(this.urlManager.getLoginUrl(), data);
}else{	
	promise= this.req.send(this.urlManager.getBaseUrl());
}

promise.then(function(response){

var cookie = response.getCookies();
var code = null; 
if(response.isRedirect()){
  	code= CookieManager.getTextByCookie(cookie);
  	if(that.config.pass){
 		code= code || 201;
  	}else{
  		code= code || 501;
  	}	
}else{
 	that.chk = CookieManager.getCHKByCookie(cookie); 
 	code= 201;
}

 defer.resolve({code: code, message: CookieMessages.auth[code]});
});
return defer.promise;
};





Trooper.prototype.makeBattle = function(opponent){
		var that= this, defer= q.defer(); 
		var data = {
			chk: that.chk,
			friend: opponent || that.config.opponent,
		};
		var promise= this.req.post(this.urlManager.getBattleUrl(), data);
		promise.then(function(response){		
			var cookies= response.getCookies();			
			if(cookies){
				var msg = CookieManager.getMessageByCookie(cookies);
				defer.resolve(msg);
			}else{
				defer.resolve(-1);
			}
		}, function(){ 
			console.log("not catched err")
		});
		return defer.promise;	
};

Trooper.prototype.makeRaid = function(){
		var defer= q.defer(); 	
		var promise= this.req.send(this.urlManager.getRaidUrl(this.chk));
		promise.then(function(response){		
			var cookies= response.getCookies();	
			var headers = response.getHeaders();
			if(cookies){
				var msg = CookieManager.getMessageByCookie(cookies);
				defer.resolve(msg);
			}else{
				defer.resolve(-174);
			}
		}, function(){ 
			console.log("not catched err")
		});
		return defer.promise;
};
 
Trooper.prototype.upgrade = function(trooper){

		var defer= q.defer(); 	 
		var promise= this.req.send(this.urlManager.getTrooperUpgradeUrl(this.chk, trooper));
		promise.then(function(response){	
			var headers = response.getHeaders();
			var cookies= response.getCookies();	
			console.log(headers);

			if(cookies){
				var code = CookieManager.getTextByCookie(cookies);
				defer.resolve(code);
			}else{
				switch(headers['location']){
				case ('/levelup/'+(trooper || 0)):
					console.log("skill selection available");
					defer.resolve(501);
				break;
				case  ('/t/'+(trooper || 0)):
					console.log("could'n upgrade");
					defer.resolve(503);
				break;
				case  '/hq':
					defer.resolve(504);
				break;
			};

			}			
		}, function(){ 
			console.log("not catched err")
		});
		return defer.promise;
};


Trooper.prototype.makeMission = function(){
		var defer= q.defer(); 	
		var promise= this.req.send(this.urlManager.getMissionUrl(this.chk));
		promise.then(function(response){		
			var cookies= response.getCookies();
			if(cookies){
				var msg = CookieManager.getMessageByCookie(cookies);
				defer.resolve(msg);
			}else{
				defer.resolve(-1);
			}
		}, function(){ 
			console.log("not catched err")
		});
		return defer.promise;
};

Trooper.prototype.makeRaids= function(){	 
		var results = [], that= this, defer= q.defer(); 	
		var makeRaid = function(){
			that.makeRaid().then(function(result){
				results.push(result);
				if(result === 142){
					defer.resolve(results);
				}else{
					makeRaid();
				}
			});
		};
		makeRaid();
		return defer.promise;
};

Trooper.prototype.makeBattles= function(){
		var promise= q.all([
		this.makeBattle(),
		this.makeBattle(),
		this.makeBattle()
		]);
		return promise;
};


Trooper.prototype.makeMissions= function(){
		var promise= q.all([
		this.makeMission(),
		this.makeMission(),
		this.makeMission()
		]);
		return promise;
};

Trooper.prototype.toString= function(){
	return "chk: "+this.chk;
};


module.exports =  Trooper;