var controlSearch = new L.Control.Search({
    position: 'topleft',
    layer: markersLayer,
    initial: false,
    zoom: 15,
    marker: false,
    textErr: "Proje Bulunumadı :(",
    tooltipLimit: 5,
    textCancel: "iptal",
    textPlaceholder: "proje ara...",
    collapsed: false
});

map.addControl(controlSearch);