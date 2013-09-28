(function ($s) {
    $s.fn.node = function (_options) {
        if (!(this instanceof $s.fn.node))
            return new $s.fn.node(_options);

        var _node = this, _marker;
        _node.options = {
            id: $s.guid()
            , name: ''
			, text: '' //text in the node
			, image: '' //the image to show with the node
			, imageTiled: false
			, xPos: 0 //the initial x position relative to the node container
			, yPos: 0 //the initial y position relative to the node container
			, height: 10 //the height of the node
			, width: 10 //the width of the node
            , borderWidth: 2 //border width of the node
			, lineColor: '#000000' //line color
			, lineWidth: 10 //line width
            , lineOpacity: 1
			, allowDrag: true
            , allowMenu: true
            , allowContext: true
			, backgroundColor: '#f8f8f8'
			, foregroundColor: '#000'
			, fontSize: 13
			, fontFamily: 'Trebuchet MS'
			, fontStyle: 'normal'
			, vectorPath: ''
			, rotationAngle: 0
            , link: { show: false, type: '', data: '', thumbnail: { width: 175, height: 175} }
        };

        $s.extend(_node.options, _options);
        if (_node.options.name === "") _node.options.name = _node.options.id;

        _node.constants = {
            statusPanelAtRest: 33
			, statusPanelExpanded: 200
        };

        _node.del = function () {
            var _unlinkId = _node.options.id;

            _node.slate.nodes.closeAllMenus();
            _node.relationships.removeAll();

            _node.slate.options.viewPort.allowDrag = true;

            //unlink any links
            $s.each(_node.slate.nodes.allNodes, function () {
                if (this.options.link && this.options.link.show && this.options.link.data === _unlinkId) {
                    $s.extend(this.options.link, { show: false, type: '', data: '' });
                    this.link.hide();
                }
            });

            _node.slate.unMarkAll();
            _node.slate.nodes.remove(_node);
        };

        function url(opt) {
            return _node.options.ajax.rootUrl + _node.options.ajax.urlFlavor + opt
        };

        _node.setStartDrag = function () {
            _node.slate.options.viewPort.allowDrag = false;
            _node.slate.stopEditing();
            _node.connectors && _node.connectors.reset();
            _node.context && _node.context.remove();
            if (_node.menu && _node.menu.isOpen()) {
                _node.menu.wasOpen = true;
            }
        };

        _node.setEndDrag = function () {
            if (_node.slate && _node.slate.options.enabled) //could be null in case of the tempNode
                _node.slate.options.viewPort.allowDrag = true;

            if (_node.menu && $s.isFunction(_node.menu.show) && _node.options.allowMenu)
                _node.menu.show();
        };

        _node.serialize = function (lineWidthOverride) {
            var jsonNode = {};
            $s.extend(jsonNode, {
                options: _node.options
            });
            jsonNode.relationships = { associations: [] }; //, children: []
            $s.each(_node.relationships.associations, function () {
                jsonNode.relationships.associations.push(bindRel(this, lineWidthOverride));
            });
            return jsonNode;
        };

        function bindRel(obj, lineWidthOverride) {
            return {
                childId: obj.child.options.id
                , parentId: obj.parent.options.id
                , isStraightLine: obj.blnStraight
                , lineColor: obj.lineColor
                , lineOpacity: obj.lineOpacity
                , lineWidth: lineWidthOverride || obj.lineWidth
                , showParentArrow: obj.showParentArrow || false
                , showChildArrow: obj.showChildArrow || false
            };
        };

        _node.addRelationships = function (json, cb) {
            //add parents
            var _lines = [];
            if (json.relationships) {

                //add associations
                if ($s.isArray(json.relationships.associations)) {
                    $s.each(json.relationships.associations, function () {
                        var _pr = this, _pn = null;
                        $s.each(_node.slate.nodes.allNodes, function () {
                            if (this.options.id === _pr.parentId && _node.options.id !== this.options.id) {
                                _pn = this;
                                return;
                            }
                        });
                        if (_pn) {
                            var _conn = _pn.relationships.addAssociation(_node, _pr);
                            _lines.push(_conn.line);
                            return;
                        }
                    });
                }
            }
            if ($s.isFunction(cb)) {
                cb.apply(this, [_lines]);
            }
        };

        _node.toFront = function () {
            $s.each(_node.relationships.children, function () {
                this.line.toFront();
            });
            _.invoke(_.pluck(_node.relationships.parents, "line"), "toFront");
            _.invoke(_.pluck(_node.relationships.associations, "line"), "toFront");

            _node.vect.toFront();
            _node.text.toFront();
            _node.link.toFront();
        };

        _node.toBack = function () {
            _node.link.toBack();
            _node.text.toBack();
            _node.vect.toBack();
            $s.each(_node.relationships.children, function () {
                this.line.toBack();
            });
            _.invoke(_.pluck(_node.relationships.parents, "line"), "toBack");
            _.invoke(_.pluck(_node.relationships.associations, "line"), "toBack");
        };

        _node.hide = function () {
            _node.vect.hide();
            _node.text.hide();
            _node.options.link.show && _node.link.hide();
        };

        _node.show = function () {
            _node.vect.show();
            _node.text.show();
            _node.options.link.show && _node.link.show();
        };

        function posAtt(p) {
            //var att = {}; //, p = { x: _node.options.xPos, y: _node.options.yPos };
            switch (_node.options.vectorPath) {
                case "ellipse":
                    return { cx: p.x, cy: p.y };
                case "rectangle":
                case "roundedrectangle":
                    return { x: p.x, y: p.y };
                default:
                    var _animPath = Raphael.transformPath(_node.options.vectorPath, "T" + p.x + "," + p.y);
                    return { path: _animPath };
            }
        };

        _node.setPosition = function (p, blnKeepMenusOpen) {
            _node.vect.attr(posAtt(p)); //posAtt()
            
            //_node.relationships.refresh();

            _node.options.xPos = p.x;
            _node.options.yPos = p.y;

            var lc = _node.linkCoords();
            _node.text.attr(_node.textCoords());
            _node.link.transform(["t", lc.x, ",", lc.y, "s", ".8", ",", ".8", "r", "180"].join());

            //close all open menus
            if (blnKeepMenusOpen !== true)
                _node.slate.nodes.closeAllMenus();
        };

        function _getDepCoords(p, node) {
            var lx = p.x - 5
                , tx = p.x + (node.options.width / 2)
                , ty = p.y + (node.options.height / 2);

            if (node.options.vectorPath === "ellipse") {
                lx = p.cx - 5;
                tx = p.cx;
                ty = p.cy;
            }

            return { lx: lx, tx: tx, ty: ty };
        };

        _node.move = function (pkg) {
            //for text animation
            var p = pkg.data || pkg
                , d = p.dur || 500
                , e = p.easing || ">"
                , dps = _getDepCoords(p, _node)
                , lx = dps.lx
                , tx = dps.tx
                , ty = dps.ty;

            //simulate ctrl and shift keys
            _node.slate.isCtrl = p.isCtrl || false;
            _node.slate.isShift = p.isShift || false;

            //always hide by default
            _node.link.hide();
            _node.menu.hide();

            //kick off the 'move' of all connected associations
            var _targX = p.x - _node.options.xPos
                , _targY = p.y - _node.options.yPos;

            _node.relationships.syncAssociations(_node, function(c, a) {
                //_node.vect.attr(posAtt(p));
                var pxx = { x: c.options.xPos + _targX, y: c.options.yPos + _targY };
                switch (c.options.vectorPath) {
                    case "ellipse":
                         pxx = { cx: c.options.xPos + _targX, cy: c.options.yPos + _targY };
                        break;
                }
                var dps = _getDepCoords(pxx, c);

                var _refresher = window.setInterval(function() {
                    c.relationships.refresh(true);
                }, 10);
                c.vect.animate(pxx, d, e, function() {
                    window.clearInterval(_refresher);
                });
                c.text.animate({ x: dps.tx, y: dps.ty }, d, e);
                c.link.animate({ x: dps.lx, y: dps.ty }, d, e);

                var bb = a.line.getBBox()
                    , apath = Raphael.transformPath(a.line.attr("path"), "T" + _targX + "," + _targY);

                //console.log("line: ", bb.x, parseInt(bb.x + _targX), a.line.attr("path").toString(), apath.toString());

                a.line.animate({ path: apath }, d, e);
            });

            var onAnimate = function (obj) {
                 _node.relationships.refresh(true);
            };

            var att = {};
            switch (_node.options.vectorPath) {
                case "ellipse":
                    att = { cx: p.x, cy: p.y };
                    break;
                case "rectangle":
                case "roundedrectangle":
                    att = { x: p.x, y: p.y };
                    break;
                default:
                    var _animPath = Raphael.transformPath(_node.options.vectorPath, "T" + p.x + "," + p.y);
                    att = { path: _animPath };
                    break;
            }

            var _complete = function(node) {
                var dx = node.options.vectorPath === "ellipse" ? node.vect.attr("cx") : node.vect.attr("x")
                    , dy = node.options.vectorPath === "ellipse" ? node.vect.attr("cy") : node.vect.attr("y");

                node.options.xPos = dx;
                node.options.yPos = dy;
                node.relationships.refresh();

                var lc = node.linkCoords();
                node.link.transform(["t", lc.x, ",", lc.y, "s", ".8", ",", ".8", "r", "180"].join());
                if (node.options.link && node.options.link.show) node.link.show();
                node.slate.birdseye && node.slate.birdseye.refresh(true);
                
            };

            _node.text.animate({ x: tx, y: ty }, d, e);
            _node.link.animate({ x: lx, y: ty }, d, e);

            eve.on("raphael.anim.frame.*", onAnimate);

            _node.vect.animate(att, d, e, function () {
                
                eve.unbind("raphael.anim.frame.*", onAnimate);

                _complete(_node);

                //set association coords
                _node.relationships.syncAssociations(_node, function(c, a) {
                    _complete(c);
                });

                _node.slate.isCtrl = false;
                _node.slate.isShift = false;

                //cb
                pkg.cb && pkg.cb();
            });
        };

        _node.zoom = function (zoomPercent, duration, cb) {
            /*
            var _startZoom = _node.slate.options.viewPort.zoom.w;
            var _targetZoom = _node.slate.options.viewPort.originalWidth * (100 / parseInt(zoomPercent));
            var _zoomDif = Math.abs(_targetZoom - _startZoom);
            */

            //UNTIL PAN AND ZOOM WORKS CORRECTLY, THIS WILL
            //ALWAYS BE A AIMPLE PROXY TO ZOOMING THE SLATE
            _node.slate.canvas.zoom({
                dur: duration
                , zoomPercent: zoomPercent
                , callbacks: {
                    during: function (percentComplete, easing) {
                        //additional calcs
                    }
                    , after: function (zoomVal) {
                        cb && cb.apply(this, [{ id: _node.options.id, operation: 'zoom', zoomLevel: zoomVal}]);
                    }
                }
            });
        }

        _node.position = function (location, cb, easing, dur) {

            easing = easing || 'easeTo'; //'swingFromTo'
            dur = dur || 500;

            var _vpt = _node.vect.getBBox(), zr = _node.slate.options.viewPort.zoom.r
                , d = $s.getDimensions(_node.slate.options.container)
                , cw = d.width, ch = d.height, nw = _node.options.width * zr, nh = _node.options.height * zr, pad = 10;

            //get upper left coords
            var _x = (_vpt.x * zr)
                , _y = (_vpt.y * zr);

            switch (location) {
                case "lowerright":
                    _x = _x - (cw - nw) - pad;
                    _y = _y - (ch - nh) - pad;
                    break;
                case "lowerleft":
                    _x = _x - pad;
                    _y = _y - (ch - nh) - pad;
                    break;
                case "upperright":
                    _x = _x - (cw - nw) - pad;
                    _y = _y - pad;
                    break;
                case "upperleft":
                    _x = _x - pad;
                    _y = _y - pad;
                    break;
                default: //center
                    _x = _x - (cw / 2 - nw / 2);
                    _y = _y - (ch / 2 - nh / 2);
                    break;
            }

            if (_x === _node.slate.options.viewPort.left && _y === _node.slate.options.viewPort.top) {
                cb.apply();
            } else {
                _node.slate.canvas.move({
                    x: _x
                    , y: _y
                    , dur: dur
                    , callbacks: {
                        after: function () {
                            cb.apply(this, [{ id: _node.options.id, operation: 'position', location: location, easing: easing}]);
                        }
                    }
                    , isAbsolute: true
                    , easing: easing
                });
            }
        };

        _node.mark = function () {

            var _vpt = _node.vect.getBBox()
                , _x = _vpt.x
                , _y = _vpt.y;

            if (!_marker) {
                //if (_node.options.vectorPath === "ellipse") {
                //    _x = _x - (_node.options.width / 2);
                //    _y = _y - (_node.options.height / 2);
                //}
                _marker = _node.slate.paper.rect(_x - 10, _y - 10, _node.options.width + 20, _node.options.height + 20, 10).attr({ "stroke-width": _node.options.borderWidth, "stroke": "red", fill: "#ccc", "fill-opacity": .8 }).toBack();
            }
            else
                _marker.attr({ x: (_x - 10), y: (_y - 10), width: (_node.options.width + 20), height: (_node.options.height + 20) });
        };

        _node.unmark = function () {
            _marker && _marker.remove();
            _marker = null;
        };

        var lm;
        _node.unbutton = function () {
            lm && lm.unbutton();
        };

        _node.button = function (options) {
            lm = _node.slate.paper.set();
            lm.push(_node.vect);
            lm.push(_node.text);
            $s.extend(options, { node: _node });
            lm.button(options);
        };

        //var _prevAllowDrag, _prevAllowMenu;
        _node.disable = function () {
            //_prevAllowDrag = _node.options.allowDrag;
            //_prevAllowMenu = _node.options.allowMenu;
            _node.options.allowMenu = false;
            _node.options.allowDrag = false;
            _node.relationships.unwireHoverEvents();
        };

        _node.enable = function () {
            _node.options.allowMenu = true; // _prevAllowMenu || true;
            _node.options.allowDrag = true; // _prevAllowDrag || true;
            _node.relationships.wireHoverEvents();
        };

        _node.offset = function () {
            var _x = _node.options.xPos - _node.slate.options.viewPort.left;
            var _y = _node.options.yPos - _node.slate.options.viewPort.top;
            if (_node.options.vectorPath === "ellipse") {
                _x = _x - (_node.options.width / 2);
                _y = _y - (_node.options.height / 2);
            }

            //var z = _node.slate.options.viewPort.zoom.r;
            //var _x = ((off.x - d.width) * z) / 2;
            //var _y = ((off.y - d.height) * z) / 2;

            return { x: _x, y: _y };
        };

        _node.textCoords = function () {
            var tx = _node.options.xPos + (_node.options.width / 2);
            var ty = _node.options.yPos + (_node.options.height / 2);

            if (_node.vect.type !== "rect") {
                tx = _node.options.xPos;
                ty = _node.options.yPos;
            }
            return { x: tx, y: ty };
        };

        _node.linkCoords = function () {
            var x = _node.options.xPos - 20;
            var y = _node.options.yPos + (_node.options.height / 2) - 22;

            if (_node.vect.type !== "rect") {
                y = _node.options.yPos - 22;
                x = (_node.options.xPos - _node.options.width / 2) - 20;
            }
            return { x: x, y: y };
        };

        _node.animCoords = function () {
            var att = _self._.options.vectorPath === "ellipse" ? { cx: _self._.vect.ox + dx, cy: _self._.vect.oy + dy} : { x: _self._.vect.ox + dx, y: _self._.vect.oy + dy };

        };

        _node.init = function () {
            if (_node.options.id > -1) {
                $s.ajax(url(_node.options.ajax.nodeCreated)
					, function (respText, resp) {
					    _node.options.holdData = eval('(' + respText + ')');
					    bindSlates(_node.options.holdData);
					}, JSON.stringify(_node.options));
            }
        };

        _node.rotate = function (_opts) {
            var opts = {
                angle: 0
                , cb: null
                , dur: 0
            };
            $s.extend(opts, _opts);
            var ta = ["r", opts.angle].join('');

            if (opts.dur === 0) {
                _node.vect.transform(ta);
                _node.text.transform(ta);
                if (_node.options.link.show) _node.link.transform(ta);
                opts.cb && opts.cb();
            } else {
                var lm = _node.slate.paper.set();
                lm.push(_node.vect);
                lm.push(_node.text);
                if (_node.options.link.show) lm.push(_node.link);
                lm.animate({ transform: ta }, opts.dur, ">", function () {
                    opts.cb && opts.cb();
                });
            }
        };

        $s.each($s.fn.node.fn, function () {
            if (Slatebox.isFunction(this)) {
                if (arguments[0].substring(0, 1) === '_') {
                    var p = arguments[0].replace("_", "");
                    _node[p] = {};
                    _node[p] = this.apply(_node[p]);
                    _node[p]._ = _node;
                    //delete _node["_" + p];
                }
            }
        });
        return _node;
    };
    $s.fn.node.fn = $s.fn.node.prototype = {};
})(Slatebox);