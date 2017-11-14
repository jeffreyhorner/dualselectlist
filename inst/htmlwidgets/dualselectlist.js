(function(){

HTMLWidgets.widget({

  name: 'dualselectlist',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance
    var dsl = {
      el: el,
      object: $(el).DualSelectList(),
      input_name: null
    };

    $(el).on('dualselectlist:change', function(event){
      //console.log('received dualselectlist:change sending to shiny');
      Shiny.onInputChange(dsl.input_name,dsl.object.getSelection());
    });

    return {

      renderValue: function(x) {

        // TODO: code to render the widget, e.g.
        // el.innerText = x.message;
        //console.log('items: ' + x.items);
        //console.log('input_name: ' + x.input_name);

        dsl.input_name = x.input_name;
        if (x.items){
          dsl.object.setCandidate(x.items);
        }

      },

      resize: function(width, height) {

        //console.log('resize: ' + width + ' ' + height);
        // TODO: code to re-render the widget with a new size
        if (dsl) {
          dsl.object.css({
            'width': width,
            'height': height
          });
        }

      },

      dsl: dsl

    };
  }
});

Shiny.addCustomMessageHandler('updatedualselectlist',function(message){
  var widget = HTMLWidgets.find("#" + message.outputId);

  //console.log('updatedualselectlist called',message);
  if (widget){
    //console.log('widget found');
    widget.dsl.object.removeCandidates();
    if (message.items){
      //console.log('setCandidate:' + message.items);
      if (typeof(message.items) === "string"){
        widget.dsl.object.setCandidate([message.items]);
      } else {
        widget.dsl.object.setCandidate(message.items);
      }
    }

    widget.dsl.object.removeSelections();
    if (message.selected_items){
      //console.log('setSelection:' + message.selected_items);
      if (typeof(message.selected_items) === "string"){
        widget.dsl.object.setSelection([message.selected_items]);
      } else {
        widget.dsl.object.setSelection(message.selected_items);
      }
    }
  }
});

})();
