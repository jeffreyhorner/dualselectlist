(function($) {

	$.fn.DualSelectList = function(parameter)
	{
		// Only allow DIV to be the DualSelectList container
		if (this.length != 1) {
		  //console.log('this.length is ' + this.length);
		  return;
		}
		if (this.prop('tagName') != 'DIV') {
		  //console.log('tagName is' + this.prop('tagName'));
		  return;
		}

		// Apply default value
		var params = $.extend({}, $.fn.DualSelectList.defaults, parameter);

		var thisMain = null;
		var thisLftPanel = null;
		var thisRgtPanel = null;
		var thisItemNull = null;
		var thisClearSelectedButton = null;
    var thisAddButton = null;
    var thisLftBottom = null;
		var	AddItem = null;

		var thisSelect = null;
		var srcEvent = null;
		var isPickup = false;
		var isMoving = false;
		var xOffset = null;
		var yOffset = null;

		this.init = function () {
			// Initialize DualSelectList content
			//this.append(
			//	'<div class="dsl-filter left-panel" ><input class="dsl-filter-input" tyle="text" value="Input Filter"></div>' +
			//	'<div class="dsl-filter right-panel"><input class="dsl-filter-input" tyle="text" value="Input Filter"></div>' +
			//	'<div class="dsl-panel left-panel" /><div class="dsl-panel right-panel"></div>' +
			//	'<div class="dsl-panel-item-null">&nbsp;</div>'
			//);

			// TODO: add parameters to show/hide input filters
			this.append(
			  '<div class="dsl-filter left-panel">Candidates</div>' +
			  '<div class="dsl-filter right-panel">Selected ' +
			  '<button type="button" class="btn btn-primary btn-sm dsl-button dsl-clear-selected">Clear</button></div>' +
				'<div class="dsl-panel left-panel" /><div class="dsl-panel right-panel"></div>' +
				'<div class="dsl-bottom left-panel"><span></span></div>' +
				'<div class="dsl-bottom right-panel">' +
				  '<input class="dsl-add-input" tyle="text" value=""> ' +
				  '<button type="button" class="btn btn-primary btn-sm dsl-button dsl-add-item">Add Item</button>' +
				  '</div>' +
				'<div class="dsl-panel-item-null">&nbsp;</div>'
			);

			thisMain = this;
			thisLftPanel = this.find('div.dsl-panel.left-panel');
			thisRgtPanel = this.find('div.dsl-panel.right-panel');
			thisItemNull = this.find('div.dsl-panel-item-null');
			thisLftBottom = this.find('div.dsl-bottom.left-panel');
			thisClearSelectedButton = this.find('button.dsl-clear-selected');
			thisAddButton = this.find('button.dsl-add-item');
			this.AddItem = function(){
				var item = thisMain.find('input.dsl-add-input');
				if (item){
    		  thisMain.setSelection([item.val()]);
    		  item.val('');
    		  thisMain.trigger("dualselectlist:change");
				}
  		}

  		thisClearSelectedButton.click(function(){
  		  thisMain.removeSelections();
  		  thisMain.trigger("dualselectlist:change");
  		});

      // Either hitting ender or clicking the "Add Item" button
      // adds new item.
  		thisAddButton.click(this.AddItem);
  		$(document).on('keypress', 'input.dsl-add-input', function(e){
  		  console.log(thisMain);
  		  if (e.which == 13){
  		    thisMain.AddItem();
  		  }
		  });

			// Allow default Candidate and default Selection
			if(typeof(params.candidateItems) === 'string') params.candidateItems = [params.candidateItems];
			if(typeof(params.selectionItems) === 'string') params.selectionItems = [params.selectionItems];
			if (params.candidateItems.length > 0) this.setCandidate(params.candidateItems);
			if (params.selectionItems.length > 0) this.setSelection(params.selectionItems);

			// When mouse click down in one item, record this item for following actions.
			$(document).on('mousedown', 'div.dsl-panel-item', function(event) {
				thisSelect = $(this);
				isPickup = true;
				srcEvent = event;
				event.preventDefault();
			});

			// When mouse move in [Body] ...
			// --> If already click down in one item, drag this item.
			// --> If no item is clicked, do nothing
			$(document).on('mousemove', 'body', function(event) {
				// move this item...
				if (isPickup) {
					if (isMoving) {
						thisSelect.css({
							'left' : event.screenX + xOffset,
							'top'  : event.screenY + yOffset
						});

						var target = findItemLocation(thisSelect);
						if (target.targetItem == null) {
							thisItemNull.appendTo(target.targetPanel).show();
						}else{
							thisItemNull.insertAfter(target.targetItem).show();
						}
					}else{
						if ((Math.abs(event.screenX - srcEvent.screenX) >= 2) ||
							(Math.abs(event.screenY - srcEvent.screenY) >= 2))
						{
							isMoving = true;

							var srcPanel = thisSelect.parent('div.dsl-panel');
							var xSrc = thisSelect.position().left;
							var ySrc = thisSelect.position().top;
							xOffset = xSrc - event.screenX;
							yOffset = ySrc - event.screenY;
							thisSelect.css({
								'position' : 'absolute',
								'z-index' : 10,
								'left' : xSrc,
								'top' : ySrc,
								'width' : srcPanel.width()
							}).appendTo(thisMain);
						}
					}
				}

				event.preventDefault();
			});

			// When mouse up ...
			// --> If there is an item clicked down ...
			// -----> If this item is draged with mouse, drop this item in correct location.
			// -----> If this item is not draged, calculate it's new location and fly to.
			// --> If there is no item clicked down, do nothing.
			$(document).on('mouseup', 'div.dsl-panel-item', function(event) {
				// Click on an item
				var dslDiv = null;

				if (isPickup && !isMoving) {
					// fly to another panel
  				dslDiv = $(this).parent('div.dsl-panel').parent('.dualselectlist');
					var srcPanel = $(this).parent('div.dsl-panel');
					var tarPanel = srcPanel.siblings('div.dsl-panel');
					var tarItem = tarPanel.find('div.dsl-panel-item:last');

					var xSrc = $(this).position().left;
					var ySrc = $(this).position().top;
					var xTar = 0;
					var yTar = 0;
					if (tarItem.length > 0) {
						xTar = tarItem.position().left;
						yTar = tarItem.position().top + tarItem.height();
						yTar = Math.min(yTar, tarPanel.position().top + tarPanel.width());
					}else{
						xTar = tarPanel.position().left;
						yTar = tarPanel.position().top;
					}

					$(this).css({
						'position' : 'absolute',
						'z-index' : 10,
						'left' : xSrc,
						'top' : ySrc,
						'width' : srcPanel.width()
					}).animate({
						left: xTar,
						top: yTar
					},200, function(){
						$(this).css({
							'position' : 'initial',
							'z-index' : 'initial',
							'width' : 'calc(100% - 16px)'
						}).appendTo(tarPanel);
    				// Notify on change
    				//console.log('dualselectlist:change fired');
    				dslDiv.trigger("dualselectlist:change");
					});
				}

				// Drag-n-Drop an item
				if (isPickup && isMoving) {
					// drag-n-drop item
					var target = findItemLocation($(this));

					if (target.targetItem == null) {
  				  dslDiv = $(target.targetPanel).parent('.dualselectlist');

						$(this).css({
							'position' : 'initial',
							'z-index' : 'initial',
							'width' : 'calc(100% - 16px)'
						}).appendTo(target.targetPanel);
					}else{
    				dslDiv = $(target.targetItem).parent('div.dsl-panel').parent('.dualselectlist');

						$(this).css({
							'position' : 'initial',
							'z-index' : 'initial',
							'width' : 'calc(100% - 16px)'
						}).insertAfter(target.targetItem);
					}
  				// Notify on change
  				//console.log('dualselectlist:change fired');
  				dslDiv.trigger("dualselectlist:change");
				}


				// reset the status
				isPickup = false;
				isMoving = false;
				thisItemNull.appendTo(thisMain).hide();

			});

			// When Clicking on the filter, remove the hint text
			$(document).on('focus', 'input.dsl-filter-input', function() {
				var fltText = $(this).val();
				if (fltText == 'Input Filter') {
					$(this).val('');
					$(this).css({
						'font-weight' : 'normal',
						'font-style' : 'normal',
						'color' : 'black'
					});
				}else{
					//
				}
			});

			// When leving the filter, add the hint text if there is no filter text
			$(document).on('focusout', 'input.dsl-filter-input', function() {
				var fltText = $(this).val();
				if (fltText == '') {
					$(this).val('Input Filter');
					$(this).css({
						'font-weight' : 'bolder',
						'font-style' : 'Italic',
						'color' : 'lightgray'
					});
				}else{
					//
				}
			});

			// When some text input to the filter, do filter.
			$(document).on('keyup', 'input.dsl-filter-input', function() {
				var fltText = $(this).val();
				var tarPanel = null;
				if ($(this).parent('div.dsl-filter').hasClass('left-panel')) {
					tarPanel = thisLftPanel;
				}else{
					tarPanel = thisRgtPanel;
				}

				tarPanel.find('div.dsl-panel-item').show();
				if (fltText != '') {
					tarPanel.find('div.dsl-panel-item:not(:contains(' + fltText + '))').hide();
				}
			});
		};

		// Allow user to create the DualSelectList object first, and add candidate list later.
		this.setCandidate = function (candidate) {
			for (var n=0; n<candidate.length; ++n) {
				var itemString = $.trim(candidate[n].toString());
				if (itemString == '') continue;
				thisLftPanel.append('<div class="dsl-panel-item">' + itemString + '</div>');
			}
			thisLftBottom.find("span").text( thisLftPanel.children().length);
		};

		this.removeCandidates = function(){
		  thisLftPanel.find('div.dsl-panel-item').remove();
		};

		// Allow user to create the DualSelectList object first, and add selection list later.
		this.setSelection = function (selection) {
			for (var n=0; n<selection.length; ++n) {
				var itemString = $.trim(selection[n].toString());
				if (itemString == '') continue;
				thisRgtPanel.append('<div class="dsl-panel-item">' + itemString + '</div>');
			}
		};

		this.removeSelections = function(){
		  thisRgtPanel.find('div.dsl-panel-item').remove();
		}

		// Allow user to get current selection result
		this.getSelection = function () {
			var result = new Array();
			var selection = thisRgtPanel.find('div.dsl-panel-item');
			for (var n=0; n<selection.length; ++n) result.push(selection.eq(n).text());
			return result;
		};

		// Function for item location calculation, not public to user.
		function findItemLocation(objItem) {
			var target = {
				targetPanel: null,
				targetItem: null
			};
			//var targetPanel = null;
			if (objItem.position().left <= (0.5 * thisLftPanel.width())) {
				target.targetPanel = thisLftPanel;
			}else{
				target.targetPanel = thisRgtPanel;
			}

			//var targetItem = null;
			var candidateItems = target.targetPanel.find('div.dsl-panel-item');
			for (var n=0; n<candidateItems.length; ++n) {
				if (objItem.position().top > candidateItems.eq(n).position().top) target.targetItem = candidateItems[n];
			}

			//return targetItem;
			return target;
		};

		this.init();
		return this;
	}

	$.fn.DualSelectList.defaults = {
		candidateItems: [],
		selectionItems: []
	};

})(jQuery);
