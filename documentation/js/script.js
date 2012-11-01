
window.addEvent('domready', function() {

	prettyPrint()

	document.getElements('[data-example]').each(function(el) {
		el.addClass('simulated-example');
		Moobile.Simulator.create('iPhone', el.get('data-example'), { container: el });
	});

	document.getElements('[data-simulator-app]').each(function(el) {
		el.addClass('simulator-wrapper');
		var simulator = new Moobile.Simulator({container: el});
		simulator.setDevice(el.get('data-device') || 'iPhone5');
		simulator.setDeviceOrientation(el.get('data-orientation') || 'portrait');
		simulator.setApplication(el.get('data-simulator-app'));
	});

	document.getElements('.sidebar a').each(function(el) {
		var href = el.get('href').replace('../../', '');
		if (window.location.pathname.contains(href)) {
			el.addClass('current');
		}
	});

	document.getElements('.table-of-contents a').each(function(el) {
		el.addEvent('click', function(e) {
			e.stop();
			document.location.hash = this.href.split('#')[1];
		});
	});

});