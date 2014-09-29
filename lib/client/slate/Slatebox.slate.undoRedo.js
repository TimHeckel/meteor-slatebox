(function ($s, $slate, $) {
    $slate.fn._undoRedo = function () {
        
        var _self = this, _stateSlate, _actions = [], _actionIndex = -1, toolbar = [];

        function _setVisibility() {

            toolbar[0].data({ disabled: false });
            toolbar[1].data({ disabled: false });

            if (!_actions[_actionIndex - 1]) {
                toolbar[0].attr({ "fill-opacity": "0.3" });
                toolbar[0].data({ disabled: true })
            } else {
                toolbar[0].attr({ "fill-opacity": "1.0" });
            }

            if (!_actions[_actionIndex + 1]) {
                toolbar[1].attr({ "fill-opacity": "0.3" });
                toolbar[1].data({ disabled: true })
            } else {
                toolbar[1].attr({ "fill-opacity": "1.0" });
            }
        };

        function run() {
            var _state = _actions[_actionIndex];
            _self._.loadJSON(_state);
            _self._.birdseye && _self._.birdseye.refresh(true);
            var _pkg = { type: "onSaveRequested" };
            _self._.options.collaboration.onCollaboration && _self._.options.collaboration.onCollaboration({ type: "custom", slate: _self._, pkg: _pkg });
            //var _pkg = { type: "onJSONChanged", data: { json: _state } };
            //_self._.collab && _self._.collab.send(_pkg);
            //_self._.collab.invoke(pkg);
            //console.log("running ", pkg);
            //pkg && _self._.collab && _self._.collab.send(pkg);
        };

        _self.undo = function() {
            if (_actions[_actionIndex - 1]) {
                _actionIndex--;
                _setVisibility();
                run();
                //pkg && _invoker[pkg.type](pkg);
            } else {
                _setVisibility();
            }
        };

        _self.redo = function() {
            if (_actions[_actionIndex + 1]) {
                _actionIndex++;
                _setVisibility();
                run();
                //pkg && _invoker[pkg.type](pkg);
            } else {
                _setVisibility();
                //console.log("cannot redo", _actionIndex, _actions.length, _actions);
            }
        };

        _self.hide = function () {
            if ($s.el("slateUndoRedo") !== null) {
                _self._.options.container.removeChild($s.el("slateUndoRedo"));
            }
        };

        _self.show = function (_options) {

            _self.hide();

            var options = {
                height: 80
                , width: 130
                , offset: { left: 10, top: 8 }
            };

            $s.extend(options, _options);

            var c = _self._.options.container;
            var scx = document.createElement('div');
            scx.setAttribute("id", "slateUndoRedo");
            scx.style.position = "absolute";
            scx.style.height = options.height + "px";
            scx.style.width = options.width + "px";
            scx.style.left = options.offset.left + "px";
            scx.style.top = options.offset.top + "px";
            c.appendChild(scx);

            var x = options.offset.left;
            var y = options.offset.top + 30;

            options.paper = Raphael("slateUndoRedo", options.width, options.height);

            toolbar = [
                options.paper.undo().data({ msg: 'Undo', width: 50, height: 22 }).attr({ fill: "#fff", "cursor": "pointer" }).attr({ "fill": "#333", "stroke": "#fff" }).transform(["t", x, ",", y, "s", "1.5", "1.5"].join())
                , options.paper.redo().data({ msg: 'Redo', width: 50, height: 22 }).attr({ fill: "#fff", "cursor": "pointer" }).attr({ "fill": "#333", "stroke": "#fff" }).transform(["t", x + 50, ",", y, "s", "-1.5", "1.5"].join())
            ];

            $s.each(toolbar, function () {
                this.mouseover(function (e) {
                    $s.stopEvent(e);
                    _self._.multiselection && _self._.multiselection.hide();
                    //$(e.target).style.cursor = "pointer";
                    if (!this.data("disabled")) {
                        _self._.glow(this);
                        var _text = this.data("msg");
                        _self._.addtip(this.tooltip({ type: 'text', msg: _text }, this.data("width"), this.data("height")));
                    }
                });
                this.mouseout(function (e) {
                    $s.stopEvent(e);
                    _self._.multiselection && _self._.multiselection.show();
                    _self._.unglow();
                    this.untooltip();
                });
            });

            toolbar[0].mousedown(function(e) {
                $s.stopEvent(e);
                _self._.unglow();
                if (!this.data("disabled")) {
                    _self.undo();
                }
            });

            toolbar[1].mousedown(function(e) {
                $s.stopEvent(e);
                _self._.unglow();
                if (!this.data("disabled")) {
                    _self.redo();
                }
            });

            // var _state = document.createElement('div');
            // _state.setAttribute("id", "slateState_" + _self._.options.id);
            // _state.style.display = "none";
            // c.appendChild(_state);

            //add stateHolder
            // _stateSlate = $s.instance.slate({
            //     container: $s.el("slateState_" + _self._.options.id)
            //     , viewPort: { allowDrag: false }
            //     , collaboration: { allow: false }
            //     , showZoom: false
            //     , showUndoRedo: false
            //     , showMultiSelect: false
            //     , showBirdsEye: false
            //     , imageFolder: ''
            // }).init();

            //set the buttons both to be disabled
            _setVisibility();

            //register the initial state
            setTimeout(function() {
                _self.snap(true);
            }, 500);
            //_actions.splice(_actionIndex, 0, _self._.exportJSON());
            //_actionIndex++;
        };

        _self.snap = function(init) {

            //load the JSON into the slate
            //_stateSlate.loadJSON(_actions[_actionIndex - 1]);
            //var _export = _self._.exportJSON(); //exportDifference(_stateSlate); //line width override
            _actionIndex++;
            if (_actionIndex !== _actions.length) {
                //work has bene performed, so abandon the forked record
                _actions.splice(_actionIndex);
            }
            _actions.push(_self._.exportJSON());
            //_actions.splice(_actionIndex, 0, _self._.exportJSON());
            !init && _setVisibility();

            //_actions.splice(_actionIndex, 0, pkg);
            //_actionIndex++;

            //var _last = _actions[_actionIndex];
            //var _export = _self._.exportDifference(_last); //line width override
            //_corner.loadJSON(_export, true);

            //console.log("action ", pkg, _actions.length);

            /*

            var _action = { id: $s.guid() }
            switch (pkg.type) {
                case "onZoom":
                    var _pkg = { type: 'onZoom', data: { zoomLevel: _self._.options.viewPort.zoom } };
                    _actions.push(_pkg);
                    break;
                case "onNodePositioned":
                    break;
                case "onNodeLinkRemoved":
                    break;
                case "onNodeLinkAdded":
                    break;
                case "onNodeUnlocked":
                    break;
                case "onNodeLocked":
                    break;
                case "onNodeToBack":
                    break;
                case "onNodeToFront":
                    break;
                case "onNodeShapeChanged":
                    break;
                case "onNodeAdded":
                    break;
                case "onNodeImageChanged":
                    break;
                case "onNodeDeleted":
                    break;
                case "onNodeResized":
                    break;
                case "onNodeColorChanged":
                    break;
                case "onNodeTextChanged":
                    break;
                case "addRelationship":
                    break;
                case "removeRelationship":
                    break;
                case "onNodeMove":
                    break;
                case "changeLineColor":
                    break;
                case "changeLineWidth":
                    break;
                case "toggleParentArrow":
                    break;
                case "toggleChildArrow":
                    break;
                case "onCanvasMove":
                    break;
            }
            */

        }

        return _self;
    }

})(Slatebox, Slatebox.fn.slate);