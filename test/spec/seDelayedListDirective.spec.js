describe("seDelayedList", function () {
	"use strict";
	var DEFAULT_ITEMS_PER_ITERATION_COUNT = 25;
	var DEFAULT_INTERVAL = 40;
	var BEFORE_INTERVAL = 1;

	var element, repeatElement;
	var $rootScope, scope, $compile, $timeout;

	beforeEach(module("seDelayedList.seDelayedList", function() {
	}));
	beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_) {
		$rootScope = _$rootScope_;
		scope = $rootScope.$new();
		$compile = _$compile_;
		$timeout = _$timeout_;
	}));

	describe("compile stage", function () {
		it("should add limitTo if there is no track by", inject(function () {
			element = angular.element(
				"<div data-se-delayed-list='demoCtrl.limit'>" +
				"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
				"</div>");
			repeatElement = element.find("div");

			$compile(element);

			expect(repeatElement.attr("data-ng-repeat")).toBe("user in demoCtrl.users | limitTo:demoCtrl.limit ");
		}));

		it("should add limitTo if there is track by", inject(function () {
			element = angular.element(
				"<div data-se-delayed-list='demoCtrl.limit'>" +
				"	<div data-ng-repeat='user in demoCtrl.users track by user.id' ></div>" +
				"</div>");
			repeatElement = element.find("div");

			$compile(element);

			expect(repeatElement.attr("data-ng-repeat")).toBe("user in demoCtrl.users  | limitTo:demoCtrl.limit track by user.id");
		}));

		it("should add limitTo if there is \\s between track and by", inject(function () {
			element = angular.element(
				"<div data-se-delayed-list='demoCtrl.limit'>" +
				"	<div data-ng-repeat='user in demoCtrl.users track" + " " + " " + " " + "	" + " " + " by user.id' ></div>" +
				"</div>");
			repeatElement = element.find("div");

			$compile(element);

			expect(repeatElement.attr("data-ng-repeat")).toBe("user in demoCtrl.users  | limitTo:demoCtrl.limit track" +
				" " + " " + " " + "	" + " " + " by user.id");
		}));

		it("should add limitTo if there is track by and expression is multiline", inject(function () {
			element = angular.element(
				"<div data-se-delayed-list='demoCtrl.limit'>" +
				"	<div data-ng-repeat='user    \n   \n   in    \n   \n   demoCtrl.users    \n  \n   \ntrack by user.id' ></div>" +
				"</div>");
			repeatElement = element.find("div");

			$compile(element);

			expect(repeatElement.attr("data-ng-repeat")).toBe("user    \n   \n   in    \n   \n   demoCtrl.users    \n  \n   \n | limitTo:demoCtrl.limit track by user.id");
		}));
		it("should add limitTo if there is track by and expression is multiline", inject(function () {
			element = angular.element(
				"<div data-se-delayed-list='demoCtrl.limit'>" +
				"	<div data-ng-repeat='user in demoCtrl.users\ntrack by user.id' ></div>" +
				"</div>");
			repeatElement = element.find("div");

			$compile(element);

			expect(repeatElement.attr("data-ng-repeat")).toBe("user in demoCtrl.users\n | limitTo:demoCtrl.limit track by user.id");
		}));

		it("should add limitTo if there is no track by and expression is multiline", inject(function () {
			element = angular.element(
				"<div data-se-delayed-list='demoCtrl.limit'>" +
				"	<div data-ng-repeat='user in\ndemoCtrl.users' ></div>" +
				"</div>");
			repeatElement = element.find("div");

			$compile(element);

			expect(repeatElement.attr("data-ng-repeat")).toBe("user in\ndemoCtrl.users | limitTo:demoCtrl.limit ");
		}));

	});

	describe("link stage", function () {
		describe("resetLimitEverytimeFilterIsChanged", function () {
			it("should listen for filter changes and reset limit", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit' data-se-delayed-list-filter='demoCtrl.filter'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);

				expect(scope.demoCtrl.limit).toBe(DEFAULT_ITEMS_PER_ITERATION_COUNT);

				scope.demoCtrl.limit = 0;

				scope.demoCtrl.filter = {};
				scope.$digest();

				expect(scope.demoCtrl.limit).toBe(DEFAULT_ITEMS_PER_ITERATION_COUNT);
			}));
			it("should not listen for filter changes if there is no filter", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);

				expect(scope.demoCtrl.limit).toBe(DEFAULT_ITEMS_PER_ITERATION_COUNT);

				scope.demoCtrl.limit = 0;

				scope.demoCtrl.filter = {};
				scope.$digest();

				expect(scope.demoCtrl.limit).toBe(0);
			}));
		});
		describe("increase limit", function () {
			beforeEach(inject(function () {
				scope.demoCtrl = {
					users: []
				};
			}));
			it("should increment limit until max value - exact page", inject(function () {
				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT*10);i++) {
					scope.demoCtrl.users.push({id: i});
				}

				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				var elementsCount = scope.demoCtrl.users.length;

				element = $compile(element)(scope);
				var expectedCount = DEFAULT_ITEMS_PER_ITERATION_COUNT;
				expect(scope.demoCtrl.limit).toBe(expectedCount);

				do {
					$timeout.flush(DEFAULT_INTERVAL - BEFORE_INTERVAL);
					scope.$digest();
					expect(scope.demoCtrl.limit).toBe(expectedCount);
					$timeout.flush(BEFORE_INTERVAL);
					scope.$digest();

					expectedCount += DEFAULT_ITEMS_PER_ITERATION_COUNT;
					expectedCount = Math.min(expectedCount, elementsCount);

					expect(scope.demoCtrl.limit).toBe(expectedCount);
				} while (expectedCount < elementsCount);
				$timeout.verifyNoPendingTasks();
			}));
			it("should increment limit until max value - not exact page", inject(function () {
				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT*10+3);i++) {
					scope.demoCtrl.users.push({id: i});
				}

				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				var elementsCount = scope.demoCtrl.users.length;

				element = $compile(element)(scope);
				var expectedCount = DEFAULT_ITEMS_PER_ITERATION_COUNT;
				expect(scope.demoCtrl.limit).toBe(expectedCount);

				do {
					$timeout.flush(DEFAULT_INTERVAL - BEFORE_INTERVAL);
					scope.$digest();
					expect(scope.demoCtrl.limit).toBe(expectedCount);
					$timeout.flush(BEFORE_INTERVAL);
					scope.$digest();

					expectedCount += DEFAULT_ITEMS_PER_ITERATION_COUNT;
					expectedCount = Math.min(expectedCount, elementsCount);

					expect(scope.demoCtrl.limit).toBe(expectedCount);
				} while (expectedCount < elementsCount);
				$timeout.verifyNoPendingTasks();
			}));
		});
		describe("controller.getElementsCount", function () {
			beforeEach(inject(function () {
				scope.demoCtrl = {
					users: [{}]
				};
			}));

			it("should return count", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);
				var controller = element.data("$seDelayedListController");
				// to create at least one ng-repeat element:
				scope.$digest();
				expect(controller.getElementsCount()).toBe(scope.demoCtrl.users.length);
				scope.demoCtrl.users.push({});
				scope.demoCtrl.users.push({});
				expect(controller.getElementsCount()).toBe(scope.demoCtrl.users.length);
			}));
			it("should support multiline ng-repeat", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user   \n   \n  in   \n \n  \n demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);
				var controller = element.data("$seDelayedListController");
				// to create at least one ng-repeat element:
				scope.$digest();
				expect(controller.getElementsCount()).toBe(scope.demoCtrl.users.length);
				scope.demoCtrl.users.push({});
				scope.demoCtrl.users.push({});
				expect(controller.getElementsCount()).toBe(scope.demoCtrl.users.length);
			}));

		});
		describe("controller.getLimit", function () {
			beforeEach(inject(function () {
				scope.demoCtrl = {
					limit: 1
				};
			}));

			it("should return limit", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);
				var controller = element.data("$seDelayedListController");
				expect(controller.getLimit()).toBe(scope.demoCtrl.limit);
				scope.demoCtrl.limit = 5;
				expect(controller.getLimit()).toBe(scope.demoCtrl.limit);
			}));

		});

	});

});
