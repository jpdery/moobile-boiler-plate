/*
---

name: Class.Binds

description: A clean Class.Binds Implementation

authors: Scott Kyle (@appden), Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class, Core/Function]

provides: Class.Binds

...
*/

Class.Binds = new Class({

	$bound: {},

	bound: function(name){
		return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
	}

});

/*
---

name: Simulator

description: Creates a simulated device.

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Events.CSS3
	- Element.Style.Vendor
	- Class-Extras/Class.Binds

provides:
	- Simulator

...
*/

if (!window.Moobile)           window.Moobile = {};
if (!window.Moobile.Simulator) window.Moobile.Simulator = {};

Moobile.Simulator = new Class({

	Implements: [
		Events,
		Options,
		Class.Binds
	],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	applicationPath: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	applicationWindow: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	device: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	deviceName: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	deviceOrientation: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	deviceAnimating: false,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	deviceElement: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	facadeElement: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	screenElement: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	iframeElement: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	options: {
		container: document.body
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	initialize: function(options) {
		this.setOptions(options);
		this.build();
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	build: function() {

		Asset.css(Moobile.Simulator.getResource('simulator.css'));

		this.deviceElement = new Element('div.simulator').inject(this.options.container);
		this.facadeElement = new Element('div.simulator-facade').inject(this.deviceElement);
		this.screenElement = new Element('div.simulator-screen').inject(this.facadeElement);
		this.iframeElement = new Element('iframe[scrolling=no]').inject(this.screenElement);

		this.iframeElement.addEvent('load', this.bound('_onApplicationLoad'));

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	destroy: function() {

		this.iframeElement.removeEvent('load', this.bound('_onApplicationLoad'));
		this.iframeElement = null;

		this.deviceElement.destroy();
		this.deviceElement = null;
		this.facadeElement = null;
		this.screenElement = null;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDeviceAnimated: function(name) {

		if (this.deviceAnimating || this.deviceName === name)
			return this;

		var onPlay = function(anim) {
			if (anim === '2') this.setDevice(name);
		}.bind(this);

		var animation = this._createAnimationList();
		animation.setAnimation('1', new Animation(this.deviceElement).setAnimationClass('hide-device'));
		animation.setAnimation('2', new Animation(this.deviceElement).setAnimationClass('show-device'));
		animation.addEvent('play', onPlay);
		animation.start();

		this.fireEvent('beforedevicechange', name);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	setDevice: function(name) {

		if (this.deviceName === name)
			return this;

		if (this.device) {
			this.device.teardown();
			this.device = null;
		}

		var device = Moobile.Simulator.Device[name] || Moobile.Simulator.Device['iPhone5'];

		this.device = new device(this);
		this.deviceElement.setStyle('height', this.device.getSize().y);
		this.deviceElement.setStyle('width', this.device.getSize().x);
		this.device.setup();

		this.deviceName = name;

		this.fireEvent('devicechange', name);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDeviceOrientationAnimated: function(orientation) {

		if (this.deviceAnimating || this.deviceOrientation === orientation)
			return this;

		var onPlay = function(name) {
			if (name === '2') this.setDeviceOrientation(orientation);
		}.bind(this)

		var animation = this._createAnimationList();

		switch (orientation) {
			case 'portrait':
				animation.setAnimation('1', new Animation(this.deviceElement).setAnimationClass('rotate-device-portrait'));
				animation.setAnimation('2', new Animation(this.screenElement).setAnimationClass('rotate-screen-portrait'));
				break;
			case 'landscape':
				animation.setAnimation('1', new Animation(this.deviceElement).setAnimationClass('rotate-device-landscape'));
				animation.setAnimation('2', new Animation(this.screenElement).setAnimationClass('rotate-screen-landscape'));
				break;
		}

		animation.addEvent('play', onPlay);
		animation.start();

		this.fireEvent('beforedeviceorientationchange', orientation);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	setDeviceOrientation: function(orientation) {

		if (this.deviceOrientation === orientation)
			return this;

		this.deviceOrientation = orientation;

		this.deviceElement.removeClass('portrait');
		this.deviceElement.removeClass('landscape');
		this.deviceElement.addClass(orientation);

		if (this.applicationWindow) {
			this.applicationWindow.orientation = orientation === 'portrait' ? 0 : 90;
			this.applicationWindow.orientationName = orientation;
			this.applicationWindow.fireEvent('orientationchange');
		}

		this.fireEvent('deviceorientationchange', orientation);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getDeviceOrientation: function() {
		return this.deviceOrientation;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getDeviceName: function() {
		return this.deviceName;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getDeviceSize: function() {
		return this.device.getSize();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	setDeviceOptions: function(options) {

		if (this.device === null)
			return this;

		Object.each(options, function(value, option) {
			this.setDeviceOption(option, value);
		}, this);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getDeviceOptions: function() {
		return this.device ? this.device.getOptions() : null;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	setDeviceOption: function(option, value) {

		if (this.device == null)
			return this;

		var current = this.device.getOption(option);
		if (current === value)
			return this;

		this.device.setOption(option, value);

		this.fireEvent('deviceoptionchange', [option, value]);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getDeviceOption: function(option) {
		return this.device ? this.device.getOption(option) : null;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setApplication: function(path) {

		if (this.applicationPath === path)
			return this;

		this.applicationPath = path;
		this.applicationWindow = null;
		this.iframeElement.set('src', path + '?' + String.uniqueID());

		this.fireEvent('deviceapplicationchange', path);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getApplicationPath: function() {
		return this.applicationPath;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getApplicationWindow: function() {
		return this.applicationWindow;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getDeviceElement: function() {
		return this.deviceElement;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getFacadeElement: function() {
		return this.facadeElement;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getScreenElement: function() {
		return this.screenElement;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getIframeElement: function() {
		return this.iframeElement;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	_createAnimationList: function() {
		var list = new Animation.List();
		list.addEvent('start', this.bound('_onDeviceAnimationStart'));
		list.addEvent('end', this.bound('_onDeviceAnimationEnd'));
		return list;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	_onDeviceAnimationStart: function() {
		this.deviceAnimating = true;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	_onDeviceAnimationEnd: function() {
		this.deviceAnimating = false;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	_onApplicationLoad: function() {
		this.applicationWindow = this.iframeElement.contentWindow;
		this.applicationWindow.orientation = this.deviceOrientation === 'portrait' ? 0 : 90;
		this.applicationWindow.orientationName = this.deviceOrientation;
		this.device.applicationDidLoad();
	}

});

(function() {

var resourcePath = '.';

Moobile.Simulator.setResourcePath = function(path) {
	resourcePath = path.replace(/[/\\]+$/, '');
};

Moobile.Simulator.getResourcePath = function() {
	return resourcePath;
};

Moobile.Simulator.getResource = function(file) {
	return resourcePath + '/' + file;
}

})();

/*
---

name: Device

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Simulator

provides:
	- Device

...
*/

Moobile.Simulator.Device = new Class({

	Implements: [
		Class.Binds
	],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	simulator: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	resources: [],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	options: {},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @eduted 0.2
	 * @since  0.2
	 */
	initialize: function(simulator) {
		this.simulator = simulator;
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	setup: function() {
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @eduted 0.2
	 * @since  0.2
	 */
	teardown: function() {

		Object.each(this.options, function(option) {
			option.disable.call(this);
		}, this);

		this.options = null;
		this.simulator = null;
		this.resources.invoke('destroy');
		this.resource = null;

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	require: function(file) {

		file = Moobile.Simulator.getResource(file);

		var extension = file.split('.').pop();
		if (extension === null)
			return this;

		var load = null;
		switch (extension) {
			case 'js':  load = Asset.js; break;
			case 'css': load = Asset.css; break;
		}

		this.resources.push(load(file));

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getSize: function() {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getName: function() {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	applicationDidLoad: function() {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	defineOption: function(id, title, options) {

		this.options[id] = {
			title: title,
			active: options.active || false,
			enable: options.enable || function(){},
			disable: options.disable || function(){}
		};

		if (this.options[id].active) {
			this.options[id].enable.call(this);
		}

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	setOption: function(id, active) {

		if (active === undefined) {
			active = true;
		}

		var option = this.options[id];
		if (option) {
			option.active = active;
			if (active) option.enable.call(this)
			else        option.disable.call(this);
		}

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getOptions: function() {
		return this.options;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getOption: function(id) {
		return this.options[id] || null;
	}

});


/*
---

name: Device.iOS

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Device

provides:
	- Device.iOS

...
*/

Moobile.Simulator.Device['iOS'] = new Class({

	Extends: Moobile.Simulator.Device,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	glare: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	statusBar: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	statusBarTime: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	statusBarNetwork: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	statusBarBattery: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setup: function() {

		this.parent();

		this.require('iOS/styles.css');

		var wrapper = this.simulator.getDeviceElement();
		var content = this.simulator.getScreenElement();

		this.glare = new Element('div.simulator-glare');
		this.glare.inject(wrapper, 'top');

		this.statusBar = new Element('div.simulator-status-bar');
		this.statusBarTime = new Element('div.simulator-status-bar-time');
		this.statusBarNetwork = new Element('div.simulator-status-bar-network');
		this.statusBarBattery = new Element('div.simulator-status-bar-battery');

		this.statusBar.inject(content, 'top');
		this.statusBarTime.inject(this.statusBar);
		this.statusBarNetwork.inject(this.statusBar);
		this.statusBarBattery.inject(this.statusBar);

		this.defineOption('glare', 'Show Screen Glare', {
			active: true,
			enable:  function() { wrapper.removeClass('without-glare') },
			disable: function() { wrapper.addClass('without-glare') }
		});

		this.clock();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	teardown: function() {
		this.glare.destroy();
		this.glare = null;
		this.statusBar.destroy();
		this.statusBar = null;
		this.statusBarTime = null;
		this.statusBarNetwork = null;
		this.statusBarBattery = null;
		this.parent();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	clock: function() {

		var time = new Date()
		var hh = time.getHours()
		var mm = time.getMinutes()
		var am = "AM";
		if (hh >= 12) {
			hh = hh - 12;
			am = "PM";
		}
		if (hh == 0) {
			hh = 12;
		}
		if (mm < 10) {
			mm = "0" + mm;
		}

		if (this.statusBar) {
			this.statusBar.getElement('.simulator-status-bar-time').set('html', hh + ":" + mm + " " + am);
			this.clock.delay(5000, this);
		}
	}

});

/*
---

name: Device.iPad

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Device.iPhone

provides:
	- Device.iPad

...
*/

Moobile.Simulator.Device['iPad'] = new Class({

	Extends: Moobile.Simulator.Device['iOS'],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	safariBar: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	buttonBar: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setup: function() {

		this.parent();

		this.require('iPad/styles.css');

		var payload = this.simulator.getIframeElement();
		var wrapper = this.simulator.getDeviceElement();

		this.safariBar = new Element('div.simulator-safari-bar');
		this.safariBar.inject(payload, 'before');

		this.defineOption('safari-bar', 'Show Navigation Bar', {
			active: false,
			enable:  function() { wrapper.addClass('with-safari-bar'); },
			disable: function() { wrapper.removeClass('with-safari-bar'); }
		});
 	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	teardown: function() {
		this.safariBar.destroy();
		this.safariBar = null;
		this.parent();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getSize: function() {
		return {
			x: 966,
			y: 1256
		};
	}

});

/*
---

name: Device.iPhone4

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Device

provides:
	- Device.iPhone4

...
*/

Moobile.Simulator.Device['iPhone4'] = new Class({

	Extends: Moobile.Simulator.Device['iOS'],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	safariBar: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	buttonBar: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setup: function() {

		this.parent();

		this.require('iPhone4/styles.css');

		var payload = this.simulator.getIframeElement();
		var wrapper = this.simulator.getDeviceElement();

		this.safariBar = new Element('div.simulator-safari-bar');
		this.buttonBar = new Element('div.simulator-button-bar');
		this.safariBar.inject(payload, 'before');
		this.buttonBar.inject(payload, 'after');

		this.defineOption('safari-bar', 'Show Safari Navigation Bar', {
			active: false,
			enable:  function() { wrapper.addClass('with-safari-bar') },
			disable: function() { wrapper.removeClass('with-safari-bar') }
		});

		this.defineOption('tool-bar', 'Show Safari Toolbar', {
			active: false,
			enable:  function() { wrapper.addClass('with-button-bar') },
			disable: function() { wrapper.removeClass('with-button-bar') }
		});
 	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	teardown: function() {
		this.safariBar.destroy();
		this.safariBar = null;
		this.buttonBar.destroy();
		this.buttonBar = null;
		this.parent();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getSize: function() {
		return {
			x: 382,
			y: 744
		};
	}

});


/*
---

name: Device.iPhone5

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Device

provides:
	- Device.iPhone5

...
*/

Moobile.Simulator.Device['iPhone5'] = new Class({

	Extends: Moobile.Simulator.Device['iPhone4'],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setup: function() {
		this.parent();
		this.require('iPhone5/styles.css');
 	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getSize: function() {
		return {
			x: 382,
			y: 802
		};
	}

});


/*
---

name: Device.GalaxyS3

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Device

provides:
	- Device.GalaxyS3

...
*/

Moobile.Simulator.Device['GalaxyS3'] = new Class({

	Extends: Moobile.Simulator.Device,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	glare: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	statusBar: null,


	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setup: function() {

		this.parent();

		this.require('GalaxyS3/styles.css');

		var wrapper = this.simulator.getDeviceElement();
		var content = this.simulator.getScreenElement();

		this.glare = new Element('div.simulator-glare');
		this.glare.inject(wrapper, 'top');

		this.statusBar = new Element('div.simulator-status-bar');
		this.statusBar.inject(content, 'top');

		this.defineOption('glare', 'Show Screen Glare', {
			active: true,
			enable:  function() { wrapper.removeClass('without-glare') },
			disable: function() { wrapper.addClass('without-glare') }
		});
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	teardown: function() {
		this.glare.destroy();
		this.glare = null;
		this.statusBar.destroy();
		this.statusBar = null;
		this.parent();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2
	 */
	getSize: function() {
		return {
			x: 418,
			y: 812
		};
	}

});

/*
---

name: Animation

description: Provides a wrapper for a CSS animation.

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:

provides:
	- Animation

...
*/

if (!window.Moobile) window.Moobile = {};

/**
 * @see    http://moobilejs.com/doc/latest/Animation/Animation
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.1.0
 */
var Animation = new Class({

	Implements: [
		Events,
		Options,
		Class.Binds
	],

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_name: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_running: false,

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#element
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	element: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#animationClass
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	animationClass: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#animationProperties
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	animationProperties: {
		'name': null,
		'duration': null,
		'iteration-count': null,
		'animation-direction': null,
		'animation-timing-function': null,
		'animation-fill-mode': null,
		'animation-delay': null
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#initialize
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	initialize: function(element, options) {
		this.setElement(element);
		this.setOptions(options);
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setName
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setName: function(name) {
		this._name = name;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getName
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getName: function() {
		return this._name;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setElement
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setElement: function(element) {
		this.element = document.id(element);
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getElement
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getElement: function() {
		return this.element;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationClass
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationClass: function(value) {
		this.animationClass = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationClass
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationClass: function() {
		return this.animationClass;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationName
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationName: function(value) {
		this.animationProperties['name'] = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationName
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationName: function() {
		return this.animationProperties['name'];
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationDuration
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationDuration: function(value) {
		this.animationProperties['duration'] = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationDuration
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationDuration: function() {
		return this.animationProperties['duration'];
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationIterationCount
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationIterationCount: function(value) {
		this.animationProperties['iteration-count'] = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationIterationCount
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationIterationCount: function() {
		return this.animationProperties['iteration-count'];
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationDirection
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationDirection: function(value) {
		this.animationProperties['direction'] = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationDirection
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationDirection: function() {
		return this.animationProperties['direction'];
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationTimingFunction
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationTimingFunction: function(value) {
		this.animationProperties['timing-function'] = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationTimingFunction
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationTimingFunction: function() {
		return this.animationProperties['timing-function'];
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationFillMode
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationFillMode: function(value) {
		this.animationProperties['fill-mode'] = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationFillMode
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationFillMode: function() {
		return this.animationProperties['fill-mode'];
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#setAnimationDelay
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationDelay: function(value) {
		this.animationProperties['delay'] = value;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#getAnimationDelay
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationDelay: function() {
		return this.animationProperties['delay'];
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	attach: function() {

		this.element.addEvent('animationend', this.bound('onAnimationEnd'));
		this.element.addClass(this.animationClass);

		Object.each(this.animationProperties, function(val, key) {
			this.element.setStyle('-webkit-animation-' + key, val);
		}, this);

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	detach: function() {

		this.element.removeEvent('animationend', this.bound('onAnimationEnd'));
		this.element.removeClass(this.animationClass);

		Object.each(this.animationProperties, function(val, key) {
			this.element.setStyle('-webkit-animation-' + key, null);
		}, this);

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#start
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	start: function() {

		if (this._running)
			return this;


		this._running = true;
		this.fireEvent('start');
		this.attach();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#stop
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	stop: function() {

		if (this._running === false)
			return this;

		this._running = false;
		this.fireEvent('stop');
		this.detach();

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation#isRunning
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isRunning: function() {
		return this._running;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	onAnimationEnd: function(e) {

		if (this._running === false)
			return;

		if (this.element !== e.target)
			return;

		e.stop();

		this._running = false;
		this.detach();
		this.fireEvent('end');
	}

});


/*
---

name: Animation.List

description: Provides a container for multiple animations.

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Animation

provides:
	- Animation.List

...
*/

/**
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.1.0
 */
Animation.List = new Class({

	Extends: Animation,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	element: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	animations: [],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	currentAnimationIndex: -1,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	initialize: function(element, options) {
		this.parent(element, options);
		delete this.animationClass;
		delete this.animationProperties;
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimation: function(name, animation) {

		animation.setName(name);
		animation.setOptions(this.options);

		animation.addEvent('start', this.bound('onAnimationStart'));
		animation.addEvent('stop', this.bound('onAnimationStop'));
		animation.addEvent('end', this.bound('onAnimationEnd'));

		this.animations.include(animation);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimation: function(name) {
		return this.animations.find(function(animation) {
			return animation.getName() === name;
		});
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeAnimation: function(name) {

		var animation = this.getAnimation(name);
		if (animation) {
			animation.cancel();
			animation.removeEvent('start', this.bound('onAnimationStart'));
			animation.removeEvent('stop', this.bound('onAnimationStop'));
			animation.removeEvent('end', this.bound('onAnimationEnd'));
			this.animations.erase(animation);
		}

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setElement: function(element) {
		this.element = document.id(element);
		this.animations.invoke('setElement', this.element);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getElement: function() {
		return this.animations.invoke('getElement');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationClass: function(value) {
		this.animations.invoke('setAnimationClass', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationClass: function() {
		return this.animations.invoke('getAnimationClass');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationName: function(value) {
		this.animations.invoke('setAnimationName', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationName: function() {
		return this.animations.invoke('getAnimationName');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationDuration: function(value) {
		this.animations.invoke('setAnimationDuration', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationDuration: function() {
		return this.animations.invoke('getAnimationDuration');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationIterationCount: function(value) {
		this.animations.invoke('setAnimationIterationCount', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationIterationCount: function() {
		return this.animations.invoke('getAnimationIterationCount');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationDirection: function(value) {
		this.animations.invoke('setAnimationDirection', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationDirection: function() {
		return this.animations.invoke('getAnimationDirection');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationTimingFunction: function(value) {
		this.animations.invoke('setAnimationTimingFunction', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationTimingFunction: function() {
		return this.animations.invoke('getAnimationTimingFunction');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationFillMode: function(value) {
		this.animations.invoke('setAnimationFillMode', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationFillMode: function() {
		return this.animations.invoke('getAnimationFillMode');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setAnimationDelay: function(value) {
		this.animations.invoke('setAnimationDelay', value);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getAnimationDelay: function() {
		return this.animations.invoke('getAnimationDelay');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	start: function() {

		this.currentAnimationIndex = 0;

		var animation = this.animations[this.currentAnimationIndex];
		if (animation) {
			animation.start();
		}

		this.fireEvent('start');

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation.Set#stop
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	stop: function() {

		var animation = this.animations[this.currentAnimationIndex];
		if (animation) {
			animation.stop();
		}

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Animation/Animation.Set#isRunning
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isRunning: function() {
		return this.animations.some(function(animation) {
			return animation.isRunning();
		});
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	onAnimationStart: function() {
		this.fireEvent('play', this.animations[this.currentAnimationIndex].getName());
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	onAnimationStop: function() {
		this.fireEvent('stop', this.animations[this.currentAnimationIndex].getName());
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	onAnimationEnd: function() {
		var animation = this.animations[++this.currentAnimationIndex];
		if (animation) {
			animation.start();
		} else {
			this.fireEvent('end');
		}
	},

});


/*
---

name: Event.CSS3

description: Provides CSS3 events.

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Core/Event
	- Core/Element
	- Core/Element.Event

provides:
	- Event.CSS3

...
*/

(function() {

var prefix = '';
if (Browser.safari || Browser.chrome || Browser.Platform.ios) {
	prefix = 'webkit';
} else if (Browser.firefox) {
	prefix = 'Moz';
} else if (Browser.opera) {
	prefix = 'o';
} else if (Browser.ie) {
	prefix = 'ms';
}

Element.NativeEvents[prefix + 'TransitionEnd'] = 2;
Element.Events['transitionend'] = { base: (prefix + 'TransitionEnd') };

Element.NativeEvents[prefix + 'AnimationEnd'] = 2;
Element.Events['animationend'] = { base: (prefix + 'AnimationEnd') };

})();


/*
---

name: Element.defineCustomEvent

description: Allows to create custom events based on other custom events.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Element.Event]

provides: Element.defineCustomEvent

...
*/

(function(){

[Element, Window, Document].invoke('implement', {hasEvent: function(event){
	var events = this.retrieve('events'),
		list = (events && events[event]) ? events[event].values : null;
	if (list){
		var i = list.length;
		while (i--) if (i in list){
			return true;
		}
	}
	return false;
}});

var wrap = function(custom, method, extended){
	method = custom[method];
	extended = custom[extended];

	return function(fn, name){
		if (extended && !this.hasEvent(name)) extended.call(this, fn, name);
		if (method) method.call(this, fn, name);
	};
};

var inherit = function(custom, base, method){
	return function(fn, name){
		base[method].call(this, fn, name);
		custom[method].call(this, fn, name);
	};
};

var events = Element.Events;

Element.defineCustomEvent = function(name, custom){
	var base = events[custom.base];

	custom.onAdd = wrap(custom, 'onAdd', 'onSetup');
	custom.onRemove = wrap(custom, 'onRemove', 'onTeardown');

	events[name] = base ? Object.append({}, custom, {

		base: base.base,

		condition: function(event, name){
			return (!base.condition || base.condition.call(this, event, name)) &&
				(!custom.condition || custom.condition.call(this, event, name));
		},

		onAdd: inherit(custom, base, 'onAdd'),
		onRemove: inherit(custom, base, 'onRemove')

	}) : custom;

	return this;
};

Element.enableCustomEvents = function(){
  Object.each(events, function(event, name){
    if (event.onEnable) event.onEnable.call(event, name);
  });
};

Element.disableCustomEvents = function(){
  Object.each(events, function(event, name){
    if (event.onDisable) event.onDisable.call(event, name);
  });
};

})();


/*
---

name: Class.Instantiate

description: Simple Wrapper for Mass-Class-Instantiation

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class]

provides: Class.Instantiate

...
*/

Class.Instantiate = function(klass, options){
	var create = function(object){
		if (object.getInstanceOf && object.getInstanceOf(klass)) return;
		new klass(object, options);
	};

	return function(objects){
		objects.each(create);
	};
};

/*
---

name: Class.Singleton

description: Beautiful Singleton Implementation that is per-context or per-object/element

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class]

provides: Class.Singleton

...
*/

(function(){

var storage = {

	storage: {},

	store: function(key, value){
		this.storage[key] = value;
	},

	retrieve: function(key){
		return this.storage[key] || null;
	}

};

Class.Singleton = function(){
	this.$className = String.uniqueID();
};

Class.Singleton.prototype.check = function(item){
	if (!item) item = storage;

	var instance = item.retrieve('single:' + this.$className);
	if (!instance) item.store('single:' + this.$className, this);

	return instance;
};

var gIO = function(klass){

	var name = klass.prototype.$className;

	return name ? this.retrieve('single:' + name) : null;

};

if (('Element' in this) && Element.implement) Element.implement({getInstanceOf: gIO});

Class.getInstanceOf = gIO.bind(storage);

})();

/*
---

name: Class.Properties

description: Provides getters/setters sugar for your class properties.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class, Core/String]

provides: Class.Properties

...
*/

(function(){

var setter = function(name){
	return function(value){
		this[name] = value;
		return this;
	};
};

var getter = function(name){
	return function(){
		return this[name] || null;
	};
};

Class.Mutators.Properties = function(properties){
	this.implement(properties);

	for (var prop in properties){
		var name = prop.replace(/^_+/, '').capitalize().camelCase();
		this.implement('set' + name, setter(prop));
		this.implement('get' + name, getter(prop));
	}
};

})();

