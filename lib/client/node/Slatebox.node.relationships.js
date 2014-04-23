(function ($s, $n) {
    $n.fn._relationships = function () {
        var _self = this;
        _self.associations = [];

        var _isLastAlt = false, _isLastShift = false;

        function broadcast(pkg) {
            _self._.slate.collab && _self._.slate.collab.send(pkg);
        };

        function refreshBe() {
            //refresh the birds eye
            var _json = null;
            if (_self._.slate.birdseye)
                _json = _self._.slate.birdseye.refresh(false);
            return _json;
        };

        _self.addAssociation = function (_node, assocPkg) {
            var cx = _self._.slate.paper;
            assocPkg = assocPkg || {};

            //make sure this doesn't already exist
            var _connection = _.detect(_self.associations, function(a) {
                return a.child.options.id === _node.options.id;
            });

            if (!_connection) {
                _connection = cx.connection({
                    id: $s.guid()
                    , parent: _self._
                    , child: _node
                    , lineColor: assocPkg.lineColor || _self._.options.lineColor
                    , lineWidth: assocPkg.lineWidth || _self._.options.lineWidth
                    , lineOpacity: assocPkg.lineOpacity || _self._.options.lineOpacity
                    , blnStraight: assocPkg.isStraightLine || false
                    , showParentArrow: assocPkg.showParentArrow || false
                    , showChildArrow: assocPkg.showChildArrow || false
                });
                _connection.line.toBack();

                _self.associations.push(_connection);
                _node.relationships.associations.push(_connection);

                wireLineEvents(_connection);
                //refreshBe();
            }

            return _connection;
        };

        function wireLineEvents(c) {
            if (_self._.options.allowMenu) {
                var sp = 200, highlight = "#ff0";
                c.line.node.style.cursor = "pointer";
                c.line.mouseover(function () {
                    if (_self._.slate.options.enabled) {
                        _self._.slate.glow(this);
                        c.showChildArrow && (_self._.slate.glow(c.childArrow));
                        c.showParentArrow && (_self._.slate.glow(c.parentArrow));
                    }
                });
                c.line.mouseout(function () {
                    _self._.slate.unglow();
                });

                c.line.mousedown(function (e) {
                    if (_self._.slate.options.enabled) {
                        _self._.slate.unglow();

                        var pkg = { type: "removeRelationship", data: { parent: c.parent.options.id, child: c.child.options.id} };
                        _self._.slate.nodes.removeRelationship(pkg.data);
                        _self._.slate.birdseye && _self._.slate.birdseye.relationshipsChanged(pkg);
                        broadcast(pkg);

                        _self.initiateTempNode(e, c.parent);
                    }
                });
            }
        };

        _self.initiateTempNode = function (e, _parent, isNew) {
            var mp = $s.mousePos(e);
            var _slate = _parent.slate;

            var off = $s.positionedOffset(_slate.options.container);

            var _zr = _self._.slate.options.viewPort.zoom.r;
            var xp = (_slate.options.viewPort.left + mp.x - off.left);
            var yp = (_slate.options.viewPort.top + mp.y - off.top);

            var _tempNode = $s.instance.node({
                id: _self._.slate.tempNodeId
                , xPos: xp + ((xp / _zr) - xp)
                , yPos: yp + ((yp / _zr) - yp)
                , lineColor: "#990000"
                , backgroundColor: "#ffffff"
                , vectorPath: 'ellipse'
                , width: 30
                , height: 30
            });

            _slate.nodes.add(_tempNode, true);
            var _tempRelationship = _parent.relationships.addAssociation(_tempNode, {}, true); // _tempNode.relationships.addParent(_parent, {}, true);

            _tempRelationship.hoveredOver = null;
            _tempRelationship.lastHoveredOver = null;

            //initiates the drag
            _tempNode.vect.initDrag(e); //, off.x, off.y);
            _slate.options.viewPort.allowDrag = false;

            _tempNode.vect.mousemove(function (e) {
                _self._.slate.paper.connection(_tempRelationship);

                //is there a current hit?
                if (_tempRelationship.hoveredOver === null) { //(e.clientX + e.clientY) % 2 === 0 && 
                    _tempRelationship.hoveredOver = hitTest($s.mousePos(e));
                    if (_tempRelationship.hoveredOver !== null) {
                        //yes, currently over a node -- scale it
                        _tempRelationship.hoveredOver.vect.animate({ "stroke-width": 5 }, 500, function () {
                            _tempRelationship.hoveredOver.vect.animate({ "stroke-width": _self._.options.borderWidth }, 500, function () {
                                _tempRelationship.hoveredOver = null;
                            });
                        });

                        //_tempRelationship.hoveredOver.vect.animate({ scale: '1.25, 1.25' }, 200);
                        //remember this node
                        //_tempRelationship.lastHoveredOver = _tempRelationship.hoveredOver;
                    } else {
                        //no current hit...is there a previous hit to reset?
                        //if (_tempRelationship.lastHoveredOver !== null) {
                        //    _tempRelationship.lastHoveredOver.vect.attr({ fill: _self._.options.backgroundColor });
                        //_tempRelationship.lastHoveredOver.vect.animate({ scale: '1,1' }, 200);
                        //    _tempRelationship.lastHoveredOver = null;
                        //}
                    }
                }
            });

            _tempNode.vect.mouseup(function (e) {
                _parent.relationships.removeAssociation(_tempNode);
                //_tempNode.relationships.removeParent(_parent);
                _tempNode.slate.nodes.remove(_tempNode);

                var overNode = hitTest($s.mousePos(e));
                if (overNode !== null) {
                    //overNode.vect.transform("s1,1,");
                    _parent.relationships.addAssociation(overNode);
                    var _pkgx = { type: "addRelationship", data: { type: 'association', parent: _parent.options.id, child: overNode.options.id } };
                    _self._.slate.birdseye && _self._.slate.birdseye.relationshipsChanged(_pkgx);
                    broadcast(_pkgx);
                }

                if (_self._.slate.options.enabled)
                    _parent.slate.options.viewPort.allowDrag = true;
            });
        };

        _self.removeAll = function () {
            $s.each(_self.associations, function () {
                this.child.relationships.removeAssociation(_self._); //.parent);
                this.parent.relationships.removeAssociation(_self._);
                //_self.removeAssociation(this.child);
                _self._.slate.paper.removeConnection(this);
            });
            _self.associations = [];
        };

        _self.removeAssociation = function (_node) {
            _self.associations = remove(_self.associations, 'child', _node);
            _self.associations = remove(_self.associations, 'parent', _node);
            return _self;
        };

        function hitTest(mp) {
            var overNode = null;
            var off = $s.positionedOffset(_self._.slate.options.container);
            $s.each(_self._.slate.nodes.allNodes, function () {
                if (this.options.id !== _self._.slate.tempNodeId && this.options.id !== _self._.options.id) {
                    var _bb = this.vect.getBBox();

                    var _zr = _self._.slate.options.viewPort.zoom.r;
                    var xp = (_self._.slate.options.viewPort.left + mp.x - off.left);
                    var yp = (_self._.slate.options.viewPort.top + mp.y - off.top);

                    var c = {
                        x: xp + ((xp / _zr) - xp)
                        , y: yp + ((yp / _zr) - yp)
                    };

                    if (c.x > _bb.x && c.x < _bb.x + _bb.width && c.y > _bb.y && c.y < _bb.y + _bb.height) {
                        overNode = this;
                        return;
                    }
                }
            });
            return overNode;
        };

        function remove(a, type, obj) {
            var _na = [];
            $s.each(a, function () {
                if (this[type].options.id === obj.options.id) {
                    _self._.slate.paper.removeConnection(this);
                } else {
                    _na.push(this);
                }
            });
            return _na;
        };

        var dragger = function (x, y) {
            if (_self._.events && $s.isFunction(_self._.events.onClick)) {
                _self._.events.onClick.apply(this, [function () {
                    _initDrag(this);
                } ]);
            } else {
                _initDrag(this);
            }
        };

        function _initDrag(_vect) {
            _self._.slate.multiselection && _self._.slate.multiselection.end();
            if (_self._.slate.options.linking) {
                _self._.slate.options.linking.onNode.apply(_vect, [_self._]);
            } else {
                if (_self._.options.allowDrag) {
                    _vect.ox = _vect.type == "rect" ? _vect.attr("x") : _vect.attr("cx");
                    _vect.oy = _vect.type == "rect" ? _vect.attr("y") : _vect.attr("cy");

                    _self.syncAssociations(_self._, function(c) {
                        c.vect.ox = c.vect.type == "rect" ? c.vect.attr("x") : c.vect.attr("cx");
                        c.vect.oy = c.vect.type == "rect" ? c.vect.attr("y") : c.vect.attr("cy");
                        c.relationships.hideAll();
                        c.setStartDrag();
                    });
                    _self.hideAll();
                    _self._.setStartDrag();

                    _isLastAlt = _self._.slate.isAlt;
                    _isLastShift = _self._.slate.isShift;
                }
            }
        };

        var move = function (dx, dy) {
            if (_self._.options.allowDrag) {

                var _zr = _self._.slate.options.viewPort.zoom.r;
                dx = dx + ((dx / _zr) - dx);
                dy = dy + ((dy / _zr) - dy);

                _self.refresh();

                _self._.setPosition({ x: _self._.vect.ox + dx, y: _self._.vect.oy + dy });

                _self.syncAssociations(_self._, function(c, a) {
                    c.setPosition({ x: c.vect.ox + dx, y: c.vect.oy + dy });
                    c.relationships.refresh();
                });

                //var att = _self._.options.vectorPath === "ellipse" ? { cx: _self._.vect.ox + dx, cy: _self._.vect.oy + dy} : { x: _self._.vect.ox + dx, y: _self._.vect.oy + dy };
            }
        };

        _self.syncAssociations = function(node, cb) {
            if (!_self._.slate.isShift || (_self._.slate.isAlt && _self._.slate.isShift)) {
                _.each(node.relationships.associations, function(a) {
                    if (a.child.options.id !== _self._.options.id && a.child.options.id !== node.options.id) {
                        cb && cb(a.child, a);
                        if (_self._.slate.isAlt && _self._.slate.isShift) {
                            _self.syncAssociations(a.child, cb);
                        }
                    }
                });
            }
        };

        var up = function (e) {

            _self.showAll();
            _self.refresh();
            _self._.setEndDrag();

            _self.syncAssociations(_self._, function(c) {
                c.relationships.showAll();
                c.relationships.refresh();
                //c.setEndDrag();
            });

            _self._.slate.birdseye && _self._.slate.birdseye.refresh(true);

            if (_self._.slate.options.events && $s.isFunction(_self._.slate.options.events.onNodeDragged))
                _self._.slate.options.events.onNodeDragged.apply(this);

            if (_self._.context && !_self._.context.isVisible() && _self._.options.allowDrag) {
                _self._.slate.collab && _self._.slate.collab.send({
                    type: "onNodeMove"
                    , data: {
                        id: _self._.options.id
                        , x: _self._.options.xPos
                        , y: _self._.options.yPos
                        , isAlt: _isLastAlt
                        , isShift: _isLastShift
                    }
                });
            }
        };

        var _visibility = function(action) {
            var slate = _self._.slate.paper;
            for (var i = _self.associations.length; i--; ) {
                _self.associations[i].line[action]();
            }
            slate.safari();
        };

        _self.hideAll = function () {
            if (_self._.slate.isAlt && _self._.slate.isShift) _visibility("hide");
        };

        _self.showAll = function () {
            if (_self._.slate.isAlt && _self._.slate.isShift) _visibility("show");
        };

        _self.refresh = function (isAnimating) {
            var slate = _self._.slate.paper;
            for (var i = _self.associations.length; i--; ) {
                var _pkg = _self.associations[i];
                _pkg.isAnimating = isAnimating || false;
                slate.connection(_pkg);
            }
            slate.safari();
        };

        var _over = function (e) {
            _self._.slate.options.viewPort.allowDrag = false;

            _self._.slate.keyboard && _self._.slate.keyboard.start(_self._);

            //close all open menus
            _self._.slate.nodes.closeAllMenus(_self._.options.id);
            if (_self._.menu && $s.isFunction(_self._.menu.show) && _self._.options.allowMenu && !_self._.menu.isOpen()) {
                _self._.menu.show();
            }
            $s.stopEvent(e);
        };

        var _out = function (e) {
            if (_self._ && _self._.slate && _self._.slate.options) {
                _self._.slate.options.viewPort.allowDrag = true;
                _self._.slate.unglow();
                _self._.slate.keyboard && _self._.slate.keyboard.end();
            } else {
                console.log("missing options from ", _self);
            }
            $s.stopEvent(e);
        };

        var _dbl = function (e) {
            if (_self._.slate.options.enabled) {
                _self._.position('center', function () {
                    _self._.editor && _self._.editor.start();
                });
            }
            $s.stopEvent(e);
        };

        var v = [];
        _self.wireHoverEvents = function () {
            v = [];
            v.push({ o: _self._.vect, over: _over, out: _out, dbl: _dbl });
            v.push({ o: _self._.text, over: _over, out: _out, dbl: _dbl });
            if (_self._.options.id !== _self._.slate.tempNodeId) {
                $s.each(v, function () {
                    this.o.mouseover(this.over);
                    this.o.mouseout(this.out);
                    this.o.dblclick(this.dbl);
                });
            }
        };

        _self.unwireHoverEvents = function () {
            $s.each(v, function () {
                $s.each(v, function () {
                    this.o.events && this.o.unmouseover(this.over); //_.indexOf(_.pluck(this.o.events, 'name'), "mouseover") > -1
                    this.o.events && this.o.unmouseout(this.out);
                    this.o.events && this.o.undblclick(this.dbl);
                });
            });
        };

        _self.wireDragEvents = function () {
            _self._.vect.drag(move, dragger, up);
            _self._.text.mousedown(function (e) {
                _self._.vect.initDrag(e);
            });
        };

        return _self;
    };
})(Slatebox, Slatebox.fn.node);