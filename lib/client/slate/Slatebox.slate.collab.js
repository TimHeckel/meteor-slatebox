(function ($s, $slate, $) {
    $slate.fn._collab = function () {
        var _self = this, options, _invoker, pc;

        _self.init = function () {
            pc = _self._.options.collaboration || {};
            if (!$s.localRecipients) $s.localRecipients = [];
            wire();
        };

        _self.invoke = function (pkg) {
            _invoker[pkg.type](pkg);
        };

        function process(pkg) {
            if ($s.localRecipients.length > 1) {
                var _time = 0;
                for (var s in $s.localRecipients) {
                    _time += 100;
                    (function (rec, t) {
                        setTimeout(function () { rec["_"]["collab"]["invoke"](pkg); }, t);
                    })($s.localRecipients[s], _time);
                }
            } else {
                _invoker[pkg.type](pkg);
            }
        };

        function wire() {            

            _invoker = {

                onZoom: function (pkg) {
                    var zoomPercent = (_self._.options.viewPort.originalWidth / pkg.data.zoomLevel) * 100;
                    _self._.canvas.zoom({
                        dur: pkg.data.duration || 500
                        , zoomPercent: zoomPercent
                        , callbacks: {
                            during: function (percentComplete, easing) {
                                //additional calcs
                            }
                            , after: function (zoomVal) {
                                //additional
                                addMessage(pkg, 'That was me\n zooming the canvas!');
                            }
                        }
                    });
                },

                onNodePositioned: function (pkg) {
                    var cn = _self._.nodes.one(pkg.data.id);
                    cn.position(pkg.data.location, function () { }, pkg.data.easing, pkg.data.duration || 500);
                    addMessage(pkg, 'That was me\n positioning the node!');
                },

                onNodeLinkRemoved: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.links && cn.links.unset();
                    addMessage(pkg, 'That was me\n removing the link!');
                },

                onNodeLinkAdded: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.links && cn.links.set(pkg.data.linkType, pkg.data.linkData);
                    addMessage(pkg, 'That was me\n adding the resource link!');
                },

                onNodeUnlocked: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.options.allowDrag = true;
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n unlocking the node!');
                },

                onNodeLocked: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.options.allowDrag = false;
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n locking the node!');
                },

                onNodeToBack: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.vect.toBack();
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n send to back!');
                },

                onNodeToFront: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.vect.toFront();
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n bringing to front!');
                },

                onNodeShapeChanged: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.shapes.set(pkg.data);
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n changing the shape!');
                },

                onNodeAdded: function (pkg) {
                    var blnPreserve = (pkg.preserve !== undefined) ? pkg.preserve : true;
                    _self._.loadJSON(pkg.data, blnPreserve);
                    _self._.birdseye && _self._.birdseye.refresh();
                    addMessage(pkg, 'That was me\n adding the node!');
                },

                onNodeImageChanged: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.images.set(pkg.data.img, pkg.data.w, pkg.data.w);
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n changing the image!');
                },
                
                onNodeDeleted: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.del()
                    _self._.birdseye && _self._.birdseye.nodeDeleted(pkg);
                    addMessage(pkg, 'That was me\n deleting the node!');
                },

                onNodeResized: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.resize.set(pkg.data.width, pkg.data.height, 500);
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n changing the size!');
                },

                onNodeColorChanged: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.colorpicker.set(pkg.data);
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n changing the color!');
                },

                onNodeTextChanged: function (pkg) {
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.editor.set(pkg.data.text, pkg.data.fontSize, pkg.data.fontColor);
                    _self._.birdseye && _self._.birdseye.nodeChanged(pkg);
                    addMessage(pkg, 'That was me\n changing the text!');
                },

                addRelationship: function (pkg) {
                    _self._.nodes.addRelationship(pkg.data);
                    _self._.birdseye && _self._.birdseye.relationshipsChanged(pkg);
                    addMessage(pkg, 'That was me\n adding the relationship!');
                },

                removeRelationship: function (pkg) {
                    _self._.nodes.removeRelationship(pkg.data);
                    _self._.birdseye && _self._.birdseye.relationshipsChanged(pkg);
                    addMessage(pkg, 'That was me\n removing the relationship!');
                },

                onNodeMove: function (pkg) {
                    console.log("moving node", pkg);
                    cn = _self._.nodes.one(pkg.data.id);
                    cn.move(pkg);
                    addMessage(pkg, 'That was me\n moving the node!');
                },

                onCanvasMove: function (pkg) {
                    var opts = {
                        x: pkg.data.left
                        , y: pkg.data.top
                        , dur: pkg.data.duration || 500
                        , callback: {
                            after: function () {
                                _self._.birdseye && _self._.birdseye.refresh(true);
                            }
                        }
                        , isAbsolute: true
                    };
                    _self._.canvas.move(opts);
                    addMessage(pkg, 'That was me\n moving the canvas!');
                }
            };

            pc.onCollaboration && pc.onCollaboration({type: "init", slate: _self._, cb: function(pkg) { process(pkg); } });
        }

        _self.send = function (pkg) {
            send(pkg);
        };

        function addMessage(pkg, msg) {
            //CollaborationMessages.insert({userId: getUserId(), slateId: _self._._id || _self._.options.id, msg: msg});
        };

        function send(pkg) {
            if (pc.allow) {
                if ($s.isFunction(_self._.options.onSlateChanged)) {
                    _self._.options.onSlateChanged.apply(this, [pkg]);
                }
                pc.onCollaboration && pc.onCollaboration({type: "process", slate: _self._, pkg: pkg, cb: function(pkg) { process(pkg); } });
            }
        };

        return _self;
    }

})(Slatebox, Slatebox.fn.slate);