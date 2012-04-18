// packager build Mobile/Browser.Mobile Mootilities/LocalStorage
/*
---

name: Browser.Mobile

description: Provides useful information about the browser environment

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Browser]

provides: Browser.Mobile

...
*/

(function(){

Browser.Device = {
	name: 'other'
};

if (Browser.Platform.ios){
	var device = navigator.userAgent.toLowerCase().match(/(ip(ad|od|hone))/)[0];
	
	Browser.Device[device] = true;
	Browser.Device.name = device;
}

if (this.devicePixelRatio == 2)
	Browser.hasHighResolution = true;

Browser.isMobile = !['mac', 'linux', 'win'].contains(Browser.Platform.name);

}).call(this);


/*
---

name: LocalStorage

description: Simple localStorage wrapper. Does not even attempt to be a fancy plugin.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Cookie, Core/JSON]

provides: LocalStorage

...
*/

(function(){

var storage, set, get, erase;
if ('localStorage' in this) {
	storage = this.localStorage;
	set = function(key, value){
		storage.setItem(key, JSON.encode(value));
		return this;
	};

	get = function(key){
		return JSON.decode(storage.getItem(key));
	};

	erase = function(key){
		storage.removeItem(key);
		return this;
	}.overloadGetter();
} else {
	storage = this.Cookie;
	set = function(key, value){
		storage.write(key, JSON.encode(value));
		return this;
	};

	get = function(key){
		return JSON.decode(storage.read(key));
	};

	erase = function(key){
		storage.dispose(key);
		return this;
	}.overloadGetter();
}

this.LocalStorage = {
	set: set.overloadSetter(),
	get: get.overloadGetter(),
	erase: function(){
		erase.apply(this, arguments);
		return this;
	}
};

})();

