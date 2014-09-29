(function ($s, $n) {
    $n.fn._menu = function () {
        var _self = this;
        var _m = null
        var _isOpen = false;

        _self.isOpen = function () { return _isOpen; };
        _self.show = function (ttl) {
            if (_self._.slate !== null) {
                var r = _self._.slate.paper;
                if (ttl === undefined) ttl = 3000;
                if (_m) { _.invoke(_m, 'remove'); _m = null; }

                var off = _self._.offset();
                var _x = off.x + _self._.slate.options.viewPort.left;
                var _y = off.y + _self._.slate.options.viewPort.top - 80;

                _m = r.set();

                //right, bottom, and settings connectors
                _self._.connectors.show(_x, _y, _m, function () {
                    loadParent(r, _x, _y);
                });

                if (_self.wasOpen) { _self.wasOpen = false; _self._.connectors.removeSettingsButton(); loadParent(r, _x, _y); }
            }
        };

        _self.hide = function () {
            if (_m) { _.invoke(_m, 'remove'); _m = null; }
            _isOpen = false;
        };

        function broadcast(_pkg) {
            _self._.colorpicker.set(_pkg.data);
            _self._.slate.collab && _self._.slate.collab.send(_pkg);
        };

        function loadParent(r, _x, _y) {

            _isOpen = true;

            //menu parent
            var _menuParent = r.rect(_x, _y, 295, 80, 10).attr({ "fill": "90-#ccc-#eee" });
            _menuParent.node.style.cursor = "pointer";
            _m.push(_menuParent);

            //toolbar -- connector, editor, deleter
            _self._.toolbar.show(_x, _y, _m);

            //color picker
            _self._.colorpicker.show({ 
                x: _x
                , y: _y
                , m: _m 
                , onSelected: function(_swatch) {
                    _swatch.loop();
                    var _backColor = _swatch.attr("fill");
                    var _testColor = "#" + _backColor.split(/90-#/g)[1].split(/-#/g)[0];
                    var _textColor = Raphael.rgb2hsb(_testColor).b < .4 ? "#fff" : "#000";

                    if (_self._.options.image !== "") _self._.options.image = "";

                    var _pkg = { type: "onNodeColorChanged", data: { id: _self._.options.id, color: _backColor} };
                    broadcast(_pkg);
                    _self._.slate.birdseye && _self._.slate.birdseye.nodeChanged(_pkg);
                }
            });

            //shapes -- change the node shape to rect, rounded rect, ellipse
            _self._.shapes.show(_x, _y, _m);

            //lines on menu
            _m.push(r.path(["M", _x, _y + 36, "L", _x + 160, _y + 36].join(",")).attr({ stroke: "#000" }));
            _m.push(r.path(["M", _x + 160, _y, "L", _x + 160, _y + 80].join(",")).attr({ stroke: "#000" }));

            //menu
            var cls = r.deleter().attr({ fill: "#ddd", stroke: "#333" }).transform(["t", (_x + 275), ",", (_y - 13), "s", ",", ".75", ".75"].join());
            cls.mouseover(function () {
                _self._.slate.glow(cls);
            });
            cls.mouseout(function () {
                _self._.slate.unglow();
            });
            cls.mousedown(function () {
                _self._.slate.unglow();
                _self.hide();
            });
            _m.push(cls);

        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);