/**
 * Leaflet vector features drag functionality
 * @author Alexander Milevski <info@w8r.name>
 * @preserve
 */
L.Path.include({
  _transform: function (t) {
    if (this._renderer) {
      if (t) {
        this._renderer.transformPath(this, t)
      } else {
        this._renderer._resetTransformPath(this)
        this._update()
      }
    }
    return this
  },
  _onMouseClick: function (t) {
    if (
      (this.dragging && this.dragging.moved()) ||
      (this._map.dragging && this._map.dragging.moved())
    ) {
      return
    }
    this._fireMouseEvent(t)
  }
})
L.Handler.PathDrag = L.Handler.extend({
  statics: { DRAGGING_CLS: 'leaflet-path-draggable' },
  initialize: function (t) {
    this._path = t
    this._matrix = null
    this._startPoint = null
    this._dragStartPoint = null
    this._mapDraggingWasEnabled = false
  },
  addHooks: function () {
    this._path.on('mousedown', this._onDragStart, this)
    this._path.options.className = this._path.options.className
      ? this._path.options.className + ' ' + L.Handler.PathDrag.DRAGGING_CLS
      : L.Handler.PathDrag.DRAGGING_CLS
    if (this._path._path) {
      L.DomUtil.addClass(this._path._path, L.Handler.PathDrag.DRAGGING_CLS)
    }
  },
  removeHooks: function () {
    this._path.off('mousedown', this._onDragStart, this)
    this._path.options.className = this._path.options.className.replace(
      new RegExp('\\s+' + L.Handler.PathDrag.DRAGGING_CLS),
      ''
    )
    if (this._path._path) {
      L.DomUtil.removeClass(this._path._path, L.Handler.PathDrag.DRAGGING_CLS)
    }
  },
  moved: function () {
    return this._path._dragMoved
  },
  _onDragStart: function (t) {
    var e = t.originalEvent._simulated ? 'touchstart' : t.originalEvent.type
    this._mapDraggingWasEnabled = false
    this._startPoint = t.containerPoint.clone()
    this._dragStartPoint = t.containerPoint.clone()
    this._matrix = [1, 0, 0, 1, 0, 0]
    L.DomEvent.stop(t.originalEvent)
    L.DomUtil.addClass(this._path._renderer._container, 'leaflet-interactive')
    L.DomEvent.on(document, L.Draggable.MOVE[e], this._onDrag, this).on(
      document,
      L.Draggable.END[e],
      this._onDragEnd,
      this
    )
    if (this._path._map.dragging.enabled()) {
      this._path._map.dragging.disable()
      this._mapDraggingWasEnabled = true
    }
    this._path._dragMoved = false
    if (this._path._popup) {
      this._path._popup._close()
    }
    this._replaceCoordGetters(t)
  },
  _onDrag: function (t) {
    L.DomEvent.stop(t)
    var e = t.touches && t.touches.length >= 1 ? t.touches[0] : t
    var a = this._path._map.mouseEventToContainerPoint(e)
    if (t.type === 'touchmove' && !this._path._dragMoved) {
      var i = this._dragStartPoint.distanceTo(a)
      if (i <= this._path._map.options.tapTolerance) {
        return
      }
    }
    var r = a.x
    var s = a.y
    var n = r - this._startPoint.x
    var o = s - this._startPoint.y
    if (n || o) {
      if (!this._path._dragMoved) {
        this._path._dragMoved = true
        this._path.fire('dragstart', t)
        this._path.bringToFront()
      }
      this._matrix[4] += n
      this._matrix[5] += o
      this._startPoint.x = r
      this._startPoint.y = s
      this._path.fire('predrag', t)
      this._path._transform(this._matrix)
      this._path.fire('drag', t)
    }
  },
  _onDragEnd: function (t) {
    var e = this._path._map.mouseEventToContainerPoint(t)
    var a = this.moved()
    if (a) {
      this._transformPoints(this._matrix)
      this._path._updatePath()
      this._path._project()
      this._path._transform(null)
      L.DomEvent.stop(t)
    }
    L.DomEvent.off(document, 'mousemove touchmove', this._onDrag, this).off(
      document,
      'mouseup touchend',
      this._onDragEnd,
      this
    )
    this._restoreCoordGetters()
    if (a) {
      this._path.fire('dragend', {
        distance: Math.sqrt(L.LineUtil._sqDist(this._dragStartPoint, e))
      })
      var i = this._path._containsPoint
      this._path._containsPoint = L.Util.falseFn
      L.Util.requestAnimFrame(function () {
        L.DomEvent._skipped({ type: 'click' })
        this._path._containsPoint = i
      }, this)
    }
    this._matrix = null
    this._startPoint = null
    this._dragStartPoint = null
    this._path._dragMoved = false
    if (this._mapDraggingWasEnabled) {
      if (a) L.DomEvent._fakeStop({ type: 'click' })
      this._path._map.dragging.enable()
    }
  },
  _transformPoints: function (t, e) {
    var a = this._path
    var i, r, s
    var n = L.point(t[4], t[5])
    var o = a._map.options.crs
    var h = o.transformation
    var _ = o.scale(a._map.getZoom())
    var g = o.projection
    var p = h.untransform(n, _).subtract(h.untransform(L.point(0, 0), _))
    var d = !e
    a._bounds = new L.LatLngBounds()
    if (a._point) {
      e = g.unproject(g.project(a._latlng)._add(p))
      if (d) {
        a._latlng = e
        a._point._add(n)
      }
    } else if (a._rings || a._parts) {
      var l = a._rings || a._parts
      var f = a._latlngs
      e = e || f
      if (!L.Util.isArray(f[0])) {
        f = [f]
        e = [e]
      }
      for (i = 0, r = l.length; i < r; i++) {
        e[i] = e[i] || []
        for (var m = 0, u = l[i].length; m < u; m++) {
          s = f[i][m]
          e[i][m] = g.unproject(g.project(s)._add(p))
          if (d) {
            a._bounds.extend(f[i][m])
            l[i][m]._add(n)
          }
        }
      }
    }
    return e
  },
  _replaceCoordGetters: function () {
    if (this._path.getLatLng) {
      this._path.getLatLng_ = this._path.getLatLng
      this._path.getLatLng = L.Util.bind(function () {
        return this.dragging._transformPoints(this.dragging._matrix, {})
      }, this._path)
    } else if (this._path.getLatLngs) {
      this._path.getLatLngs_ = this._path.getLatLngs
      this._path.getLatLngs = L.Util.bind(function () {
        return this.dragging._transformPoints(this.dragging._matrix, [])
      }, this._path)
    }
  },
  _restoreCoordGetters: function () {
    if (this._path.getLatLng_) {
      this._path.getLatLng = this._path.getLatLng_
      delete this._path.getLatLng_
    } else if (this._path.getLatLngs_) {
      this._path.getLatLngs = this._path.getLatLngs_
      delete this._path.getLatLngs_
    }
  }
})
L.Handler.PathDrag.makeDraggable = function (t) {
  t.dragging = new L.Handler.PathDrag(t)
  return t
}
L.Path.prototype.makeDraggable = function () {
  return L.Handler.PathDrag.makeDraggable(this)
}
L.Path.addInitHook(function () {
  if (this.options.draggable) {
    this.options.interactive = true
    if (this.dragging) {
      this.dragging.enable()
    } else {
      L.Handler.PathDrag.makeDraggable(this)
      this.dragging.enable()
    }
  } else if (this.dragging) {
    this.dragging.disable()
  }
})
L.SVG.include({
  _resetTransformPath: function (t) {
    t._path.setAttributeNS(null, 'transform', '')
  },
  transformPath: function (t, e) {
    t._path.setAttributeNS(null, 'transform', 'matrix(' + e.join(' ') + ')')
  }
})
L.SVG.include(
  !L.Browser.vml
    ? {}
    : {
        _resetTransformPath: function (t) {
          if (t._skew) {
            t._skew.on = false
            t._path.removeChild(t._skew)
            t._skew = null
          }
        },
        transformPath: function (t, e) {
          var a = t._skew
          if (!a) {
            a = L.SVG.create('skew')
            t._path.appendChild(a)
            a.style.behavior = 'url(#default#VML)'
            t._skew = a
          }
          var i =
            e[0].toFixed(8) +
            ' ' +
            e[1].toFixed(8) +
            ' ' +
            e[2].toFixed(8) +
            ' ' +
            e[3].toFixed(8) +
            ' 0 0'
          var r =
            Math.floor(e[4]).toFixed() + ', ' + Math.floor(e[5]).toFixed() + ''
          var s = this._path.style
          var n = parseFloat(s.left)
          var o = parseFloat(s.top)
          var h = parseFloat(s.width)
          var _ = parseFloat(s.height)
          if (isNaN(n)) n = 0
          if (isNaN(o)) o = 0
          if (isNaN(h) || !h) h = 1
          if (isNaN(_) || !_) _ = 1
          var g = (-n / h - 0.5).toFixed(8) + ' ' + (-o / _ - 0.5).toFixed(8)
          a.on = 'f'
          a.matrix = i
          a.origin = g
          a.offset = r
          a.on = true
        }
      }
)
L.Util.trueFn = function () {
  return true
}
L.Canvas.include({
  _resetTransformPath: function (t) {
    if (!this._containerCopy) return
    delete this._containerCopy
    if (t._containsPoint_) {
      t._containsPoint = t._containsPoint_
      delete t._containsPoint_
      this._requestRedraw(t)
    }
  },
  transformPath: function (t, e) {
    var a = this._containerCopy
    var i = this._ctx,
      r
    var s = L.Browser.retina ? 2 : 1
    var n = this._bounds
    var o = n.getSize()
    var h = n.min
    if (!a) {
      a = this._containerCopy = document.createElement('canvas')
      r = a.getContext('2d')
      a.width = s * o.x
      a.height = s * o.y
      this._removePath(t)
      this._redraw()
      r.translate(s * n.min.x, s * n.min.y)
      r.drawImage(this._container, 0, 0)
      this._initPath(t)
      t._containsPoint_ = t._containsPoint
      t._containsPoint = L.Util.trueFn
    }
    i.save()
    i.clearRect(h.x, h.y, o.x * s, o.y * s)
    i.setTransform(1, 0, 0, 1, 0, 0)
    i.restore()
    i.save()
    i.drawImage(this._containerCopy, 0, 0, o.x, o.y)
    i.transform.apply(i, e)
    this._drawing = true
    t._updatePath()
    this._drawing = false
    i.restore()
  }
})
/**
 * Drag feature functionality for Leaflet.draw
 * @preserve
 * @license MIT
 * @author Alexander Milevski <info@w8r.name>
 */
