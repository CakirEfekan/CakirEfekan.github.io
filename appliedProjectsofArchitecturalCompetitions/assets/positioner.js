legend.addTo(map);
L.control
    .layers(null, overlays, { collapsed: false, position: "topleft" })
    .addTo(map);

/*map.addControl(controlSearch);*/