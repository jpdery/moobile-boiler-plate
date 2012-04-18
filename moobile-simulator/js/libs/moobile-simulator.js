/*
---

name: Element.Style.Vendor

description: Automatically adds vendor prefix to styles

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Core/Event
	- Core/Element
	- Core/Element.Event

provides:
	- Element.Style.Vendor

...
*/

(function() {

var setStyle = Element.prototype.setStyle;
var getStyle = Element.prototype.getStyle;

var prefixes = ['Khtml', 'O', 'Ms', 'Moz', 'Webkit'];

var cache = {};

Element.implement({

	getPrefixed: function (property) {

		property = property.camelCase();

		if (property in this.style)
			return property;

		if (cache[property] !== undefined)
			return cache[property];

		var suffix = property.charAt(0).toUpperCase() + property.slice(1);

		for (var i = 0; i < prefixes.length; i++) {
			var prefixed = prefixes[i] + suffix;
			if (prefixed in this.style) {
				cache[property] = prefixed;
				break
			}
		}

		return cache[property];
	},

	setStyle: function (property, value) {
		return setStyle.call(this, this.getPrefixed(property), value);
	},

	getStyle: function (property) {
		return getStyle.call(this, this.getPrefixed(property));
	}

});

})();

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
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_device: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_deviceName: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_deviceOrientation: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_devicePixelRatio: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	animating: false,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	applicationPath: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	applicationWindow: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	element: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	display: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	content: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	iframe: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	options: {
		deviceOrientation: 'portrait',
		devicePixelRatio: 1,
		container: null,
		animationDuration: '350ms',
		animationTimingFunction: 'cubic-bezier(0.5, 0.1, 0.5, 1.0)'
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	initialize: function(device, options) {

		this.setOptions(options);

		var parent = document.id(this.options.container) || document.body;

		if (Browser.safari) document.id(document.body).addClass('safari');
		if (Browser.chrome) document.id(document.body).addClass('chrome');

		if (!Browser.safari && !Browser.chrome) {
			this.notSupported(parent);
			return;
		}

		this.element =
			new Element('div.simulator').adopt([
				new Element('div.simulator-display').adopt([
					new Element('div.simulator-content').adopt([
						new Element('iframe')
					])
				])
			]).inject(parent);

		this.display = this.element.getElement('div.simulator-display');
		this.content = this.element.getElement('div.simulator-content');
		this.iframe  = this.element.getElement('div.simulator-content iframe');

		this.setDevice(device);
		this.setDeviceOrientation(this.options.deviceOrientation);

		window.addEvent('appready', this.bound('_onApplicationReady'));

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDevice: function(name) {

		if (this.animating)
			return this;

		if (this._deviceName === name)
			return this;

		return this._applyDevice(name);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDeviceAnimated: function(name) {

		if (this.animating)
			return this;

		if (this._deviceName === name)
			return this;

		var rotation = this._deviceOrientation == 'portrait' ? 'rotate(0deg)' : 'rotate(90deg)';

		var hideAnimation = {
			'opacity':   [1, 0],
			'transform': [
				rotation + ' scale(1.00)',
				rotation + ' scale(0.75)'
			]
		};

		var showAnimation = {
			'opacity':   [0, 1],
			'transform': [
				rotation + ' scale(0.75)',
				rotation + ' scale(1.00)'
			]
		};

		var animationEnd = function() {
			this._applyDevice(name);
			this._animate(showAnimation);
		}.bind(this);

		if (this._device) {
			this._animate(hideAnimation, animationEnd);
			return this;
		}

		animationEnd();

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_applyDevice: function(name) {

		if (this._device) {
			this._device.teardown();
			this._device = null;
		}

		this._deviceName = name;

		this._device = Moobile.Simulator.Device.create(name, this);
		this._device.decorate(
			this.element,
			this.display,
			this.content,
			this.iframe
		);

		var size = this.getDeviceSize();
		this.element.setStyle('height', size.y);
		this.element.setStyle('width', size.x);

		this.fireEvent('devicechange', name);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getDevice: function() {
		return this._device;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getDeviceSize: function() {
		return this._device ? this._device.getSize() : {x:0, y:0};
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDeviceOrientation: function(orientation) {

		if (this.animating)
			return this;

		if (this._deviceOrientation === orientation)
			return this;

		if (this._device.supportsOrientation(orientation)) {
			this._device.willChangeOrientation(orientation);
			this._applyDeviceOrientation(orientation);
			this._device.didChangeOrientation(orientation);
		}

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDeviceOrientationAnimated: function(orientation) {

		if (this.animating)
			return this;

		if (this._deviceOrientation === orientation)
			return this;

		if (this._device.supportsOrientation(orientation)) {

			var animationEnd = function() {
				this._device.didChangeOrientation(orientation);
			}.bind(this);

			this._device.willChangeOrientationAnimated(orientation);
			this._animate(animationEnd);
			this._applyDeviceOrientation(orientation);
		}

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_applyDeviceOrientation: function(orientation) {

		this._deviceOrientation = orientation;

		(function() {

			this.element.removeClass('portrait');
			this.element.removeClass('landscape');
			this.element.addClass(orientation);

			switch (orientation) {
				case 'portrait':
					this.element.setStyle('transform', 'rotate(0deg)');
					this.content.setStyle('transform', 'rotate(0deg)');
					break;
				case 'landscape':
					this.element.setStyle('transform', 'rotate(90deg)');
					this.content.setStyle('transform', 'rotate(-90deg)');
					break;
			}

			if (this.applicationWindow) {
				this.applicationWindow.orientation = orientation === 'portrait' ? 0 : 90;
				this.applicationWindow.orientationName = orientation;
				this.applicationWindow.fireEvent('rotate', orientation);
			}

			this.fireEvent('deviceorientationchange', orientation);

		}).delay(5, this);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getDeviceOrientation: function() {
		return this._deviceOrientation;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDevicePixelRatio: function() {
		// TODO
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_applyPixelRatio: function(ratio) {
		// TODO
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setDevicePixelRatioAnimated: function() {
		// TODO
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getDevicePixelRatio: function() {
		// TODO
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_animate: function(style, value, callback) {

		this.animating = true;

		var styles = {};

		switch (typeof style) {
			case 'string':
				styles[style] = value;
				break;
			case 'function':
				callback = style;
				break;
			case 'object':
				styles = style;
				callback = value;
				break;
		}

		var f = {};
		var t = {};
		Object.each(styles, function(val, key) {
			val = Array.from(val);
			if (val.length == 2) {
				f[key] = val[0];
				t[key] = val[1];
			} else {
				t[key] = val[0];
			}
		});

		this.element.setStyles(f);

		(function() {

			var parent = this.element.getParent();
			if (parent) {
				parent.setStyle('perspective', 1000);
			}

			this.element.setStyle('transform-style', 'preserve-3d');
			this.element.setStyle('transition-property', 'all');
			this.element.setStyle('transition-duration', this.options.animationDuration);
			this.element.setStyle('transition-timing-function', this.options.animationTimingFunction);

			this.element.addEvent('transitionend:once', function(e) {

				if (parent) {
					parent.setStyle('perspective', null);
				}

				this.element.setStyle('transform-style', null);
				this.element.setStyle('transition-property', null);
				this.element.setStyle('transition-duration', null);
				this.element.setStyle('transition-timing-function', null);

				if (callback) callback();

				this.animating = false;

			}.bind(this));

			this.element.setStyles(t);

		}).delay(5, this);

		return this;
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

		this.iframe.set('src', path + '?' + String.uniqueID());

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getApplication: function() {
		return this.applicationPath;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_onApplicationReady: function() {
		this.applicationWindow = this.iframe.contentWindow;
		this.applicationWindow.orientation = this._deviceOrientation === 'portrait' ? 0 : 90;
		this.applicationWindow.orientationName = this._deviceOrientation;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getAnimationDuration: function() {
		return this.options.animationDuration;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getAnimationTimingFunction: function() {
		return this.options.animationTimingFunction;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	notSupported: function(container) {
		new Element('style[type=text/css]')
		.set('html',
			'.browser-not-supported {' +
			'	-webkit-border-radius: 12px;' +
			'	   -moz-border-radius: 12px;' +
			'	        border-radius: 12px;' +
			'	background: black;' +
			'	background: rgba(0, 0, 0, 0.5);' +
			'	color: white;' +
			'	font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;' +
			'	font-weight: 400;' +
			'	line-height: 22px;' +
			'	padding: 20px;' +
			'	text-shadow: 0px 1px 0px rgba(0, 0, 0, 0.5);' +
			'	width: 400px;' +
			'}' +
			'.browser-not-supported strong {' +
			'	font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;' +
			'	font-weight: 500;' +
			'	font-size: 28px;' +
			'	display: block;' +
			'	margin-bottom: 10px;' +
			'}' +
			'.browser-not-supported a {' +
			'	color: #8ec4de;' +
			'	text-decoration: none;' +
			'}'
		).inject(container);
		var element = new Element('div.browser-not-supported').set('html',
			'<strong>Sorry!</strong>' +
			'Your browser is currently not supported. ' +
			'This simulator works with <a href="http://www.apple.com/safari/">Safari</a> or <a href="https://www.google.com/chrome">Google Chrome</a>.'
		);
		element.inject(container);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getElement: function() {
		return this.element;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	toElement: function() {
		return this.getElement();
	}

});

(function() {

Moobile.Simulator.Animated = true;

var resourcePath = '.';

Moobile.Simulator.setResourcePath = function(path) {
	resourcePath = path.replace(/[/\\]+$/, '');
};

Moobile.Simulator.getResourcePath = function() {
	return resourcePath;
};

var instances = [];

Moobile.Simulator.create = function(device, app, options) {
	var simulator = new Moobile.Simulator(device, options).setApplication(app);
	instances.push(simulator);
	return simulator;
};

Moobile.Simulator.getInstances = function() {
	return instances;
};

Moobile.Simulator.getCurrentInstance = function() {
	return instances[instances.length - 1];
};

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
		Events,
		Options,
		Class.Binds
	],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_simulator: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_resources: [],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	initialize: function(simulator) {
		this._simulator = simulator;
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	decorate: function(element, display, content, iframe) {
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	teardown: function() {
		this._resources.invoke('destroy');
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getSize: function() {
		return {};
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	loadCSS: function(file) {
		this._resources.push(Asset.css(Moobile.Simulator.getResourcePath() + '/' + file));
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	loadJS: function(file) {
		this._resources.push(Asset.javascript(Moobile.Simulator.getResourcePath() + '/' + file));
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willChangeOrientation: function(orientation) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willChangeOrientationAnimated: function(orientation) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didChangeOrientation: function(orientation) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didChangeOrientationAnimated: function(orientation) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	supportsOrientation: function(orientation) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	supportsPixelRatio: function(ratio) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willChangePixelRatio: function(ratio) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willChangePixelRatioAnimated: function(ratio) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didChangePixelRatio: function(ratio) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didChangePixelRatioAnimated: function(ratio) {

	}

});

Moobile.Simulator.Device.create = function(name, simulator) {
	var device = Moobile.Simulator.Device[name];
	if (device) return new device(simulator);
	throw new Error('Device ' + name + ' does not exists.');
};


/*
---

name: Device.iPhone

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Device

provides:
	- Device.iPhone

...
*/

Moobile.Simulator.Device['iPhone'] = new Class({

	Extends: Moobile.Simulator.Device,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	element: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	glare: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	statusBar: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	buttonBar: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	decorate: function(element, display, content, iframe) {

		this.loadCSS('iPhone/styles.css');

		this.element = element;

		this.glare = new Element('div.simulator-display-glare').inject(element, 'top');
		this.buttonBar = new Element('div.simulator-button-bar').inject(content, 'bottom');
		this.statusBar = new Element('div.simulator-status-bar').inject(content, 'top');
		this.statusBar.adopt([
			new Element('div.simulator-status-bar-time'),
			new Element('div.simulator-status-bar-network'),
			new Element('div.simulator-status-bar-battery')
		]);

		this.updateTime();
 	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	teardown: function() {
		this.glare.destroy();
		this.statusBar.destroy();
		this.buttonBar.destroy();
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
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willChangeOrientationAnimated: function(orientation) {
		this.element.addClass('animate');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didChangeOrientationAnimated: function(orientation) {
		this.element.removeClass('animate');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	supportsOrientation: function(orientation) {
		return ['portrait', 'landscape'].contains(orientation);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	supportsPixelRatio: function(ratio) {
		return [1, 2].contains(ratio);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	updateTime: function() {

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

		this.element.getElement('.simulator-status-bar-time').set('html', hh + ":" + mm + " " + am);

		this.updateTime.delay(5000, this);
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

	Extends: Moobile.Simulator.Device.iPhone,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	decorate: function(element, display, content, iframe) {
		this.parent(element, display, content, iframe);
		this.loadCSS('iPad/styles.css');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getSize: function() {
		return {
			x: 978,
			y: 1268
		};
	}

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

