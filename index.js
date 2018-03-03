SCWeb.core.ComponentManager.appendComponentInitialize({
    ext_lang: 'geo_code',
    formats: ['format_geo_json'],
    struct_support: true,
    factory: function (sandbox) {
        var container_id = sandbox.container;
        var frame_id = container_id + '_frame';

        $('#'+container_id).append("<iframe id=" + frame_id + " src='/static/components/js/geo/geo-component.html' style='border: none;width:100%;height:100%;'></iframe>")
    }
});