describe("seDelayedListFill", function () {
	"use strict";
	var DEFAULT_ITEMS_PER_ITERATION_COUNT = 25;
	var PIXELS_PER_ELEMENT = 1;

	var element, repeatElement, fillElement;
	var $rootScope, scope, $compile, $timeout;

	beforeEach(module("seDelayedList.seDelayedList", function() {
	}));
	beforeEach(module("seDelayedList.seDelayedListFill", function() {
	}));
	beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_) {
		$rootScope = _$rootScope_;
		scope = $rootScope.$new();
		$compile = _$compile_;
		$timeout = _$timeout_;
	}));

	beforeEach(inject(function () {
		scope.demoCtrl = {
			users: [],
			limit: DEFAULT_ITEMS_PER_ITERATION_COUNT
		};

		for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT*10+3);i++) {
			scope.demoCtrl.users.push({id: i});
		}
	}));

	function expectHidden() {
		expect(fillElement.css("display")).toBe("none");
	}
	function expectVisible() {
		expect(fillElement.css("display")).not.toBe("none");
		expect(fillElement.height()).toBe(PIXELS_PER_ELEMENT * (scope.demoCtrl.users.length - scope.demoCtrl.limit));
	}

	it("should watch for element count changes", inject(function () {
		element = angular.element(
			"<div data-se-delayed-list='demoCtrl.limit'>" +
			"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
			"	<div data-se-delayed-list-fill='" + PIXELS_PER_ELEMENT + "' ></div>" +
			"</div>");
		repeatElement = element.find("div");

		element = $compile(element)(scope);
		fillElement = element.find("[data-se-delayed-list-fill]");
		scope.$digest();
		expectVisible();


		for(var i = scope.demoCtrl.users.length;i<2*(DEFAULT_ITEMS_PER_ITERATION_COUNT*10+3);i++) {
			scope.demoCtrl.users.push({id: i});
		}

		scope.$digest();
		expectVisible();

		scope.demoCtrl.users.length = scope.demoCtrl.limit;
		scope.$digest();
		expectHidden();
	}));
	it("should watch for limit changes", inject(function () {
		element = angular.element(
			"<div data-se-delayed-list='demoCtrl.limit'>" +
			"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
			"	<div data-se-delayed-list-fill='" + PIXELS_PER_ELEMENT + "' ></div>" +
			"</div>");
		repeatElement = element.find("div");

		element = $compile(element)(scope);
		fillElement = element.find("[data-se-delayed-list-fill]");
		scope.$digest();
		expectVisible();

		scope.demoCtrl.limit++;
		scope.$digest();
		expectVisible();

		scope.demoCtrl.limit = scope.demoCtrl.users.length;

		scope.$digest();
		expectHidden();
	}));


});
