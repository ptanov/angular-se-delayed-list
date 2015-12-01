angular.module("seDelayedList.seDelayedList", []).directive("seDelayedList", function() {
	"use strict";
	var DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST = 30;
	var DEFAULT_ITEMS_PER_ITERATION_COUNT = 25;
	var DEFAULT_INTERVAL = 40;

	var ATTR_NG_REPEAT = "data-ng-repeat";
	function getRepeatElement(element) {
		var result = element.find("["+ATTR_NG_REPEAT+"]");
		if (result.length === 0) {
			throw "seDelayedList: no repeat element";
		}
		return result;
	}
	return {
		restrict: "A",
		controller: ["$scope", "$element", "$attrs", "$parse", "$interval", function($scope, $element, $attrs, $parse, $interval) {
			var controller = this;
			var listVariableExpression = $attrs.$$seDelayedListListVariableExpression;
			var listVariableHolder = $parse(listVariableExpression);
			var intervalPromise;

			function atachMethods(limitHolder) {
				controller.getElementsCount = function getElementsCount() {
					return (listVariableHolder($scope)||[]).length;
				};

				controller.getLimit = function getLimit() {
					return limitHolder($scope);
				};
			}

			function resetLimitEverytimeFilterOrListIsChanged(limitHolder) {
				function startIncrementing() {
					stopIncrementing();

					limitHolder.assign($scope, DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST);

					intervalPromise = $interval(function() {
						var elementsCount = controller.getElementsCount();
						var newValue = controller.getLimit() + DEFAULT_ITEMS_PER_ITERATION_COUNT;

						limitHolder.assign($scope, newValue);

						if (newValue >= elementsCount) {
							stopIncrementing();
						}
					}, DEFAULT_INTERVAL);
				}
				function stopIncrementing() {
					if (intervalPromise) {
						$interval.cancel(intervalPromise);
						intervalPromise = null;
					}
				}
				limitHolder.assign($scope, DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST);

				$scope.$watchCollection(listVariableExpression, startIncrementing);
			}
			var limitHolder = $parse($attrs.seDelayedList);
			atachMethods(limitHolder);
			resetLimitEverytimeFilterOrListIsChanged(limitHolder);
		}],
		compile: function(element, attrs) {
			function getTrackByPositionOrEndOfString(repeatExpression) {
				var trackByRegex = /([^]+)track\s+by\s+.+/g;
				var match = trackByRegex.exec(repeatExpression);
				if (!match) {
					return repeatExpression.length;
				}
				return match[1].length;
			}
			function addLimitTo(repeatElement) {
				var repeatExpression = repeatElement.attr(ATTR_NG_REPEAT);
				var positionToInsert = getTrackByPositionOrEndOfString(repeatExpression);
				var limitTo = " | limitTo:" + attrs.seDelayedList + " ";

				var result = repeatExpression.slice(0, positionToInsert) + limitTo + repeatExpression.slice(positionToInsert);


				repeatElement.attr(ATTR_NG_REPEAT, result);
			}
			function getListVariableExpression(repeatElement) {
				var repeatExpression = repeatElement.attr(ATTR_NG_REPEAT);
				var repeatExpressionWithoutTrackBy = repeatExpression.substring(0, getTrackByPositionOrEndOfString(repeatExpression));
				// always there should be | - for limitTo
				var trackByRegex = /.+\s+in\s+(.+)(\|.+)?/g;
				var match = trackByRegex.exec(repeatExpressionWithoutTrackBy);
				if (!match) {
					throw "seDelayedList: can't get list name: " + repeatExpression;
				}
				return match[1];
			}
			var repeatElement = getRepeatElement(element);
			// will be used in controller
			// in controller there may be no repeat element (in collection is empty)
			// so we will have to wait for at least one element before getting the name
			attrs.$$seDelayedListListVariableExpression = getListVariableExpression(repeatElement);
			addLimitTo(repeatElement);
		}
	};
});
