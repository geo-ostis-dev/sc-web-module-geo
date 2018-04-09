L.OSM.note = function (options) {
  var control = L.control(options);

  control.onAdd = function (map) {
    var $container = $('<div>')
      .attr('class', 'control-note');

    var link = $('<a>')
      .attr('class', 'control-button')
      .attr('href', '#')
      .html('<span class="icon note"></span>')
      .appendTo($container);

    map.on('zoomend', update);

    function update() {
      var disabled = MAP.STATUS === "database_offline" || map.getZoom() < 12;
      link
        .toggleClass('disabled', disabled)
        .attr('data-original-title', 'javascripts.site.createnote_tooltip');
    }

    update();

    return $container[0];
  };

  return control;
};
