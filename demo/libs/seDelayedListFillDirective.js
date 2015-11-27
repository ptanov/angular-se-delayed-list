angular.module("seDelayedList.seDelayedListFill", []).directive("seDelayedListFill", ["$parse", function($parse) {
	"use strict";
	return {
		require: "^^seDelayedList",
		restrict: "A",
		link: function(scope, element, attrs, seDelayedListCtrl) {
			var pixelsPerElement = $parse(attrs.seDelayedListFill)(scope);
			if (!pixelsPerElement) {
				throw "seDelayedListFill: No pixelsPerElement: " + attrs.seDelayedListFill;
			}

			scope.$watchGroup([seDelayedListCtrl.getElementsCount, seDelayedListCtrl.getLimit], function(newValues) {
				var elementsCount = newValues[0];
				var limit = newValues[1];
				if (elementsCount <= limit) {
					element.hide();
				} else {
					element.show();
				}

				element.height(pixelsPerElement * (elementsCount - limit));
			});
		}
	};
}]);
