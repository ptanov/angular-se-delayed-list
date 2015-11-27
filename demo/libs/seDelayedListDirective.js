angular.module("seDelayedList.seDelayedList", []).directive("seDelayedList", function() {
	"use strict";
	var DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST = 25;
	var DEFAULT_ITEMS_PER_ITERATION_COUNT = DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST;
	var DEFAULT_INTERVAL = 40;

	var ATTR_NG_REPEAT = "data-ng-repeat";
	function getRepeatElement(element) {
		var result = element.find("["+ATTR_NG_REPEAT+"]");
		if (result.length === 0) {
			return null;
		}
		return result;
	}
	return {
		restrict: "A",
		controller: ["$scope", "$element", "$attrs", "$parse", "$timeout", function($scope, $element, $attrs, $parse, $timeout) {
			var controller = this;

			function atachMethods(limitHolder) {
				var listVariableHolder;
				controller.getElementsCount = function getElementsCount() {
					function getListVariableHolder() {
						var repeatElement = getRepeatElement($element);
						if (!repeatElement) {
							// this can be null if there are no elements
							return null;
						}
						var repeatExpression = repeatElement.attr(ATTR_NG_REPEAT);

						// always there should be | - for limitTo
						var trackByRegex = /.+\sin\s(.+)\|.+/g;
						var match = trackByRegex.exec(repeatExpression);
						if (!match) {
							throw "seDelayedList: can't get list name: " + repeatExpression;
						}
						return $parse(match[1]);
					}
					listVariableHolder = listVariableHolder || getListVariableHolder();
					if (!listVariableHolder) {
						return 0;
					}
					return (listVariableHolder($scope)||[]).length;
				};

				controller.getLimit = function getLimit() {
					return limitHolder($scope);
				};
			}

			function resetLimitEverytimeFilterIsChanged(limitHolder) {
				limitHolder.assign($scope, DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST);

				var filterExpression = $attrs.seDelayedListFilter;
				if (filterExpression) {
					// reset limit everytime the filter is changed
					$scope.$watchCollection(filterExpression, function() {
						limitHolder.assign($scope, DEFAULT_ITEMS_PER_ITERATION_COUNT_FIRST);
					});
				}
			}
			function incrementLimit(limitHolder) {
				$timeout(function() {
					var newValue = controller.getLimit() + DEFAULT_ITEMS_PER_ITERATION_COUNT;

					limitHolder.assign($scope, newValue);

					if (newValue < controller.getElementsCount()) {
						incrementLimit(limitHolder);
					}
				}, DEFAULT_INTERVAL);

			}

			var limitHolder = $parse($attrs.seDelayedList);
			atachMethods(limitHolder);
			resetLimitEverytimeFilterIsChanged(limitHolder);
			incrementLimit(limitHolder);
		}],
		compile: function(element, attrs) {
			function addLimitTo(repeatElement) {
				function getPositionToInsert(repeatExpression) {
					var trackByRegex = /(.+)\strack\s+by\s.+/g;
					var match = trackByRegex.exec(repeatExpression);
					if (!match) {
						return repeatExpression.length;
					}
					return match[1].length;
				}

				var repeatExpression = repeatElement.attr(ATTR_NG_REPEAT);
				var positionToInsert = getPositionToInsert(repeatExpression);
				var limitTo = " | limitTo:" + attrs.seDelayedList;

				var result = repeatExpression.slice(0, positionToInsert) + limitTo + repeatExpression.slice(positionToInsert);


				repeatElement.attr(ATTR_NG_REPEAT, result);
			}

			var repeatElement = getRepeatElement(element);
			if (!repeatElement) {
				throw "seDelayedList: no repeat element";
			}
			addLimitTo(repeatElement);
		}
	};
});
