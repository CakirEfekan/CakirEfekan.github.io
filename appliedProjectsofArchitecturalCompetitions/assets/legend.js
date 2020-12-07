var legend = L.control({ position: "topleft" });
legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h1>Uygulanmış Mimari Yarışma Projeleri Haritası</h1>";
    div.innerHTML += "<span>Haritada toplam <b>" + projectArray.length + "</b> proje yer almaktadır.</span>";




    return div;
};

legend.addTo(map);