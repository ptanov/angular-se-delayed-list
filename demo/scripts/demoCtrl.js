angular.module("seDelayedListDirectiveDemoApp", ["seDelayedList"]).controller("DemoCtrl", function () {
	"use strict";
	var controller = this;

	function initState() {
		controller.users = [];
		for(var i = 0;i<3000;i++) {
		// for(var i = 0;i<300;i++) {
			controller.users.push({id: i});
		}
	}
	function atachMethods() {
	}

	initState();
	atachMethods();
});
