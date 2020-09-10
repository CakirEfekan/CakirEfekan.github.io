!(function (t, e) {
  'function' == typeof define && define.amd
    ? define(['leaflet'], t)
    : 'object' == typeof exports && (module.exports = t(require('leaflet'))),
    void 0 !== e && e.L && (e.L.StyleEditor = t(L))
})(function (t) {
  return { marker: {}, forms: {}, formElements: {} }
}, window),
  (L.StyleEditor.Util = L.Class.extend({
    initialize: function (t) {
      t && L.setOptions(this, t)
    },
    fireChangeEvent: function (t) {
      this.options.styleEditorOptions.map.fireEvent('styleeditor:changed', t)
    },
    hideElement: function (t) {
      t && L.DomUtil.addClass(t, 'leaflet-styleeditor-hidden')
    },
    rgbToHex: function (t, e) {
      if (
        (t ||
          (0 !==
            (t = this.options.styleEditorOptions.defaultColor).indexOf('#') &&
            (t = '#' + t)),
        0 === t.indexOf('#'))
      )
        return e && t.replace('#', ''), t
      if (t.indexOf('(') < 0) return '#' + t
      var o = ''
      return (
        (t = t.substring(4).replace(')', '').split(',')),
        (o =
          this._componentToHex(parseInt(t[0], 10)) +
          this._componentToHex(parseInt(t[1], 10)) +
          this._componentToHex(parseInt(t[2], 10))),
        e ? o : '#' + o
      )
    },
    getCurrentElement: function () {
      return this.options.styleEditorOptions.currentElement
        ? this.options.styleEditorOptions.currentElement.target
        : null
    },
    setCurrentElement: function (t) {
      this.options.styleEditorOptions.currentElement.target = t
    },
    fillCurrentElement: function () {
      return this.getCurrentElement().options.fill
    },
    getStyle: function (t) {
      var e = this.getCurrentElement().options[t]
      return e || null
    },
    setStyle: function (t, e) {
      var o = this.getCurrentElement()
      if (o instanceof L.Marker)
        this.options.styleEditorOptions.markerType.setStyle(t, e)
      else {
        var i = {}
        ;(i[t] = e), o.setStyle(i)
      }
      this.fireChangeEvent(o)
    },
    showElement: function (t) {
      t && L.DomUtil.removeClass(t, 'leaflet-styleeditor-hidden')
    },
    _componentToHex: function (t) {
      var e = t.toString(16)
      return 1 === e.length ? '0' + e : e
    },
    getMarkersForColor: function (t) {
      t = this.rgbToHex(t)
      var e = this.options.styleEditorOptions.markerType.options.markers,
        o = this.options.styleEditorOptions.markers
      if (
        (Array.isArray(e) ||
          (e = Object.keys(e).includes(t) ? e[t] : e.default),
        null !== o)
      ) {
        if (!Array.isArray(o)) {
          var i = Object.keys(o)
          o = i.includes(t) ? o[t] : i.includes('default') ? o.default : e
        }
        return e.filter((t) => o.includes(t))
      }
      return e
    },
    getDefaultMarkerForColor: function (t) {
      t = this.rgbToHex(t)
      var e = this.getMarkersForColor(t),
        o = [],
        i = this.options.styleEditorOptions.defaultMarkerIcon
      return (
        null !== i &&
          ('string' == typeof i && o.push(i),
          Object.keys(i).includes(t) && o.push(i[t])),
        void 0 !==
          (i = this.options.styleEditorOptions.markerType.options
            .defaultMarkerIcon) &&
          ('string' == typeof i && o.push(i),
          Object.keys(i).includes(t) && o.push(i[t])),
        o.filter((t) => e.includes(t)),
        o.length > 0 ? o[0] : e[0]
      )
    }
  })),
  (L.StyleEditor.formElements.FormElement = L.Class.extend({
    initialize: function (t) {
      t && L.setOptions(this, t),
        this.options.styleOption &&
          (this.options.title =
            this.options.styleOption.charAt(0).toUpperCase() +
            this.options.styleOption.slice(1))
    },
    create: function (t) {
      this.options.uiElement = L.DomUtil.create(
        'div',
        'leaflet-styleeditor-uiElement',
        t
      )
      this.createTitle(), this.createContent()
    },
    createTitle: function () {
      L.DomUtil.create(
        'label',
        'leaflet-styleeditor-label',
        this.options.uiElement
      ).innerHTML = this.options.title + ':'
    },
    createContent: function () {},
    show: function () {
      this.style(), this.showForm()
    },
    showForm: function () {
      this.options.styleEditorOptions.util.showElement(this.options.uiElement)
    },
    hide: function () {
      this.options.styleEditorOptions.util.hideElement(this.options.uiElement)
    },
    style: function () {},
    lostFocus: function () {},
    setStyle: function (t) {
      var e = this.options.styleEditorOptions.util.getCurrentElement(),
        o = [e]
      e instanceof L.LayerGroup && (o = Object.values(e._layers))
      for (var i = 0; i < o.length; i++) {
        var n = o[i]
        if (n instanceof L.Marker)
          this.options.styleEditorOptions.markerType.setStyle(
            this.options.styleOption,
            t
          ),
            (n.options.icon.options[this.options.styleOption] = t)
        else {
          var s = {}
          ;(s[this.options.styleOption] = t),
            n.setStyle(s),
            (n.options[this.options.styleOption] = t)
        }
        this.options.styleEditorOptions.util.fireChangeEvent(n)
      }
      this.options.parentForm.style()
    }
  })),
  (L.StyleEditor.formElements.IconElement = L.StyleEditor.formElements.FormElement.extend(
    {
      _selectOptionWrapperClasses:
        'leaflet-styleeditor-select-option-wrapper leaflet-styleeditor-hidden',
      _selectOptionClasses: 'leaflet-styleeditor-select-option',
      createContent: function () {
        var t = this.options.uiElement,
          e = L.DomUtil.create('div', 'leaflet-styleeditor-select', t)
        this.options.selectBoxImage = this._createSelectInputImage(e)
        L.DomEvent.addListener(e, 'click', this._toggleSelectInput, this)
      },
      style: function () {
        this._styleSelectInputImage(
          this.options.selectBoxImage,
          this.options.styleEditorOptions.markerType.getIconOptions().icon
        ),
          this._createColorSelect(
            this.options.styleEditorOptions.markerType.options.iconOptions
              .iconColor
          ),
          this._hideSelectOptions()
      },
      lostFocus: function () {
        this._hideSelectOptions()
      },
      _createSelectInputImage: function (t) {
        var e = L.DomUtil.create(
          'div',
          'leaflet-styleeditor-select-image-wrapper',
          t
        )
        return L.DomUtil.create('div', 'leaflet-styleeditor-select-image', e)
      },
      _styleSelectInputImage: function (t, e, o) {
        if (e || (e = t.getAttribute('value'))) {
          var i = this.options.styleEditorOptions.markerType.getIconOptions()
          o && (i.iconColor = o),
            (t.innerHTML = ''),
            this.options.styleEditorOptions.markerType.createSelectHTML(
              t,
              i,
              e
            ),
            t.setAttribute('value', e)
        }
      },
      _createColorSelect: function (t) {
        if (
          (this.options.selectOptions || (this.options.selectOptions = {}),
          !(t in this.options.selectOptions))
        ) {
          var e = this.options.uiElement,
            o = L.DomUtil.create('ul', this._selectOptionWrapperClasses, e)
          this.options.styleEditorOptions.util
            .getMarkersForColor(t)
            .forEach(function (e) {
              var i = L.DomUtil.create('li', this._selectOptionClasses, o),
                n = this._createSelectInputImage(i)
              this._styleSelectInputImage(n, e, t)
            }, this),
            (this.options.selectOptions[t] = o),
            L.DomEvent.addListener(
              o,
              'click',
              function (t) {
                t.stopPropagation()
                var e = t.target
                if ('UL' !== e.nodeName) {
                  if (
                    'leaflet-styleeditor-select-image' ===
                    e.parentNode.className
                  )
                    e = e.parentNode
                  else
                    for (
                      ;
                      e && 'leaflet-styleeditor-select-image' !== e.className;

                    )
                      e = e.childNodes[0]
                  this._selectMarker({ target: e }, this)
                }
              },
              this
            )
        }
      },
      _toggleSelectInput: function (t) {
        var e = this._getCurrentColorElement(
            this.options.styleEditorOptions.util.rgbToHex(
              this.options.styleEditorOptions.markerType.options.iconOptions
                .iconColor
            )
          ),
          o = !1
        e && (o = L.DomUtil.hasClass(e, 'leaflet-styleeditor-hidden')),
          this._hideSelectOptions(),
          o && this.options.styleEditorOptions.util.showElement(e)
      },
      _selectMarker: function (t) {
        var e = this._getValue(t.target)
        this.options.selectBoxImage.setAttribute('value', e),
          this.setStyle(e),
          this._hideSelectOptions()
      },
      _getValue: function (t) {
        return t.getAttribute('value')
      },
      _getCurrentColorElement: function (t) {
        return (
          this.options.selectOptions[t] || this._createColorSelect(t),
          this.options.selectOptions[t]
        )
      },
      _hideSelectOptions: function () {
        for (var t in this.options.selectOptions)
          this.options.styleEditorOptions.util.hideElement(
            this.options.selectOptions[t]
          )
      }
    }
  )),
  (L.StyleEditor.formElements.ColorElement = L.StyleEditor.formElements.FormElement.extend(
    {
      createContent: function () {
        ;(this.options.colorPickerDiv = L.DomUtil.create(
          'div',
          'leaflet-styleeditor-colorpicker',
          this.options.uiElement
        )),
          this._getColorRamp().forEach(this._setSelectCallback, this)
      },
      _getColorRamp: function () {
        return (
          this.options.colorRamp ||
            (this.options.parentForm instanceof
              L.StyleEditor.forms.MarkerForm &&
            this.options.styleEditorOptions.markerType.options.colorRamp
              ? (this.options.colorRamp = this.options.styleEditorOptions.markerType.options.colorRamp)
              : (this.options.colorRamp = this.options.styleEditorOptions.colorRamp)),
          this.options.colorRamp
        )
      },
      _setSelectCallback: function (t) {
        var e = L.DomUtil.create(
          'div',
          'leaflet-styleeditor-color',
          this.options.colorPickerDiv
        )
        ;(e.style.backgroundColor = t),
          L.DomEvent.addListener(e, 'click', this._selectColor, this)
      },
      _selectColor: function (t) {
        t.stopPropagation(),
          this.setStyle(t.target.style.backgroundColor),
          this.options.styleEditorOptions.currentElement.target instanceof
            L.Marker &&
            this.options.styleEditorOptions.markerType.setNewMarker()
      }
    }
  )),
  (L.StyleEditor.formElements.OpacityElement = L.StyleEditor.formElements.FormElement.extend(
    {
      createContent: function () {
        var t = (this.options.opacity = L.DomUtil.create(
          'input',
          'leaflet-styleeditor-input',
          this.options.uiElement
        ))
        ;(t.type = 'number'),
          (t.max = 1),
          (t.min = 0),
          (t.step = 0.1),
          (t.value = 0.5),
          L.DomEvent.addListener(t, 'change', this._setStyle, this),
          L.DomEvent.addListener(t, 'input', this._setStyle, this),
          L.DomEvent.addListener(t, 'keyup', this._setStyle, this),
          L.DomEvent.addListener(t, 'mouseup', this._setStyle, this)
      },
      style: function () {
        this.options.opacity.value = this.options.styleEditorOptions.util.getStyle(
          this.options.styleOption
        )
      },
      _setStyle: function () {
        this.setStyle(this.options.opacity.value)
      }
    }
  )),
  (L.StyleEditor.formElements.SizeElement = L.StyleEditor.formElements.FormElement.extend(
    {
      createContent: function () {
        var t = this.options.uiElement,
          e = L.DomUtil.create(
            'div',
            'leaflet-styleeditor-sizeicon sizeicon-small',
            t
          )
        L.DomEvent.addListener(
          e,
          'click',
          function () {
            this.setStyle(
              this.options.styleEditorOptions.markerType.options.size.small
            )
          },
          this
        ),
          (e = L.DomUtil.create(
            'div',
            'leaflet-styleeditor-sizeicon sizeicon-medium',
            t
          )),
          L.DomEvent.addListener(
            e,
            'click',
            function () {
              this.setStyle(
                this.options.styleEditorOptions.markerType.options.size.medium
              )
            },
            this
          ),
          (e = L.DomUtil.create(
            'div',
            'leaflet-styleeditor-sizeicon sizeicon-large',
            t
          )),
          L.DomEvent.addListener(
            e,
            'click',
            function () {
              this.setStyle(
                this.options.styleEditorOptions.markerType.options.size.large
              )
            },
            this
          )
      }
    }
  )),
  (L.StyleEditor.formElements.DashElement = L.StyleEditor.formElements.FormElement.extend(
    {
      createContent: function () {
        var t = this.options.uiElement,
          e = L.DomUtil.create('div', 'leaflet-styleeditor-stroke', t)
        ;(e.style.backgroundPosition = '0px -75px'),
          L.DomEvent.addListener(
            e,
            'click',
            function () {
              this.setStyle('1')
            },
            this
          ),
          ((e = L.DomUtil.create(
            'div',
            'leaflet-styleeditor-stroke',
            t
          )).style.backgroundPosition = '0px -95px'),
          L.DomEvent.addListener(
            e,
            'click',
            function () {
              this.setStyle('10, 10')
            },
            this
          ),
          ((e = L.DomUtil.create(
            'div',
            'leaflet-styleeditor-stroke',
            t
          )).style.backgroundPosition = '0px -115px'),
          L.DomEvent.addListener(
            e,
            'click',
            function () {
              this.setStyle('15, 10, 1, 10')
            },
            this
          )
      }
    }
  )),
  (L.StyleEditor.forms.Form = L.Class.extend({
    initialize: function (t) {
      t && L.setOptions(this, t), (this.options.initializedElements = [])
    },
    create: function (t) {
      this.options.parentUiElement = t
      for (
        var e = Object.keys(this.options.formElements),
          o = Object.values(this.options.formElements),
          i = 0;
        i < e.length;
        i++
      ) {
        var n = new o[i]({
          styleOption: e[i],
          parentForm: this,
          styleEditorOptions: this.options.styleEditorOptions
        })
        n.create(t), this.options.initializedElements.push(n)
      }
    },
    hide: function () {
      this.hideFormElements(), this.hideForm()
    },
    hideFormElements: function () {
      for (var t = 0; t < this.options.initializedElements.length; t++)
        this.options.initializedElements[t].hide()
    },
    hideForm: function () {
      this.options.styleEditorOptions.util.hideElement(
        this.options.parentUiElement
      )
    },
    show: function () {
      this.preShow(), this.showFormElements(), this.showForm()
    },
    preShow: function () {},
    showFormElements: function () {
      for (var t = 0; t < this.options.initializedElements.length; t++)
        this.options.initializedElements[t].show()
    },
    showForm: function () {
      this.options.styleEditorOptions.util.showElement(
        this.options.parentUiElement
      )
    },
    style: function () {
      for (var t = 0; t < this.options.initializedElements.length; t++)
        this.options.initializedElements[t].style()
    },
    lostFocus: function () {
      for (var t = 0; t < this.options.initializedElements.length; t++)
        this.options.initializedElements[t].lostFocus()
    }
  })),
  (L.StyleEditor.forms.GeometryForm = L.StyleEditor.forms.Form.extend({
    options: {
      formElements: {
        color: L.StyleEditor.formElements.ColorElement,
        opacity: L.StyleEditor.formElements.OpacityElement,
        dashArray: L.StyleEditor.formElements.DashElement,
        fillColor: L.StyleEditor.formElements.ColorElement,
        fillOpacity: L.StyleEditor.formElements.OpacityElement
      }
    },
    showFormElements: function () {
      for (var t = 0; t < this.options.initializedElements.length; t++)
        0 ===
        this.options.initializedElements[t].options.styleOption.indexOf('fill')
          ? this.options.styleEditorOptions.util.fillCurrentElement()
            ? this.options.initializedElements[t].show()
            : this.options.initializedElements[t].hide()
          : this.options.initializedElements[t].show()
    }
  })),
  (L.StyleEditor.forms.MarkerForm = L.StyleEditor.forms.Form.extend({
    options: {
      formElements: {
        icon: L.StyleEditor.formElements.IconElement,
        color: L.StyleEditor.formElements.ColorElement,
        size: L.StyleEditor.formElements.SizeElement
      }
    }
  })),
  (L.StyleEditor.marker.Marker = L.Marker.extend({
    markerForm: L.StyleEditor.forms.MarkerForm,
    options: {
      size: { small: [20, 50], medium: [30, 70], large: [35, 90] },
      selectIconSize: [],
      selectIconClass: ''
    },
    initialize: function (t) {
      L.setOptions(this, t),
        L.setOptions(this, this.options),
        '' === this.options.selectIconClass ||
          this.options.selectIconClass.startsWith(
            'leaflet-styleeditor-select-image'
          ) ||
          (this.options.selectIconClass =
            'leaflet-styleeditor-select-image-' + this.options.selectIconClass)
    },
    setNewMarker: function () {
      var t = this.getIconOptions()
      if (t.iconSize && t.icon && t.iconColor) {
        var e = this._createMarkerIcon(t)
        this.options.styleEditorOptions.currentElement.target.setIcon(e)
      }
    },
    setStyle: function (t, e) {
      'icon' !== t && (t = 'icon' + t.charAt(0).toUpperCase() + t.slice(1))
      var o = this.getIconOptions()
      o[t] !== e && ((o[t] = e), this.setNewMarker())
    },
    createSelectHTML: function (t, e, o) {},
    getIconOptions: function () {
      if (!this.options.iconOptions) {
        var t = this._getDefaultMarkerColor()
        this.options.iconOptions = {
          iconSize: this.options.styleEditorOptions.markerType.options.size
            .small,
          iconColor: t,
          icon: this.options.styleEditorOptions.util.getDefaultMarkerForColor(t)
        }
      }
      return this._ensureMarkerIcon(this.options.iconOptions)
    },
    _createMarkerIcon: function (t) {
      return (t = this.getIconOptions(t)), this.createMarkerIcon(t)
    },
    _ensureMarkerIcon: function (t) {
      return this.options.styleEditorOptions.util
        .getMarkersForColor(t.iconColor)
        .includes(t.icon)
        ? t
        : ((t.icon = this.options.styleEditorOptions.util.getDefaultMarkerForColor(
            t.iconColor
          )),
          t)
    },
    _getDefaultMarkerColor: function () {
      var t = this.options.colorRamp,
        e = this.options.styleEditorOptions.colorRamp,
        o = []
      void 0 !== t && null !== t
        ? 0 === (o = t.filter((t) => e.includes(t))).length && (o = t)
        : (o = e)
      var i = this.options.styleEditorOptions.defaultMarkerColor
      return (
        null === i || o.includes(i) || (i = null),
        null === i &&
          (null === (i = this.options.styleEditorOptions.defaultColor) ||
            o.includes(i) ||
            (i = null),
          null === i && (i = o[0])),
        this.options.styleEditorOptions.util.rgbToHex(i)
      )
    },
    sizeToName: function (t) {
      var e = Object.keys(this.options.size)
      if ('string' == typeof t)
        for (
          's' === t
            ? (t = 'small')
            : 'm' === t
            ? (t = 'medium')
            : 'l' === t && (t = 'large'),
            i = 0;
          i < e.length;
          i++
        )
          if (this.options.size[e[i]] === t) return e[i]
      for (var o = Object.values(this.options.size), i = 0; i < o.length; i++)
        if (JSON.stringify(t) === JSON.stringify(o[i])) return e[i]
      return e[0]
    },
    sizeToPixel: function (t) {
      return (t = this.sizeToName(t)), this.options.size[t]
    }
  })),
  (L.StyleEditor.marker.DefaultMarker = L.StyleEditor.marker.Marker.extend({
    createMarkerIcon: function (t, e) {
      e || (e = '')
      var o = t.iconSize
      return new L.Icon({
        iconUrl: this._getMarkerUrlForStyle(t),
        iconSize: t.iconSize,
        iconColor: t.iconColor,
        icon: t.icon,
        className: e,
        iconAnchor: [o[0] / 2, o[1] / 2],
        popupAnchor: [0, -o[1] / 2]
      })
    },
    createSelectHTML: function (t, e, o) {
      var i = {}
      ;(i.iconSize = this.options.size.small),
        (i.icon = o),
        (i.iconColor = e.iconColor),
        (t.innerHTML = this.createMarkerIcon(
          i,
          this.options.selectIconClass
        ).createIcon().outerHTML)
    },
    setStyle: function (t, e) {
      'icon' !== t && (t = 'icon' + t.charAt(0).toUpperCase() + t.slice(1))
      var o = this.options.iconOptions
      o[t] !== e && ((o[t] = e), this.setNewMarker())
    },
    _getMarkerUrlForStyle: function (t) {
      return this._getMarkerUrl(t.iconSize, t.iconColor, t.icon)
    },
    _getMarkerUrl: function (t, e, o) {
      ;(t = this.sizeToName(t)[0]),
        (e =
          0 === e.indexOf('#')
            ? e.replace('#', '')
            : this.options.styleEditorOptions.util.rgbToHex(e, !0))
      var i = 'http://api.tiles.mapbox.com/v3/marker/pin-' + t
      return o && (i += '-' + o), i + '+' + e + '.png'
    },
    options: {
      selectIconClass: 'defaultmarker',
      markers: [
        'circle-stroked',
        'circle',
        'square-stroked',
        'square',
        'triangle-stroked',
        'triangle',
        'star-stroked',
        'star',
        'cross',
        'marker-stroked',
        'marker',
        'religious-jewish',
        'religious-christian',
        'religious-muslim',
        'cemetery',
        'rocket',
        'airport',
        'heliport',
        'rail',
        'rail-metro',
        'rail-light',
        'bus',
        'fuel',
        'parking',
        'parking-garage',
        'airfield',
        'roadblock',
        'ferry',
        'harbor',
        'bicycle',
        'park',
        'park2',
        'museum',
        'lodging',
        'monument',
        'zoo',
        'garden',
        'campsite',
        'theatre',
        'art-gallery',
        'pitch',
        'soccer',
        'america-football',
        'tennis',
        'basketball',
        'baseball',
        'golf',
        'swimming',
        'cricket',
        'skiing',
        'school',
        'college',
        'library',
        'post',
        'fire-station',
        'town-hall',
        'police',
        'prison',
        'embassy',
        'beer',
        'restaurant',
        'cafe',
        'shop',
        'fast-food',
        'bar',
        'bank',
        'grocery',
        'cinema',
        'pharmacy',
        'hospital',
        'danger',
        'industrial',
        'warehouse',
        'commercial',
        'building',
        'place-of-worship',
        'alcohol-shop',
        'logging',
        'oil-well',
        'slaughterhouse',
        'dam',
        'water',
        'wetland',
        'disability',
        'telephone',
        'emergency-telephone',
        'toilets',
        'waste-basket',
        'music',
        'land-use',
        'city',
        'town',
        'village',
        'farm',
        'bakery',
        'dog-park',
        'lighthouse',
        'clothing-store',
        'polling-place',
        'playground',
        'entrance',
        'heart',
        'london-underground',
        'minefield',
        'rail-underground',
        'rail-above',
        'camera',
        'laundry',
        'car',
        'suitcase',
        'hairdresser',
        'chemist',
        'mobilephone',
        'scooter'
      ]
    }
  })),
  (L.StyleEditor.marker.GlyphiconMarker = L.StyleEditor.marker.Marker.extend({
    getMarkerHtml: function (t, e, o) {
      var i = this._getMarkerUrl(t, e)
      return (
        '<div class="leaflet-styleeditor-marker leaflet-styleeditor-marker-' +
        this.sizeToName(t)[0] +
        '" style="background-image: url(' +
        i +
        ');"><div class="leaflet-styleeditor-fill"></div><i class="glyphicon ' +
        o +
        '"></i><div class="leaflet-styleeditor-fill"></div></div>'
      )
    },
    createMarkerIcon: function (t) {
      var e = t.iconSize
      return new L.divIcon({
        className: 'leaflet-styleeditor-glyphicon-marker-wrapper',
        html: this.getMarkerHtml(e, t.iconColor, t.icon),
        icon: t.icon,
        iconColor: t.iconColor,
        iconSize: e,
        iconAnchor: [e[0] / 2, e[1] / 2],
        popupAnchor: [0, -e[1] / 2]
      })
    },
    setStyle: function (t, e) {
      'icon' !== t && (t = 'icon' + t.charAt(0).toUpperCase() + t.slice(1))
      var o = this.options.iconOptions
      o[t] !== e && ((o[t] = e), this.setNewMarker())
    },
    createSelectHTML: function (t, e, o) {
      t.innerHTML = this.getMarkerHtml('s', e.iconColor, o)
    },
    _getMarkerUrlForStyle: function (t) {
      return this._getMarkerUrl(t.iconSize, t.iconColor, t.icon)
    },
    _getMarkerUrl: function (t, e, o) {
      return (
        'http://api.tiles.mapbox.com/v3/marker/pin-' +
        (t = this.sizeToName(t)[0]) +
        '+' +
        (e =
          0 === e.indexOf('#')
            ? e.replace('#', '')
            : this.options.styleEditorOptions.util.rgbToHex(e, !0)) +
        '.png'
      )
    },
    options: {
      markers: [
        'glyphicon-plus',
        'glyphicon-asterisk',
        'glyphicon-plus',
        'glyphicon-euro',
        'glyphicon-minus',
        'glyphicon-cloud',
        'glyphicon-envelope',
        'glyphicon-pencil',
        'glyphicon-glass',
        'glyphicon-music',
        'glyphicon-search',
        'glyphicon-heart',
        'glyphicon-star',
        'glyphicon-star-empty',
        'glyphicon-user',
        'glyphicon-film',
        'glyphicon-th-large',
        'glyphicon-th',
        'glyphicon-th-list',
        'glyphicon-ok',
        'glyphicon-remove',
        'glyphicon-zoom-in',
        'glyphicon-zoom-out',
        'glyphicon-off',
        'glyphicon-signal',
        'glyphicon-cog',
        'glyphicon-trash',
        'glyphicon-home',
        'glyphicon-file',
        'glyphicon-time',
        'glyphicon-road',
        'glyphicon-download-alt',
        'glyphicon-download',
        'glyphicon-upload',
        'glyphicon-inbox',
        'glyphicon-play-circle',
        'glyphicon-repeat',
        'glyphicon-refresh',
        'glyphicon-list-alt',
        'glyphicon-lock',
        'glyphicon-flag',
        'glyphicon-headphones',
        'glyphicon-volume-off',
        'glyphicon-volume-down',
        'glyphicon-volume-up',
        'glyphicon-qrcode',
        'glyphicon-barcode',
        'glyphicon-tag',
        'glyphicon-tags',
        'glyphicon-book',
        'glyphicon-bookmark',
        'glyphicon-print',
        'glyphicon-camera',
        'glyphicon-font',
        'glyphicon-bold',
        'glyphicon-italic',
        'glyphicon-text-height',
        'glyphicon-text-width',
        'glyphicon-align-left',
        'glyphicon-align-center',
        'glyphicon-align-right',
        'glyphicon-align-justify',
        'glyphicon-list',
        'glyphicon-indent-left',
        'glyphicon-indent-right',
        'glyphicon-facetime-video',
        'glyphicon-picture',
        'glyphicon-map-marker',
        'glyphicon-adjust',
        'glyphicon-tint',
        'glyphicon-edit',
        'glyphicon-share',
        'glyphicon-check',
        'glyphicon-move',
        'glyphicon-chevron-right',
        'glyphicon-plus-sign',
        'glyphicon-minus-sign',
        'glyphicon-remove-sign',
        'glyphicon-ok-sign',
        'glyphicon-question-sign',
        'glyphicon-info-sign',
        'glyphicon-screenshot',
        'glyphicon-remove-circle',
        'glyphicon-ok-circle',
        'glyphicon-ban-circle',
        'glyphicon-arrow-left',
        'glyphicon-arrow-right',
        'glyphicon-arrow-up',
        'glyphicon-arrow-down',
        'glyphicon-share-alt',
        'glyphicon-resize-full',
        'glyphicon-resize-small',
        'glyphicon-exclamation-sign',
        'glyphicon-gift',
        'glyphicon-leaf',
        'glyphicon-fire',
        'glyphicon-eye-open',
        'glyphicon-eye-close',
        'glyphicon-warning-sign',
        'glyphicon-plane',
        'glyphicon-calendar',
        'glyphicon-random',
        'glyphicon-comment',
        'glyphicon-magnet',
        'glyphicon-chevron-up',
        'glyphicon-chevron-down',
        'glyphicon-retweet',
        'glyphicon-shopping-cart',
        'glyphicon-bullhorn',
        'glyphicon-bell',
        'glyphicon-certificate',
        'glyphicon-thumbs-up',
        'glyphicon-thumbs-down',
        'glyphicon-hand-right',
        'glyphicon-hand-left',
        'glyphicon-hand-up',
        'glyphicon-hand-down',
        'glyphicon-circle-arrow-right',
        'glyphicon-circle-arrow-left',
        'glyphicon-circle-arrow-up',
        'glyphicon-circle-arrow-down',
        'glyphicon-globe',
        'glyphicon-wrench',
        'glyphicon-tasks',
        'glyphicon-filter',
        'glyphicon-briefcase',
        'glyphicon-fullscreen',
        'glyphicon-dashboard',
        'glyphicon-paperclip',
        'glyphicon-heart-empty',
        'glyphicon-link',
        'glyphicon-phone',
        'glyphicon-pushpin',
        'glyphicon-usd'
      ]
    }
  })),
  (L.StyleForm = L.Class.extend({
    initialize: function (t) {
      L.setOptions(this, t),
        this.createMarkerForm(),
        this.createGeometryForm(),
        this.addDOMEvents()
    },
    addDOMEvents: function () {
      L.DomEvent.addListener(
        this.options.styleEditorOptions.map,
        'click',
        this.lostFocus,
        this
      ),
        L.DomEvent.addListener(
          this.options.styleEditorDiv,
          'click',
          this.lostFocus,
          this
        )
    },
    clearForm: function () {
      this.options.styleEditorOptions.markerForm.hide(),
        this.options.styleEditorOptions.geometryForm.hide()
    },
    createMarkerForm: function () {
      var t = L.DomUtil.create(
        'div',
        'leaflet-styleeditor-interior-marker',
        this.options.styleEditorInterior
      )
      this.options.styleEditorOptions.markerForm.create(t)
    },
    createGeometryForm: function () {
      var t = L.DomUtil.create(
        'div',
        'leaflet-styleeditor-interior-geometry',
        this.options.styleEditorInterior
      )
      this.options.styleEditorOptions.geometryForm.create(t)
    },
    showMarkerForm: function () {
      this.clearForm(), this.options.styleEditorOptions.markerForm.show()
    },
    showGeometryForm: function () {
      this.clearForm(), this.options.styleEditorOptions.geometryForm.show()
    },
    fireChangeEvent: function (t) {
      this.options.styleEditorOptions.map.fireEvent('styleeditor:changed', t)
    },
    lostFocus: function (t) {
      for (var e = t.target, o = 0; o < 10 && e; o++) {
        if (
          e.className &&
          L.DomUtil.hasClass(e, 'leaflet-styleeditor-interior')
        )
          return
        e = e.parentNode
      }
      this.options.styleEditorOptions.markerForm.lostFocus(),
        this.options.styleEditorOptions.geometryForm.lostFocus()
    }
  })),
  (L.Control.StyleEditor = L.Control.extend({
    options: {
      position: 'topleft',
      enabled: !1,
      colorRamp: [
        '#1abc9c',
        '#2ecc71',
        '#3498db',
        '#9b59b6',
        '#34495e',
        '#16a085',
        '#27ae60',
        '#2980b9',
        '#8e44ad',
        '#2c3e50',
        '#f1c40f',
        '#e67e22',
        '#e74c3c',
        '#ecf0f1',
        '#95a5a6',
        '#f39c12',
        '#d35400',
        '#c0392b',
        '#bdc3c7',
        '#7f8c8d'
      ],
      defaultColor: null,
      currentElement: null,
      markerType: L.StyleEditor.marker.DefaultMarker,
      markers: null,
      defaultMarkerIcon: null,
      defaultMarkerColor: null,
      geometryForm: L.StyleEditor.forms.GeometryForm,
      editLayers: [],
      layerGroups: [],
      openOnLeafletDraw: !0,
      showTooltip: !0,
      strings: {
        tooltip: 'Click on the element you want to style',
        tooltipNext: 'Choose another element you want to style'
      },
      useGrouping: !0
    },
    initialize: function (t) {
      t && L.setOptions(this, t),
        (this.options.util = new L.StyleEditor.Util({
          styleEditorOptions: this.options
        })),
        (this.options.markerType = new this.options.markerType({
          styleEditorOptions: this.options
        })),
        (this.options.markerForm = new this.options.markerType.markerForm({
          styleEditorOptions: this.options
        })),
        (this.options.geometryForm = new this.options.geometryForm({
          styleEditorOptions: this.options
        }))
    },
    onAdd: function (t) {
      return (this.options.map = t), this.createUi()
    },
    createUi: function () {
      var t = (this.options.controlDiv = L.DomUtil.create(
        'div',
        'leaflet-control-styleeditor leaflet-bar'
      ))
      ;(this.options.controlUI = L.DomUtil.create(
        'a',
        'leaflet-control-styleeditor-interior',
        t
      )).title = 'Style Editor'
      var e = (this.options.styleEditorDiv = L.DomUtil.create(
        'div',
        'leaflet-styleeditor',
        this.options.map._container
      ))
      this.options.styleEditorHeader = L.DomUtil.create(
        'div',
        'leaflet-styleeditor-header',
        e
      )
      var o = L.DomUtil.create('div', 'leaflet-styleeditor-interior', e)
      return (
        this.addDomEvents(),
        this.addLeafletDrawEvents(),
        this.addButtons(),
        (this.options.styleForm = new L.StyleForm({
          styleEditorDiv: e,
          styleEditorInterior: o,
          styleEditorOptions: this.options
        })),
        t
      )
    },
    addDomEvents: function () {
      L.DomEvent.addListener(
        this.options.controlDiv,
        'click',
        function (t) {
          this.clickHandler(t), t.stopPropagation()
        },
        this
      ),
        L.DomEvent.addListener(
          this.options.controlDiv,
          'dblclick',
          function (t) {
            t.stopPropagation()
          },
          this
        ),
        L.DomEvent.addListener(
          this.options.styleEditorDiv,
          'click',
          L.DomEvent.stopPropagation
        ),
        L.DomEvent.addListener(
          this.options.styleEditorDiv,
          'mouseenter',
          this.disableLeafletActions,
          this
        ),
        L.DomEvent.addListener(
          this.options.styleEditorDiv,
          'mouseleave',
          this.enableLeafletActions,
          this
        )
    },
    addLeafletDrawEvents: function () {
      this.options.openOnLeafletDraw &&
        L.Control.Draw &&
        this.options.map.on(
          'draw:created',
          function (t) {
            this.initChangeStyle({ target: t.layer })
          },
          this
        )
    },
    addButtons: function () {
      var t = L.DomUtil.create(
        'button',
        'leaflet-styleeditor-button styleeditor-nextBtn',
        this.options.styleEditorHeader
      )
      ;(t.title = this.options.strings.tooltipNext),
        L.DomEvent.addListener(
          t,
          'click',
          function (t) {
            this.hideEditor(),
              L.DomUtil.hasClass(this.options.controlUI, 'enabled') &&
                this.createTooltip(),
              t.stopPropagation()
          },
          this
        )
    },
    clickHandler: function (t) {
      ;(this.options.enabled = !this.options.enabled),
        this.options.enabled
          ? this.enable()
          : (L.DomUtil.removeClass(this.options.controlUI, 'enabled'),
            this.disable())
    },
    disableLeafletActions: function () {
      var t = this.options.map
      t.dragging.disable(),
        t.touchZoom.disable(),
        t.doubleClickZoom.disable(),
        t.scrollWheelZoom.disable(),
        t.boxZoom.disable(),
        t.keyboard.disable()
    },
    enableLeafletActions: function () {
      var t = this.options.map
      t.dragging.enable(),
        t.touchZoom.enable(),
        t.doubleClickZoom.enable(),
        t.scrollWheelZoom.enable(),
        t.boxZoom.enable(),
        t.keyboard.enable()
    },
    enable: function () {
      L.DomUtil.addClass(this.options.controlUI, 'enabled'),
        this.options.map.eachLayer(this.addEditClickEvents, this),
        this.createTooltip()
    },
    disable: function () {
      this.options.editLayers.forEach(this.removeEditClickEvents, this),
        (this.options.editLayers = []),
        (this.options.layerGroups = []),
        this.hideEditor(),
        this.removeTooltip()
    },
    addEditClickEvents: function (t) {
      if (this.options.useGrouping && t instanceof L.LayerGroup)
        this.options.layerGroups.push(t)
      else if (t instanceof L.Marker || t instanceof L.Path) {
        var e = t.on('click', this.initChangeStyle, this)
        this.options.editLayers.push(e)
      }
    },
    removeEditClickEvents: function (t) {
      t.off('click', this.initChangeStyle, this)
    },
    hideEditor: function () {
      L.DomUtil.removeClass(this.options.styleEditorDiv, 'editor-enabled')
    },
    showEditor: function () {
      var t = this.options.styleEditorDiv
      L.DomUtil.hasClass(t, 'editor-enabled') ||
        L.DomUtil.addClass(t, 'editor-enabled')
    },
    initChangeStyle: function (t) {
      ;(this.options.currentElement = this.options.useGrouping
        ? this.getMatchingElement(t)
        : t),
        this.showEditor(),
        this.removeTooltip(),
        t.target instanceof L.Marker
          ? this.showMarkerForm()
          : this.showGeometryForm()
    },
    showGeometryForm: function () {
      this.options.styleForm.showGeometryForm()
    },
    showMarkerForm: function () {
      this.options.styleForm.showMarkerForm()
    },
    createTooltip: function () {
      this.options.showTooltip &&
        (this.options.tooltipWrapper ||
          (this.options.tooltipWrapper = L.DomUtil.create(
            'div',
            'leaflet-styleeditor-tooltip-wrapper',
            this.options.map.getContainer()
          )),
        this.options.tooltip ||
          (this.options.tooltip = L.DomUtil.create(
            'div',
            'leaflet-styleeditor-tooltip',
            this.options.tooltipWrapper
          )),
        (this.options.tooltip.innerHTML = this.options.strings.tooltip))
    },
    getMatchingElement: function (t) {
      for (
        var e = null, o = t.target, i = 0;
        i < this.options.layerGroups.length;
        ++i
      )
        if ((e = this.options.layerGroups[i]) && o !== e && e.hasLayer(o))
          return (
            (e.options && e.options.opacity) ||
              ((e.options = o.options),
              o.setIcon &&
                (e.setIcon = function (t) {
                  e.eachLayer(function (e) {
                    e instanceof L.Marker && e.setIcon(t)
                  })
                })),
            this.getMatchingElement({ target: e })
          )
      return t
    },
    removeTooltip: function () {
      this.options.tooltip &&
        this.options.tooltip.parentNode &&
        (this.options.tooltip.remove(), (this.options.tooltip = void 0))
    }
  })),
  (L.control.styleEditor = function (t) {
    return new L.Control.StyleEditor(t)
  })
