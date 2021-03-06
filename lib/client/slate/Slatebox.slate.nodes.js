﻿(function ($s, $slate) {
    $slate.fn._nodes = function () {
        var _self = this, _ensureBe;
        _self.allNodes = [];

        function refreshBe() {
            window.clearTimeout(_ensureBe);
            _ensureBe = window.setTimeout(function() {
                _self._.birdseye && _self._.birdseye.refresh(false);
            }, 10);
        };

        _self.copyNodePositions = function (source) {
            _.each(source, function(src) {
                //if (src.options.id !== _self.tempNodeId) {
                    var cn = _.detect(_self.allNodes, function(n) { return n.options.id === src.options.id });
                    cn.setPosition({ x: src.options.xPos, y: src.options.yPos });
                //}
            });
            _.invoke(_.pluck(_self.allNodes, 'relationships'), 'refresh');
        };

        _self.addRange = function (_nodes) {
            $s.each(_nodes, function () {
                _self.add(this);
            });
            return _self;
        };

        _self.removeRange = function (_nodes) {
            $s.each(_nodes, function () {
                _self.allNodes = removeNode(_self.allNodes, this);
            });
            return _self;
        };

        _self.add = function (_node) {
            _node.slate = _self._; //parent
            _self.allNodes.push(_node);
            addToCanvas(_node);
        };

        _self.remove = function (_node) {
            _self.allNodes = remove(_self.allNodes, _node);
            _node.slate = null;
            removeFromCanvas(_node);
        };

        function getParentChild(obj) {
            var _parent, _child;
            $s.each(_self.allNodes, function () {
                var _node = this;
                if (this.options.id === obj.parent) {
                    _parent = _node;
                } else if (this.options.id === obj.child) {
                    _child = _node;
                }
                if (_parent && _child) return;
            });

            return { p: _parent, c: _child };
        };

        _self.removeRelationship = function (rm) {
            var pc = getParentChild(rm);
            var _parent = pc.p, _child = pc.c;
            if (_parent && _child) {
                // _parent.relationships.removeChild(_child);
                // _child.relationships.removeParent(_parent);
                _parent.relationships.removeAssociation(_child);
                _child.relationships.removeAssociation(_parent);
            }
        };

        _self.addRelationship = function (add) {
            var pc = getParentChild(add);
            var _parent = pc.p, _child = pc.c;
            if (_parent && _child) {
                switch (add.type) {
                    case "association":
                        _parent.relationships.addAssociation(_child, add.options);
                        break;
                    // case "parent":
                    //     _parent.relationships.addParent(_child);
                    //     break;
                }
            }
        };

        _self.closeAllLineOptions = function (exception) {
            $s.each(_self.allNodes, function () {
                var _nx = this;
                $s.each(_nx.relationships.associations, function() {
                    if (this.id === exception) {
                    } else {
                        _nx.lineOptions && _nx.lineOptions.hide(this.id);
                    }
                });
            });
        };

        _self.closeAllMenus = function (exception) {
            $s.each(_self.allNodes, function () {
                if (this.options.id === exception) {
                } else {
                    this.menu && this.menu.hide();
                }
            });
        };

        _self.closeAllConnectors = function () {
            $s.each(_self.allNodes, function () {
                this.connectors && this.connectors.remove();
                this.resize && this.resize.hide();
            });
        };

        _self.one = function (id) {
            var cn = null;
            $s.each(_self.allNodes, function () {
                if (this.options.id === id) {
                    cn = this;
                    return;
                }
            });
            return cn;
        };

        function remove(a, obj) {
            return _.filter(a, function(a) { return a.options.id !== obj.options.id; });
        }

        function removeFromCanvas(_node) {
            _.each(["vect", "text", "link"], function(tt) {
                _node[tt].remove();
            });
            refreshBe();
        };

        function addToCanvas(_node) {
            var vect = null, text = null, link = null, s = _node.options.borderColor || "#000";
            if (_node.options.borderWidth === 0) s = 'transparent';
            var vectOpt = { stroke: s, "stroke-dasharray": _node.options.borderStyle || "", "stroke-width": _node.options.borderWidth, fill: (_node.options.backgroundColor || "none") };
            var _x = _node.options.xPos;
            var _y = _node.options.yPos;
            var paperToUse = _self._.paper;
            var percent = 1;

            var _width = _node.options.width;
            var _height = _node.options.height;

            switch (_node.options.vectorPath) {
                case "ellipse":
                    vect = paperToUse.ellipse(_x * percent, _y * percent, (_width / 2) * percent, (_height / 2) * percent).attr(vectOpt);
                    break;
                case "rectangle":
                    vect = paperToUse.rect(_x * percent, _y * percent, _width * percent, _height * percent).attr(vectOpt);
                    break;
                case "roundedrectangle":
                    vect = paperToUse.rect(_x * percent, _y * percent, _width * percent, _height * percent, 10).attr(vectOpt);
                    break;
                default:
                    var _tPath = Raphael.transformPath(_node.options.vectorPath, "T" + (_x * percent) + "," + (_y * percent));
                    vect = paperToUse.path(_tPath).attr(vectOpt);
                    break;
            }

            //vect.transform("s" + (_node.options.scaleX || 1) + "," + (_node.options.scaleY || 1));

            //need to set in case toback or tofront is called and the load order changes in the context plugin
            vect.node.setAttribute("rel", _node.options.id);
            vect.data({ id: _node.options.id });
            _node.vect = vect;

            tc = _node.textCoords();
            lc = _node.linkCoords();
            text = paperToUse.text(tc.x, tc.y, (_node.options.text || '')).attr({ "font-size": _node.options.fontSize + "pt", fill: _node.options.foregroundColor || "#000" });
            link = paperToUse.linkArrow().transform(["t", lc.x, ",", lc.y, "s", ".8", ",", ".8", "r", "180"].join());

            _node.text = text;
            _node.link = link;

            _node.relationships.wireHoverEvents();
            _node.relationships.wireDragEvents();
            _node.links && _node.links.wireEvents();

            if (_node.options.image && _node.options.image !== "") {
                _node.vect.attr({ "fill": "url(" + _node.options.image + ")", "stroke-width": _node.options.borderWidth, "stroke": "#000" });
            }

            if (!_node.options.link || !_node.options.link.show) {
                _node.link.hide();
            }
            
            refreshBe();
            return vect;
        };
        return _self;
    }
})(Slatebox, Slatebox.fn.slate);