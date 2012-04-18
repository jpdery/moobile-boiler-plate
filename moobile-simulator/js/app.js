
// The default resource path

Moobile.Simulator.setResourcePath('resources')

// -----------------------------------------------------------------------------
// Toolbar
// -----------------------------------------------------------------------------

new Unit({

	Prefix: 'toolbar',

	openButton: null,

	openExternalButton: null,

	deviceButtons: null,

	orientationButtons: null,

	readySetup: function() {

		this.openButton = document.getElement('.toolbar .tool.open');
		this.openExternalButton = document.getElement('.toolbar .tool.open-external');
		this.deviceButtons = document.getElements('.toolbar .tool.device .option');
		this.orientationButtons = document.getElements('.toolbar .tool.orientation .option');

		this.openButton.addEvent('click', this.onOpen.bind(this));
		this.openExternalButton.addEvent('click', this.onOpenExternal.bind(this));
		this.deviceButtons.addEvent('click', this.onDeviceSelect.bind(this));
		this.orientationButtons.addEvent('click', this.onOrientationSelect.bind(this));

		this.subscribe('open.file', this.onFileOpen.bind(this));

		var file = LocalStorage.get('file');
		if (file) {
			this.openExternalButton.addClass('visible');
		}
	},

	onOpen: function(e) {
		this.publish('open');
	},

	onOpenExternal: function(e) {
		var iframe = document.getElement('iframe');
		if (iframe) {
			var source = iframe.get('src');
			if (source) {
				var size = iframe.getSize();
				var external = window.open(source, '_blank', 'height=' + size.y + ',width=' + size.x + ',location=no,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no');
				if (Browser.Platform.mac) {
					(function() {
						if (Browser.safari) external.resizeTo(size.x, size.y + 24);
						if (Browser.chrome) external.resizeTo(size.x, size.y + 50);
					}).delay(5);
				}
			}
		}
	},

	onDeviceSelect: function(e) {
		this.publish('select device', e.target.get('data-value'));
	},

	onOrientationSelect: function(e) {
		this.publish('select orientation', e.target.get('data-value'));
	},

	onFileOpen: function(file) {
		if (file) {
			this.openExternalButton.addClass('visible');
		} else {
			this.openExternalButton.removeClass('visible');
		}
	}

});

// -----------------------------------------------------------------------------
// Open Dialog
// -----------------------------------------------------------------------------

new Unit({

	Prefix: 'open',

	input: null,

	openButton: null,

	closeButton: null,

	readySetup: function() {
		this.input = document.getElement('.open-dialog input');
		this.input.set('value', LocalStorage.get('file'));
		document.getElement('.open-dialog .button.open').addEvent('click', this.onOpenButtonClick.bind(this))
		document.getElement('.open-dialog .button.close').addEvent('click', this.onCloseButtonClick.bind(this))
		this.subscribe('toolbar.open', this.onRequestOpen.bind(this));
	},

	toggle: function() {
		var togglable = document.getElements('.open-dialog, .simulator');
		togglable.addClass('animated');
		togglable.addEvent('transitionend', function() { togglable.removeClass('animated'); });
		togglable.toggleClass('flipped');
	},

	onRequestOpen: function() {
		this.toggle();
	},

	onOpenButtonClick: function() {
		this.publish('file', this.input.get('value'));
		this.toggle();
	},

	onCloseButtonClick: function() {
		this.toggle();
	}

});

// -----------------------------------------------------------------------------
// Simulator
// -----------------------------------------------------------------------------

new Unit({

	Prefix: 'simulator',

	simulator: null,

	reflection: null,

	readySetup: function() {

		if (Browser.safari)
			document.body.addClass('safari');
		if (Browser.chrome)
			document.body.addClass('chrome');

		this.reflection = document.getElement('.content .reflection');
		this.subscribe('toolbar.select device', this.onRequestDeviceChange.bind(this));
		this.subscribe('toolbar.select orientation', this.onRequestOrientationChange.bind(this));
		this.subscribe('open.file', this.onOpenFile.bind(this));
		this.create();
	},

	create: function() {

		var device = LocalStorage.get('device');
		if (device === null) {
			device = 'iPhone';
		}

		var orientation = LocalStorage.get('orientation')
		if (orientation === null) {
			orientation = 'portrait';
		}

		var file = LocalStorage.get('file');

		var options = {
			deviceOrientation: orientation,
			devicePixelRatio: 1,
			container: this.reflection
		}

		this.simulator = Moobile.Simulator.create(device, file, options);
		this.simulator.addEvent('devicechange', this.onDeviceChange.bind(this));
		this.simulator.addEvent('deviceorientationchange', this.onDeviceOrientationChange.bind(this));

		this.reflect();
	},

	reflect: function() {

		var s = this.simulator.getDeviceSize();
		var o = this.simulator.getDeviceOrientation();

		switch (o) {
			case 'portrait':  this.reflection.setStyle('height', s.y); break;
			case 'landscape': this.reflection.setStyle('height', s.x); break;
		}

		return this;
	},

	onOpenFile: function(file) {
		LocalStorage.set('file', file);
		this.simulator.setApplication(file);
	},

	onRequestDeviceChange: function(device) {
		LocalStorage.set('device', device);
		this.simulator.setDeviceAnimated(device);
	},

	onRequestOrientationChange: function(orientation) {
		LocalStorage.set('orientation', orientation);
		this.simulator.setDeviceOrientationAnimated(orientation);
	},

	onDeviceChange: function(name) {
		this.reflect();
	},

	onDeviceOrientationChange: function(orientation) {
		this.reflect();
	}

});