L.EditToolbar.Edit.MOVE_MARKERS = false
L.EditToolbar.Edit.include({
  initialize: function (t, e) {
    if (e && e.selectedPathOptions) {
      L.EditToolbar.Edit.MOVE_MARKERS = !!e.selectedPathOptions.moveMarkers
    }
    this._initialize(t, e)
  },
  _initialize: L.EditToolbar.Edit.prototype.initialize
})
L.Edit.SimpleShape.include({
  _updateMoveMarker: function () {
    if (this._moveMarker) {
      this._moveMarker.setLatLng(this._getShapeCenter())
    }
  },
  _getShapeCenter: function () {
    return this._shape.getBounds().getCenter()
  },
  _createMoveMarker: function () {
    if (L.EditToolbar.Edit.MOVE_MARKERS) {
      this._moveMarker = this._createMarker(
        this._getShapeCenter(),
        this.options.moveIcon
      )
    }
  }
})
L.Edit.SimpleShape.mergeOptions({ moveMarker: false })
L.Edit.Circle.include({
  addHooks: function () {
    if (this._shape._map) {
      this._map = this._shape._map
      this._shape.setStyle(this._shape.options.editing)
      if (!this._markerGroup) {
        this._enableDragging()
        this._initMarkers()
      }
      this._shape._map.addLayer(this._markerGroup)
    }
  },
  removeHooks: function () {
    this._shape.setStyle(this._shape.options.original)
    if (this._shape._map) {
      for (var t = 0, e = this._resizeMarkers.length; t < e; t++) {
        this._unbindMarker(this._resizeMarkers[t])
      }
      this._disableDragging()
      this._resizeMarkers = null
      this._map.removeLayer(this._markerGroup)
      delete this._markerGroup
    }
    this._map = null
  },
  _createMoveMarker: L.Edit.SimpleShape.prototype._createMoveMarker,
  _resize: function (t) {
    var e = this._shape.getLatLng()
    var a = e.distanceTo(t)
    this._shape.setRadius(a)
    this._updateMoveMarker()
    this._map.fire('draw:editresize', { layer: this._shape })
  },
  _enableDragging: function () {
    if (!this._shape.dragging) {
      this._shape.dragging = new L.Handler.PathDrag(this._shape)
    }
    this._shape.dragging.enable()
    this._shape
      .on('dragstart', this._onStartDragFeature, this)
      .on('dragend', this._onStopDragFeature, this)
  },
  _disableDragging: function () {
    this._shape.dragging.disable()
    this._shape
      .off('dragstart', this._onStartDragFeature, this)
      .off('dragend', this._onStopDragFeature, this)
  },
  _onStartDragFeature: function () {
    this._shape._map.removeLayer(this._markerGroup)
    this._shape.fire('editstart')
  },
  _onStopDragFeature: function () {
    var t = this._shape.getLatLng()
    this._resizeMarkers[0].setLatLng(this._getResizeMarkerPoint(t))
    this._shape._map.addLayer(this._markerGroup)
    this._updateMoveMarker()
    this._fireEdit()
  }
})
L.Edit.Rectangle.include({
  addHooks: function () {
    if (this._shape._map) {
      this._map = this._shape._map
      this._shape.setStyle(this._shape.options.editing)
      if (!this._markerGroup) {
        this._enableDragging()
        this._initMarkers()
      }
      this._shape._map.addLayer(this._markerGroup)
    }
  },
  removeHooks: function () {
    this._shape.setStyle(this._shape.options.original)
    if (this._shape._map) {
      this._shape._map.removeLayer(this._markerGroup)
      this._disableDragging()
      delete this._markerGroup
      delete this._markers
    }
    this._map = null
  },
  _resize: function (t) {
    this._shape.setBounds(L.latLngBounds(t, this._oppositeCorner))
    this._updateMoveMarker()
    this._shape._map.fire('draw:editresize', { layer: this._shape })
  },
  _onMarkerDragEnd: function (t) {
    this._toggleCornerMarkers(1)
    this._repositionCornerMarkers()
    L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, t)
  },
  _enableDragging: function () {
    if (!this._shape.dragging) {
      this._shape.dragging = new L.Handler.PathDrag(this._shape)
    }
    this._shape.dragging.enable()
    this._shape
      .on('dragstart', this._onStartDragFeature, this)
      .on('dragend', this._onStopDragFeature, this)
  },
  _disableDragging: function () {
    this._shape.dragging.disable()
    this._shape
      .off('dragstart', this._onStartDragFeature, this)
      .off('dragend', this._onStopDragFeature, this)
  },
  _onStartDragFeature: function () {
    this._shape._map.removeLayer(this._markerGroup)
    this._shape.fire('editstart')
  },
  _onStopDragFeature: function () {
    var t = this._shape
    for (var e = 0, a = t._latlngs.length; e < a; e++) {
      for (var i = 0, r = t._latlngs[e].length; i < r; i++) {
        var s = this._resizeMarkers[i]
        s.setLatLng(t._latlngs[e][i])
        s._origLatLng = t._latlngs[e][i]
        if (s._middleLeft) {
          s._middleLeft.setLatLng(this._getMiddleLatLng(s._prev, s))
        }
        if (s._middleRight) {
          s._middleRight.setLatLng(this._getMiddleLatLng(s, s._next))
        }
      }
    }
    this._shape._map.addLayer(this._markerGroup)
    this._updateMoveMarker()
    this._repositionCornerMarkers()
    this._fireEdit()
  }
})
L.Edit.PolyVerticesEdit.include({
  __createMarker: L.Edit.PolyVerticesEdit.prototype._createMarker,
  __removeMarker: L.Edit.PolyVerticesEdit.prototype._removeMarker,
  addHooks: function () {
    var t = this._poly
    if (!(t instanceof L.Polygon)) {
      t.options.fill = false
      if (t.options.editing) {
        t.options.editing.fill = false
      }
    }
    t.setStyle(t.options.editing)
    if (this._poly._map) {
      this._map = this._poly._map
      if (!this._markerGroup) {
        this._enableDragging()
        this._initMarkers()
        this._createMoveMarker()
      }
      this._poly._map.addLayer(this._markerGroup)
    }
  },
  _createMoveMarker: function () {
    if (L.EditToolbar.Edit.MOVE_MARKERS && this._poly instanceof L.Polygon) {
      this._moveMarker = new L.Marker(this._getShapeCenter(), {
        icon: this.options.moveIcon
      })
      this._moveMarker.on('mousedown', this._delegateToShape, this)
      this._markerGroup.addLayer(this._moveMarker)
    }
  },
  _delegateToShape: function (t) {
    var e = this._shape || this._poly
    var a = t.target
    e.fire(
      'mousedown',
      L.Util.extend(t, {
        containerPoint: L.DomUtil.getPosition(a._icon).add(
          e._map._getMapPanePos()
        )
      })
    )
  },
  _getShapeCenter: function () {
    return this._poly.getCenter()
  },
  removeHooks: function () {
    var t = this._poly
    t.setStyle(t.options.original)
    if (this._poly._map) {
      this._poly._map.removeLayer(this._markerGroup)
      this._disableDragging()
      delete this._markerGroup
      delete this._markers
    }
    this._map = null
  },
  _enableDragging: function () {
    if (!this._poly.dragging) {
      this._poly.dragging = new L.Handler.PathDrag(this._poly)
    }
    this._poly.dragging.enable()
    this._poly
      .on('dragstart', this._onStartDragFeature, this)
      .on('dragend', this._onStopDragFeature, this)
  },
  _disableDragging: function () {
    this._poly.dragging.disable()
    this._poly
      .off('dragstart', this._onStartDragFeature, this)
      .off('dragend', this._onStopDragFeature, this)
  },
  _onStartDragFeature: function (t) {
    this._poly._map.removeLayer(this._markerGroup)
    this._poly.fire('editstart')
  },
  _onStopDragFeature: function (t) {
    var e = this._poly
    var a = e._latlngs
    if (!L.Util.isArray(a[0])) {
      a = [a]
    }
    for (var i = 0, r = a.length; i < r; i++) {
      for (var s = 0, n = a[i].length; s < n; s++) {
        var o = this._markers[s]
        o.setLatLng(a[i][s])
        o._origLatLng = a[i][s]
        if (o._middleLeft) {
          o._middleLeft.setLatLng(this._getMiddleLatLng(o._prev, o))
        }
        if (o._middleRight) {
          o._middleRight.setLatLng(this._getMiddleLatLng(o, o._next))
        }
      }
    }
    this._poly._map.addLayer(this._markerGroup)
    L.Edit.SimpleShape.prototype._updateMoveMarker.call(this)
    this._fireEdit()
  },
  _updateMoveMarker: L.Edit.SimpleShape.prototype._updateMoveMarker,
  _createMarker: function (t, e) {
    var a = this.__createMarker(t, e)
    a.on('dragstart', this._hideMoveMarker, this).on(
      'dragend',
      this._showUpdateMoveMarker,
      this
    )
    return a
  },
  _removeMarker: function (t) {
    this.__removeMarker(t)
    t.off('dragstart', this._hideMoveMarker, this).off(
      'dragend',
      this._showUpdateMoveMarker,
      this
    )
  },
  _hideMoveMarker: function () {
    if (this._moveMarker) {
      this._markerGroup.removeLayer(this._moveMarker)
    }
  },
  _showUpdateMoveMarker: function () {
    if (this._moveMarker) {
      this._markerGroup.addLayer(this._moveMarker)
      this._updateMoveMarker()
    }
  }
})
L.Edit.PolyVerticesEdit.prototype.options.moveIcon = new L.DivIcon({
  iconSize: new L.Point(8, 8),
  className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
})
L.Edit.PolyVerticesEdit.mergeOptions({ moveMarker: false })
