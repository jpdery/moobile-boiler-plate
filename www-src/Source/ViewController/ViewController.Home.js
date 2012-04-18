/*
---

name: ViewController.Home

description:

license:

authors:
	- Your name

requires:

provides:
	- ViewController.Home

...
*/

if (!window.ViewController) window.ViewController = {};

ViewController.Home = new Class({

	Extends: Moobile.ViewController,

	loadView: function() {
		this.view = Moobile.View.at('templates/views/home-view.html');
	}

});