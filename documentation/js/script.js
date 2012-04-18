
window.addEvent('domready', function() {

	prettyPrint()

	document.getElements('[data-example]').each(function(el) {
		el.addClass('simulated-example');
		Moobile.Simulator.create('iPhone', el.get('data-example'), { container: el });
	});

	document.getElements('[data-simulator-app]').each(function(el) {
		el.addClass('simulator-wrapper');
		el.getParent('.content').addClass('with-simulator');
		Moobile.Simulator.create('iPhone', el.get('data-simulator-app'), { container: el });
	});

	document.getElements('.sidebar a').each(function(el) {
		var href = el.get('href');
		if (window.location.pathname.contains(href)) {
			el.addClass('current');
		}
	});

});