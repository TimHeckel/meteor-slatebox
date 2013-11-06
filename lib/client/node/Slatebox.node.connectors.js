(function ($s, $n) {
    $n.fn._connectors = function () {
        var _self = this;
        var buttons;
        var pinnedRowCount = 3;
        var _lastUnpinned = { options: { xPos: null, width: null, yPos: null} };

        _self.remove = function () {
            _.invoke(buttons, 'remove');
        };
        _self.removeSettingsButton = function () { buttons.setting.remove(); }
        _self.show = function (x, y, _m, onSettingsClicked) {
            var btnRadius = 15;
            var r = _self._.slate.paper;

            //menu offset, resetting back
            y = y + 80;
            var btnAttr = { fill: "#fff", stroke: "#000" };

            buttons = {
                setting: r.setting().transform(["t", x + _self._.options.width - 50, ",", y - 18].join()).attr(btnAttr)
                , unPinned: r.plus().transform(["t", x + _self._.options.width - 16, ",", y + 8].join()).attr(btnAttr)
                //, pinned: r.arrow().transform(["t", _cx - 13, ",", _cy - 9, "s", so, so, "r", "90"].join()).attr(btnAttr)
            };

            $s.each(['mousedown'], function () {
                buttons.setting[this](function (e) {
                    _self._.slate.unglow();
                    onSettingsClicked.apply(this);
                    this.remove();
                    _self._.slate.multiselection && _self._.slate.multiselection.end();
                    _self._.context && _self._.context.remove();
                    _self._.editor && _self._.editor.end();
                    _self._.images && _self._.images.end();
                    _self._.links && _self._.links.end();
                });

                buttons.unPinned[this](function (e) {
                    _self._.slate.unglow();
                    _self._.connectors.addNode();
                    this.loop();
                    _self._.context && _self._.context.remove();
                });

            });

            $s.each(buttons, function () {
                _m.push(this);
                this.mouseover(function (e) {
                    _self._.slate.glow(this);
                });
                this.mouseout(function (e) {
                    _self._.slate.unglow();
                });
            });

            var rs = _self._.resize.show(x + _self._.options.width, y + _self._.options.height);
            _m.push(rs);

            return _self;
        };

        _self.reset = function () {
            _lastUnpinned = { options: { xPos: null, width: null, yPos: null} };
        };

        function broadcast(_snap) {
            var pkg = { type: 'onNodeAdded', data: _self._.slate.exportDifference(_snap) };
            _self._.slate.collab && _self._.slate.collab.send(pkg);
        };

        _self.addNode = function (skipCenter) {
            //add new node to the right of this one.
            var _snap = _self._.slate.snapshot();

            var _options = $s.clone(_self._.options);
            delete _options.id;
            delete _options.link;
            _options.xPos = (_lastUnpinned.xPos || _self._.options.xPos) + (_self._.options.width || _lastUnpinned.width) + 30;
            _options.text = "";
            _options.width = _self._.options.width;
            _options.height = _self._.options.height;
            var newNode = $s.instance.node(_options);
            _self._.slate.nodes.add(newNode);
            _lastUnpinned = newNode.options;

            _self._.relationships.addAssociation(newNode);
            _self._.slate.birdseye && _self._.slate.birdseye.refresh(false);
            _self._.slate.unMarkAll();

            broadcast(_snap);

            //var _pkg = { type: "addRelationship", data: { type: 'association', parent: _self._.options.id, child: newNode.options.id} };
            //_self._.slate.collab && _self._.slate.collab.send(_pkg);

            //fire the editor
            if (skipCenter === undefined) {
                newNode.position('center', function () {
                    newNode.editor && newNode.editor.start();
                });
            }

            return newNode;
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);