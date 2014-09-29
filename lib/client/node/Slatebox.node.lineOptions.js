(function ($s, $n) {
    $n.fn._lineOptions = function () {
        var _self = this;
        var _m = {};
        var _slider = null;

        _self.set = function(pkg) {
            _self._.options[pkg.prop] = pkg.val;
            var a = _self._.relationships.associations[pkg.index];
            if (pkg.val === "toggle") {
                a[pkg.prop] = a[pkg.prop] ? ![pkg.prop] : true;
            } else {
                a[pkg.prop] = pkg.val;
            }
            _self._.relationships.refresh();
        };

        _self.show = function (e, c) {
            _self.hideAll();
            //_self._.slate.nodes.closeAllLineOptions(c.id);
            //if (!_m[c.id]) {

                var _r = _self._.slate.paper;
                var mp = $s.mousePos(e);
                var off = $s.positionedOffset(_self._.slate.options.container);
                var z = _self._.slate.options.viewPort.zoom.r;  
                var x = (mp.x + _self._.slate.options.viewPort.left - off.left - 90)/z;
                var y = (mp.y + _self._.slate.options.viewPort.top - off.top - 30)/z;

                _m[c.id] = _r.set();
                var _menuParent = _r.rect(x - 5, y - 5, 180, 90, 5).attr({ "fill": "90-#ccc-#eee", "fill-opacity": "0.4" });
                _m[c.id].push(_menuParent);

                toolbar = [
                    _r.arrowHead().data({ msg: 'Parent Arrow', width: 83, height: 22 }).attr({ fill: "#fff", stroke: "#333", "stroke-width": 1, "cursor": "pointer" }).transform(["t", x + 20, ",", y - 6, "s", ".85", ".85", "r", 180].join())
                    , _r.handle().data({ msg: 'Remove Relationship', width: 132, height: 22 }).attr({ fill: "#fff", stroke: "#333", "stroke-width": 1, "cursor": "pointer" }).transform(["t", x + 20, ",", y - 6 + 30, "s", ".85", ".85"].join())
                    , _r.arrowHead().data({ msg: 'Child Arrow', width: 75, height: 22 }).attr({ fill: "#fff", stroke: "#333", "stroke-width": 1, "cursor": "pointer" }).transform(["t", x + 20, ",", y - 6 + 60, "s", ".85", ".85"].join())
                ];

                var onInit = function() {
                    _self._.setStartDrag();
                    _slider && _slider.setValue(_self._.options.lineWidth);
                };

                var onSlide = function(width) { 
                    _self.set({ val: parseInt(Math.max(width, 1)), prop: "lineWidth", index: _index(c.id) });
                };

                var onDone = function(width) { 
                     var _data = { val: parseInt(Math.max(width, 1)), prop: "lineWidth", index: _index(c.id) };
                    _self.set(_data);
                    broadcast({ type: "changeLineWidth", data: _data });
                    _self._.setEndDrag();
                };

                _slider = _r.slider(80, 1, 50, _self._.options.lineWidth || 2, onSlide, onDone, onInit, x, y, true, z)
                _m[c.id].push(_slider);

                $s.each(toolbar, function () {
                    this.mouseover(function (e) {
                        //$(e.target).style.cursor = "pointer";
                        _self._.slate.glow(this);
                        var _text = this.data("msg");
                        _self._.slate.addtip(this.tooltip({ type: 'text', msg: _text }, this.data("width"), this.data("height")));
                        $s.stopEvent(e);
                    });
                    this.mouseout(function (e) {
                        if (_self._ && _self._.slate) {
                            _self._.slate.unglow();
                            this.untooltip();
                        }
                        $s.stopEvent(e);
                    });
                });

                toolbar[0].mousedown(function(e) {
                    $s.stopEvent(e);
                    var _data = { val: "toggle", prop: "showParentArrow", index: _index(c.id) };
                    _self.set(_data);
                    broadcast({ type: "toggleParentArrow", data: _data });
                });

                toolbar[1].mousedown(function(e) {
                    _self._.slate.untooltip();
                    $s.stopEvent(e);
                    if (_self._.slate.options.enabled) {
                        _self._.slate.unglow();

                        var a = _.find(_self._.relationships.associations, function(a) { return a.id === c.id; });
                        var pkg = { type: "removeRelationship", data: { parent: c.parent.options.id, child: c.child.options.id} };
                        _self._.slate.nodes.removeRelationship(pkg.data);
                        _self._.slate.birdseye && _self._.slate.birdseye.relationshipsChanged(pkg);
                        broadcast(pkg);

                        _self._.relationships.initiateTempNode(e, c.parent, { showChildArrow: a.showChildArrow, showParentArrow: a.showParentArrow });
                        _self.hide(c.id);
                    }
                });

                toolbar[2].mousedown(function(e) {
                    $s.stopEvent(e);
                    var _data = { val: "toggle", prop: "showChildArrow", index: _index(c.id) };
                    _self.set(_data);
                    broadcast({ type: "toggleChildArrow", data: _data });
                });

                 _self._.colorpicker.show({ 
                    x: x
                    , y: y
                    , m: _m[c.id]
                    , width: _menuParent.attr("width")
                    , onSelected: function(_swatch) {
                        _swatch.loop();
                        var _backColor = _swatch.attr("fill");
                        var _testColor = "#" + _backColor.split(/90-#/g)[1].split(/-#/g)[0];
                        var _textColor = Raphael.rgb2hsb(_testColor).b < .4 ? "#fff" : "#000";

                        var _data = { val: _testColor, prop: "lineColor", index: _index(c.id) };
                        _self.set(_data);
                        broadcast({ type: "changeLineColor", data: _data });

                        // if (_self._.options.image !== "") _self._.options.image = "";

                        // var _pkg = { type: "onNodeColorChanged", data: { id: _self._.options.id, color: _backColor} };
                        // broadcast(_pkg);
                        // _self._.slate.birdseye && _self._.slate.birdseye.nodeChanged(_pkg);
                    }
                });

                $s.each(toolbar, function () {
                    _m[c.id].push(this);
                });

                //closer
                var cls = _r.deleter().attr({ fill: "#ddd", stroke: "#333" }).transform(["t", (x + 162), ",", (y - 19), "s", ",", ".75", ".75"].join());
                cls.mouseover(function () {
                    _self._.slate.glow(cls);
                });
                cls.mouseout(function () {
                    _self._.slate.unglow();
                });
                cls.mousedown(function () {
                    _self._.slate.unglow();
                    _self.hide(c.id);
                });
                _m[c.id].push(cls);
            //}
            return _self;
        };

        _self.hide = function(id) {
            if (_m[id]) { _.invoke(_m[id], 'remove'); _m[id] = null; }
        };

        _self.hideAll = function(id) {
            _.each(_.pluck(_self._.relationships.associations, "id"), function(id) {
                _self.hide(id);
            });           
        };

        function _index(cid) {
            return _.indexOf(_.pluck(_self._.relationships.associations, "id"), cid);
        };

        function broadcast(pkg) {
            pkg.data.id = _self._.options.id;
            _self._.slate.collab && _self._.slate.collab.send(pkg);
        };

        return _self;
    }

})(Slatebox, Slatebox.fn.node);