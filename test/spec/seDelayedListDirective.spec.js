describe("seDelayedList", function () {
	"use strict";
	var DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST = 30;
	var DEFAULT_ITEMS_PER_ITERATION_COUNT = 25;
	var DEFAULT_INTERVAL = 40;
	var BEFORE_INTERVAL = 1;

	var element, repeatElement;
	var $rootScope, scope, $compile, $interval;

	beforeEach(module("seDelayedList.seDelayedList", function() {
	}));
	beforeEach(inject(function (_$rootScope_, _$compile_, _$interval_) {
		$rootScope = _$rootScope_;
		scope = $rootScope.$new();
		$compile = _$compile_;
		$interval = _$interval_;
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
		describe("increase limit", function () {
			function iterateOverLimit(limitHolder, elementsCount, initialElementsCount) {
				var expectedCount = initialElementsCount || DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST;

				// expect(limitHolder.limit).toBe(expectedCount);

				scope.$digest();
				expect(limitHolder.limit).toBe(expectedCount);
				if (expectedCount >= elementsCount) {
					expectLimit(limitHolder, expectedCount);
					return;
				}

				do {
					$interval.flush(DEFAULT_INTERVAL - BEFORE_INTERVAL);
					scope.$digest();
					expect(limitHolder.limit).toBe(expectedCount);
					$interval.flush(BEFORE_INTERVAL);
					scope.$digest();

					expectedCount += DEFAULT_ITEMS_PER_ITERATION_COUNT;

					expect(limitHolder.limit).toBe(expectedCount);
				} while (expectedCount < elementsCount);

				// be sure that there are no increments
				$interval.flush(DEFAULT_INTERVAL * 2);
				scope.$digest();
				expect(limitHolder.limit).toBe(expectedCount);
			}
			function expectLimit(limitHolder, expectedLimit) {
				scope.$digest();
				expect(limitHolder.limit).toBe(expectedLimit);

				scope.$digest();
				expect(limitHolder.limit).toBe(expectedLimit);

				// be sure that there are no increments
				$interval.flush(DEFAULT_INTERVAL * 2);
				scope.$digest();
				expect(limitHolder.limit).toBe(expectedLimit);
			}
			beforeEach(inject(function () {
				scope.demoCtrl = {
					users: []
				};
			}));
			it("should increment limit until max value - exact page", inject(function () {
				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST*10);i++) {
					scope.demoCtrl.users.push({id: i});
				}

				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);

				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);
			}));
			it("should increment limit until max value - not exact page", inject(function () {
				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST + DEFAULT_ITEMS_PER_ITERATION_COUNT*10+3);i++) {
					scope.demoCtrl.users.push({id: i});
				}

				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);

				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);
			}));

			it("should listen for elements changes and reset limit", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");


				element = $compile(element)(scope);
				// initial value - 0 items
				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);

				// populate with items after initializing
				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST+DEFAULT_ITEMS_PER_ITERATION_COUNT*10);i++) {
					scope.demoCtrl.users.push({id: i});
				}
				scope.$digest();

				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);
			}));
			it("should listen for elements changes and reset limit with initial data", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				var initialElementsCount = (DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST+DEFAULT_ITEMS_PER_ITERATION_COUNT*10);

				for(var i = 0;i<initialElementsCount;i++) {
					scope.demoCtrl.users.push({id: i});
				}

				element = $compile(element)(scope);
				// initial value
				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);

				// populate with items after initializing
				for(i = initialElementsCount;i<2*initialElementsCount;i++) {
					scope.demoCtrl.users.push({id: i});
				}
				scope.$digest();

				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length, initialElementsCount + DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST);
			}));
			it("should listen for filter changes and reset limit", inject(function () {
				var trueCount = 0;
				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST + DEFAULT_ITEMS_PER_ITERATION_COUNT*10);i++) {
					scope.demoCtrl.users.push({id: i, even: (i%2)===0});
					if ((i%2)===0) {
						trueCount++;
					}
				}
				scope.demoCtrl.filter = {};
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users | filter:demoCtrl.filter' ></div>" +
					"</div>");
				repeatElement = element.find("div");


				element = $compile(element)(scope);
				var controller = element.data("$seDelayedListController");

				// initial value - all items
				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);

				// populate with items after filter
				scope.demoCtrl.filter.even = true;

				expect(controller.getElementsCount()).toBe(trueCount);

				expectLimit(scope.demoCtrl, scope.demoCtrl.users.length);
			}));
			it("should listen for filter changes and reset limit - when filter is unset", inject(function () {
				var trueCount = 0;
				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST + DEFAULT_ITEMS_PER_ITERATION_COUNT*10);i++) {
					scope.demoCtrl.users.push({id: i, even: (i%2)===0});
					if ((i%2)===0) {
						trueCount++;
					}
				}
				scope.demoCtrl.filter = {
					even: true
				};
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users | filter:demoCtrl.filter' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				element = $compile(element)(scope);
				var controller = element.data("$seDelayedListController");

				// initial value - all items
				iterateOverLimit(scope.demoCtrl, trueCount);

				// populate with items after filter
				scope.demoCtrl.filter = {};

				expect(controller.getElementsCount()).toBe(scope.demoCtrl.users.length);

				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length, trueCount + DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST);
			}));

			it("should listen for elements remove and do not reset limit", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");

				for(var i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST+DEFAULT_ITEMS_PER_ITERATION_COUNT*10);i++) {
					scope.demoCtrl.users.push({id: i});
				}

				element = $compile(element)(scope);
				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);

				// remove items after initializing

				scope.demoCtrl.users.splice(0, 1);
				scope.demoCtrl.users.splice(5, 2);

				var expectedLimit = scope.demoCtrl.limit;

				expectLimit(scope.demoCtrl, expectedLimit);
			}));

			it("should listen for elements add after 0 and reset limit", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users' ></div>" +
					"</div>");
				repeatElement = element.find("div");
				var elementsCount = (DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST+DEFAULT_ITEMS_PER_ITERATION_COUNT*10);

				for(var i = 0;i<elementsCount;i++) {
					scope.demoCtrl.users.push({id: i});
				}

				element = $compile(element)(scope);
				// initial value
				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);

				// remove items after initializing

				scope.demoCtrl.users = [];
				scope.$digest();

				expectLimit(scope.demoCtrl, elementsCount);
				for(i = 0;i<(DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST+DEFAULT_ITEMS_PER_ITERATION_COUNT*10);i++) {
					scope.demoCtrl.users.push({id: i});
				}
				scope.$digest();

				iterateOverLimit(scope.demoCtrl, scope.demoCtrl.users.length);
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
			it("should return count - with filter", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users | filter:{}' ></div>" +
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
			it("should return count - with filter and track by", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users | filter:{} track by $index' ></div>" +
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
			it("should return count - with track by", inject(function () {
				element = angular.element(
					"<div data-se-delayed-list='demoCtrl.limit'>" +
					"	<div data-ng-repeat='user in demoCtrl.users track by $index' ></div>" +
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
