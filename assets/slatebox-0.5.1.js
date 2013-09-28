(function () {
    var Slatebox = function (_options) {
        var _sb = this;
        var slate = null;

        if (!(_sb instanceof Slatebox))
            return new Slatebox(_options);

        if (_sb.slate === undefined) {
            alert("You have not included a reference to Slatebox.slate.js!");
        }

        _sb.slates = new Array();
        _sb._options = _options;

        window.Slatebox.instance = _sb;
    };

    Slatebox.trim = function (str) {
        var str1 = str.replace(/^\s\s*/, ''),
        ws = /\s/,
        i = str1.length;
        while (ws.test(str1.charAt(-i)));
        return str1.slice(0, i + 1);
    };

    Slatebox.windowSize = function () {
        var w = 0;
        var h = 0;

        //IE
        if (!window.innerWidth) {
            //strict mode
            if (!(document.documentElement.clientWidth == 0)) {
                w = document.documentElement.clientWidth;
                h = document.documentElement.clientHeight;
            }
            //quirks mode
            else {
                w = document.body.clientWidth;
                h = document.body.clientHeight;
            }
        }
        //w3c
        else {
            w = window.innerWidth;
            h = window.innerHeight;
        }
        return { width: w, height: h };
    };

    Slatebox.clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));

        /*
        if (obj == null || typeof (obj) != 'object')
        return obj;

        var temp = obj.constructor(); // changed

        for (var key in obj)
        temp[key] = Slatebox.clone(obj[key]);

        return temp;
        */
    };

    Slatebox.isEqualTo = function (obj1, obj2) {
        for (p in obj2) {
            if (typeof (obj1[p]) == 'undefined') { return false; }
        }
        for (p in obj2) {
            if (obj2[p]) {
                switch (typeof (obj2[p])) {
                    case 'object':
                        if (!obj2[p].equals(obj1[p])) { return false }; break;
                    case 'function':
                        if (typeof (obj1[p]) == 'undefined' || (p != 'equals' && obj2[p].toString() != obj1[p].toString())) { return false; }; break;
                    default:
                        if (obj2[p] != obj1[p]) { return false; }
                }
            } else {
                if (obj1[p]) {
                    return false;
                }
            }
        }
        for (p in obj1) {
            if (typeof (obj2[p]) == 'undefined') { return false; }
        }
        return true;
    }

    // stripped from jQuery, thanks John Resig 
    Slatebox.each = function (obj, fn) {
        if (!obj) { return; }

        var name, i = 0, length = obj.length;

        // object
        if (length === undefined) {
            for (name in obj) {
                if (fn.call(obj[name], name, obj[name]) === false) { break; }
            }

            // array
        } else {
            for (var value = obj[0];
			    i < length && fn.call(value, i, value) !== false; value = obj[++i]) {
            }
        }

        return obj;
    };

    Slatebox.isElement = function (o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    };

    Slatebox.isFunction = function (x) {
        return Object.prototype.toString.call(x) === "[object Function]";
    };

    Slatebox.isArray = function (o) {
        return Object.prototype.toString.call(o) === "[object Array]";
    };

    // convenience
    Slatebox.el = function (id) {
        return document.getElementById(id);
    };

    // used extensively. a very simple implementation. 
    Slatebox.extend = function (to, from, skipFuncs) {
        if (typeof from != 'object') { return to; }

        if (to && from) {
            Slatebox.each(from, function (name, value) {
                if (!skipFuncs || typeof value != 'function') {
                    to[name] = value;
                }
            });
        }

        return to;
    };

    // var arr = select("elem.className"); 
    Slatebox.select = function (query) {
        var index = query.indexOf(".");
        if (index != -1) {
            var tag = query.slice(0, index) || "*";
            var klass = query.slice(index + 1, query.length);
            var els = [];
            Slatebox.each(document.getElementsByTagName(tag), function () {
                if (this.className && this.className.indexOf(klass) != -1) {
                    els.push(this);
                }
            });
            return els;
        }
    };

    Slatebox.getKey = function (e) {
        var keyCode = 0;
        try { keyCode = e.keyCode; } catch (Err) { keyCode = e.which; }
        return keyCode;
    };

    // fix event inconsistencies across browsers
    Slatebox.stopEvent = function (e) {
        e = e || window.event;

        if (e.preventDefault) {
            e.stopPropagation();
            e.preventDefault();

        } else {
            e.returnValue = false;
            e.cancelBubble = true;
        }
        return false;
    };

    Slatebox.toShortDateString = function (jsonDate) {
        var _date = jsonDate;
        try {
            var d = new Date(parseInt(jsonDate.substr(6)));
            _date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        } catch (Err) { }

        return _date;
    };

    Slatebox.addEvent = function (obj, type, fn) {
        if (obj.attachEvent) {
            obj['e' + type + fn] = fn;
            obj[type + fn] = function () { obj['e' + type + fn](window.event); }
            obj.attachEvent('on' + type, obj[type + fn]);
        } else
            obj.addEventListener(type, fn, false);
    }
    Slatebox.removeEvent = function (obj, type, fn) {
        if (obj.detachEvent) {
            obj.detachEvent('on' + type, obj[type + fn]);
            obj[type + fn] = null;
        } else
            obj.removeEventListener(type, fn, false);
    }

    // push an event listener into existing array of listeners
    Slatebox.bind = function (to, evt, fn) {
        to[evt] = to[evt] || [];
        to[evt].push(fn);
    };

    Slatebox.imageExists = function (u, cb, id) {
        var _id = "temp_" + Slatebox.guid();
        var _img = document.body.appendChild(document.createElement("img"));
        _img.style.position = "absolute";
        _img.style.top = "-10000px";
        _img.style.left = "-10000px";
        _img.setAttribute("src", u);
        _img.setAttribute("id", _id);

        Slatebox.addEvent(_img, "load", function (e) {
            var d = Slatebox.getDimensions(_img);
            document.body.removeChild(_img);
            cb.apply(this, [true, d.width, d.height, id]);
        });

        Slatebox.addEvent(_img, "error", function (e) {
            document.body.removeChild(_img);
            cb.apply(this, [false, 0, 0, id]);
        });
    };

    Slatebox.urlExists = function (url) {
        var http = new XMLHttpRequest();
        http.open('GET', url, false);
        http.send();
        return http.status == 200;
    };

    Slatebox.ajax = function (u, f, d, v, x, h) {
        x = this.ActiveXObject;
        //the guid is essential to break the cache because ie8< seems to want to cache this. argh.
        u = [u, u.indexOf("?") === -1 ? "?" : "&", "guid=" + Slatebox.guid()].join("");
        x = new (x ? x : XMLHttpRequest)('Microsoft.XMLHTTP');
        var vx = d ? (v ? v : 'POST') : (v ? v : 'GET');
        x.open(vx, u, 1);
        x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        if (h) Slatebox.each(h, function () { x.setRequestHeader(this.n, this.v); });
        x.onreadystatechange = function () {
            x.readyState > 3 && f ? f(x.responseText, x) : 0
        };
        x.send(d);
    };

    var S4 = function () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }
    Slatebox.guid = function () { return (S4() + S4() + S4()); }
    Slatebox.number = function () { return Math.floor(Math.random() * 9999) + 999; }

    var head = document.getElementsByTagName('head')[0], global = this;
    Slatebox.getJSON = function (url, callback) {
        id = S4() + S4();
        var script = document.createElement('script'), token = '__jsonp' + id;

        // callback should be a global function
        global[token] = callback;

        // url should have "?" parameter which is to be replaced with a global callback name
        script.src = url.replace(/\?(&|$)/, '__jsonp' + id + '$1');

        // clean up on load: remove script tag, null script variable and delete global callback function
        script.onload = function () {
            delete script;
            script = null;
            delete global[token];
        };
        head.appendChild(script);
    };

    Slatebox.positionedOffset = function (obj) {
        var curleft = 0;
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return { left: curleft, top: curtop };
    };

    Slatebox.getDimensions = function (ele) {
        var width = 0, height = 0;
        if (typeof ele.clip !== "undefined") {
            width = ele.clip.width;
            height = ele.clip.height;
        } else {
            if (ele.style.pixelWidth) {
                width = ele.style.pixelWidth;
                height = ele.style.pixelHeight;
            } else {
                width = ele.offsetWidth;
                height = ele.offsetHeight;
            }
        }
        return { width: width, height: height };
    };

    Slatebox.isNumeric = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    Slatebox.isIE = function () {
        var version = 999; // we assume a sane browser
        if (navigator.appVersion.indexOf("MSIE") !== -1 && navigator.appVersion.indexOf("chromeframe") === -1)
            version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        return version;
    };

    Slatebox.isIpad = function () {
        return navigator.userAgent.match(/iPad/i) !== null;
    };

    Slatebox.mousePos = function (e) {
        if (document.all) {
            mouseX = window.event.clientX; //document.body.scrollLeft; //(e.clientX || 0) +
            mouseY = window.event.clientY; //document.body.scrollTop;
        } else if (e.targetTouches) {
            if (e.targetTouches.length) {
                var t = e.targetTouches[0]; // touches.item(0);
                mouseX = t.clientX;
                mouseY = t.clientY;
                var _allTouches = [];
                for (var tx in e.targetTouches) {
                    _allTouches.push({ x: e.targetTouches[tx].clientX, y: e.targetTouches[tx].clientY });
                }
            }
            //}
        } else {
            mouseX = e.pageX;
            mouseY = e.pageY;
        }
        return { x: mouseX, y: mouseY, allTouches: _allTouches };
    };

    //    Slatebox.toJSON = function (obj) {
    //        var tmp = this.split("");
    //        for (var i = 0; i < tmp.length; i++) {
    //            var c = tmp[i];
    //            (c >= ' ') ?
    //			            (c == '\\') ? (tmp[i] = '\\\\') :
    //			            (c == '"') ? (tmp[i] = '\\"') : 0 :
    //		            (tmp[i] =
    //			            (c == '\n') ? '\\n' :
    //			            (c == '\r') ? '\\r' :
    //			            (c == '\t') ? '\\t' :
    //			            (c == '\b') ? '\\b' :
    //			            (c == '\f') ? '\\f' :
    //			            (c = c.charCodeAt(), ('\\u00' + ((c > 15) ? 1 : 0) + (c % 16)))
    //		            )
    //        }
    //        return '"' + tmp.join("") + '"';
    //    };

    Slatebox.ensureEle = function (el) {
        return (typeof el === 'string' ? document.getElementById(el) : el);
    };

    Slatebox.onOff = function (baseUrl, ele, callback) {
        var imgID = Slatebox.guid().replace('-', '').substring(0, 8);
        var _element = Slatebox.ensureEle(ele);
        _element.innerHTML = "<div style='cursor:pointer;overflow:hidden;width:53px;height:20px;'><img id='" + imgID + "' style='margin-top:0px;' src='" + baseUrl + "/public/images/checkbox-switch-stateful.png' alt='toggle'/>";
        Slatebox.el(imgID).onclick = function (e) {
            callback.apply(this, [imgID]);
        };
        return imgID;
    };

    Slatebox.isOn = function (ele) {
        var _ele = Slatebox.ensureEle(ele);
        if (_ele.style.marginTop === "0px") return false;
        return true;
    };

    Slatebox.toggleOnOff = function (ele) {
        var _ele = Slatebox.ensureEle(ele);
        if (_ele.style.marginTop === "0px") _ele.style.marginTop = "-22px";
        else _ele.style.marginTop = "0px";
    };

    Slatebox.div = function (p, x, y, w, h) {
        var _id = "temp_" + Slatebox.guid();
        var _div = p.appendChild(document.createElement("div"));
        _div.style.position = 'absolute';
        _div.style.top = y + "px";
        _div.style.left = x + "px";
        _div.style.width = w + "px";
        _div.style.height = h + "px";
        _div.style.border = "1px solid red";
        _div.style.backgroundColor = "#f8f8f8";
        _div.setAttribute("id", _id);
        return _id;
    };


    Slatebox.fn = Slatebox.prototype = {
        initNode: function () {
            var _node = this;
            $s.each($s.fn.node.fn, function () {
                if (Slatebox.isFunction(this)) {
                    if (arguments[0].substring(0, 1) === '_') {
                        this.apply(_node);
                        //delete Slatebox.fn.node.fn[arguments[0]];
                    }
                }
            });
        }
    };

    //helper methods
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun /*, thisp */) {
            "use strict";

            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function")
                throw new TypeError();

            var res = [];
            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, t))
                        res.push(val);
                }
            }

            return res;
        };
    }

    window.Slatebox = Slatebox;
})();
(function ($s) {
    $s.fn.slate = function (_options) {
        if (!(this instanceof $s.fn.slate))
            return new $s.fn.slate(_options);

        var _slate = this;
        _slate.options = {
            id: $s.guid()
            , container: ''
            , instance: ''
            , name: ''
            , description: ''
            , containerStyle: {
                width: "auto"
                , height: "auto"
            }
            , viewPort: {
                allowDrag: true
                , originalWidth: 50000
                , width: 50000
                , height: 50000
                , left: 5000
                , top: 5000
                , zoom: { w: 50000, h: 50000, r: 1 }
            }
            , events: {
                onNodeDragged: null
                , onCanvasClicked: null
            }
            , enabled: true
            , showBirdsEye: true
            , sizeOfBirdsEye: 200
            , showMultiSelect: true
            , showZoom: true
            , showStatus: true
            , collaboration: {
                allow: true
                , localizedOnly: false
                , userIdOverride: null
                , onCollaboration: null
            }
            , isPublic: false
        };

        //ensure indiv sections aren't wiped out by custom additions/changes
        var _iv = _slate.options.viewPort;
        var _cs = _slate.options.containerStyle;
        var _ie = _slate.options.events;
        var _c = _slate.options.collaboration;
        //var _cc = _slate.options.collaboration.callbacks;

        $s.extend(_slate.options, _options);
        $s.extend(_slate.options.collaboration, $s.extend(_c, _options.collaboration || {}));
        //$s.extend(_slate.options.collaboration.callbacks, $s.extend(_cc, _options.collaboration.callbacks || {}));
        $s.extend(_slate.options.viewPort, $s.extend(_iv, _options.viewPort || {}));
        $s.extend(_slate.options.events, $s.extend(_ie, _options.events || {}));
        $s.extend(_slate.options.containerStyle, $s.extend(_cs, _options.containerStyle || {}));

        //ensure container is always an object
        if (!$s.isElement(_slate.options.container)) {
            _slate.options.container = $s.el(_slate.options.container);
        }

        var constants = {
            statusPanelAtRest: 33
            , statusPanelExpanded: 200
        };

        function url(opt) {
            return options.ajax.rootUrl + options.ajax.urlFlavor + opt
        };

        var glows = [];
        _slate.glow = function (obj) {
            glows.push(obj.glow());
            //setTimeout(function () { glows.length > 0 && _slate.unglow() }, 1000);
        };

        _slate.unglow = function () {
            $s.each(glows, function () {
                this.remove();
            });
            glows = [];
        };

        var tips = [];
        _slate.addtip = function (tip) {
            if (tip) tips.push(tip);
        };

        _slate.untooltip = function () {
            $s.each(tips, function () {
                this && this.remove();
            });
        };

        // _slate.reset = function () {
        //     var _v = 50000;
        //     _slate.options.viewPort = {
        //         allowDrag: true
        //         , originalWidth: _v
        //         , width: _v
        //         , height: _v
        //         , left: 5000
        //         , top: 5000
        //         , zoom: { w: _v, h: _v, r: 1 }
        //     };
        //     _slate.zoom(0, 0, _v, _v, false);
        //     _slate.canvas.resize(_v);
        //     //_slate.canvas.move({ x: 5000, y: 5000, dur: 0, isAbsolute: true });
        // };

        _slate.zoom = function (x, y, w, h, fit) {
            this.paper.setViewBox(x, y, w, h, fit);
        };

        _slate.present = function (pkg) {
            var _currentOperations = [], n = null;
            var next = function () {
                if (_currentOperations.length === 0) {
                    if (pkg.nodes.length > 0) {
                        var node = pkg.nodes.shift();
                        n = _.detect(_slate.nodes.allNodes, function (n) { return n.options.name == node.name; });
                        _currentOperations = node.operations;
                        pkg.nodeChanged && pkg.nodeChanged(node);
                    }
                }

                if (_currentOperations.length > 0) {
                    var op = _currentOperations.shift();
                    pkg.opChanged && pkg.opChanged(op);

                    perform(pkg, n, op, function (p) {
                        var _sync = pkg.sync !== undefined ? pkg.sync[p.operation] : false;
                        switch (p.operation) {
                            case "zoom":
                                _sync && _slate.collab && _slate.collab.send({ type: 'onZoom', data: { id: p.id, zoomLevel: p.zoomLevel} });
                                break;
                            case "position":
                                _sync && _slate.collab && _slate.collab.send({ type: "onNodePositioned", data: { id: p.id, location: p.location, easing: p.easing} });
                                break;
                        }
                        next();
                    });
                } else {
                    pkg.complete && pkg.complete();
                }
            };
            next();
        };

        function perform(pkg, node, op, cb) {
            var _det = op.split('@'), _param = _det[1];
            //console.log(_det[0]);
            switch (_det[0]) {
                case 'zoom':
                    var _dur = _det.length > 2 ? parseFloat(_det[2]) : pkg.defaultDuration;
                    node.zoom(_param, _dur, cb);
                    break;
                case 'position':
                    var _ease = _det.length > 2 ? _det[2] : pkg.defaultEasing, _dur = _det.length > 3 ? parseFloat(_det[3]) : pkg.defaultDuration;
                    node.position(_param, cb, _ease, _dur);
                    break;
            }
        };

        // _slate.setSize = function (w, h) {
        //     this.paper.setSize(w, h);
        // };

        _slate.loadJSON = function (_jsonSlate, blnPreserve) {
            var _enabled = this.options.enabled;
            if (blnPreserve === undefined) {
                this.paper.clear();
                _slate.nodes.allNodes = [];
            }

            var _loadedSlate = JSON.parse(_jsonSlate);
            var _collab = this.options.collaboration;
            $s.extend(this.options, _loadedSlate.options);
            //this.id = _loadedSlate.id;
            this.options.collaboration = _collab;
            
            var _deferredRelationships = [];
            $s.each(_loadedSlate.nodes, function () {
                var _boundTo = $s.instance.node(this.options);
                _slate.nodes.add(_boundTo);
                _deferredRelationships.push({ bt: _boundTo, json: this });
            });

            $s.each(_deferredRelationships, function () {
                var _bounded = this;
                _bounded.bt.addRelationships(_bounded.json, function (lines) {
                    _.invoke(lines, 'toFront');
                    _bounded.bt.vect.toFront();
                    _bounded.bt.text.toFront();
                    _bounded.bt.link.toFront();
                });
            });

            //zoom
            var _v = Math.max(this.options.viewPort.zoom.w, this.options.viewPort.zoom.h);
            this.zoom(0, 0, _v, _v, false);
            this.canvas.resize(_v);

            //reset disable if previously was disabled
            if (!_enabled) {
                _slate.disable();
            }

            //refresh birdseye
            _slate.options.showBirdsEye && _slate.birdseye.refresh();

        };

        //the granularity is at the level of the node...
        _slate.exportDifference = function (compare, lineWidthOverride) {
            var _difOpts = $s.extend({}, _slate.options);
            var _pc = _difOpts.collaboration.panelContainer;
            var _cc = _difOpts.collaboration.callbacks;
            delete _difOpts.collaboration.panelContainer;
            delete _difOpts.collaboration.callbacks;
            delete _difOpts.container;
            delete _difOpts.events;
            var jsonSlate = { options: $s.clone(_difOpts), nodes: [] };

            $s.each(_slate.nodes.allNodes, function () {
                var _exists = false;
                var pn = this;
                $s.each(compare.nodes.allNodes, function () {
                    if (this.options.id === pn.options.id) {
                        _exists = true;
                        return;
                    }
                });
                if (!_exists) jsonSlate.nodes.push(pn.serialize(lineWidthOverride));
            });

            _difOpts.collaboration.panelContainer = _pc;
            _difOpts.collaboration.callbacks = _cc;

            return JSON.stringify(jsonSlate);
        };

        _slate.exportJSON = function () {
            var _cont = _slate.options.container;
            var _pcont = _slate.options.collaboration.panelContainer || null;
            var _callbacks = _slate.options.collaboration.callbacks || null;
            var _opts = _slate.options;
            delete _opts.container;
            delete _opts.collaboration.panelContainer;

            var jsonSlate = { options: $s.clone(_opts), nodes: [] };
            _slate.options.container = _cont;
            _slate.options.collaboration.panelContainer = _pcont;
            _slate.options.collaboration.callbacks = _callbacks;

            delete jsonSlate.options.events;
            delete jsonSlate.options.ajax;
            delete jsonSlate.options.container;

            var ma = [];
            $s.each(_slate.nodes.allNodes, function () {
                jsonSlate.nodes.push(this.serialize());
            });

            return JSON.stringify(jsonSlate);
        };

        _slate.snapshot = function () {
            var _snap = JSON.parse(_slate.exportJSON());
            _snap.nodes.allNodes = _snap.nodes;
            return _snap;
        };

        _slate.getOrientation = function (_nodesToOrient) {
            var orient = 'landscape', sWidth = _slate.options.viewPort.width, sHeight = _slate.options.viewPort.height, vpLeft = 0, vpTop = 0;

            var bb = new Array();
            bb['left'] = 99999; bb['right'] = 0; bb['top'] = 99999; bb['bottom'] = 0;

            var an = _nodesToOrient || _slate.nodes.allNodes;
            if (an.length > 0) {
                for (_px = 0; _px < an.length; _px++) {
                    //var sb = allNodes[_px].b.split(' ');
                    var sbw = 10;
                    //if (!isNaN(sb[0].replace('px', ''))) sbw = parseInt(sb[0].replace('px', ''));
                    var _bb = an[_px].vect.getBBox();

                    //var x = _bb.x + ((_bb.x / _slate.options.viewPort.zoom.r) - _bb.x);
                    var _r = _slate.options.viewPort.zoom.r || 1;
                    var x = _bb.x * _r;
                    var y = _bb.y * _r;
                    var w = _bb.width * _r;
                    var h = _bb.height * _r;

                    /*
                    var x = _bb.x;
                    var y = _bb.y;
                    var w = _bb.width;
                    var h = _bb.height;
                    */

                    bb['left'] = Math.abs(Math.min(bb['left'], x - sbw));
                    bb['right'] = Math.abs(Math.max(bb['right'], x + w + sbw));
                    bb['top'] = Math.abs(Math.min(bb['top'], y - sbw));
                    bb['bottom'] = Math.abs(Math.max(bb['bottom'], y + h + sbw));
                }

                var sWidth = bb['right'] - bb['left'];
                var sHeight = bb['bottom'] - bb['top'];

                if (sHeight > sWidth) {
                    orient = 'portrait';
                }
            }
            return { orientation: orient, height: sHeight, width: sWidth, left: bb['left'], top: bb['top'] };
        };

        _slate.resize = function (_size, dur, pad) {
            var _p = (pad || 0);
            if (_p < 6) _p = 6;
            _size = _size - ((_p * 2) || 0);
            var orx = _slate.getOrientation();
            var wp = (orx.width / _size) * _slate.options.viewPort.width;
            var hp = (orx.height / _size) * _slate.options.viewPort.height;
            var sp = Math.max(wp, hp);

            var _r = Math.max(_slate.options.viewPort.width, _slate.options.viewPort.height) / sp;
            var l = orx.left * _r - _p;
            var t = orx.top * _r - _p;

            _slate.zoom(0, 0, sp, sp, true);
            _slate.options.viewPort.zoom = { w: sp, h: sp, l: parseInt(l * -1), t: parseInt(t * -1), r: _slate.options.viewPort.originalWidth / sp };
            _slate.canvas.move({ x: l, y: t, dur: dur, isAbsolute: true });
        };

        _slate.stopEditing = function () {
            $s.each(_slate.nodes.allNodes, function () {
                this.editor && this.editor.end();
                this.images && this.images.end();
                this.links && this.links.end();
            });
        };

        var _prevEnabled;
        _slate.disable = function (exemptSlate) {
            $s.each(_slate.nodes.allNodes, function () {
                this.disable();
            });
            _prevEnabled = _slate.options.enabled;
            if (exemptSlate === undefined) {
                _slate.options.enabled = false;
                _slate.options.viewPort.allowDrag = false;
            }
        };

        _slate.enable = function () {
            $s.each(_slate.nodes.allNodes, function () {
                this.enable();
            });
            _slate.options.enabled = _prevEnabled;
            _slate.options.viewPort.allowDrag = true;
        };

        _slate.unMarkAll = function () {
            $s.each(_slate.nodes.allNodes, function () {
                this.unmark();
            });
        };

        _slate.init = function () {

            //init collaboration
            if (_slate.options.collaboration && _slate.options.collaboration.allow) {
                //init collaboration
                _slate.collab.init();
            }

            var _init = _slate.canvas.init();

             //init multi selection mode 
            if (_slate.options.showMultiSelect) {
                _slate.multiselection && _slate.multiselection.init();
            }

            return _init;

            //window.onerror = function (e) {
            //TODO: add error handling
            //};
        };

        //loads plugins
        $s.each($s.fn.slate.fn, function () {
            if ($s.isFunction(this)) {
                if (arguments[0].substring(0, 1) === '_') {
                    var p = arguments[0].replace("_", "");
                    _slate[p] = {};
                    _slate[p] = this.apply(_slate[p]);
                    _slate[p]._ = _slate; //_slate[p].parent = 
                    //delete _node["_" + p];
                }
            }
        });

        _slate.tempNodeId = $s.guid();

        if ($s.isFunction(_slate.options.onInitCompleted)) {
            _slate.options.onInitCompleted.apply(this);
        }

        return _slate;
    };
    $s.fn.slate.fn = $s.fn.slate.prototype = {};
})(Slatebox);
(function ($s) {
    $s.fn.node = function (_options) {
        if (!(this instanceof $s.fn.node))
            return new $s.fn.node(_options);

        var _node = this, _marker;
        _node.options = {
            id: $s.guid()
            , name: ''
			, text: '' //text in the node
            , isPinned: false
            , isPinnedExact: false
            , pinnedRowCount: 5
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
            var _reposParents = [], _unlinkId = _node.options.id;
            if (_node.options.isPinnedExact) {
                _reposParents = _node.relationships.parents;
            }

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
            _node.context && _node.context.hide();
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
                if (this.child.options.isPinnedExact) {
                    this.child.vect.toFront();
                    this.child.text.toFront();
                    this.child.link.toFront();
                }
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
                if (this.child.options.isPinnedExact) {
                    this.child.link.toBack();
                    this.child.text.toBack();
                    this.child.vect.toBack();
                }
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

            if (_node.vect.type !== "rect") {
                tx = p.x;
                ty = p.y;
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
                var pxx = { x: c.options.xPos + _targX, y: c.options.yPos + _targY }
                    , dps = _getDepCoords(pxx, c);

                c.vect.animate(pxx, d, e);
                c.text.animate({ x: dps.tx, y: dps.ty }, d, e);
                c.link.animate({ x: dps.lx, y: dps.ty }, d, e);

                var bb = a.line.getBBox()
                    , apath = Raphael.transformPath(a.line.attr("path"), "T" + _targX + "," + _targY);

                //console.log("line: ", bb.x, parseInt(bb.x + _targX), a.line.attr("path").toString(), apath.toString());

                a.line.animate({ path: apath }, d, e);
            });

            var _assocs = _node.relationships.associations
                , ppr = _node.slate.paper

            var onAnimate = function () {
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
(function ($s, $slate) {
    $slate.fn._birdseye = function () {
        if (Raphael === undefined) {
            alert("You must load Raphael in order to use the Slatebox.slate.birdseye.js plugin!");
        }

        var _self = this, _be, _corner, _handle, orx, sp, options, _parentDimen, _parentOffset, _lastX, _lastY, _wpadding, _hpadding;

        _self.show = function (_options) {

            options = {
                size: 200
                , onHandleMove: null
            };

            $s.extend(options, _options);

            var c = _self._.options.container;
            _parentDimen = $s.getDimensions(c);
            _parentOffset = $s.positionedOffset(c);

            _be = document.createElement('div');
            _be.setAttribute("id", "slateBirdsEye_" + _self._.options.id);
            _be.style.position = "absolute";
            _be.style.height = options.size + "px";
            _be.style.width = options.size + "px";
            _be.style.border = "2px inset #333";
            _be.style.backgroundColor = "#fff";

            c.appendChild(_be);
            setBe();

            _corner = $s.instance.slate({
                container: $s.el("slateBirdsEye_" + _self._.options.id)
                , viewPort: { allowDrag: false }
                , collaboration: { allow: false }
                , showZoom: false
                , showMultiSelect: false
                , showBirdsEye: false
                , imageFolder: ''
                , events: {
                    onNodeDragged: function () {
                        _self._.nodes.copyNodePositions(_corner.nodes.allNodes);
                    }
                }
            }).init();

            _self.refresh();

            $s.addEvent(window, "resize", function () {
                var c = _self._.options.container;
                _parentDimen = $s.getDimensions(c);
                _parentOffset = $s.positionedOffset(c);
                setBe();
            });

            if (!_self._.options.showBirdsEye) _self.disable();
        };

        _self.enabled = function () { return _corner !== undefined; };

        _self.enable = function () {
            if (!_corner) _self.show();
            $s.el("slateBirdsEye_" + _self._.options.id).style.display = "block";
        };

        _self.disable = function () {
            $s.el("slateBirdsEye_" + _self._.options.id).style.display = "none";
        };

        function setBe() {
            _be.style.left = (_parentDimen.width - options.size) + "px";
            _be.style.top = "-2px";
        };

        _self.relationshipsChanged = function (pkg) {
            if (_corner) {
                switch (pkg.type) {
                    case "removeRelationship":
                        _corner.nodes.removeRelationship(pkg.data);
                        //{ parent: c.parent.options.id, child: c.child.options.id };
                        break;
                    case "addRelationship":
                        var __pkg = JSON.parse(JSON.stringify(pkg));
                        _.extend(__pkg.data, { options: { lineWidth: 1 }});
                        //data: { id: _self._.options.id, relationships: rels} };
                        _corner.nodes.addRelationship(__pkg.data);
                        break;
                }
            }
        };

        _self.nodeChanged = function (pkg) {
            if (_corner) {
                var _node;
                switch (pkg.type) {
                    case 'onNodeShapeChanged':
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.shapes.set(pkg.data);
                        break;
                    case "onNodeTextChanged":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.editor.set(pkg.data.text, pkg.data.fontSize, pkg.data.fontColor);
                        break;
                    case "onNodeColorChanged":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.colorpicker.set(pkg.data);
                        break;
                    case "onNodeImageChanged":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.images.set(pkg.data.img, pkg.data.w, pkg.data.h);
                        break;
                    case "onNodeResized":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.resize.set(pkg.data.width, pkg.data.height);
                        break;
                    case "onNodeToFront":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.vect.toFront();
                        break;
                    case "onNodeToBack":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.vect.toBack();
                        break;
                    case "onNodeLocked":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.options.allowDrag = false;
                    case "onNodeUnlocked":
                        _node = _corner.nodes.one(pkg.data.id);
                        _node.options.allowDrag = true;
                        break;
                }
            }
        };

        _self.nodeDeleted = function (pkg) {
            if (_corner) {
                var _node = _corner.nodes.one(pkg.data.id);
                _node.del();
            }
        };

        _self.nodeDetatched = function (pkg) {
            if (_corner) {
                var _node = _corner.nodes.one(pkg.data.id);
                _node.relationships.detatch();
            }
        };

        _self.reload = function (json) {
            if (_handle) _handle.remove();
            _corner.loadJSON(json);
            _self.refresh(true);
        };

        _self.refresh = function (blnNoAdditions) {
            if (_corner) {
                if (_handle) _handle.remove();

                if (blnNoAdditions === true) {
                    console.log("no additions");
                    _corner.canvas.move({ x: _self._.options.viewPort.left, y: _self._.options.viewPort.top, dur: 0, isAbsolute: true });
                    _corner.nodes.copyNodePositions(_self._.nodes.allNodes); //repositionNodes();
                } else {
                    console.log("exporting dif");
                    var _export = _self._.exportDifference(_corner, 1); //line width override
                    _corner.loadJSON(_export, true);
                }

                orx = _self._.getOrientation();

                if (_self._.options.viewPort.left < orx.left)
                    _wpadding = ((_self._.options.viewPort.left) - (orx.left));
                else
                    _wpadding = (_self._.options.viewPort.left - orx.left) + (_parentDimen.width - orx.width); // (_self._.options.viewPort.left + _parentDimen.width) - (orx.left + orx.width);

                _hpadding = ((_self._.options.viewPort.top) - (orx.top));

                var _pw = Math.max(Math.abs(_wpadding), (orx.width < _parentDimen.width ? (_parentDimen.width - orx.width) : 0));
                var _ph = Math.max(Math.abs(_hpadding), (orx.height < _parentDimen.height ? (_parentDimen.height - orx.height) : 0));

                var wp = ((orx.width + _pw) / options.size) * _self._.options.viewPort.width;
                var hp = ((orx.height + _ph) / options.size) * _self._.options.viewPort.height;

                sp = Math.max(wp, hp);

                var _r = Math.max(_self._.options.viewPort.width, _self._.options.viewPort.height) / sp;
                var l = (orx.left + (_wpadding < 0 ? _wpadding : 0)) * _r - 5;
                var t = (orx.top + (_hpadding < 0 ? _hpadding : 0)) * _r - 5;

                _corner.zoom(0, 0, sp, sp, true);
                _corner.options.viewPort.zoom.r = _corner.options.viewPort.originalWidth / sp;
                _corner.canvas.move({ x: l, y: t, dur: 0, isAbsolute: true });
                _corner.disable();

                var _ix = _self._.options.viewPort.left / _self._.options.viewPort.zoom.r; // +_wpadding; // orx.left; // -(orx.left - _self._.options.viewPort.left); //+_self._.options.viewPort.left; // orx.left + orx.width / 2;
                var _iy = _self._.options.viewPort.top / _self._.options.viewPort.zoom.r; // +_hpadding; // orx.top; // -(orx.top - _self._.options.viewPort.top); //+_self._.options.viewPort.top; // orx.top + orx.height / 2;

                var _w = _parentDimen.width / _self._.options.viewPort.zoom.r, _h = _parentDimen.height / _self._.options.viewPort.zoom.r;
                _handle = _corner.paper.rect(_ix, _iy, _w, _h).attr({ stroke: 'red', "stroke-width": 1, fill: "#f8f8f8", "fill-opacity": ".6" });
                wireHandle();
            }
        };

        var init = function () {
            _handle.ox = this.attr("x");
            _handle.oy = this.attr("y");
        };

        var move = function (x, y) {

            var _zr = _corner.options.viewPort.originalWidth / sp;
            x = x + ((x / _zr) - x);
            y = y + ((y / _zr) - y);

            var _mx = _handle.ox + x;
            var _my = _handle.oy + y;

            _handle.attr({ x: _mx, y: _my });

            var bb = _handle.getBBox();
            var _cx = bb.x * _self._.options.viewPort.zoom.r; // -_parentDimen.width / 2;
            var _cy = bb.y * _self._.options.viewPort.zoom.r; // -_parentDimen.height / 2;

            if ($s.isFunction(options.onHandleMove)) {
                options.onHandleMove.apply(this, [_cx, _cy]);
            };

            _self._.canvas.move({ x: _cx, y: _cy, dur: 0, isAbsolute: true });

            _lastX = bb.x;
            _lastY = bb.y;
            _lastOrx = orx;

            //_handle.transform(["t", x, y].join());
        };

        var up = function (e) {
            _self.refresh();
            _self._.canvas.broadcast();
        };

        function wireHandle() {
            _handle.drag(move, init, up);
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.slate);
(function ($s, $slate) {
    $slate.fn._canvas = function () {
        if (Raphael === undefined) {
            alert("You must load Raphael in order to use the Slatebox.slate.canvas.js plugin!");
        }

        var _self = this, _paper, _internal, _status, imageFolder, _dken = null;

        var cp = function (e) {
            var m = $s.mousePos(e);

            difX = Canvas.objInitPos.left + (m.x - Canvas.objInitialMousePos.x);
            difY = Canvas.objInitPos.top + (m.y - Canvas.objInitialMousePos.y);

            _width = _self._.options.containerStyle.width;
            _height = _self._.options.containerStyle.height;
            _vpWidth = _self._.options.viewPort.width;
            _vpHeight = _self._.options.viewPort.height;

            if (difX > 0) difX = 0; else if (Math.abs(difX) + _width > _vpWidth) difX = _width - vpWidth;
            if (difY > 0) difY = 0; else if (Math.abs(difY) + _height > _vpHeight) difY = _height - _vpHeight;

            return { x: difX, y: difY };
        };

        var Canvas = {
            objInitPos: {},
            objInitialMousePos: { x: 0, y: 0 },
            kinetic: null,
            isDragging: false,
            initDrag: function (e) {

                _self._.options.events && _self._.options.events.onCanvasClicked && _self._.options.events.onCanvasClicked();

                if (_self._.options.viewPort.allowDrag) {
                    _self._.multiselection && _self._.multiselection.end();
                    this.isDragging = true;
                    var m = $s.mousePos(e);
                    Canvas.objInitPos = $s.positionedOffset(_internal);
                    var offsets = $s.positionedOffset(_self._.options.container);
                    Canvas.objInitialMousePos = { x: m.x + offsets.left, y: m.y + offsets.top };

                    var xy = cp(e);

                    _status.innerHTML = Math.abs(xy.x) + ', ' + Math.abs(xy.y);

                    if (_self._.options.showStatus) {
                        _status.style.display = 'block';
                        _self._.multiselection && _self._.multiselection.hide();
                    }

                    _internal.style.cursor = 'url(' + imageFolder + 'closedhand.cur), default';

                    if (m.allTouches) {
                        _self._.options.lastTouches = m.allTouches;
                    }

                    if ($s.isFunction(_self._.removeContextMenus)) _self._.removeContextMenus();
                    $s.stopEvent(e);
                } else {
                    if ($s.isFunction(_self._.onSelectionStart)) {
                        _self._.onSelectionStart.apply(this, [e]);
                    } else {
                        $s.stopEvent(e);
                    }
                }
            },
            setCursor: function (containerInstance) {
                if (this.isDragging)
                    _internal.style.cursor = 'url(' + imageFolder + 'closedhand.cur), default';
                else
                    _internal.style.cursor = 'url(' + imageFolder + 'openhand.cur), default';
            },
            onDrag: function (e) {
                if (this.isDragging && _self._.options.viewPort.allowDrag) {
                    var xy = cp(e);
                    if (xy.allTouches && xy.allTouches.length > 1) {
                        _self._.options.lastTouches = xy.allTouches;
                    }

                    _status.innerHTML = Math.abs(xy.x) + ', ' + Math.abs(xy.y);
                    _internal.style.left = xy.x + "px";
                    _internal.style.top = xy.y + "px";
                }
            },
            endDrag: function (e) {
                if (this.isDragging && _self._.options.viewPort.allowDrag) {
                    this.isDragging = false;
                    //var m = $s.mousePos(e);

                    _internal.style.cursor = 'url(' + imageFolder + 'openhand.cur), default';
                    _status.style.display = 'none';
                    _self._.multiselection && _self._.multiselection.show();

                    var xy = cp(e);
                    _self.endDrag(xy);

                    /*
                    if (!isNaN(Canvas.objInitPos.left)) {
                    difX = Canvas.objInitPos.left + (Canvas.objInitialMousePos.x);
                    difY = Canvas.objInitPos.top + (Canvas.objInitialMousePos.y);

                    _width = _self._.options.containerStyle.width;
                    _height = _self._.options.containerStyle.height;

                    vpWidth = _self._.options.viewPort.width; //* _self._.options.viewPort.zoom) / _self._.options.viewPort.width;
                    vpHeight = _self._.options.viewPort.height // * _self._.options.viewPort.zoom) / _self._.options.viewPort.height;

                    if (difX >= 0) difX = 0; else if (Math.abs(difX) + _width > vpWidth) difX = _width - vpWidth;
                    if (difY >= 0) difY = 0; else if (Math.abs(difY) + _height > vpHeight) difY = _height - vpHeight;
                    Canvas.objInitPos = {};

                    _self._.options.viewPort.left = Math.abs(difX); // Math.abs((difX * _self._.options.viewPort.zoom) / _self._.options.viewPort.width);
                    _self._.options.viewPort.top = Math.abs(difY); // Math.abs((difY * _self._.options.viewPort.zoom) / _self._.options.viewPort.height);
                    //Canvas.saveAndBroadcast(difX, difY);
                    }
                    */
                }
            }
        };

        _self.endDrag = function (coords) {
            _self._.options.viewPort.left = Math.abs(coords.x); // Math.abs((difX * _self._.options.viewPort.zoom) / _self._.options.viewPort.width);
            _self._.options.viewPort.top = Math.abs(coords.y); // Math.abs((difY * _self._.options.viewPort.zoom) / _self._.options.viewPort.height);

            _internal.style.left = coords.x + "px";
            _internal.style.top = coords.y + "px";

            _self._.birdseye && _self._.birdseye.refresh(true);

            if (_self._.options.collaboration.allow) _self.broadcast();
        }

        _self.broadcast = function () {
            _self._.collab && _self._.collab.send({ type: "onCanvasMove", data: { left: _self._.options.viewPort.left, top: _self._.options.viewPort.top} });
        };

        _self.zoom = function (_opts) {

            var opts = {
                dur: 500
                , callbacks: { after: null, during: null }
                , easing: 'easeFromTo'
                , zoomPercent: 100
            };

            $s.extend(opts, _opts);

            _self._.nodes.closeAllConnectors();
            var dc = $s.isFunction(opts.callbacks.during);

            var _startZoom = _self._.options.viewPort.zoom.w;
            var _targetZoom = _self._.options.viewPort.originalWidth * (100 / parseInt(opts.zoomPercent));
            var _zoomDif = Math.abs(_targetZoom - _startZoom);

            opts.dur = opts.dur || 500;

            //_internal.style.transform = perspective(config.perspective / targetScale) + scale(_zoomDif);
            //_internal.style.transitionDuration = opts.dur + "ms";
            //_internal.style.transitionDelay = "0ms";

            emile(_internal, "padding:1px", {
                duration: opts.dur
                , before: function () {
                    _self._.options.viewPort.allowDrag = false;
                }
                , after: function () {
                    _self._.options.viewPort.allowDrag = true;
                    _self._.zoomSlider.set(_targetZoom);
                    _self._.birdseye && _self._.birdseye.refresh(true);
                    opts.callbacks.after && opts.callbacks.after.apply(_self, [_targetZoom]);
                }
                , during: function (pc) {
                    var _val = _targetZoom > _startZoom ? (_startZoom + (_zoomDif * pc)) : (_startZoom - (_zoomDif * pc));
                    _self._.zoom(0, 0, _val, _val, false);
                    _self._.canvas.resize(_val);

                    dc && opts.callbacks.during.apply(this, [pc]);
                }
                , easing: _self.easing[opts.easing]
            });
        };

        _self.scaleToFitNodes = function (_opts) {
            var opts = {
                nodes: []
                , dur: 500
                , cb: null
                , offset: 0
                , minWidth: 60
                , minHeight: 30
            };
            $s.extend(opts, _opts);

            var orient = _self._.getOrientation(opts.nodes)
                , d = $s.getDimensions(_self._.options.container)
                , r = _self._.options.viewPort.zoom.r || 1
                , _tp = 1
                , _widthZP = parseInt((d.width / (orient.width/r)) * 100) //division by r converts it back from the scaled version
                , _heightZP =  parseInt((d.height / (orient.height/r)) * 100);

            switch (orient.orientation) {
                case "landscape":
                    _tp = _widthZP;
                    break;
                case "portrait": 
                    _tp = _heightZP;
                    break;
            }
            //_tp = parseInt(_tp * 100);

            console.log("zoom ", _tp, orient.orientation);

            //zoom canvas
            _self.zoom({
                dur: 500
                , callbacks: {
                    after: function () {
                        opts.cb && opts.cb();
                    }
                }
                , easing: 'easeFromTo'
                , zoomPercent: _tp
            });
        };

        //useful for centering the canvas on a collection of nodes
        _self.centerOnNodes = function (_opts) {
            var opts = {
                nodes: []
                , dur: 500
                , cb: null
            };
            $s.extend(opts, _opts);
            var orient = _self._.getOrientation(opts.nodes);
            var d = $s.getDimensions(_self._.options.container);
            var cw = d.width, ch = d.height, nw = orient.width, nh = orient.height, pad = 10;

            //console.log("orient width: " + nw + " , height: " + nh + " | width: " + cw + " , height: " + ch);

            //get upper left coords
            var _x = orient.left - (cw / 2 - nw / 2);
            var _y = orient.top - (ch / 2 - nh / 2);

            _self.move({ x: _x, y: _y, isAbsolute: true, duration: opts.dur, easing: 'swingFromTo', callbacks: { after: function () { opts.cb && opts.cb(); } } });
        };

        //useful for centering the canvas by comparing the viewport's previous width/height to its current width/height        
        _self.center = function (_opts) {
            var opts = {
                previousWindowSize: {}
                , dur: 500
                , cb: null
            };
            $s.extend(opts, _opts);
            var ws = $s.windowSize();
            _self.move({
                x: ((ws.width - opts.previousWindowSize.w) / 2) * -1
                , y: ((ws.height - opts.previousWindowSize.h) / 2) * -1
                , duration: opts.dur
                , isAbsolute: false
                , easing: 'swingFromTo'
                , callbacks: {
                    after: function () {
                        opts.cb && opts.cb();
                    }
                }
            });
            return ws;
        };

        _self.move = function (_opts) {
            var opts = {
                x: 0
                , y: 0
                , dur: 500
                , callbacks: { after: null, during: null }
                , isAbsolute: true
                , easing: 'easeFromTo'
            };

            $s.extend(opts, _opts);

            _self._.nodes.closeAllConnectors();
            var x = opts.x;
            var y = opts.y;
            var dc = $s.isFunction(opts.callbacks.during);
            if (opts.isAbsolute === false) {
                x = _self._.options.viewPort.left + x;
                y = _self._.options.viewPort.top + y;
            }

            if (opts.dur > 0) {
                emile(_internal, "left:" + (x * -1) + "px;top:" + y * -1 + "px", {
                    duration: opts.dur
                    , before: function () {
                        _self._.options.viewPort.allowDrag = false;
                    }
                    , after: function () {
                        _self._.options.viewPort.allowDrag = true;
                        _self._.options.viewPort.left = Math.abs(parseInt(_internal.style.left.replace("px", "")));
                        _self._.options.viewPort.top = Math.abs(parseInt(_internal.style.top.replace("px", "")));
                        _self._.birdseye && _self._.birdseye.refresh(true);
                        opts.callbacks.after && opts.callbacks.after.apply(_self);
                    }
                    , during: function (pc) {
                        dc && opts.callbacks.during.apply(this, [pc]);
                    }
                    , easing: _self.easing[opts.easing]
                });

            } else {
                //x = Math.abs(_self._.options.viewPort.left) + Math.abs(x) * -1;
                //y = Math.abs(_self._.options.viewPort.top) + Math.abs(y) * -1;
                _internal.style.left = (x * -1) + "px";
                _internal.style.top = (y * -1) + "px";
                _self._.options.viewPort.left = Math.abs(x);
                _self._.options.viewPort.top = Math.abs(y);
            }
        };

        _self.resize = function (val) {

            val = parseInt(val);

            var R = (_self._.options.viewPort.width / val);
            var dimen = $s.getDimensions(_self._.options.container);

            _internal.style.width = "50000px";
            _internal.style.height = "50000px";

            var _top = ((_self._.options.viewPort.top * -1) * R);
            var _left = ((_self._.options.viewPort.left * -1) * R);

            var _centerY = (((dimen.height / 2 * R) - (dimen.height / 2)) * -1);
            var _centerX = (((dimen.width / 2 * R) - (dimen.width / 2)) * -1);

            _top = (_top + _centerY);
            _left = (_left + _centerX);

            _internal.style.top = _top + "px";
            _internal.style.left = _left + "px";

            _self._.options.viewPort.zoom = { w: val, h: val, l: parseInt(_left * -1), t: parseInt(_top * -1), r: _self._.options.viewPort.originalWidth / val };
            //console.log(val);
            //if (_self._.options.viewPort.lockZoom === false) z.r = R;
        };

        _self.clear = function () {
            _self._.options.container.innerHTML = "";
            return _self._;
        };

        var _eve = {
            init: ['onmousedown', 'ontouchstart']
            , drag: ['onmousemove', 'ontouchmove']
            , up: ['onmouseup', 'ontouchend', 'onmouseout']
            , gest: ['ongesturestart', 'ongesturechange', 'ongestureend']
        };

        _self.wire = function () {
            for (var ee in _eve.init) { _internal[_eve.init[parseInt(ee)]] = Canvas.initDrag; }
            for (var ee in _eve.drag) { _internal[_eve.drag[parseInt(ee)]] = Canvas.onDrag; }
            for (var ee in _eve.up) { _internal[_eve.up[parseInt(ee)]] = Canvas.endDrag; }

            var origVal, zoomX, zoomY;
            _internal.ongesturestart = function (e) {
                e.preventDefault();
                _self._.options.viewPort.allowDrag = false;
                if (_self._.options.lastTouches) {
                    var lt = _self._.options.lastTouches;
                    zoomX = lt[0].x;
                    zoomY = lt[0].y;
                    if (lt.length > 1) {
                        zoomX = (Math.max(lt[0].x, lt[1].x || 0) - Math.min(lt[0].x, lt[1].x || lt[0].x)) / 2; // + Math.min(lt[0].x, lt[1].x || lt[0].x);
                        zoomY = (Math.max(lt[0].y, lt[1].y || 0) - Math.min(lt[0].y, lt[1].y || lt[0].y)) / 2; // + Math.min(lt[0].y, lt[1].y || lt[0].y);
                    }
                    origVal = _self._.options.viewPort.zoom.w;
                    //_self._.paper.rect(xMiddle + _self._.options.viewPort.left, yMiddle + _self._.options.viewPort.top, 10, 10);
                }
            }
            _internal.ongesturechange = function (e) {
                var val = origVal / e.scale;

                _self._.zoom(0, 0, val, val, false);
                _self._.canvas.resize(val); //, zoomX, zoomY

                $s.select('li.rmitem')[0].innerHTML = _self._.options.lastTouches[0].x + " , " + _self._.options.lastTouches[1].x
            }
            _internal.ongestureend = function (e) {
                _self._.options.viewPort.allowDrag = true;
                //try expanding the canvas -- i think this is consistently firing, but the _internal is out of scope after a bit...

                //$s.select('li.rmitem')[0].innerHTML = z.w + " , " + z.h + " , " + z.l + " , " + z.t;
                var z = _self._.options.viewPort.zoom;
                var vp = _self._.options.viewPort;
                vp.width = z.w;
                vp.height = z.h;
                vp.left = z.l;
                vp.top = z.t;
            }
        };

        _self.unwire = function () {
            for (var ee in _eve.init) {
                _internal[_eve.init[parseInt(ee)]] = null;
            }
            for (var ee in _eve.drag) { _internal[_eve.drag[parseInt(ee)]] = null; }
            for (var ee in _eve.up) { _internal[_eve.up[parseInt(ee)]] = null; }
            for (var ee in _eve.gest) { _internal[_eve.gest[parseInt(ee)]] = null; }
        };

        _self.init = function (_options) {
            var c = _self._.options.container, opts = _self._.options;
            imageFolder = opts.imageFolder;
            if (typeof (c) === "string") c = $s.el(c);
            if (c === undefined || c === null) {
                throw new Error("You must provide a container to initiate the canvas!");
            }

            /*
            var _cw = _self._.options.containerStyle.width + "px";
            var _ch = _self._.options.containerStyle.height + "px";
            if (_self._.options.containerStyle.width === 'auto') {
            _ws = $s.windowSize();
            _self._.options.containerStyle.width = _ws.width;
            _self._.options.containerStyle.height = _ws.height;
            _cw = _ws.width + "px";
            _ch = _ws.height + "px"
            }

            c.style.width = _cw;
            c.style.height = _ch;
            */

            //wipe it clean
            c.innerHTML = "";
            if (_paper) _paper.clear();

            if (_internal) c.removeChild(_internal);

            //internal
            _internal = document.createElement('div');
            _internal.setAttribute("class", "slateboxInternal");
            c.appendChild(_internal);

            //status
            var d = $s.getDimensions(c);
            _status = document.createElement("div");
            _status.style.position = "absolute";
            _status.style.height = " 20px";
            _status.style.left = '0px';
            _status.style.color = "#000";
            _status.style.fontSize = "10pt";
            _status.style.fontFamily = "trebuchet ms";
            _status.style.top = "0px";
            _status.style.display = "none";
            _status.style.padding = "5px";
            _status.style.filter = "alpha(opacity=80)";
            _status.style.opacity = '.80';
            _status.style.backgroundColor = "#ffff99"
            _status.style.fontWeight = "bold";
            c.appendChild(_status);

            //style container
            var cs = opts.containerStyle;
            //c.style.border = cs.border;
            //c.style.backgroundImage = cs.backgroundImage;
            //c.style.backgroundRepeat = cs.backgroundImageIsTiled; bad for ie
            //c.style.backgroundColor = cs.backgroundColor;
            c.style.position = "relative";
            c.style.overflow = "hidden";

            //style internal
            var _w = opts.viewPort.width;
            var _h = opts.viewPort.height;
            var _l = opts.viewPort.left;
            var _t = opts.viewPort.top;
            _internal.style.width = _w + "px";
            _internal.style.height = _h + "px";
            _internal.style.left = (_l * -1) + "px";
            _internal.style.top = (_t * -1) + "px";
            _internal.style.position = 'absolute';
            _self.borderTop = _self.borderTop + 2 || 2;
            _internal.style.borderTop = _self.borderTop + "px";
            _internal.style.cursor = 'url(' + imageFolder + 'openhand.cur), default'
            
            if (opts.viewPort.allowDrag) {
                _self.wire();
            }

            _paper = Raphael(_internal, _w, _h);

            opts.viewPort.originalHeight = _h;
            opts.viewPort.originalWidth = _w;

            //set up initial zoom params
            _self.resize(_w);

            //show zoom slider
            if (opts.showZoom) {
                _self._.zoomSlider.show();
                _self._.zoomSlider.setValue(opts.viewPort.width);
            }

            //show birdseye
            if (opts.showBirdsEye) {
                if (_self._.birdseye.enabled()) {
                    _self._.birdseye.reload(_self._.exportJSON());
                } else {
                    _self._.birdseye.show({
                        size: opts.sizeOfBirdsEye || 200
                        , onHandleMove: function (left, top) {
                        }
                    });
                }
            }

            _self._.paper = _paper;
            return _self._;
        };

        _self.rawSVG = function () {
            return _internal.innerHTML;
        };

        _self.darken = function (percent) {
            if (_dken === null) {
                _dken = document.createElement("div");
                var ws = $s.windowSize();
                _dken.style.backgroundColor = '#ccc';
                _dken.style.position = 'absolute';
                _dken.style.left = '0px';
                _dken.style.top = '0px';
                _dken.style.width = ws.width + "px";
                _dken.style.height = ws.height + "px";
                _dken.style.zIndex = 999;
                _dken.style.filter = "alpha(opacity=" + percent + ")";
                _dken.style.opacity = (percent / 100);
                document.body.appendChild(_dken);
            }
            return _dken;
        };

        $s.addEvent(window, "resize", function () {
            if (_dken !== null) {
                var ws = $s.windowSize();
                _dken.style.width = ws.width + "px";
                _dken.style.height = ws.height + "px";
            }
        });

        _self.lighten = function () {
            _dken && document.body.removeChild(_dken);
            _dken = null;
        };

        _self.get = function () {
            return _internal;
        };

        _self.draggable = function () { return _internal; }

        _self.easing = {
            elastic: function (pos) { return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1 },
            swingFromTo: function (pos) { var s = 1.70158; return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) : 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2) },
            swingFrom: function (pos) { var s = 1.70158; return pos * pos * ((s + 1) * pos - s) },
            swingTo: function (pos) { var s = 1.70158; return (pos -= 1) * pos * ((s + 1) * pos + s) + 1 },
            bounce: function (pos) { if (pos < (1 / 2.75)) { return (7.5625 * pos * pos) } else { if (pos < (2 / 2.75)) { return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75) } else { if (pos < (2.5 / 2.75)) { return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375) } else { return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375) } } } },
            bouncePast: function (pos) { if (pos < (1 / 2.75)) { return (7.5625 * pos * pos) } else { if (pos < (2 / 2.75)) { return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75) } else { if (pos < (2.5 / 2.75)) { return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375) } else { return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375) } } } },
            easeFromTo: function (pos) { if ((pos /= 0.5) < 1) { return 0.5 * Math.pow(pos, 4) } return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2) },
            easeFrom: function (pos) { return Math.pow(pos, 4) },
            easeTo: function (pos) { return Math.pow(pos, 0.25) },
            none: function (pos) { return (-Math.cos(pos * Math.PI) / 2) + 0.5; }
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.slate);
(function ($s, $slate) {
    $slate.fn._keyboard = function () {
        var _self = this, hoverNode = null;

        _self.start = function (_hoverNode) {
            hoverNode = _hoverNode;
            $s.addEvent(document, "keydown", _press);
        };

        var _press = function (e) {
            var _key = $s.getKey(e);
            if (hoverNode) {
                hoverNode.context && hoverNode.context.hide();
                switch (_key) {
                    case 39: //left
                        hoverNode.connectors.addUnpinnedNode(true);
                        break;
                    case 46: //delete
                        hoverNode.toolbar.del();
                        break;
                }
                return $s.stopEvent(e);
            } else if (_self._.multiselection && _self._.multiselection.isSelecting()) {
                switch (_key) {
                    case 46: //delete
                        _self._.multiselection.del();
                        break;
                }
            }
        };

        _self.end = function () {
            hoverNode = null;
            if (!_self._.multiselection.isSelecting()) {
                $s.removeEvent(document, "keydown", _press);
            }
        };

        function _key(e, bln) {
            var _key = $s.getKey(e);
            switch (_key) {
                case 17: //ctrl
                    _self._.isCtrl = bln;
                    break;
                case 16: //shift
                    _self._.isShift = bln;
                    break;
                case 18: //alt
                    _self._.isAlt = bln;
                    break;
            }
        };

        var _globalDown = function(e) {
            _key(e, true);
        };

        var _globalUp = function(e) {
            setTimeout(function() {
                _key(e, false);
            }, 100); //gives the move collab event a moment to catch up
        };

        //perpetual look
        $s.addEvent(document, "keydown", _globalDown);
        $s.addEvent(document, "keyup", _globalUp);

        return _self;
    }
})(Slatebox, Slatebox.fn.slate);
(function ($s, $slate) {
    $slate.fn._message = function () {
        var _self = this

        _self.show = function (msg, time) {
            var mb = _self._.messageBox;
            var d = $s.getDimensions(_self._.options.container);

            if (_self._.messageBox === undefined) {
                var r = _self._.paper;
                mb = _self._.messageBox = r.set();
                mb.push(r.rect(0, 0, d.width, 28, 7).attr({ fill: "#ffff99" }));
                mb.push(r.text(0, 0, "").standard());
            }

            mb.show();

            mb[1].attr({ text: msg });
            var _w = mb[1].getBBox().width;
            mb[0].attr({ width: _w + 12 });

            var _x = _self._.options.viewPort.left + ((d.width - mb[0].attr("width")) / 2);
            var _y = _self._.options.viewPort.top + 3;
            mb[0].attr({ x: _x, y: _y, "fill-opacity": 0 });
            mb[1].attr({ x: _x + (_w / 2) + 6, y: _y + 13, "fill-opacity": 0 });

            mb.animate({ "fill-opacity": 1 }, 500, function () {
                setTimeout(function () {
                    mb.animate({ "fill-opacity": 0 }, 500, function () {
                        mb.hide();
                    });
                }, time);
            });
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.slate);
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
(function ($s, $slate) {
    $slate.fn._multiselection = function () {
        var _self = this, selRect = null, ox, oy, _init, marker = null, selectedNodes = [], origPos = null, resizer = null, minSize = 100;

        _self.init = function () {
            var c = _self._.options.container;
            if (c) {
                _init = document.createElement("div");
                _init.style.position = "absolute";
                _init.style.height = "18px";
                _init.style.left = '1px';
                _init.style.color = "#081272";
                _init.style.fontSize = "11pt";
                _init.style.fontFamily = "trebuchet ms";
                _init.style.top = "1px";
                _init.style.display = "block";
                _init.style.padding = "5px";
                _init.style.backgroundColor = "#f8f8f8";
                _init.style.cursor = "pointer";
                _init.innerHTML = "[multi-select]";
                c.appendChild(_init);

                $s.addEvent(_init, "click", function (e) {
                    switch (_init.innerHTML) {
                        case "[multi-select]":
                            _self.start();
                            break;
                        case "selecting [click to stop]...":
                            _self.end();
                            break;
                    }
                });
            }
        };

        _self.hide = function () {
            if (_init) _init.style.display = "none";
        };

        _self.show = function () {
            if (_init) _init.style.display = "block";
        };

        _self.start = function () {
            _self._.disable(); // options.viewPort.allowDrag = false;
            _init.innerHTML = "selecting [click to stop]...";
            _self._.onSelectionStart = function (e) {
                var p = xy(e);
                selRect = _self._.paper.rect(p.x, p.y, 10, 10).attr({ "stroke-dasharray": "-" });
                $s.addEvent(_self._.canvas.get(), "mousemove", _move);
                $s.addEvent(_self._.canvas.get(), "mouseup", _select);
                ox = p.x;
                oy = p.y;
            };
        };

        _self.isSelecting = function () {
            return (marker !== null);
        };

        _self.del = function () {
            if (confirm('Are you sure you want to remove the selected nodes?')) {
                $s.each(selectedNodes, function () {
                    this.toolbar.del();
                });
                _self.end();
            }
        };

        _self.end = function () {
            if (marker !== null) {
                resizer.unmouseover(_resizeHover);
                //marker.undrag(markerEvents.move, markerEvents.init, markerEvents.up);
                //resizer.undrag(resizeEvents.move, resizeEvents.init, resizeEvents.up);
                marker.remove();
                resizer.remove();
                marker = null;
                _self._.keyboard && _self._.keyboard.end();
            }
            if (_init) _init.innerHTML = "[multi-select]";
        };

        _self.endSelection = function () {
            selRect && selRect.remove();
            _self._.enable();
            _self._.onSelectionStart = null;
            $s.removeEvent(_self._.canvas.get(), "mousemove", _move);
            $s.removeEvent(_self._.canvas.get(), "mouseup", _select);
        };

        var xy = function (e) {
            var mp = $s.mousePos(e);
            var off = $s.positionedOffset(_self._.options.container);
            var _x = mp.x + _self._.options.viewPort.left - off.left;
            var _y = mp.y + _self._.options.viewPort.top - off.top;
            var z = _self._.options.viewPort.zoom.r;
            return { x: _x / z, y: _y / z };
        };

        var _move = function (e) {
            p = xy(e);
            var height = p.y - oy;
            var width = p.x - ox;

            if (height > 0) {
                selRect.attr({ height: height });
            } else {
                selRect.attr({ y: p.y, height: (oy - p.y) });
            }
            if (width > 0) {
                selRect.attr({ width: width });
            } else {
                selRect.attr({ x: p.x, width: (ox - p.x) });
            }
        };

        var _select = function (e) {
            var sr = selRect.getBBox();
            var l = _self._.options.viewPort.left;
            var t = _self._.options.viewPort.top;
            var z = _self._.options.viewPort.zoom.r;
            selectedNodes = _.filter(_self._.nodes.allNodes, function (n) {
                return ((n.options.xPos + n.options.width > sr.x && n.options.xPos < sr.x + sr.width) && (n.options.yPos + n.options.height > sr.y && n.options.yPos < sr.y + sr.height))
            });

            if (selectedNodes.length > 1) {
                var orient = _self._.getOrientation(selectedNodes);
                var w = orient.width / z;
                var h = orient.height / z;
                if (w < minSize) w = minSize;
                if (h < minSize) h = minSize;

                marker = _self._.paper.rect(orient.left / z, orient.top / z, w, h).attr({ "stroke-dasharray": "-", "fill": "#f8f8f8" });
                marker.toBack();
                origPos = marker.getBBox();

                _self.endSelection();

                //resizer
                var _nx = origPos.x + origPos.width;
                var _ny = origPos.y + origPos.height;

                resizer = _self._.paper.resize(_self._.options.imageFolder + "2_lines.png").transform(["t", _nx - 5, ",", _ny - 5].join()).attr({ fill: "#fff", "stroke": "#000" });
                resizer.mouseover(_resizeHover);
                marker.drag(markerEvents.move, markerEvents.init, markerEvents.up);
                resizer.drag(resizeEvents.move, resizeEvents.init, resizeEvents.up);

                //hiding resizer for now
                //resizer.hide();

                //unmark all and remove connectors
                _self._.unMarkAll();

                $s.each(selectedNodes, function () {
                    this.connectors.remove();
                    this.resize.hide();
                });

                //activate keyboard shortcuts for this group...
                _self._.keyboard && _self._.keyboard.start();

            } else if (selectedNodes.length === 1) {
                selectedNodes[0].menu.show();
                selectedNodes[0].mark();
                _self.endSelection();
                _self.end();
            } else {
                _self.endSelection();
                _self.end();
            }
        };

        var _resizeHover = function (e) { resizer.attr({ cursor: 'nw-resize' }); };

        var markerEvents = {
            init: function (x, y) {
                _self._.options.viewPort.allowDrag = false;
                marker.ox = marker.attr("x");
                marker.oy = marker.attr("y");
                $s.each(selectedNodes, function () {
                    this.vect.ox = this.vect.type == "rect" ? this.vect.attr("x") : this.vect.attr("cx");
                    this.vect.oy = this.vect.type == "rect" ? this.vect.attr("y") : this.vect.attr("cy");
                });
            }
            , move: function (dx, dy) {
                var _zr = _self._.options.viewPort.zoom.r;
                dx = dx + ((dx / _zr) - dx);
                dy = dy + ((dy / _zr) - dy);

                var att = { x: marker.ox + dx, y: marker.oy + dy };
                marker.attr(att);

                $s.each(selectedNodes, function () {
                    var node = this;
                    node.setPosition({ x: node.vect.ox + dx, y: node.vect.oy + dy });
                    node.relationships.refresh();
                    /*
                    node.relationships.syncAssociations(node, function(c, a) {
                        //c.setPosition({ x: c.vect.ox + dx, y: c.vect.oy + dy });
                        c.relationships.refresh();
                    });
                    */
                });

                var _nx = origPos.x + origPos.width + dx - 5
                    , _ny = origPos.y + origPos.height + dy - 5;
                resizer.transform(["t", _nx, ",", _ny].join(""));
            }
            , up: function (e) {
                _self._.options.viewPort.allowDrag = true;
                _self._.birdseye && _self._.birdseye.refresh(true);

                var _sids = _(selectedNodes).chain().pluck('options').pluck('id').value();

                $s.each(selectedNodes, function () {
                    broadcastMove(this);
                });

                origPos = marker.getBBox();
            }
        };

        function _resize() {
            var mbb = marker.getBBox();

            var xStatic = mbb.x + mbb.width / 2;
            var yStatic = mbb.y + mbb.height / 2;
            var yScale = mbb.height / origPos.height;
            var xScale = mbb.width / origPos.width;

            $s.each(selectedNodes, function () {
                var nx = xStatic + (xScale * (this.options.xPos - xStatic));
                var ny = yStatic + (yScale * (this.options.yPos - yStatic));

                this.setPosition({ x: nx, y: ny });

                var nw = xScale * this.options.width; // ((mbb.width * this.options.width) / origPos.width);
                var nh = yScale * this.options.height; // ((mbb.height * this.options.height) / origPos.height);
                this.resize.set(nw, nh, 0);
            });
        };

        function broadcastMove(node) {
            _self._.collab && _self._.collab.send({
                type: "onNodeMove"
                , data: {
                    id: node.options.id
                    , x: node.options.xPos
                    , y: node.options.yPos
                }
            });
        };

        var resizeEvents = {
            init: function () {
                _self._.disable();
                $s.each(selectedNodes, function () {
                    this.vect.ox = this.vect.type == "rect" ? this.vect.attr("x") : this.vect.attr("cx");
                    this.vect.oy = this.vect.type == "rect" ? this.vect.attr("y") : this.vect.attr("cy");
                });
            }
            , move: function (dx, dy) {

                var _zr = _self._.options.viewPort.zoom.r;
                dx = dx + ((dx / _zr) - dx);
                dy = dy + ((dy / _zr) - dy);

                var _width = origPos.width + (dx * 2);
                var _height = origPos.height + (dy * 2);

                var _nx = origPos.x + origPos.width + dx - 5;
                var _ny = origPos.y + origPos.height + dy - 5;
                var rw = true, rh = true;
                if (_width < minSize) { _width = minSize; rw = false; }
                if (_height < minSize) { _height = minSize; rh = false; }

                resizer.transform(["t", _nx, ",", _ny].join(""));

                var att = { width: _width, height: _height };
                rw && $s.extend(att, { x: origPos.x - dx });
                rh && $s.extend(att, { y: origPos.y - dy });

                marker.attr(att);
            }
            , up: function () {
                _self._.enable();
                _resize();

                $s.each(selectedNodes, function () {
                    this.resize.send();
                    broadcastMove(this);
                });

                _self._.birdseye && _self._.birdseye.refresh(true);

                origPos = marker.getBBox();
                var _nx = origPos.x + origPos.width;
                var _ny = origPos.y + origPos.height;
                resizer.transform(["t", _nx - 5, ",", _ny - 5].join(""));
            }
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.slate);
(function ($s, $slate) {
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
                var cn = _.detect(_self.allNodes, function(n) { return n.options.id === src.options.id });
                cn.setPosition({ x: src.options.xPos, y: src.options.yPos });
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
            var _na = new Array();
            $s.each(a, function () {
                if (this.options.id !== obj.options.id) {
                    _na.push(this);
                }
            });
            return _na;
        }

        function removeFromCanvas(_node) {
            _.each(["vect", "text", "link"], function(tt) {
                _node[tt].remove();
            });
            refreshBe();
        };

        function addToCanvas(_node) {
            var vect = null, text = null, link = null, s = "#000";
            if (_node.options.borderWidth === 0) s = 'transparent';
            var vectOpt = { stroke: s, "stroke-width": _node.options.borderWidth, fill: (_node.options.backgroundColor || "none") };
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
(function ($s, $slate) {
    $slate.fn._zoomSlider = function () {
        var _self = this, slider;

        _self.setValue = function (val) {
            slider && slider.setValue(val);
        };

        _self.hide = function () {
            if ($s.el("slateSlider_" + _self._.options.id) !== null) {
                _self._.options.container.removeChild($s.el("slateSlider_" + _self._.options.id));
            }
        };

        _self.show = function (_options) {

            _self.hide();

            var options = {
                height: 320
                , width: 70
                , offset: { left: 10, top: 50 }
                , slider: { height: 300, min: 6000, max: 200000, set: 5000 }
            };

            $s.extend(options, _options);

            var c = _self._.options.container;
            var scx = document.createElement('div');
            scx.setAttribute("id", "slateSlider_" + _self._.options.id);
            scx.style.position = "absolute";
            scx.style.height = options.height + "px";
            scx.style.width = options.width + "px";
            scx.style.left = options.offset.left + "px";
            scx.style.top = options.offset.top + "px";
            c.appendChild(scx);

            options.paper = Raphael("slateSlider_" + _self._.options.id, options.width, options.height);

            slider = options.paper.slider(options.slider.height, options.slider.min, options.slider.max, options.slider.set, function (val) { //length, start, end, initVal, onSlide, onDone

                if (Raphael.svg) {
                    console.log("zooming to " + val);
                    _self._.zoom(0, 0, val, val, false);
                    _self._.canvas.resize(val);
                }

            }, function (val) {
                _self.set(val);
                _self._.collab && _self._.collab.send({ type: 'onZoom', data: { zoomLevel: val} });
            });
        };

        _self.set = function (val) {
            _self._.zoom(0, 0, val, val, false);
            _self._.canvas.resize(val);

            var z = _self._.options.viewPort.zoom;

            _self._.options.viewPort.width = z.w;
            _self._.options.viewPort.height = z.h;
            _self._.options.viewPort.left = z.l;
            _self._.options.viewPort.top = z.t;
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.slate);
(function ($s, $n) {
    $n.fn._colorpicker = function (_options) {
        var options = {
            colors: [
                { hex: "000000", to: "575757"} //black //six to a row
                , { hex: "FFFFFF", to: "d9d9d9"} //white
                , { hex: "FF0000", to: "a31616"} //red
                , { hex: "C3FF68", to: "afff68"} //green
                , { hex: "0B486B", to: "3B88B5"} //blue
                , { hex: "FBB829", to: "cd900e"} //orange
                , { hex: "BFF202", to: "D1F940"} //yellow
                , { hex: "FF0066", to: "aa1d55"} ///pink
                , { hex: "800F25", to: "3d0812"} //dark red
                , { hex: "A40802", to: "d70b03"} //red
                , { hex: "FF5EAA", to: "cf5d93"} //strong pink
                , { hex: "740062", to: "D962C6"} //purple
                , { hex: "FF4242", to: "A61515"} //red
                , { hex: "D15C57", to: "9D5C58"} //pinkish
                , { hex: "FCFBE3", to: "c9c56f"} //light yellow-white
                , { hex: "FF9900", to: "c98826"} //orange
                , { hex: "369001", to: "9CEE6C"} //green
                , { hex: "9E906E", to: "675324"} //brown
                , { hex: "F3D915", to: "F9EA7C"} //yellow 2
                , { hex: "031634", to: "2D579A"} // dark blue
                , { hex: "556270", to: "7b92ab"} //gray-blue
                , { hex: "1693A5", to: "23aad6"} //turquoise
                , { hex: "ADD8C7", to: "59a989"} //light turquoise
                , { hex: "261C21", to: "EB9605" }
            ]
            , useColorLovers: false
        };
        $s.extend(options, _options);
        if (options.colors !== null) {
            $s.availColors = options.colors;
        }
        var _self = this;

        function getColors(callback) {
            if ($s.availColors === undefined) {
                var apiUrl = "http://www.colourlovers.com/api/colors/top&jsonCallback=?"; //&context=" + this.imageContext;
                $s.getJSON(apiUrl,
                    function (data) {
                        $s.availColors = data;
                        if ($s.isFunction(callback))
                            callback.apply(this, [$s.availColors]);
                    }
                );
            } else {
                if ($s.isFunction(callback))
                    callback.apply(this, [$s.availColors]);
            }
        };

        _self.prepColors = function () {
            getColors();
        };

        _self.show = function (x, y, _m) {

            var wx = _m[3].attr("width");

            var _rowOff = wx - 125;

            var _x = x + _rowOff;
            var _y = y + 5;

            getColors(function (data) {
                var tot = -1, rowCount = 6, rp = _self._.slate.paper, w = 15, h = 15, p = 4;

                $s.each(data, function () {
                    tot++;
                    if (tot % rowCount === 0 && tot !== 0) {
                        _y += h + p;
                        _x = _self._.options.xPos + _rowOff;
                        if (_self._.options.vectorPath === 'ellipse') {
                            _x = _x - _self._.options.width / 2;
                        }
                    }
                    var _hex = this.hex;
                    var _to = this.to;
                    var _swatch = rp.rect(_x, _y, w, h, 3).attr({ stroke: '#000', fill: ["90-#", _hex, "-#", _to].join('') });

                    _swatch.mouseover(function (e) {
                        _self._.slate.glow(this);
                        //this.animate({ transform: "s1.5, 1.5" }, 200);
                    });

                    _swatch.mouseout(function (e) {
                        _self._.slate.unglow();
                        //this.animate({ transform: "s1,1" }, 200);
                    });

                    _swatch.mousedown(function (e) {
                        this.loop();
                        var _backColor = this.attr("fill");
                        var _testColor = "#" + _backColor.split(/90-#/g)[1].split(/-#/g)[0];
                        var _textColor = Raphael.rgb2hsb(_testColor).b < .4 ? "#fff" : "#000";

                        if (_self._.options.image !== "") _self._.options.image = "";

                        var _pkg = { type: "onNodeColorChanged", data: { id: _self._.options.id, color: _backColor} };
                        broadcast(_pkg);
                        _self._.slate.birdseye && _self._.slate.birdseye.nodeChanged(_pkg);
                    });

                    _m.push(_swatch);
                    _x += w + p;
                    if (tot > 19) return;
                });
            });
        };

        function broadcast(_pkg) {
            _self.set(_pkg.data);
            _self._.slate.collab && _self._.slate.collab.send(_pkg);
        };

        _self.set = function (cast) {
            _self._.options.backgroundColor = cast.color;
            _self._.vect.attr({ fill: cast.color });
            //$s.each(_self._.relationships.children, function () {
            //    this.lineColor = cast.color;
            //});
            _self._.relationships.refresh();
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
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
                    _self._.context && _self._.context.hide();
                    _self._.editor && _self._.editor.end();
                    _self._.images && _self._.images.end();
                    _self._.links && _self._.links.end();
                });

                buttons.unPinned[this](function (e) {
                    _self._.slate.unglow();
                    _self._.connectors.addUnpinnedNode();
                    this.loop();
                    _self._.context && _self._.context.hide();
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

        _self.addUnpinnedNode = function (skipCenter) {
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

            broadcast(_snap);

            _self._.relationships.addAssociation(newNode);
            _self._.slate.birdseye && _self._.slate.birdseye.refresh(false);
            _self._.slate.unMarkAll();

            var _pkg = { type: "addRelationship", data: { type: 'association', parent: _self._.options.id, child: newNode.options.id} };
            _self._.slate.collab && _self._.slate.collab.send(_pkg);

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
(function ($s, $n, $si) {
    $n.fn._context = function () {
        var _self = this, _contextMenu, _priorAllowDrag = true, _height = 150;

        //wire up event
        var _wire = window.setInterval(function () {
            if (_self._) {
                _self.init();
                window.clearInterval(_wire);
            }
        }, 500);

        _self.init = function () {
            if (_self._.text.node && _self._.options.allowContext) {
                _self._.text.node.oncontextmenu = _self._.vect.node.oncontextmenu = function (e) {
                    _priorAllowDrag = _self._.options.allowDrag;
                    _self._.options.allowDrag = false;
                    _self.hide();
                    buildContext(e);
                    setTimeout(function (e) {
                        _self._.options.allowDrag = _priorAllowDrag;
                    }, 2);
                    return $s.stopEvent(e);
                };
            }
        };

        function buildContext(e) {
            _contextMenu = document.createElement('div');
            _contextMenu.setAttribute("id", "contextMenu_" + _self._.options.id);
            _contextMenu.setAttribute("class", "sb_cm");
            document.body.appendChild(_contextMenu);
            setContext(e);
        };

        function menuItems() {
            var _tmp = "<div style='padding:5px;' class='sb_contextMenuItem' rel='{func}'>{text}</div>";
            var _inside = _tmp.replace(/{func}/g, "tofront").replace(/{text}/g, "to front");
            _inside += _tmp.replace(/{func}/g, "toback").replace(/{text}/g, "to back");
            if (_priorAllowDrag) {
                _inside += _tmp.replace(/{func}/g, "lock").replace(/{text}/g, "lock");
            } else {
                _inside += _tmp.replace(/{func}/g, "unlock").replace(/{text}/g, "unlock");
            }
            _inside += _tmp.replace(/{func}/g, "close").replace(/{text}/g, "close");
            return _inside;
        };

        function setContext(e) {
            _contextMenu.innerHTML = menuItems();

            $s.each($s.select("div.contextMenuItem"), function (e) {
                this.onclick = function (e) {
                    var act = this.getAttribute("rel"), _reorder = false;
                    var pkg = { type: '', data: { id: _self._.options.id} };
                    switch (act) {
                        case "tofront":
                            _self._.toFront();
                            _reorder = true;
                            pkg.type = 'onNodeToFront';
                            break;
                        case "toback":
                            _self._.toBack();
                            _reorder = true;
                            pkg.type = 'onNodeToBack';
                            break;
                        case "lock":
                            _self._.disable();
                            pkg.type = 'onNodeLocked';
                            break;
                        case "unlock":
                            _self._.enable();
                            pkg.type = 'onNodeUnlocked';
                            break;
                        case "close":
                            break;
                    }
                    if (_reorder) {
                        var zIndex = 0;
                        for (var node = _self._.slate.paper.bottom; node != null; node = node.next) {
                            if (node.type === "ellipse" || node.type === "rect") {
                                zIndex++;
                                var _id = node.data("id");

                                //not all rects have an id (the menu box is a rect, but it has no options.id because it is not a node
                                //so you cannot always show this...
                                if (_id) {
                                    var reorderedNode = _.detect(_self._.slate.nodes.allNodes, function (n) { return n.options.id === _id; });
                                    reorderedNode.sortorder = zIndex;
                                }
                            }
                        }
                        _self._.slate.nodes.allNodes.sort(function (a, b) { return a.sortorder < b.sortorder ? -1 : 1 });
                    }
                    if (pkg.type !== "") broadcast(pkg);
                    _self.hide();
                };
            });

            var mp = $s.mousePos(e);

            var _x = mp.x; // _self._.options.xPos - _self._.slate.options.viewPort.left + _self._.options.width / 3;
            var _y = mp.y; // _self._.options.yPos - _self._.slate.options.viewPort.top;
            _contextMenu.style.left = _x + "px";
            _contextMenu.style.top = _y + "px";
            _contextMenu.style.height = _height + "px";
        };

        function broadcast(pkg) {
            //broadcast
            if (_self._.slate.collab) _self._.slate.collab.send(pkg);
            if (_self._.slate.birdseye) _self._.slate.birdseye.nodeChanged(pkg);
        };

        _self.hide = function () {
            _self._.slate.removeContextMenus();
            _contextMenu = null;
        }

        _self.isVisible = function () {
            return (_contextMenu !== null);
        };

        return _self;
    };
    $si.fn.removeContextMenus = function () {
        var _cm = $s.select("div.sb_cm")
        $s.each(_cm, function () {
            document.body.removeChild(this);
        });
    };

})(Slatebox, Slatebox.fn.node, Slatebox.fn.slate);
(function ($s, $n) {
    $n.fn._editor = function () {
        var _self = this, _tempId = $s.guid().replace("-", ""), lineBreaks = [], _keypress, _submit, _cancel, cursor, ll, _ntfy;
        _self.editing = false;
        _self.start = function () {
            _self.editing = true;
            _self._.slate.keyboard && _self._.slate.keyboard.end();

            cursor = _self._.slate.paper.rect(-99, -99, 8, 1).attr({ fill: "#000" }).loop({
                pkg: [{ fill: "#fff" }, { fill: "#000"}]
                , duration: 500
                , repeat: true
            });
            //positionedoffset?
            _self._.slate.nodes.closeAllMenus();

            var origText = '', origSize;

            function sizes() {
                var _sel = "<select id='ddlTxtSize'>";
                for (ptx = 10; ptx < 201; ptx++) {
                    if (ptx % 2 === 0) {
                        _sel += "<option>" + ptx + "</option>";
                    }
                }
                _sel += "</select>";
                return _sel;
            };

            function buildColorPicker() {
                var ctmp = "<div style='float:left;padding:3px;margin-right:5px;background-color:#f8f8f8;border:1px solid #ccc;cursor:pointer;' class='changeTextColor' rel='{text}'><div style='width:30px;height:30px;background-color:{color};float:left;border:1px solid #333;'></div></div>";
                var _colors = ctmp.replace(/{color}/gi, '#000').replace(/{text}/gi, 'black');
                _colors += ctmp.replace(/{color}/gi, '#FFF').replace(/{text}/gi, 'white');
                return _colors;
            };

            function setColor(clr, txtBg) {
                _self.set(null, null, clr);
                var txt = $s.el("txtForNode")
                txt.style.backgroundColor = txtBg;
                txt.style.color = clr;
                txt.focus();
            };

            if ($s.select("div.embedBar").length > 0) {
                $s.each($s.select("div.embedBar"), function () {
                    document.body.removeChild(this);
                });
            };

            _ntfy = new Notify().message({
                hgt: 120
                , duration: 200
                , className: 'embedBar'
                , delayClose: 0
                , spinner: null
                , hideClose: false
                , popFromBottom: true
                , onClose: function () {
                    //_self.set(origText, origSize);
                    _self.end();
                }
                , onOpen: function (container, _ntfy) {
                    container.innerHTML = "<div style='width:900px;'>You are editing the node's text!<br/><div style='float:left;margin-right:8px;height:60px;'><textarea id='txtForNode' style='text-align:center;width:500px;height:70px;'></textarea></div><div style='float:left;margin-right:20px;'>Size " + sizes() + " pt&nbsp;&nbsp;<button id='btnSubmitText' style='width:80px;font-size:14pt;'>Update</button><div id='textColorPicker' style='margin-top:4px;'></div></div></div>";
                    origText = _self._.options.text;
                    origSize = _self._.options.fontSize;
                    $s.el("txtForNode").value = origText;
                    $s.el("txtForNode").select();

                    $s.el("btnSubmitText").onclick = function (e) {
                        _self.end();
                        submitChanges();
                    };
                    $s.el("ddlTxtSize").value = origSize;
                    $s.el("ddlTxtSize").onchange = function (e) {
                        var pt = this.options[this.selectedIndex].value;
                        _self.set(_self._.options.text, pt);
                    };

                    $s.el("textColorPicker").innerHTML = buildColorPicker();
                    $s.each($s.select("div.changeTextColor"), function () {
                        var btn = this;
                        btn.onclick = function (e) {
                            btn.style.border = "1px solid red";
                            switch (btn.getAttribute("rel")) {
                                case "black":
                                    setColor("#000", "#fff");
                                    break;
                                case "white":
                                    setColor("#fff", "#000");
                                    break;
                            }
                        };
                        btn.onmouseover = function (e) {
                            btn.style.border = "1px solid red";
                        };
                        btn.onmouseout = function (e) {
                            btn.style.border = "1px solid #ccc";
                        };
                    });

                    $s.el("txtForNode").onkeyup = function (e) {
                        var _v = this.value;
                        if (_v === "") _v = " ";
                        var _text = _self._.text;
                        _self._.options.text = _v;
                        var keyCode = $s.getKey(e || event);
                        _text.attr({ "text": (keyCode === 13 || keyCode === 32) ? _v + " " : _v });
                        var ts = _text.getBBox();
                        if (keyCode === 13 || keyCode === 32) { setTimeout(function () { _text.attr({ "text": _self._.options.text }); }, 0) };

                        //get the width of the last line of text
                        var _sp = _text.attr("text").split("\n");
                        ll = _self._.slate.paper.text(-99, -99, _sp[_sp.length - 1]).attr({ "font-size": _self._.options.fontSize + "pt" });
                        var _b = ll.getBBox();
                        ll.remove();

                        _self.resize();
                        _self.resize();
                        _self._.mark();

                        _self._.refresh();

                        var centerX = (_sp.length > 1 ? (ts.width / 2 + _b.width / 2) : ts.width);
                        cursor.attr({ x: ts.x + centerX, y: ts.y + ts.height, "font-size": _self._.options.fontSize + "pt" });
                    };
                }
            });

            _self._.mark();
        };

        _self.set = function (t, s, c) {
            t && (_self._.options.text = t);
            s && (_self._.options.fontSize = s);
            c && (_self._.options.foregroundColor = c);
            t && (_self._.text.attr({ "text": t }));
            s && (_self._.text.attr({ "font-size": + s + "pt" }));
            c && (_self._.text.attr({ fill: c }));
            _self.resize();
            _self.resize();
        };

        function submitChanges() {
            //broadcast
            var textPkg = { type: "onNodeTextChanged", data: { id: _self._.options.id, text: _self._.options.text, fontSize: _self._.options.fontSize, fontColor: _self._.options.foregroundColor} };
            if (_self._.slate.collab) _self._.slate.collab.send(textPkg);
            if (_self._.slate.birdseye) _self._.slate.birdseye.nodeChanged(textPkg);
        };

        _self.resize = function () {
            var _text = _self._.text;

            var _xPad = 20;
            var _yPad = 20;

            if (_self._.options.vectorPath === "ellipse") {
                _xPad = 30;
                _yPad = 30;
            }

            var _shim = false;
            if (_text.attr("text") === " ") { _text.attr("text", "."); _shim = true; }

            var ts = _text.getBBox();

            if (_shim) _text.attr("text", " ");

            var _rsWidth = ts.width + _xPad
                , _rsHeight = ts.height + _yPad
                , _rsX = ts.x - _xPad / 2
                , _rsY = ts.y - _yPad / 2
                , _rscX = ts.x + (_self._.options.width / 2) - _xPad / 2
                , _rscY = ts.y + (_self._.options.height / 2) - _yPad / 2;

            if (_rsWidth < _self._.options.width) {
                _rsWidth = _self._.options.width;
                _rsX = _self._.options.xPos;
                _rscX = _self._.options.xPos;
            }

            if (_rsHeight < _self._.options.height) {
                _rsHeight = _self._.options.height;
                _rsY = _self._.options.yPos;
                _rscY = _self._.options.yPos;
            }

            var att = _self._.vect.type == "rect" ? { x: _rsX, y: _rsY} : { cx: _rscX, cy: _rscY };
            var wdt = _self._.vect.type == "rect" ? { width: _rsWidth, height: _rsHeight} : { rx: _rsWidth / 2, ry: _rsHeight / 2 };
            $s.extend(att, wdt);

            _self._.vect.attr(att);
            _self._.options.xPos = _rsX;
            _self._.options.width = _rsWidth;
            _self._.options.yPos = _rsY;
            _self._.options.height = _rsHeight;

            _self._.link.attr(_self._.linkCoords());
        };

        _self.end = function () {
            _self.editing = false;
            _self._.unmark();
            if (_ntfy && _ntfy.visible()) submitChanges();
            _ntfy && _ntfy.closeMessage();

            if (cursor) {
                cursor.remove();
                cursor = null;
            }
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
(function ($s, $n) {
    $n.fn._images = function () {
        var _self = this, _ntfy, options, _searchType = 'image';
        _self.imagesearching = false;
        _self.start = function (_options) {
            _self.imagesearching = true;
            _self._.slate.nodes.closeAllMenus();

            options = {
                searchPatterns: true
                , searchImages: true
                , imageUrl: '/Images?query={query}&size={size}&rpp={rpp}&page={page}'
                , patternUrl: 'http://www.colourlovers.com/api/patterns?keywords={query}&orderCol=score&sortBy=DESC&numResults={rpp}&resultOffset={page}&jsonCallback=?'
                , size: 'Small'
                , isColor: true
                , paging: { rpp: 4, page: 0, total: 0 }
            };

            $s.extend(options, _options || {});

            var origImage;
            _ntfy = new Notify().message({
                hgt: 185
                , duration: 200
                , className: 'embedBar'
                , delayClose: 0
                , spinner: null
                , hideClose: false
                , popFromBottom: true
                , onOpen: function (container, _ntfy) {

                    container.innerHTML = "<div style='width:900px;'>" +
                                            "<div id='embedDivAction' style='float:left;width:260px;'>" +
                                                "<span style='font-size:20pt;' id='spnEmbedAction'>Search</span> (to embed in node)<br/>" +
                                                "<span style='display:none;font-size:20pt;color:#ccc;' id='embedUrlPrefix'>http://</span><input type='text' id='txtSearch' style='width:170px;font-size:20pt;'/>" +
                                                "&nbsp;<button id='btnImageSearch' style='font-size:20pt;'>go</button>" +
                                                "<div id='imgShowSize' style='padding-top:10px'>" +
                                                    "<span id='lblImageSize' style='font-size:12pt;'>Size</span> " +
                                                    "<select id='ddlImageSize'>" +
                                                        "<option>Icon</option>" +
                                                        "<option selected>Small</option>" +
                                                        "<option>Medium</option>" +
                                                        "<option>Large</option>" +
                                                        "<option>All</option>" +
                                                    "</select>" +
                                                    "<label for='chkAsUrl' style='cursor:pointer'><input type='checkbox' id='chkAsUrl' />Provide URL</label>" +
                                                "</div>" +
                                                "<div style='padding-top:10px;font-size:12pt;'><label for='radioImage' style='cursor:pointer;'>" +
                                                    "<input type='radio' id='radioImage' name='imageSearchType' checked/>" +
                                                    "images" +
                                                "</label>" +
                                                "<label for='radioPattern' style='cursor:pointer;display:none;'>" +
                                                    "<input type='radio' id='radioPattern' name='imageSearchType'/>" +
                                                    "patterns" +
                                                "</label>" +
                                                "&nbsp;[<a href='javascript:' id='lnkClearImage'>clear</a>]" +
                                                "</div>" +
                                            "</div>" +
                                            "<div style='float:left;width:30px;visibility:hidden;margin-right:-10px;margin-left:-10px;font-size:40pt;cursor:pointer;' id='lnkSearchBack' class='imgChanger'> < </div>" +
                                            "<div style='float:left;width:470px;' id='imgResults'></div>" +
                                            "<div style='float:left;width:30px;visibility:hidden;margin-right:-10px;margin-left:-10px;font-size:40pt;cursor:pointer;' id='lnkSearchForward' class='imgChanger'> > </div>" +
                                        "</div>";

                    origImage = _self._.options.image;
                    $s.el("ddlImageSize").value = options.size;

                    $s.el("txtSearch").focus();
                    _self._.mark();

                    $s.addEvent($s.el("txtSearch"), "keypress", function (e) {
                        if ($s.getKey(e) === 13) {
                            if ($s.el("chkAsUrl").checked) {
                                bindURL();
                            } else {
                                bindResults();
                                options.paging.page = 0;
                                options.paging.total = 0;
                            }
                        }
                    });

                    $s.addEvent($s.el("txtSearch"), "focus", function (e) {
                        this.select();
                    });

                    $s.addEvent($s.el("btnImageSearch"), "click", function (e) {
                        if ($s.el("chkAsUrl").checked) {
                            bindURL();
                        } else {
                            bindResults();
                            options.paging.page = 0;
                            options.paging.total = 0;
                        }
                        return $s.stopEvent(e);
                    });

                    $s.addEvent($s.el("lnkSearchForward"), "click", function (e) {
                        options.paging.page++;
                        bindResults();
                        return $s.stopEvent(e);
                    });

                    $s.addEvent($s.el("lnkSearchBack"), "click", function (e) {
                        options.paging.page--;
                        bindResults();
                        return $s.stopEvent(e);
                    });

                    $s.addEvent($s.el("lnkClearImage"), "click", function (e) {
                        _set('', 50, 50);
                    });

                    $s.addEvent($s.el("radioPattern"), "click", function (e) {
                        if ($s.el("chkAsUrl").checked) {
                            $s.el("chkAsUrl").checked = false;
                            shrinkBox(function () {
                                $s.el("imgShowSize").style.visibility = 'hidden';
                            });
                        } else {
                            $s.el("imgShowSize").style.visibility = 'hidden';
                        }
                    });

                    $s.addEvent($s.el("radioImage"), "click", function (e) {
                        $s.el("imgShowSize").style.visibility = 'visible';
                    });

                    $s.addEvent($s.el("chkAsUrl"), "click", function (e) {
                        if (this.checked) {
                            $s.el("ddlImageSize").style.visibility = 'hidden';
                            $s.el("lblImageSize").style.visibility = 'hidden';
                            $s.el("embedUrlPrefix").style.display = "inline";
                            $s.el("spnEmbedAction").innerHTML = "Provide URL";
                            $s.each($s.select("div.imgChanger"), function () {
                                this.style.display = 'none';
                            });
                            $s.el("imgResults").style.display = "none";
                            $s.el("embedDivAction").style.width = "850px";
                            emile($s.el("txtSearch"), "width:600px", {
                                duration: 500
                                , after: function () {
                                    $s.el("txtSearch").setAttribute("placeholder", "provide the url to your image");
                                }
                            });
                        } else {
                            shrinkBox();
                        }
                    });

                    $s.each($s.select("div.imgChanger"), function () {
                        $s.addEvent(this, "mouseover", function (e) {
                            this.style.color = '#fff';
                        });
                        $s.addEvent(this, "mouseout", function (e) {
                            this.style.color = '#000';
                        });
                    });
                }
            });
        };

        var isp = function () {
            return $s.el("radioPattern").checked;
        };

        function shrinkBox(cb) {
            emile($s.el("txtSearch"), "width:170px", {
                duration: 500
                , after: function () {
                    $s.el("ddlImageSize").style.visibility = 'visible';
                    $s.el("lblImageSize").style.visibility = 'visible';
                    $s.el("embedUrlPrefix").style.display = "none";
                    $s.el("spnEmbedAction").innerHTML = "Search";
                    $s.each($s.select("div.imgChanger"), function () {
                        this.style.display = 'block';
                    });
                    $s.el("imgResults").style.display = "block";
                    $s.el("embedDivAction").style.width = "260px";

                    $s.el("txtSearch").removeAttribute("placeholder");

                    if ($s.isFunction(cb)) cb.apply(this);
                }
            });
        };

        function bindURL() {
            var u = ["http://", $s.el("txtSearch").value.replace('http://', '')].join('');
            $s.imageExists(u, function (w, h) {
                _set(u, w, h);
            });

            setTimeout(function () {
                if (_self._.options.image !== u) {
                    alert("Sorry, that image could not be loaded.");
                }
            }, 2000);
        };

        function bindResults() {
            hideNav();
            var _size = "Size:" + $s.el("ddlImageSize").value;
            if ($s.el("ddlImageSize").value === "Icon") {
                _size = "Size:Width:64&Image.Filters=Style:Graphics&Image.Filters=Face:Other";
            } else if ($s.el("ddlImageSize").value === "All") {
                _size = "";
            }

            var _url = options.imageUrl
                        .replace(/{query}/gi, $s.el("txtSearch").value)
                        .replace(/{size}/gi, _size)
                        .replace(/{rpp}/gi, options.paging.rpp)
                        .replace(/{page}/gi, (options.paging.page * options.paging.rpp))

            if (isp()) {
                _url = options.patternUrl
                        .replace(/{query}/gi, $s.el("txtSearch").value)
                        .replace(/{rpp}/gi, options.paging.rpp)
                        .replace(/{page}/gi, options.paging.page);
            }

            var _template = "<div style='float:left;cursor:pointer;border:1px solid transparent;padding:5px;height:150px;overflow:hidden;' class='searchImage' rel='{url}|{width}|{height}'><div style='width:100px;height:125px;text-align:center;'><img src='{thumb}' title='{title}' alt='{title}' style='width:{imgWidth}px;height:{imgHeight}px;'/></div><div style='text-align:center;'>{width} x {height}</div></div>";
            var _results = '';

            var objs = [];
            if (isp()) {
                $s.getJSON(_url, function (context, data) {
                    objs = context;
                    if (!objs) objs = [];
                    options.paging.total = ((options.paging.page * options.paging.rpp) + context.length + 1);

                    $s.each(objs, function () {
                        var _title = this.title;
                        var _thumb = this.imageUrl;
                        var _url = this.imageUrl;
                        var _width = 75;
                        var _height = 75;

                        if ($s.el("ddlImageSize").value === "Icon") _imgSize = 64;
                        _results += _template.replace(/{url}/gi, _url).replace(/{thumb}/gi, _thumb).replace(/{imgSize}/gi, _imgSize).replace(/{title}/gi, _title).replace(/{width}/gi, _width).replace(/{height}/gi, _height);
                    });
                    setResults(objs, _results);
                });
            } else {
                $s.ajax(_url, function (respText, resp) {
                    var pkg = JSON.parse(respText);
                    objs = pkg.results;
                    if (pkg.__next !== "") { options.paging.total = (options.paging.page + 2) * options.paging.rpp; }
                    $s.each(objs, function () {
                        var _title = this.Title;
                        var _thumb = this.Thumbnail.MediaUrl;
                        var _url = this.MediaUrl;
                        var _width = parseInt(this.Width);
                        var _height = parseInt(this.Height);
                        _results += _template.replace(/{url}/gi, _url).replace(/{thumb}/gi, _thumb).replace(/{imgWidth}/gi, this.Thumbnail.Width).replace(/{imgHeight}/gi, this.Thumbnail.Height).replace(/{title}/gi, _title).replace(/{width}/gi, _width).replace(/{height}/gi, _height);
                    });
                    setResults(objs, _results);
                });
            }
        };

        function setResults(objs, _results) {
            if (objs.length === 0) {
                $s.el("imgResults").innerHTML = "<div style='font-size:20pt;color:#fff;margin-top:20px;'>There are no results!</div>";
            } else {
                $s.el("imgResults").innerHTML = _results;
                setNav();
                setImageSelect();
            }
        };

        function setImageSelect() {
            $s.each($s.select("div.searchImage"), function () {
                $s.addEvent(this, "click", function (e) {
                    var _sel = this.getAttribute("rel").split('|');
                    var img = _sel[0], w = parseInt(_sel[1]), h = parseInt(_sel[2]);
                    _set(img, w, h);
                });
                $s.addEvent(this, "mouseover", function (e) {
                    this.style.border = "1px solid #ccc";
                    this.style.backgroundColor = '#333';
                    this.style.color = '#fff'
                });
                $s.addEvent(this, "mouseout", function (e) {
                    this.style.border = "1px solid transparent";
                    this.style.backgroundColor = 'transparent';
                    this.style.color = '#000'
                });
            });
        };

        function _set(img, w, h) {
            _self.set(img, w, h);
            _self._.mark();

            var _pkg = { type: 'onNodeImageChanged', data: { id: _self._.options.id, img: _self._.options.image, w: _self._.options.width, h: _self._.options.height} };
            _self._.slate.birdseye && _self._.slate.birdseye.nodeChanged(_pkg);
            _self._.slate.collab && _self._.slate.collab.send(_pkg);
        };

        function hideNav() {
            $s.el("lnkSearchForward").style.visibility = 'hidden';
            $s.el("lnkSearchBack").style.visibility = 'hidden';
        };

        function setNav() {
            if (((options.paging.page + 1) * options.paging.rpp) < options.paging.total) {
                $s.el("lnkSearchForward").style.visibility = 'visible';
            }
            if (options.paging.page > 0) {
                $s.el("lnkSearchBack").style.visibility = 'visible';
            }
        };

        _self.end = function () {
            _self.imagesearching = false;
            _self._.unmark();
            _ntfy && _ntfy.closeMessage();
        };

        _self.set = function (img, w, h) {
            _self._.options.image = img;
            sz = { "fill": "url(" + _self._.options.image + ")", "stroke-width": _self._.options.borderWidth, "stroke": "#000" };

            if (_self._.options.width < w || !_self._.options.text) {
                _self._.options.width = w;
                var asz = _self._.vect.type == "rect" ? { width: w} : { rx: w / 2 };
                $s.extend(sz, asz);
            }

            if (_self._.options.height < h || !_self._.options.text) {
                _self._.options.height = h;
                var asz = _self._.vect.type == "rect" ? { height: h} : { ry: h / 2 };
                $s.extend(sz, asz);
            }

            _self._.vect.attr(sz);
            _self._.relationships.refresh();
            _self._.connectors && _self._.connectors.remove();
            _self._.resize && _self._.resize.hide();
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
(function ($s, $n) {
    $n.fn._links = function () {
        var _self = this, _ntfy;

        var options = {
            thumbUrl: '/Thumbnail'
            , existenceUrl: '/UrlExists'
        };

        _self.start = function (_options) {
            _self._.slate.nodes.closeAllMenus();

            $s.extend(options, (_options || {}));

            _ntfy = new Notify().message({
                hgt: 185
                , duration: 200
                , className: 'embedBar'
                , delayClose: 0
                , spinner: null
                , hideClose: false
                , popFromBottom: true
                , onOpen: function (container, _ntfy) {
                    _self._.slate.unglow();
                    container.innerHTML = "<div style='width:900px;'>" +
                                            "<div id='linkForm'><div id='provideUrlPlaceholder' style='height:75px;width:900px;'>" +
                                                "<span style='font-size:20pt;' id='spnEmbedAction'>Provide an external link (will always open in a new window)</span><br/>" +
                                                "<span style='font-size:20pt;color:#ccc;' id='embedUrlPrefix'>http://</span>" +
                                                "<input type='text' id='txtUrl' style='width:450px;font-size:20pt;'/>" +
                                                "&nbsp;<button id='btnApply' style='font-size:20pt;'>go</button>&nbsp;<button id='btnRemove' style='font-size:20pt;visibility:hidden;'>remove</button>" +
                                            "</div>" +
                                            "<div id='messagePlaceholder' style='display:none;height:75px;font-size:20pt;width:900px;'></div>" +
                                            "<div style='margin-top:10px;padding:3px;width:800px;height:63px;font-size:14pt;'>WHERE do you want to link to?" +
                                                "<div style='border-top:1px dashed #ccc;padding:5px;font-size:12pt;'>" +
                                                    "<label for='radioLinkUrl' style='float:left;cursor:pointer;'>" +
                                                        "<input type='radio' id='radioLinkUrl' name='linkType' checked/>" +
                                                        "an EXTERNAL website" +
                                                    "</label>" +
                                                    "<label for='radioLinkSlate' style='float:left;margin-left:15px;cursor:pointer;'>" +
                                                        "<input type='radio' id='radioLinkSlate' name='linkType'/>" +
                                                        "a node on THIS slate" +
                                                    "</label>" +
                                                    "<label for='radioLinkExternalSlate' style='margin-left:15px;float:left;cursor:pointer;display:none;'>" +
                                                        "<input type='radio' id='radioLinkExternalSlate' name='linkType' disabled/>" +
                                                        "a DIFFERENT slate<br/>(coming soon)" +
                                                    "</label>" +
                                                "</div>" +
                                            "</div></div><div id='processForm' style='font-size:20pt;'></div>" +
                                        "</div>";

                    _self._.link.hide();
                    $s.el("txtUrl").focus();
                    _self._.mark();

                    if (_self._.options.link && _self._.options.link.show) {
                        $s.el("btnRemove").style.visibility = "visible";
                    }

                    $s.addEvent($s.el("btnRemove"), "click", function (e) {
                        _self.unset();
                        var pkg = { type: 'onNodeLinkRemoved', data: { id: _self._.options.id} };
                        if (_self._.slate.collab) _self._.slate.collab.send(pkg);
                        return $s.stopEvent(e);
                    });

                    $s.addEvent($s.el("txtUrl"), "keypress", function (e) {
                        if ($s.getKey(e) === 13) {
                            bindURL();
                        }
                    });

                    $s.addEvent($s.el("txtUrl"), "focus", function (e) {
                        this.select();
                    });

                    $s.addEvent($s.el("btnApply"), "click", function (e) {
                        bindURL();
                        return $s.stopEvent(e);
                    });

                    $s.addEvent($s.el("radioLinkUrl"), "click", function (e) {
                        removeInternalLinking();
                        $s.el("provideUrlPlaceholder").style.display = "block";
                        $s.el("messagePlaceholder").style.display = "none";
                    });

                    $s.addEvent($s.el("radioLinkSlate"), "click", function (e) {
                        _self._.slate.options.linking = {
                            onNode: function (node) {
                                _self.set('currentSlate', node.options.id, true);
                                var pkg = { type: 'onNodeLinkAdded', data: { id: _self._.options.id, linkType: 'currentSlate', linkData: node.options.id} };
                                if (_self._.slate.collab) _self._.slate.collab.send(pkg);

                                _ntfy && _ntfy.resize(50, 300, function () {
                                    _ntfy.changeMessage("You've set the link! Returning you to your original node in a moment...");
                                    setTimeout(function () {
                                        _self._.position('center', function () {
                                            //back
                                            _ntfy.changeMessage("The connection is all set!");
                                            setTimeout(function () { _ntfy && _ntfy.closeMessage(); }, 1500);
                                        }, 'swingFromTo', 1500);
                                    }, 2000);
                                });
                                removeInternalLinking();
                            }
                        };
                        $s.el("provideUrlPlaceholder").style.display = "none";
                        $s.el("messagePlaceholder").style.display = "block";
                        $s.el("messagePlaceholder").innerHTML = "Scroll the slate to the node you'd like to link to and click it.";
                    });

                    $s.addEvent($s.el("radioLinkExternalSlate"), "click", function (e) {
                        _self._.slate.options.linking = {
                            onSlate: function (slate) {

                            }
                        };
                        $s.el("provideUrlPlaceholder").style.display = "none";
                        $s.el("messagePlaceholder").style.display = "block";
                        $s.el("messagePlaceholder").innerHTML = "Select the slate that you'd like to link to using the menu above.";
                    });
                }
                , onClose: function () {
                    if (_self._.options.link.show) {
                        _self._.link.show();
                    }
                }
            });
        };

        function removeInternalLinking() {
            _self._.slate.options.linking = null;
        };

        function checkUrlExistence(u, cb) {
            var pkg = JSON.stringify({ Url: u });

            $s.el("btnApply").setAttribute("disabled", "disabled");
            $s.el("btnApply").innerHTML = "Checking...";

            $s.ajax(options.existenceUrl, function (respText, resp) {
                var _getUrl = JSON.parse(respText);
                $s.el("btnApply").removeAttribute("disabled", "disabled");
                $s.el("btnApply").innerHTML = "go";
                cb.apply(this, [_getUrl.exists]);
            }, pkg, 'POST');
        }

        function bindURL() {
            var u = $s.el("txtUrl").value.replace(/http:\/\//gi, '');
            checkUrlExistence(u, function (exists) {
                if (exists !== true) {
                    alert("Sorry but " + u + " doesn't look to be a valid URL. Please check it!");
                } else {
                    _self.set('externalUrl', u, true);
                    var pkg = { type: 'onNodeLinkAdded', data: { id: _self._.options.id, linkType: 'externalUrl', linkData: u} };
                    if (_self._.slate.collab) _self._.slate.collab.send(pkg);
                }
            });
        };

        _self.end = function () {
            _self._.unmark();
            _self._.slate.unglow();
            _ntfy && _ntfy.closeMessage();
        };

        _self.set = function (type, data, prepare) {
            if (!_self._.options.link) _self._.options.link = {};
            if (!_self._.options.link.thumbnail) _self._.options.link.thumbnail = { width: 175, height: 175 };

            switch (type) {
                case 'externalUrl':
                    $s.extend(_self._.options.link, { type: type, data: data, show: true });
                    if (prepare === true) {
                        $s.el("linkForm").style.display = 'none';
                        $s.el("processForm").style.display = 'block';
                        $s.el("processForm").innerHTML = "<div style='margin-top:-3px;float:left;'><span id='spanFetchThumb'></span></div><div style='margin-left:10px;float:left;margin-top:0px;font-size:14pt;'>Fetching URL Thumbnail (it only takes this long the first time)...</div>";

                        _ntfy && _ntfy.resize(50, 300, function () {
                            if ($s.el("spanFetchThumb") !== null)
                                var _spinner = new spinner("spanFetchThumb", 8, 16, 15, 1, "#fff");
                        });

                        var thumbpkg = JSON.stringify({ Url: _self._.options.link.data, Width: _self._.options.link.thumbnail.width, Height: _self._.options.link.thumbnail.height });
                        $s.ajax(options.thumbUrl, function (respText, resp) {
                            var _getUrl = JSON.parse(respText);
                            $s.imageExists(_getUrl.url, function (loaded, w, h) {
                                _self._.link.show();
                                _self.end();
                            });
                        }, thumbpkg, "POST");
                    } else {
                        _self._.link.show();
                    }
                    break;
                case 'currentSlate':
                    $s.extend(_self._.options.link, { type: type, data: data, show: true });
                    break;
                case 'externalSlate':
                    break;

            }

        };

        _self.unset = function () {
            $s.extend(_self._.options.link, { type: '', data: '', show: false });
            _self._.link.hide();
            _self.end();
        };

        _self.processEvent = function () {
            switch (_self._.options.link.type) {
                case "externalUrl":
                    var surl = _self._.options.link.data.length > 20 ? _self._.options.link.data.substring(0, 20) + "..." : _self._.options.link.data;
                    var _msg = surl;
                    _self._.link.tooltip({ type: 'image', msg: _msg }, _self._.options.link.thumbnail.width, _self._.options.link.thumbnail.height);
                    var thumbpkg = JSON.stringify({ Url: _self._.options.link.data, Width: _self._.options.link.thumbnail.width, Height: _self._.options.link.thumbnail.height });
                    $s.ajax(options.thumbUrl, function (respText, resp) {
                        var _getUrl = JSON.parse(respText);
                        if (_getUrl.url !== "") {
                            $s.imageExists(_getUrl.url, function (loaded, w, h) {
                                _self._.link.tt[0].attr({ "fill": "url(" + _getUrl.url + ")" });
                            });
                        }
                    }, thumbpkg, 'POST');
                    break;
                case "externalSlate":
                    break;
                case "currentSlate":
                    _self._.slate.addtip(_self._.link.tooltip({ type: 'text', msg: "Jump to another node" }, 140, 23));
                    break;
            }
        };

        _self.wireEvents = function () {
            _self._.link.mouseover(function (e) {
                _self._.slate.glow(_self._.link);
                _self.processEvent();
                $s.stopEvent(e);
            });

            _self._.link.mouseout(function (e) {
                _self._.slate.unglow();
                switch (_self._.options.link.type) {
                    case 'externalUrl':
                        _self._.link.untooltip();
                        break;
                    case "currentSlate":
                        _self._.slate.untooltip();
                        break;
                }
                $s.stopEvent(e);
            });

            _self._.link.click(function (e) {
                switch (_self._.options.link.type) {
                    case "externalUrl":
                        window.open(["http://", _self._.options.link.data].join(""), 'sb_external');
                        break;
                    case "externalSlate":
                        break;
                    case "currentSlate":
                        var n = _self._.slate.nodes.one(_self._.options.link.data),
                            _vpt = n.vect.getBBox(), zr = _self._.slate.options.viewPort.zoom.r;

                        n.position('center', function () {
                            n.mark();
                        }, 'swingFromTo', 2000);

                        break;
                }
                $s.stopEvent(e);
            });
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
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

        function loadParent(r, _x, _y) {

            _isOpen = true;

            //menu parent
            var _menuParent = r.rect(_x, _y, 295, 80, 10).attr({ "fill": "90-#ccc-#eee" });
            _menuParent.node.style.cursor = "pointer";
            _m.push(_menuParent);

            //toolbar -- connector, editor, deleter
            _self._.toolbar.show(_x, _y, _m);

            //color picker
            _self._.colorpicker.show(_x, _y, _m);

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
(function ($s, $n) {
    $n.fn._relationships = function () {
        var _self = this;
        _self.parents = [];
        _self.children = [];
        _self.associations = [];

        var _isLastCtrl = false, _isLastShift = false;

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
            var _na = new Array();
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

                    _isLastCtrl = _self._.slate.isCtrl;
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
            if (!_self._.slate.isCtrl || (_self._.slate.isCtrl && _self._.slate.isShift)) {
                _.each(node.relationships.associations, function(a) {
                    if (a.child.options.id !== _self._.options.id && a.child.options.id !== node.options.id) {
                        cb && cb(a.child, a);
                        if (_self._.slate.isCtrl && _self._.slate.isShift) {
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
                        , isCtrl: _isLastCtrl
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
            if (_self._.slate.isCtrl && _self._.slate.isShift) _visibility("hide");
        };

        _self.showAll = function () {
            if (_self._.slate.isCtrl && _self._.slate.isShift) _visibility("show");
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
            if (_self._.slate.options.enabled)
                _self._.slate.options.viewPort.allowDrag = true;
            _self._.slate.unglow();
            _self._.slate.keyboard && _self._.slate.keyboard.end();
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
(function ($s, $n) {
    $n.fn._resize = function () {
        var _self = this, resize;

        _self.show = function (x, y) {
            var r = _self._.slate.paper;
            resize = r.resize("/packages/slatebox/lib/client/images/2_lines.png").transform(["t", x - 5, ",", y - 5].join()).attr({ fill: "#fff", "stroke": "#000" });

            resize.mouseover(function (e) {
                resize.attr({ cursor: 'nw-resize' });
            });

            resize.drag(move, start, up);

            return resize;
        };

        _self.hide = function (r) {
            resize && resize.remove();
        };

        var _minWidth = 10, _minHeight = 10, _dragAllowed = false, _origWidth, _origHeight;
        var start = function () {
            _self._.slate.multiselection && _self._.slate.multiselection.end();
            this.ox = this.attr("x");
            this.oy = this.attr("y");

            _self._.setStartDrag();
            _self._.connectors.remove();

            _dragAllowed = _self._.slate.options.viewPort.allowDrag;
            _self._.slate.disable();

            if (_self._.options.text !== " ") {
                var mm = _self._.text.getBBox();
                _minWidth = mm.width + 10;
                _minHeight = mm.height + 10;
            }

            _origWidth = _self._.options.width;
            _origHeight = _self._.options.height;
        },
        move = function (dx, dy) {

            var _zr = _self._.slate.options.viewPort.zoom.r;
            dx = dx + ((dx / _zr) - dx);
            dy = dy + ((dy / _zr) - dy);

            var _transWidth = _origWidth + dx;
            var _transHeight = _origHeight + dy;

            if (_transWidth > _minWidth)
                this.attr({ x: this.ox + dx });

            if (_transHeight > _minHeight)
                this.attr({ y: this.oy + dy });

            if (_self._.events && $s.isFunction(_self._.events.onResizing)) {
                _self._.events.onResizing.apply(this, [_transWidth, _transHeight]);
            }

            _self.set(_transWidth, _transHeight);
        },
        up = function () {
            _self._.slate.enable();
            resize.remove();
            _self._.setEndDrag();
            //_self._.relationships.wireHoverEvents();

            if (_self._.events && $s.isFunction(_self._.events.onResized)) {
                _self._.events.onResized.apply(this, [_self.send]);
            } else {
                _self.send();
            }
        };

        _self.send = function () {
            //broadcast change to birdseye and collaborators
            var pkg = { type: 'onNodeResized', data: { id: _self._.options.id, height: _self._.options.height, width: _self._.options.width} };
            _self._.slate.birdseye && _self._.slate.birdseye.nodeChanged(pkg);
            _self._.slate.collab && _self._.slate.collab.send(pkg);
        };

        _self.set = function (width, height, dur, easing, callback) {
            var natt = {}, tatt = {}, latt = {}, bb = _self._.vect.getBBox();
            if (!dur) dur = 0;
            if (width > _minWidth) {
                var watt = _self._.vect.type == "rect" ? { width: width} : { rx: width / 2 };
                if (dur === 0)
                    _self._.vect.attr(watt);
                else
                    natt = watt;

                var tx = bb.x + (width / 2), lx = bb.x - 5;

                if (_self._.options.vectorPath === "ellipse") {
                    tx = _self._.vect.attr("cx");
                    lx = _self._.vect.attr("cx") + (width / 2);
                }

                if (dur === 0) {
                    _self._.text.attr({ x: tx });
                    //console.log("setting link x: " + lx);
                    //_self._.link.attr({ x: lx });
                } else {
                    tatt = { x: tx };
                    latt = { x: lx };
                }

                _self._.options.width = width;
            }

            if (height > _minHeight) {
                var hatt = _self._.vect.type == "rect" ? { height: height} : { ry: height / 2 };
                if (dur === 0)
                    _self._.vect.attr(hatt);
                else
                    natt = $s.extend(natt, hatt);

                var ty = bb.y + (height / 2);
                if (_self._.options.vectorPath === "ellipse") {
                    ty = _self._.vect.attr("cy");
                }

                if (dur === 0) {
                    _self._.text.attr({ y: ty });
                    //_self._.link.attr({ y: ty });
                    //console.log("setting link y: " + ty);
                } else {
                    $s.extend(tatt, { y: ty });
                    $s.extend(latt, { y: ty });
                }

                _self._.options.height = height;
            }

            if (dur > 0) {
                _self._.text.animate(tatt, dur);
                _self._.link.hide();

                var onAnimate = function () {
                    if (_self._.slate) _self._.relationships.refresh();
                };

                eve.on("raphael.anim.frame.*", onAnimate);
                _self._.vect.animate(natt, dur, easing, function () {
                    var lc = _self._.linkCoords();
                    _self._.link.transform(["t", lc.x, ",", lc.y, "s", ".8", ",", ".8", "r", "180"].join());
                    if (_self._.options.link.show) _self._.link.show();
                    _self._.relationships.refresh();
                    eve.unbind("raphael.anim.frame.*", onAnimate);
                    callback && callback.apply(this, [_self._]);
                });

            } else {
                var lc = _self._.linkCoords();
                _self._.link.transform(["t", lc.x, ",", lc.y, "s", ".8", ",", ".8", "r", "180"].join());
                _self._.relationships.refresh();
            }
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
; (function ($s, $n) {
    $n.fn._shapes = function () {
        var _self = this, hover = "", changer;

        _self.show = function (x, y, _m) {
            x = x + 10;
            var _r = _self._.slate.paper;
            var _s = { fill: "#fff", stroke: "#000", "stroke-width": 1 };
            var shapes = [
                _r.rect(x + 16, y + 43, 30, 30).attr(_s)
                , _r.rect(x + 56, y + 43, 30, 30, 5).attr(_s)
                , _r.ellipse(x + 110, y + 58, 16, 16).attr(_s)
            ];

            $s.each(shapes, function () {
                this.mouseover(function (e) {
                    _self._.slate.glow(this);
                });
                this.mouseout(function (e) {
                    _self._.slate.unglow();
                });
                this.mousedown(function (e) {
                    if (this.type !== _self._.options.vectorPath) {
                        var pkg = { type: 'onNodeShapeChanged', data: { id: _self._.options.id, shape: this.type, rx: this.attr("rx") } };
                        _self.set(pkg.data);
                        _self._.slate.collab && _self._.slate.collab.send(pkg);
                        _self._.slate.birdseye && _self._.slate.birdseye.nodeChanged(pkg);
                    }
                });
                _m.push(this);
            });
        };

        _self.set = function(pkg) {
            _self._.vect.remove();
            var _r = _self._.slate.paper;
            var vectOpt = { fill: _self._.options.backgroundColor, "stroke-width": _self._.options.borderWidth, "stroke": "#000" };
            if (_self._.options.image && _self._.options.image !== "") vectOpt.fill = "url(" + _self._.options.image + ")";
            var _x = _self._.options.xPos, _y = _self._.options.yPos, 
                _width = _self._.options.width, _height = _self._.options.height;
            switch (pkg.shape) {
                case "ellipse":
                    if (_self._.options.vectorPath !== "ellipse") {
                        _self._.options.vectorPath = "ellipse";
                        _self._.vect = _r.ellipse(_x + _width / 2, _y + _height / 2, (_width / 2), (_height / 2)).attr(vectOpt);
                        _self._.options.xPos += _width / 2;
                        _self._.options.yPos += _height / 2;
                    }
                    break;
                case "rect":
                    if (_self._.options.vectorPath === "ellipse") {
                        _self._.options.xPos -= _width / 2;
                        _self._.options.yPos -= _height / 2;
                        _x = _self._.options.xPos;
                        _y = _self._.options.yPos;
                    }
                    _self._.options.vectorPath = pkg.rx > 0 ? "roundedrectangle" : "rectangle";
                    _self._.vect = _r.rect(_x, _y, _width, _height, pkg.rx > 0 ? 10 : 0).attr(vectOpt);
                    break;
            }
            _self._.text.toFront();
            _self._.link.toFront();
            _self._.relationships.wireHoverEvents();
            _self._.relationships.wireDragEvents();

            //needed for tofront and toback ops of the context menu
            _self._.vect.data({id: _self._.options.id});
            _self._.context.init();
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
(function ($s, $n) {
    $n.fn._template = new function() {
        var _self = this;

        _self.hello = function () { alert(parent.options.name); }

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
(function ($s, $n) {
    $n.fn._toolbar = function () {
        var _self = this;
        _self.show = function (x, y, _m) {
            var y = y + 1;
            var _r = _self._.slate.paper;

            //build toolbar
            var cOptions = { fill: "#eee", stroke: "#333" }
            var cs = 14, cm = 16

            toolbar = [
                _r.handle().data({ msg: 'Connect To Node', width: 110 }).attr({ fill: "90-#999-#ccc", stroke: "#333", "stroke-width": 2 }).transform(["t", x, ",", y, "s", ".85", ".85"].join())
                , _r.deleter().data({ msg: 'Delete', width: 60 }).attr({ fill: "90-#999-#ccc", stroke: "#333", "stroke-width": 2 }).transform(["t", (x + 30), ",", y, "s", ".85", ".85"].join())
                , _r.editor().data({ msg: 'Edit Text', width: 70 }).attr({ fill: "90-#999-#ccc", stroke: "#333", "stroke-width": 2 }).transform(["t", (x + 60), ",", y, "s", ".85", ".85"].join())
                , _r.searcher().data({ msg: 'Embed Image', width: 90 }).attr({ fill: "90-#999-#ccc", stroke: "#333", "stroke-width": 2 }).transform(["t", (x + 90), ",", y, "s", ".85", ".85"].join())
                , _r.link().data({ msg: 'Add Link', width: 70 }).attr({ fill: "90-#999-#ccc", stroke: "#333", "stroke-width": 2 }).transform(["t", (x + 120), ",", y, "s", ".85", ".85"].join())
            ];

            $s.each(toolbar, function () {
                this.mouseover(function (e) {
                    _self._.slate.glow(this);
                    var _text = this.data("msg");
                    _self._.slate.addtip(this.tooltip({ type: 'text', msg: _text }, this.data("width"), this.data("height")));
                    $s.stopEvent(e);
                });
                this.mouseout(function (e) {
                    _self._.slate.unglow();
                    this.untooltip();
                    $s.stopEvent(e);
                });
            });

            for (t = 0; t < 5; t++)
                (function (t) {
                    $s.each(['mousedown'], function () {
                        toolbar[t][this](function (e) {
                            e.stopPropagation();
                            _self._.slate.unglow();
                            _self._.slate.untooltip();
                            if (_self._.events && $s.isFunction(_self._.events.onToolbarClick)) {
                                _self._.events.onToolbarClick.apply(this, [t]);
                            } else {
                                if (t === 0) { //connector
                                    _self._.relationships.initiateTempNode(e, _self._, true);
                                    _self._.menu.hide();
                                } else if (t === 1) {
                                    _self.del();
                                } else if (t === 2) {
                                    _self._.slate.stopEditing();
                                    //fire the editor
                                    _self._.position('center', function () {
                                        _self._.editor.start();
                                    });
                                } else if (t === 3) { //searcher
                                    //var mp = $s.mousePos(e);
                                    //mp.y = mp.y + 130; //adjust up
                                    _self._.slate.unMarkAll();
                                    _self._.slate.stopEditing();
                                    _self._.position('center', function () {
                                        _self._.images.start();
                                    });
                                } else if (t === 4) {
                                    //var mp = $s.mousePos(e);
                                    //mp.y = mp.y + 130; //adjust up

                                    _self._.slate.unMarkAll();
                                    _self._.slate.stopEditing();

                                    _self._.position('center', function () {
                                        _self._.links.start();
                                    });
                                }
                            }
                        });
                    });
                })(t);

            $s.each(toolbar, function () {
                _m.push(this);
            });
            return _self;
        };

        _self.del = function () {
            if (_self._.slate.nodes.allNodes.length <= 1) {
                alert("Sorry, this is the last node on the slate, you cannot delete this one!");
            } else {
                var s = _self._.slate;
                _self._.del();
                var delPkg = { type: 'onNodeDeleted', data: { id: _self._.options.id} };
                s.collab && s.collab.send(delPkg);
                s.birdseye && s.birdseye.nodeDeleted(delPkg);
            }
        };

        return _self;
    }
})(Slatebox, Slatebox.fn.node);
// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël 2.1.0 - JavaScript Vector Library                          │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)    │ \\
// │ Copyright © 2008-2012 Sencha Labs (http://sencha.com)              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license.│ \\
// └────────────────────────────────────────────────────────────────────┘ \\
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
            name = String(name);
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
        // Undocumented. Debug only.
        eve._events = events;
    /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt()` function will be called before `eatIt()`.
     *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
        name = String(name);
        if (typeof f != "function") {
            return function () {};
        }
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
     * Arguments that will be passed to the result function will be also
     * concated to the list of final arguments.
     | el.onclick = eve.f("click", 1, 2);
     | eve.on("click", function (a, b, c) {
     |     console.log(a, b, c); // 1, 2, [event object]
     | });
     > Arguments
     - event (string) event name
     - varargs (…) and any other arguments
     = (function) possible event handler function
    \*/
    eve.f = function (event) {
        var attrs = [].slice.call(arguments, 1);
        return function () {
            eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
        };
    };
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
    \*/
    eve.nts = function () {
        return current_event.split(separator);
    };
    /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
     * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
    \*/
    eve.off = eve.unbind = function (name, f) {
        if (!name) {
            eve._events = events = {n: {}};
            return;
        }
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            eve.unbind(name, f2);
            return f.apply(this, arguments);
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ "Raphaël 2.1.0" - JavaScript Vector Library                         │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define(["eve"], function( eve ) {
            return factory(glob, eve);
        });
    } else {
        // Browser globals (glob is window)
        // Raphael adds itself to window
        factory(glob, glob.eve);
    }
}(this, function (window, eve) {
    /*\
     * Raphael
     [ method ]
     **
     * Creates a canvas object on which to draw.
     * You must do this first, as all future calls to drawing methods
     * from this instance will be bound to this canvas.
     > Parameters
     **
     - container (HTMLElement|string) DOM element or its ID which is going to be a parent for drawing surface
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - all (array) (first 3 or 4 elements in the array are equal to [containerID, width, height] or [x, y, width, height]. The rest are element descriptions in format {type: type, <attributes>}). See @Paper.add.
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - onReadyCallback (function) function that is going to be called on DOM ready event. You can also subscribe to this event via Eve’s “DOMLoad” event. In this case method returns `undefined`.
     = (object) @Paper
     > Usage
     | // Each of the following examples create a canvas
     | // that is 320px wide by 200px high.
     | // Canvas is created at the viewport’s 10,50 coordinate.
     | var paper = Raphael(10, 50, 320, 200);
     | // Canvas is created at the top left corner of the #notepad element
     | // (or its top right corner in dir="rtl" elements)
     | var paper = Raphael(document.getElementById("notepad"), 320, 200);
     | // Same as above
     | var paper = Raphael("notepad", 320, 200);
     | // Image dump
     | var set = Raphael(["notepad", 320, 200, {
     |     type: "rect",
     |     x: 10,
     |     y: 10,
     |     width: 25,
     |     height: 25,
     |     stroke: "#f00"
     | }, {
     |     type: "text",
     |     x: 30,
     |     y: 40,
     |     text: "Dump"
     | }]);
    \*/
    function R(first) {
        if (R.is(first, "function")) {
            return loaded ? first() : eve.on("raphael.DOMload", first);
        } else if (R.is(first, array)) {
            return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            if (R.is(args[args.length - 1], "function")) {
                var f = args.pop();
                return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function () {
                    f.call(R._engine.create[apply](R, args));
                });
            } else {
                return R._engine.create[apply](R, arguments);
            }
        }
    }
    R.version = "2.1.0";
    R.eve = eve;
    var loaded,
        separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        g = {
            doc: document,
            win: window
        },
        oldRaphael = {
            was: Object.prototype[has].call(g.win, "Raphael"),
            is: g.win.Raphael
        },
        Paper = function () {
            /*\
             * Paper.ca
             [ property (object) ]
             **
             * Shortcut for @Paper.customAttributes
            \*/
            /*\
             * Paper.customAttributes
             [ property (object) ]
             **
             * If you have a set of attributes that you would like to represent
             * as a function of some number you can do it easily with custom attributes:
             > Usage
             | paper.customAttributes.hue = function (num) {
             |     num = num % 1;
             |     return {fill: "hsb(" + num + ", 0.75, 1)"};
             | };
             | // Custom attribute “hue” will change fill
             | // to be given hue with fixed saturation and brightness.
             | // Now you can use it like this:
             | var c = paper.circle(10, 10, 10).attr({hue: .45});
             | // or even like this:
             | c.animate({hue: 1}, 1e3);
             | 
             | // You could also create custom attribute
             | // with multiple parameters:
             | paper.customAttributes.hsb = function (h, s, b) {
             |     return {fill: "hsb(" + [h, s, b].join(",") + ")"};
             | };
             | c.attr({hsb: "0.5 .8 1"});
             | c.animate({hsb: [1, 0, 0.5]}, 1e3);
            \*/
            this.ca = this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = ('ontouchstart' in g.win) || g.win.DocumentTouch && g.doc instanceof DocumentTouch, //taken from Modernizr touch test
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        lowerCase = Str.prototype.toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object.prototype.toString,
        paper = {},
        push = "push",
        ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = Str.prototype.toUpperCase,
        availableAttrs = R._availableAttrs = {
            "arrow-end": "none",
            "arrow-start": "none",
            blur: 0,
            "clip-rect": "0 0 1e9 1e9",
            cursor: "default",
            cx: 0,
            cy: 0,
            fill: "#fff",
            "fill-opacity": 1,
            font: '10px "Arial"',
            "font-family": '"Arial"',
            "font-size": "10",
            "font-style": "normal",
            "font-weight": 400,
            gradient: 0,
            height: 0,
            href: "http://raphaeljs.com/",
            "letter-spacing": 0,
            opacity: 1,
            path: "M0,0",
            r: 0,
            rx: 0,
            ry: 0,
            src: "",
            stroke: "#000",
            "stroke-dasharray": "",
            "stroke-linecap": "butt",
            "stroke-linejoin": "butt",
            "stroke-miterlimit": 0,
            "stroke-opacity": 1,
            "stroke-width": 1,
            target: "_blank",
            "text-anchor": "middle",
            title: "Raphael",
            transform: "",
            width: 0,
            x: 0,
            y: 0
        },
        availableAnimAttrs = R._availableAnimAttrs = {
            blur: nu,
            "clip-rect": "csv",
            cx: nu,
            cy: nu,
            fill: "colour",
            "fill-opacity": nu,
            "font-size": nu,
            height: nu,
            opacity: nu,
            path: "path",
            r: nu,
            rx: nu,
            ry: nu,
            stroke: "colour",
            "stroke-opacity": nu,
            "stroke-width": nu,
            transform: "transform",
            width: nu,
            x: nu,
            y: nu
        },
        whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,
        commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,
        eldata = {},
        sortByKey = function (a, b) {
            return a.key - b.key;
        },
        sortByNumber = function (a, b) {
            return toFloat(a) - toFloat(b);
        },
        fun = function () {},
        pipe = function (x) {
            return x;
        },
        rectPath = R._rectPath = function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },
        ellipsePath = function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },
        getPath = R._getPath = {
            path: function (el) {
                return el.attr("path");
            },
            circle: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.r);
            },
            ellipse: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.rx, a.ry);
            },
            rect: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height, a.r);
            },
            image: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height);
            },
            text: function (el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            },
            set : function(el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        },
        /*\
         * Raphael.mapPath
         [ method ]
         **
         * Transform the path string with given matrix.
         > Parameters
         - path (string) path string
         - matrix (object) see @Matrix
         = (string) transformed path string
        \*/
        mapPath = R.mapPath = function (path, matrix) {
            if (!matrix) {
                return path;
            }
            var x, y, i, j, ii, jj, pathi;
            path = path2curve(path);
            for (i = 0, ii = path.length; i < ii; i++) {
                pathi = path[i];
                for (j = 1, jj = pathi.length; j < jj; j += 2) {
                    x = matrix.x(pathi[j], pathi[j + 1]);
                    y = matrix.y(pathi[j], pathi[j + 1]);
                    pathi[j] = x;
                    pathi[j + 1] = y;
                }
            }
            return path;
        };

    R._g = g;
    /*\
     * Raphael.type
     [ property (string) ]
     **
     * Can be “SVG”, “VML” or empty, depending on browser support.
    \*/
    R.type = (g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = g.doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return (R.type = E);
        }
        d = null;
    }
    /*\
     * Raphael.svg
     [ property (boolean) ]
     **
     * `true` if browser supports SVG.
    \*/
    /*\
     * Raphael.vml
     [ property (boolean) ]
     **
     * `true` if browser supports VML.
    \*/
    R.svg = !(R.vml = R.type == "VML");
    R._Paper = Paper;
    /*\
     * Raphael.fn
     [ property (object) ]
     **
     * You can add your own method to the canvas. For example if you want to draw a pie chart,
     * you can create your own pie chart function and ship it as a Raphaël plugin. To do this
     * you need to extend the `Raphael.fn` object. You should modify the `fn` object before a
     * Raphaël instance is created, otherwise it will take no effect. Please note that the
     * ability for namespaced plugins was removed in Raphael 2.0. It is up to the plugin to
     * ensure any namespacing ensures proper context.
     > Usage
     | Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
     |     return this.path( ... );
     | };
     | // or create namespace
     | Raphael.fn.mystuff = {
     |     arrow: function () {…},
     |     star: function () {…},
     |     // etc…
     | };
     | var paper = Raphael(10, 10, 630, 480);
     | // then use it
     | paper.arrow(10, 10, 30, 30, 5).attr({fill: "#f00"});
     | paper.mystuff.arrow();
     | paper.mystuff.star();
    \*/
    R.fn = paperproto = Paper.prototype = R.prototype;
    R._id = 0;
    R._oid = 0;
    /*\
     * Raphael.is
     [ method ]
     **
     * Handfull replacement for `typeof` operator.
     > Parameters
     - o (…) any object or primitive
     - type (string) name of the type, i.e. “string”, “function”, “number”, etc.
     = (boolean) is given value is of given type
    \*/
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };

    function clone(obj) {
        if (Object(obj) !== obj) {
            return obj;
        }
        var res = new obj.constructor;
        for (var key in obj) if (obj[has](key)) {
            res[key] = clone(obj[key]);
        }
        return res;
    }

    /*\
     * Raphael.angle
     [ method ]
     **
     * Returns angle between two or three points
     > Parameters
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     - x3 (number) #optional x coord of third point
     - y3 (number) #optional y coord of third point
     = (number) angle in degrees.
    \*/
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    /*\
     * Raphael.rad
     [ method ]
     **
     * Transform angle to radians
     > Parameters
     - deg (number) angle in degrees
     = (number) angle in radians.
    \*/
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    /*\
     * Raphael.deg
     [ method ]
     **
     * Transform angle to degrees
     > Parameters
     - deg (number) angle in radians
     = (number) angle in degrees.
    \*/
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    /*\
     * Raphael.snapTo
     [ method ]
     **
     * Snaps given value to given grid.
     > Parameters
     - values (array|number) given array of values or step of the grid
     - value (number) value to adjust
     - tolerance (number) #optional tolerance for snapping. Default is `10`.
     = (number) adjusted value.
    \*/
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };

    /*\
     * Raphael.createUUID
     [ method ]
     **
     * Returns RFC4122, version 4 ID
    \*/
    var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
        return function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
        };
    })(/[xy]/g, function (c) {
        var r = math.random() * 16 | 0,
            v = c == "x" ? r : (r & 3 | 8);
        return v.toString(16);
    });

    /*\
     * Raphael.setWindow
     [ method ]
     **
     * Used when you need to draw in `&lt;iframe>`. Switched window to the iframe one.
     > Parameters
     - newwin (window) new window object
    \*/
    R.setWindow = function (newwin) {
        eve("raphael.setWindow", R, g.win, newwin);
        g.win = newwin;
        g.doc = g.win.document;
        if (R._engine.initWin) {
            R._engine.initWin(g.win);
        }
    };
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color).replace(trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value.toString(16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = g.doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            g.doc.body.appendChild(i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    },
    prepareRGB = function (r, g, b) {
        if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
            b = r.b;
            g = r.g;
            r = r.r;
        }
        if (g == null && R.is(r, string)) {
            var clr = R.getRGB(r);
            r = clr.r;
            g = clr.g;
            b = clr.b;
        }
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }

        return [r, g, b];
    },
    packageRGB = function (r, g, b, o) {
        r *= 255;
        g *= 255;
        b *= 255;
        var rgb = {
            r: r,
            g: g,
            b: b,
            hex: R.rgb(r, g, b),
            toString: rgbtoString
        };
        R.is(o, "finite") && (rgb.opacity = o);
        return rgb;
    };

    /*\
     * Raphael.color
     [ method ]
     **
     * Parses the color string and returns object with all values for the given color.
     > Parameters
     - clr (string) color string in one of the supported formats (see @Raphael.getRGB)
     = (object) Combined RGB & HSB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) `true` if string can’t be parsed,
     o     h (number) hue,
     o     s (number) saturation,
     o     v (number) value (brightness),
     o     l (number) lightness
     o }
    \*/
    R.color = function (clr) {
        var rgb;
        if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
            rgb = R.hsb2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
            rgb = R.hsl2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else {
            if (R.is(clr, "string")) {
                clr = R.getRGB(clr);
            }
            if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                rgb = R.rgb2hsl(clr);
                clr.h = rgb.h;
                clr.s = rgb.s;
                clr.l = rgb.l;
                rgb = R.rgb2hsb(clr);
                clr.v = rgb.b;
            } else {
                clr = {hex: "none"};
                clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
            }
        }
        clr.toString = rgbtoString;
        return clr;
    };
    /*\
     * Raphael.hsb2rgb
     [ method ]
     **
     * Converts HSB values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - v (number) value or brightness
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsb2rgb = function (h, s, v, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            v = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.hsl2rgb
     [ method ]
     **
     * Converts HSL values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsl2rgb = function (h, s, l, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = 2 * s * (l < .5 ? l : 1 - l);
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = l - C / 2;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.rgb2hsb
     [ method ]
     **
     * Converts RGB values to HSB object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSB object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     b (number) brightness
     o }
    \*/
    R.rgb2hsb = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, V, C;
        V = mmax(r, g, b);
        C = V - mmin(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4
            );
        H = ((H + 360) % 6) * 60 / 360;
        S = C == 0 ? 0 : C / V;
        return {h: H, s: S, b: V, toString: hsbtoString};
    };
    /*\
     * Raphael.rgb2hsl
     [ method ]
     **
     * Converts RGB values to HSL object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSL object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     l (number) luminosity
     o }
    \*/
    R.rgb2hsl = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, L, M, m, C;
        M = mmax(r, g, b);
        m = mmin(r, g, b);
        C = M - m;
        H = (C == 0 ? null :
             M == r ? (g - b) / C :
             M == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = ((H + 360) % 6) * 60 / 360;
        L = (M + m) / 2;
        S = (C == 0 ? 0 :
             L < .5 ? C / (2 * L) :
                      C / (2 - 2 * L));
        return {h: H, s: S, l: L, toString: hsltoString};
    };
    R._path2string = function () {
        return this.join(",").replace(p2s, "$1");
    };
    function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
            return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                args = arg.join("\u2400"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count.length >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    var preload = R._preload = function (src, f) {
        var img = g.doc.createElement("img");
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(this);
            this.onload = null;
            g.doc.body.removeChild(this);
        };
        img.onerror = function () {
            g.doc.body.removeChild(this);
        };
        g.doc.body.appendChild(img);
        img.src = src;
    };

    function clrToString() {
        return this.hex;
    }

    /*\
     * Raphael.getRGB
     [ method ]
     **
     * Parses colour string as RGB object
     > Parameters
     - colour (string) colour string in one of formats:
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsl(•••, •••, •••) — same as hsb</li>
     #     <li>hsl(•••%, •••%, •••%) — same as hsb</li>
     # </ul>
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) true if string can’t be parsed
     o }
    \*/
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue, toString: clrToString};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
    }, R);
    /*\
     * Raphael.hsb
     [ method ]
     **
     * Converts HSB values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - b (number) value or brightness
     = (string) hex representation of the colour.
    \*/
    R.hsb = cacher(function (h, s, b) {
        return R.hsb2rgb(h, s, b).hex;
    });
    /*\
     * Raphael.hsl
     [ method ]
     **
     * Converts HSL values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (string) hex representation of the colour.
    \*/
    R.hsl = cacher(function (h, s, l) {
        return R.hsl2rgb(h, s, l).hex;
    });
    /*\
     * Raphael.rgb
     [ method ]
     **
     * Converts RGB values to hex representation of the colour.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (string) hex representation of the colour.
    \*/
    R.rgb = cacher(function (r, g, b) {
        return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    /*\
     * Raphael.getColor
     [ method ]
     **
     * On each call returns next colour in the spectrum. To reset it back to red call @Raphael.getColor.reset
     > Parameters
     - value (number) #optional brightness, default is `0.75`
     = (string) hex representation of the colour.
    \*/
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    /*\
     * Raphael.getColor.reset
     [ method ]
     **
     * Resets spectrum position for @Raphael.getColor back to red.
    \*/
    R.getColor.reset = function () {
        delete this.start;
    };

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp, z) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
            var p = [
                        {x: +crp[i - 2], y: +crp[i - 1]},
                        {x: +crp[i],     y: +crp[i + 1]},
                        {x: +crp[i + 2], y: +crp[i + 3]},
                        {x: +crp[i + 4], y: +crp[i + 5]}
                    ];
            if (z) {
                if (!i) {
                    p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
                } else if (iLen - 4 == i) {
                    p[3] = {x: +crp[0], y: +crp[1]};
                } else if (iLen - 2 == i) {
                    p[2] = {x: +crp[0], y: +crp[1]};
                    p[3] = {x: +crp[2], y: +crp[3]};
                }
            } else {
                if (iLen - 4 == i) {
                    p[3] = p[2];
                } else if (!i) {
                    p[0] = {x: +crp[i], y: +crp[i + 1]};
                }
            }
            d.push(["C",
                  (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                  (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                  (p[1].x + 6 * p[2].x - p[3].x) / 6,
                  (p[1].y + 6*p[2].y - p[3].y) / 6,
                  p[2].x,
                  p[2].y
            ]);
        }

        return d;
    }
    /*\
     * Raphael.parsePathString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of arrays of path segments.
     > Parameters
     - pathString (string|array) path string or array of segments (in the last case it will be returned straight away)
     = (array) array of segments.
    \*/
    R.parsePathString = function (pathString) {
        if (!pathString) {
            return null;
        }
        var pth = paths(pathString);
        if (pth.arr) {
            return pathClone(pth.arr);
        }

        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
            Str(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                if (name == "r") {
                    data.push([b][concat](params));
                } else while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = R._path2string;
        pth.arr = pathClone(data);
        return data;
    };
    /*\
     * Raphael.parseTransformString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of transformations.
     > Parameters
     - TString (string|array) transform string or array of transformations (in the last case it will be returned straight away)
     = (array) array of transformations.
    \*/
    R.parseTransformString = cacher(function (TString) {
        if (!TString) {
            return null;
        }
        var paramCounts = {r: 3, s: 4, t: 2, m: 6},
            data = [];
        if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
            data = pathClone(TString);
        }
        if (!data.length) {
            Str(TString).replace(tCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                data.push([b][concat](params));
            });
        }
        data.toString = R._path2string;
        return data;
    });
    // PATHS
    var paths = function (ps) {
        var p = paths.ps = paths.ps || {};
        if (p[ps]) {
            p[ps].sleep = 100;
        } else {
            p[ps] = {
                sleep: 100
            };
        }
        setTimeout(function () {
            for (var key in p) if (p[has](key) && key != ps) {
                p[key].sleep--;
                !p[key].sleep && delete p[key];
            }
        });
        return p[ps];
    };
    /*\
     * Raphael.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Find dot coordinates on the given cubic bezier curve at the given t.
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point
     o     y: (number) y coordinate of the point
     o     m: {
     o         x: (number) x coordinate of the left anchor
     o         y: (number) y coordinate of the left anchor
     o     }
     o     n: {
     o         x: (number) x coordinate of the right anchor
     o         y: (number) y coordinate of the right anchor
     o     }
     o     start: {
     o         x: (number) x coordinate of the start of the curve
     o         y: (number) y coordinate of the start of the curve
     o     }
     o     end: {
     o         x: (number) x coordinate of the end of the curve
     o         y: (number) y coordinate of the end of the curve
     o     }
     o     alpha: (number) angle of the curve derivative at the point
     o }
    \*/
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
            x: x,
            y: y,
            m: {x: mx, y: my},
            n: {x: nx, y: ny},
            start: {x: ax, y: ay},
            end: {x: cx, y: cy},
            alpha: alpha
        };
    };
    /*\
     * Raphael.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given cubic bezier curve
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for bezier curve
     = (object) point information in format:
     o {
     o     min: {
     o         x: (number) x coordinate of the left point
     o         y: (number) y coordinate of the top point
     o     }
     o     max: {
     o         x: (number) x coordinate of the right point
     o         y: (number) y coordinate of the bottom point
     o     }
     o }
    \*/
    R.bezierBBox = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        if (!R.is(p1x, "array")) {
            p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
        }
        var bbox = curveDim.apply(null, p1x);
        return {
            x: bbox.min.x,
            y: bbox.min.y,
            x2: bbox.max.x,
            y2: bbox.max.y,
            width: bbox.max.x - bbox.min.x,
            height: bbox.max.y - bbox.min.y
        };
    };
    /*\
     * Raphael.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding boxes.
     > Parameters
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point inside
    \*/
    R.isPointInsideBBox = function (bbox, x, y) {
        return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
    };
    /*\
     * Raphael.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     > Parameters
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if they intersect
    \*/
    R.isBBoxIntersect = function (bbox1, bbox2) {
        var i = R.isPointInsideBBox;
        return i(bbox2, bbox1.x, bbox1.y)
            || i(bbox2, bbox1.x2, bbox1.y)
            || i(bbox2, bbox1.x, bbox1.y2)
            || i(bbox2, bbox1.x2, bbox1.y2)
            || i(bbox1, bbox2.x, bbox2.y)
            || i(bbox1, bbox2.x2, bbox2.y)
            || i(bbox1, bbox2.x, bbox2.y2)
            || i(bbox1, bbox2.x2, bbox2.y2)
            || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
            && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
    };
    function base3(t, p1, p2, p3, p4) {
        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
        return t * t2 - 3 * p1 + 3 * p2;
    }
    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
        if (z == null) {
            z = 1;
        }
        z = z > 1 ? 1 : z < 0 ? 0 : z;
        var z2 = z / 2,
            n = 12,
            Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
            sum = 0;
        for (var i = 0; i < n; i++) {
            var ct = z2 * Tvalues[i] + z2,
                xbase = base3(ct, x1, x2, x3, x4),
                ybase = base3(ct, y1, y2, y3, y4),
                comb = xbase * xbase + ybase * ybase;
            sum += Cvalues[i] * math.sqrt(comb);
        }
        return z2 * sum;
    }
    function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
        if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
            return;
        }
        var t = 1,
            step = t / 2,
            t2 = t - step,
            l,
            e = .01;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        while (abs(l - ll) > e) {
            step /= 2;
            t2 += (l < ll ? 1 : -1) * step;
            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        }
        return t2;
    }
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        if (
            mmax(x1, x2) < mmin(x3, x4) ||
            mmin(x1, x2) > mmax(x3, x4) ||
            mmax(y1, y2) < mmin(y3, y4) ||
            mmin(y1, y2) > mmax(y3, y4)
        ) {
            return;
        }
        var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
            ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
            denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (!denominator) {
            return;
        }
        var px = nx / denominator,
            py = ny / denominator,
            px2 = +px.toFixed(2),
            py2 = +py.toFixed(2);
        if (
            px2 < +mmin(x1, x2).toFixed(2) ||
            px2 > +mmax(x1, x2).toFixed(2) ||
            px2 < +mmin(x3, x4).toFixed(2) ||
            px2 > +mmax(x3, x4).toFixed(2) ||
            py2 < +mmin(y1, y2).toFixed(2) ||
            py2 > +mmax(y1, y2).toFixed(2) ||
            py2 < +mmin(y3, y4).toFixed(2) ||
            py2 > +mmax(y3, y4).toFixed(2)
        ) {
            return;
        }
        return {x: px, y: py};
    }
    function inter(bez1, bez2) {
        return interHelper(bez1, bez2);
    }
    function interCount(bez1, bez2) {
        return interHelper(bez1, bez2, 1);
    }
    function interHelper(bez1, bez2, justCount) {
        var bbox1 = R.bezierBBox(bez1),
            bbox2 = R.bezierBBox(bez2);
        if (!R.isBBoxIntersect(bbox1, bbox2)) {
            return justCount ? 0 : [];
        }
        var l1 = bezlen.apply(0, bez1),
            l2 = bezlen.apply(0, bez2),
            n1 = ~~(l1 / 5),
            n2 = ~~(l2 / 5),
            dots1 = [],
            dots2 = [],
            xy = {},
            res = justCount ? 0 : [];
        for (var i = 0; i < n1 + 1; i++) {
            var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
            dots1.push({x: p.x, y: p.y, t: i / n1});
        }
        for (i = 0; i < n2 + 1; i++) {
            p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
            dots2.push({x: p.x, y: p.y, t: i / n2});
        }
        for (i = 0; i < n1; i++) {
            for (var j = 0; j < n2; j++) {
                var di = dots1[i],
                    di1 = dots1[i + 1],
                    dj = dots2[j],
                    dj1 = dots2[j + 1],
                    ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                    cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                    is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                if (is) {
                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                        continue;
                    }
                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
                    var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                        t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        if (justCount) {
                            res++;
                        } else {
                            res.push({
                                x: is.x,
                                y: is.y,
                                t1: t1,
                                t2: t2
                            });
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.pathIntersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     > Parameters
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point
     o         y: (number) y coordinate of the point
     o         t1: (number) t value for segment of path1
     o         t2: (number) t value for segment of path2
     o         segment1: (number) order number for segment of path1
     o         segment2: (number) order number for segment of path2
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
    \*/
    R.pathIntersection = function (path1, path2) {
        return interPathHelper(path1, path2);
    };
    R.pathIntersectionNumber = function (path1, path2) {
        return interPathHelper(path1, path2, 1);
    };
    function interPathHelper(path1, path2, justCount) {
        path1 = R._path2curve(path1);
        path2 = R._path2curve(path2);
        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
            res = justCount ? 0 : [];
        for (var i = 0, ii = path1.length; i < ii; i++) {
            var pi = path1[i];
            if (pi[0] == "M") {
                x1 = x1m = pi[1];
                y1 = y1m = pi[2];
            } else {
                if (pi[0] == "C") {
                    bez1 = [x1, y1].concat(pi.slice(1));
                    x1 = bez1[6];
                    y1 = bez1[7];
                } else {
                    bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                    x1 = x1m;
                    y1 = y1m;
                }
                for (var j = 0, jj = path2.length; j < jj; j++) {
                    var pj = path2[j];
                    if (pj[0] == "M") {
                        x2 = x2m = pj[1];
                        y2 = y2m = pj[2];
                    } else {
                        if (pj[0] == "C") {
                            bez2 = [x2, y2].concat(pj.slice(1));
                            x2 = bez2[6];
                            y2 = bez2[7];
                        } else {
                            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                            x2 = x2m;
                            y2 = y2m;
                        }
                        var intr = interHelper(bez1, bez2, justCount);
                        if (justCount) {
                            res += intr;
                        } else {
                            for (var k = 0, kk = intr.length; k < kk; k++) {
                                intr[k].segment1 = i;
                                intr[k].segment2 = j;
                                intr[k].bez1 = bez1;
                                intr[k].bez2 = bez2;
                            }
                            res = res.concat(intr);
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.isPointInsidePath
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     > Parameters
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) true, if point is inside the path
    \*/
    R.isPointInsidePath = function (path, x, y) {
        var bbox = R.pathBBox(path);
        return R.isPointInsideBBox(bbox, x, y) &&
               interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
    };
    R._removedFactory = function (methodname) {
        return function () {
            eve("raphael.log", null, "Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
        };
    };
    /*\
     * Raphael.pathBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given path
     > Parameters
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box
     o     y: (number) y coordinate of the left top point of the box
     o     x2: (number) x coordinate of the right bottom point of the box
     o     y2: (number) y coordinate of the right bottom point of the box
     o     width: (number) width of the box
     o     height: (number) height of the box
     o     cx: (number) x coordinate of the center of the box
     o     cy: (number) y coordinate of the center of the box
     o }
    \*/
    var pathDimensions = R.pathBBox = function (path) {
        var pth = paths(path);
        if (pth.bbox) {
            return clone(pth.bbox);
        }
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0};
        }
        path = path2curve(path);
        var x = 0,
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y),
            xmax = mmax[apply](0, X),
            ymax = mmax[apply](0, Y),
            width = xmax - xmin,
            height = ymax - ymin,
                bb = {
                x: xmin,
                y: ymin,
                x2: xmax,
                y2: ymax,
                width: width,
                height: height,
                cx: xmin + width / 2,
                cy: ymin + height / 2
            };
        pth.bbox = clone(bb);
        return bb;
    },
        pathClone = function (pathArray) {
            var res = clone(pathArray);
            res.toString = R._path2string;
            return res;
        },
        pathToRelative = R._pathToRelative = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.rel) {
                return pathClone(pth.rel);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i].length;
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res.toString = R._path2string;
            pth.rel = pathClone(res);
            return res;
        },
        pathToAbsolute = R._pathToAbsolute = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.abs) {
                return pathClone(pth.abs);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            if (!pathArray || !pathArray.length) {
                return [["M", 0, 0]];
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
            for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                res.push(r = []);
                pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "R":
                            var dots = [x, y][concat](pa.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            res.pop();
                            res = res[concat](catmullRom2bezier(dots, crz));
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else if (pa[0] == "R") {
                    dots = [x, y][concat](pa.slice(1));
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots, crz));
                    r = ["R"][concat](pa.slice(-2));
                } else {
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        r[k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = r[r.length - 2];
                        my = r[r.length - 1];
                    default:
                        x = r[r.length - 2];
                        y = r[r.length - 1];
                }
            }
            res.toString = R._path2string;
            pth.abs = pathClone(res);
            return res;
        },
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res).join()[split](",");
                var newres = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = R._path2curve = cacher(function (path, path2) {
            var pth = !path2 && paths(path);
            if (!path2 && pth.curve) {
                return pathClone(pth.curve);
            }
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i].length > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi.length) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                };
            for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg.length,
                    seg2len = p2 && seg2.length;
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            if (!p2) {
                pth.curve = pathClone(p);
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = R._parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots.push(dot);
            }
            for (i = 1, ii = dots.length - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        tear = R._tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = R._tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = R._toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = R._insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = R._insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        /*\
         * Raphael.toMatrix
         [ method ]
         **
         * Utility method
         **
         * Returns matrix of transformations applied to a given path
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (object) @Matrix
        \*/
        toMatrix = R.toMatrix = function (path, transform) {
            var bb = pathDimensions(path),
                el = {
                    _: {
                        transform: E
                    },
                    getBBox: function () {
                        return bb;
                    }
                };
            extractTransform(el, transform);
            return el.matrix;
        },
        /*\
         * Raphael.transformPath
         [ method ]
         **
         * Utility method
         **
         * Returns path transformed by a given transformation
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (string) path
        \*/
        transformPath = R.transformPath = function (path, transform) {
            return mapPath(path, toMatrix(path, transform));
        },
        extractTransform = R._extractTransform = function (el, tstr) {
            if (tstr == null) {
                return el._.transform;
            }
            tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
            var tdata = R.parseTransformString(tstr),
                deg = 0,
                dx = 0,
                dy = 0,
                sx = 1,
                sy = 1,
                _ = el._,
                m = new Matrix;
            _.transform = tdata || [];
            if (tdata) {
                for (var i = 0, ii = tdata.length; i < ii; i++) {
                    var t = tdata[i],
                        tlen = t.length,
                        command = Str(t[0]).toLowerCase(),
                        absolute = t[0] != command,
                        inver = absolute ? m.invert() : 0,
                        x1,
                        y1,
                        x2,
                        y2,
                        bb;
                    if (command == "t" && tlen == 3) {
                        if (absolute) {
                            x1 = inver.x(0, 0);
                            y1 = inver.y(0, 0);
                            x2 = inver.x(t[1], t[2]);
                            y2 = inver.y(t[1], t[2]);
                            m.translate(x2 - x1, y2 - y1);
                        } else {
                            m.translate(t[1], t[2]);
                        }
                    } else if (command == "r") {
                        if (tlen == 2) {
                            bb = bb || el.getBBox(1);
                            m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            deg += t[1];
                        } else if (tlen == 4) {
                            if (absolute) {
                                x2 = inver.x(t[2], t[3]);
                                y2 = inver.y(t[2], t[3]);
                                m.rotate(t[1], x2, y2);
                            } else {
                                m.rotate(t[1], t[2], t[3]);
                            }
                            deg += t[1];
                        }
                    } else if (command == "s") {
                        if (tlen == 2 || tlen == 3) {
                            bb = bb || el.getBBox(1);
                            m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            sx *= t[1];
                            sy *= t[tlen - 1];
                        } else if (tlen == 5) {
                            if (absolute) {
                                x2 = inver.x(t[3], t[4]);
                                y2 = inver.y(t[3], t[4]);
                                m.scale(t[1], t[2], x2, y2);
                            } else {
                                m.scale(t[1], t[2], t[3], t[4]);
                            }
                            sx *= t[1];
                            sy *= t[2];
                        }
                    } else if (command == "m" && tlen == 7) {
                        m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                    }
                    _.dirtyT = 1;
                    el.matrix = m;
                }
            }

            /*\
             * Element.matrix
             [ property (object) ]
             **
             * Keeps @Matrix object, which represents element transformation
            \*/
            el.matrix = m;

            _.sx = sx;
            _.sy = sy;
            _.deg = deg;
            _.dx = dx = m.e;
            _.dy = dy = m.f;

            if (sx == 1 && sy == 1 && !deg && _.bbox) {
                _.bbox.x += +dx;
                _.bbox.y += +dy;
            } else {
                _.dirtyT = 1;
            }
        },
        getEmpty = function (item) {
            var l = item[0];
            switch (l.toLowerCase()) {
                case "t": return [l, 0, 0];
                case "m": return [l, 1, 0, 0, 1, 0, 0];
                case "r": if (item.length == 4) {
                    return [l, 0, item[2], item[3]];
                } else {
                    return [l, 0];
                }
                case "s": if (item.length == 5) {
                    return [l, 1, 1, item[3], item[4]];
                } else if (item.length == 3) {
                    return [l, 1, 1];
                } else {
                    return [l, 1];
                }
            }
        },
        equaliseTransform = R._equaliseTransform = function (t1, t2) {
            t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
            t1 = R.parseTransformString(t1) || [];
            t2 = R.parseTransformString(t2) || [];
            var maxlength = mmax(t1.length, t2.length),
                from = [],
                to = [],
                i = 0, j, jj,
                tt1, tt2;
            for (; i < maxlength; i++) {
                tt1 = t1[i] || getEmpty(t2[i]);
                tt2 = t2[i] || getEmpty(tt1);
                if ((tt1[0] != tt2[0]) ||
                    (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                    (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                    ) {
                    return;
                }
                from[i] = [];
                to[i] = [];
                for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                    j in tt1 && (from[i][j] = tt1[j]);
                    j in tt2 && (to[i][j] = tt2[j]);
                }
            }
            return {
                from: from,
                to: to
            };
        };
    R._getContainer = function (x, y, w, h) {
        var container;
        container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
        if (container == null) {
            return;
        }
        if (container.tagName) {
            if (y == null) {
                return {
                    container: container,
                    width: container.style.pixelWidth || container.offsetWidth,
                    height: container.style.pixelHeight || container.offsetHeight
                };
            } else {
                return {
                    container: container,
                    width: y,
                    height: w
                };
            }
        }
        return {
            container: 1,
            x: x,
            y: y,
            width: w,
            height: h
        };
    };
    /*\
     * Raphael.pathToRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path to relative form
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.pathToRelative = pathToRelative;
    R._engine = {};
    /*\
     * Raphael.path2curve
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic bezier curves.
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.path2curve = path2curve;
    /*\
     * Raphael.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns matrix based on given parameters.
     > Parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     = (object) @Matrix
    \*/
    R.matrix = function (a, b, c, d, e, f) {
        return new Matrix(a, b, c, d, e, f);
    };
    function Matrix(a, b, c, d, e, f) {
        if (a != null) {
            this.a = +a;
            this.b = +b;
            this.c = +c;
            this.d = +d;
            this.e = +e;
            this.f = +f;
        } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
        }
    }
    (function (matrixproto) {
        /*\
         * Matrix.add
         [ method ]
         **
         * Adds given matrix to existing one.
         > Parameters
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         or
         - matrix (object) @Matrix
        \*/
        matrixproto.add = function (a, b, c, d, e, f) {
            var out = [[], [], []],
                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                x, y, z, res;

            if (a && a instanceof Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    res = 0;
                    for (z = 0; z < 3; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
                    out[x][y] = res;
                }
            }
            this.a = out[0][0];
            this.b = out[1][0];
            this.c = out[0][1];
            this.d = out[1][1];
            this.e = out[0][2];
            this.f = out[1][2];
        };
        /*\
         * Matrix.invert
         [ method ]
         **
         * Returns inverted version of the matrix
         = (object) @Matrix
        \*/
        matrixproto.invert = function () {
            var me = this,
                x = me.a * me.d - me.b * me.c;
            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
        };
        /*\
         * Matrix.clone
         [ method ]
         **
         * Returns copy of the matrix
         = (object) @Matrix
        \*/
        matrixproto.clone = function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        /*\
         * Matrix.translate
         [ method ]
         **
         * Translate the matrix
         > Parameters
         - x (number)
         - y (number)
        \*/
        matrixproto.translate = function (x, y) {
            this.add(1, 0, 0, 1, x, y);
        };
        /*\
         * Matrix.scale
         [ method ]
         **
         * Scales the matrix
         > Parameters
         - x (number)
         - y (number) #optional
         - cx (number) #optional
         - cy (number) #optional
        \*/
        matrixproto.scale = function (x, y, cx, cy) {
            y == null && (y = x);
            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        };
        /*\
         * Matrix.rotate
         [ method ]
         **
         * Rotates the matrix
         > Parameters
         - a (number)
         - x (number)
         - y (number)
        \*/
        matrixproto.rotate = function (a, x, y) {
            a = R.rad(a);
            x = x || 0;
            y = y || 0;
            var cos = +math.cos(a).toFixed(9),
                sin = +math.sin(a).toFixed(9);
            this.add(cos, sin, -sin, cos, x, y);
            this.add(1, 0, 0, 1, -x, -y);
        };
        /*\
         * Matrix.x
         [ method ]
         **
         * Return x coordinate for given point after transformation described by the matrix. See also @Matrix.y
         > Parameters
         - x (number)
         - y (number)
         = (number) x
        \*/
        matrixproto.x = function (x, y) {
            return x * this.a + y * this.c + this.e;
        };
        /*\
         * Matrix.y
         [ method ]
         **
         * Return y coordinate for given point after transformation described by the matrix. See also @Matrix.x
         > Parameters
         - x (number)
         - y (number)
         = (number) y
        \*/
        matrixproto.y = function (x, y) {
            return x * this.b + y * this.d + this.f;
        };
        matrixproto.get = function (i) {
            return +this[Str.fromCharCode(97 + i)].toFixed(4);
        };
        matrixproto.toString = function () {
            return R.svg ?
                "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
        };
        matrixproto.toFilter = function () {
            return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
        };
        matrixproto.offset = function () {
            return [this.e.toFixed(4), this.f.toFixed(4)];
        };
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = math.sqrt(norm(a));
            a[0] && (a[0] /= mag);
            a[1] && (a[1] /= mag);
        }
        /*\
         * Matrix.split
         [ method ]
         **
         * Splits matrix into primitive transformations
         = (object) in format:
         o dx (number) translation by x
         o dy (number) translation by y
         o scalex (number) scale by x
         o scaley (number) scale by y
         o shear (number) shear
         o rotate (number) rotation in deg
         o isSimple (boolean) could it be represented via simple transformations
        \*/
        matrixproto.split = function () {
            var out = {};
            // translation
            out.dx = this.e;
            out.dy = this.f;

            // scale and shear
            var row = [[this.a, this.c], [this.b, this.d]];
            out.scalex = math.sqrt(norm(row[0]));
            normalize(row[0]);

            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

            out.scaley = math.sqrt(norm(row[1]));
            normalize(row[1]);
            out.shear /= out.scaley;

            // rotation
            var sin = -row[0][1],
                cos = row[1][1];
            if (cos < 0) {
                out.rotate = R.deg(math.acos(cos));
                if (sin < 0) {
                    out.rotate = 360 - out.rotate;
                }
            } else {
                out.rotate = R.deg(math.asin(sin));
            }

            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
            return out;
        };
        /*\
         * Matrix.toTransformString
         [ method ]
         **
         * Return transform string that represents given matrix
         = (string) transform string
        \*/
        matrixproto.toTransformString = function (shorter) {
            var s = shorter || this[split]();
            if (s.isSimple) {
                s.scalex = +s.scalex.toFixed(4);
                s.scaley = +s.scaley.toFixed(4);
                s.rotate = +s.rotate.toFixed(4);
                return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) +
                        (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                        (s.rotate ? "r" + [s.rotate, 0, 0] : E);
            } else {
                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
            }
        };
    })(Matrix.prototype);

    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
        (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
        /*\
         * Paper.safari
         [ method ]
         **
         * There is an inconvenient rendering bug in Safari (WebKit):
         * sometimes the rendering should be forced.
         * This method should help with dealing with this bug.
        \*/
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = fun;
    }

    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (g.doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                    f = function (e) {
                        var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                            x = e.clientX + scrollX,
                            y = e.clientY + scrollY;
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e, x, y);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (g.doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || g.win.event;
                    var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                        scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                        x = e.clientX + scrollX,
                        y = e.clientY + scrollY;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e, x, y);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            var node = dragi.el.node,
                o,
                next = node.nextSibling,
                parent = node.parentNode,
                display = node.style.display;
            g.win.opera && parent.removeChild(node);
            node.style.display = "none";
            o = dragi.el.paper.getElementByPoint(x, y);
            node.style.display = display;
            g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
            o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
            x += scrollX;
            y += scrollY;
            eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    },
    /*\
     * Raphael.el
     [ property (object) ]
     **
     * You can add your own method to elements. This is usefull when you want to hack default functionality or
     * want to wrap some common transformation or attributes in one method. In difference to canvas methods,
     * you can redefine element method at any time. Expending element methods wouldn’t affect set.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | // then use it
     | paper.circle(100, 100, 20).red();
    \*/
    elproto = R.el = {};
    /*\
     * Element.click
     [ method ]
     **
     * Adds event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unclick
     [ method ]
     **
     * Removes event handler for click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes event handler for double click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes event handler for mousedown for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes event handler for mousemove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes event handler for mouseout for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes event handler for mouseover for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes event handler for mouseup for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes event handler for touchstart for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes event handler for touchmove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchend
     [ method ]
     **
     * Adds event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes event handler for touchend for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes event handler for touchcancel for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/
    for (var i = events.length; i--;) {
        (function (eventName) {
            R[eventName] = elproto[eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                var events = this.events || [],
                    l = events.length;
                while (l--){
                    if (events[l].name == eventName && (R.is(fn, "undefined") || events[l].f == fn)) {
                        events[l].unbind();
                        events.splice(l, 1);
                        !events.length && delete this.events;
                    }
                }
                return this;
            };
        })(events[i]);
    }

    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value asociated with given key.
     ** 
     * See also @Element.removeData
     > Parameters
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     * or, if key and value are not specified:
     = (object) Key/value pairs for all the data associated with the element.
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
    \*/
    elproto.data = function (key, value) {
        var data = eldata[this.id] = eldata[this.id] || {};
        if (arguments.length == 0) {
            return data;
        }
        if (arguments.length == 1) {
            if (R.is(key, "object")) {
                for (var i in key) if (key[has](i)) {
                    this.data(i, key[i]);
                }
                return this;
            }
            eve("raphael.data.get." + this.id, this, data[key], key);
            return data[key];
        }
        data[key] = value;
        eve("raphael.data.set." + this.id, this, value, key);
        return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     > Parameters
     - key (string) #optional key
     = (object) @Element
    \*/
    elproto.removeData = function (key) {
        if (key == null) {
            eldata[this.id] = {};
        } else {
            eldata[this.id] && delete eldata[this.id][key];
        }
        return this;
    };
     /*\
     * Element.getData
     [ method ]
     **
     * Retrieves the element data
     = (object) data
    \*/
    elproto.getData = function () {
        return clone(eldata[this.id] || {});
    };
    /*\
     * Element.hover
     [ method ]
     **
     * Adds event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
    \*/
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
    \*/
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for drag of the element.
     > Parameters
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events will be triggered: `drag.start.<id>` on start, 
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element will be dragged over another element 
     * `drag.over.<id>` will be fired as well.
     *
     * Start event and start handler will be called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler will be called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler will be called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
    \*/
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        this.initDrag = function (e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                    scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({ el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope });
            onstart && eve.on("raphael.drag.start." + this.id, onstart);
            onmove && eve.on("raphael.drag.move." + this.id, onmove);
            onend && eve.on("raphael.drag.end." + this.id, onend);
            eve("raphael.drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
        }
        this._drag = {};
        draggable.push({ el: this, start: this.initDrag });
        this.mousedown(this.initDrag);
        return this;
    };
    /*\
     * Element.onDragOver
     [ method ]
     **
     * Shortcut for assigning event handler for `drag.over.<id>` event, where id is id of the element (see @Element.id).
     > Parameters
     - f (function) handler for event, first argument would be the element you are dragging over
    \*/
    elproto.onDragOver = function (f) {
        f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
    };
    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from given element.
    \*/
    elproto.undrag = function () {
        var i = draggable.length;
        while (i--) if (draggable[i].el == this) {
            this.unmousedown(draggable[i].start);
            draggable.splice(i, 1);
            eve.unbind("raphael.drag.*." + this.id);
        }
        !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
        drag = [];
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) Raphaël element object with type “circle”
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
    \*/
    paperproto.circle = function (x, y, r) {
        var out = R._engine.circle(this, x || 0, y || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle.
     **
     > Parameters
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - r (number) #optional radius for rounded corners, default is 0
     = (object) Raphaël element object with type “rect”
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
    \*/
    paperproto.rect = function (x, y, w, h, r) {
        var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) Raphaël element object with type “ellipse”
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
    \*/
    paperproto.ellipse = function (x, y, rx, ry) {
        var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.path
     [ method ]
     **
     * Creates a path element by given path data string.
     > Parameters
     - pathString (string) #optional path string in SVG format.
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numercal form. Example:
     | "M10,20L30,40"
     * Here we can see two commands: “M”, with arguments `(10, 20)` and “L” with arguments `(30, 40)`. Upper case letter mean command is absolute, lower case—relative.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * “Catmull-Rom curveto” is a not standard SVG command and added in 2.0 to make life easier.
     * Note: there is a special case when path consist of just three commands: “M10,10R…z”. In this case path will smoothly connects to its beginning.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
     * For example of path strings, check out these icons: http://raphaeljs.com/icons/
    \*/
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        var out = R._engine.path(R.format[apply](R, arguments), this);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.image
     [ method ]
     **
     * Embeds an image into the surface.
     **
     > Parameters
     **
     - src (string) URI of the source image
     - x (number) x coordinate position
     - y (number) y coordinate position
     - width (number) width of the image
     - height (number) height of the image
     = (object) Raphaël element object with type “image”
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
    \*/
    paperproto.image = function (src, x, y, w, h) {
        var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string. If you need line breaks, put “\n” in the string.
     **
     > Parameters
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string) The text string to draw
     = (object) Raphaël element object with type “text”
     **
     > Usage
     | var t = paper.text(50, 50, "Raphaël\nkicks\nbutt!");
    \*/
    paperproto.text = function (x, y, text) {
        var out = R._engine.text(this, x || 0, y || 0, Str(text));
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.set
     [ method ]
     **
     * Creates array-like object to keep and operate several elements at once.
     * Warning: it doesn’t create any elements for itself in the page, it just groups existing elements.
     * Sets act as pseudo elements — all methods available to an element can be used on a set.
     = (object) array-like object that represents set of elements
     **
     > Usage
     | var st = paper.set();
     | st.push(
     |     paper.circle(10, 10, 5),
     |     paper.circle(30, 10, 5)
     | );
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.set = function (itemsArray) {
        !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
        var out = new Set(itemsArray);
        this.__set__ && this.__set__.push(out);
        out["paper"] = this;
        out["type"] = "set";
        return out;
    };
    /*\
     * Paper.setStart
     [ method ]
     **
     * Creates @Paper.set. All elements that will be created after calling this method and before calling
     * @Paper.setFinish will be added to the set.
     **
     > Usage
     | paper.setStart();
     | paper.circle(10, 10, 5),
     | paper.circle(30, 10, 5)
     | var st = paper.setFinish();
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.setStart = function (set) {
        this.__set__ = set || this.set();
    };
    /*\
     * Paper.setFinish
     [ method ]
     **
     * See @Paper.setStart. This method finishes catching and returns resulting set.
     **
     = (object) set
    \*/
    paperproto.setFinish = function (set) {
        var out = this.__set__;
        delete this.__set__;
        return out;
    };
    /*\
     * Paper.setSize
     [ method ]
     **
     * If you need to change dimensions of the canvas call this method
     **
     > Parameters
     **
     - width (number) new width of the canvas
     - height (number) new height of the canvas
    \*/
    paperproto.setSize = function (width, height) {
        return R._engine.setSize.call(this, width, height);
    };
    /*\
     * Paper.setViewBox
     [ method ]
     **
     * Sets the view box of the paper. Practically it gives you ability to zoom and pan whole paper surface by 
     * specifying new boundaries.
     **
     > Parameters
     **
     - x (number) new x position, default is `0`
     - y (number) new y position, default is `0`
     - w (number) new width of the canvas
     - h (number) new height of the canvas
     - fit (boolean) `true` if you want graphics to fit into new boundary box
    \*/
    paperproto.setViewBox = function (x, y, w, h, fit) {
        return R._engine.setViewBox.call(this, x, y, w, h, fit);
    };
    /*\
     * Paper.top
     [ property ]
     **
     * Points to the topmost element on the paper
    \*/
    /*\
     * Paper.bottom
     [ property ]
     **
     * Points to the bottom element on the paper
    \*/
    paperproto.top = paperproto.bottom = null;
    /*\
     * Paper.raphael
     [ property ]
     **
     * Points to the @Raphael object/function
    \*/
    paperproto.raphael = R;
    var getOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
            left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };
    /*\
     * Paper.getElementByPoint
     [ method ]
     **
     * Returns you topmost element under given point.
     **
     = (object) Raphaël element object
     > Parameters
     **
     - x (number) x coordinate from the top left corner of the window
     - y (number) y coordinate from the top left corner of the window
     > Usage
     | paper.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
    \*/
    paperproto.getElementByPoint = function (x, y) {
        var paper = this,
            svg = paper.canvas,
            target = g.doc.elementFromPoint(x, y);
        if (g.win.opera && target.tagName == "svg") {
            var so = getOffset(svg),
                sr = svg.createSVGRect();
            sr.x = x - so.x;
            sr.y = y - so.y;
            sr.width = sr.height = 1;
            var hits = svg.getIntersectionList(sr, null);
            if (hits.length) {
                target = hits[hits.length - 1];
            }
        }
        if (!target) {
            return null;
        }
        while (target.parentNode && target != svg.parentNode && !target.raphael) {
            target = target.parentNode;
        }
        target == paper.canvas.parentNode && (target = svg);
        target = target && target.raphael ? paper.getById(target.raphaelid) : null;
        return target;
    };

    /*\
     * Paper.getElementsByBBox
     [ method ]
     **
     * Returns set of elements that have an intersecting bounding box
     **
     > Parameters
     **
     - bbox (object) bbox to check with
     = (object) @Set
     \*/
    paperproto.getElementsByBBox = function (bbox) {
        var set = this.set();
        this.forEach(function (el) {
            if (R.isBBoxIntersect(el.getBBox(), bbox)) {
                set.push(el);
            }
        });
        return set;
    };

    /*\
     * Paper.getById
     [ method ]
     **
     * Returns you element by its internal ID.
     **
     > Parameters
     **
     - id (number) id
     = (object) Raphaël element object
    \*/
    paperproto.getById = function (id) {
        var bot = this.bottom;
        while (bot) {
            if (bot.id == id) {
                return bot;
            }
            bot = bot.next;
        }
        return null;
    };
    /*\
     * Paper.forEach
     [ method ]
     **
     * Executes given function for each element on the paper
     *
     * If callback function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Paper object
     > Usage
     | paper.forEach(function (el) {
     |     el.attr({ stroke: "blue" });
     | });
    \*/
    paperproto.forEach = function (callback, thisArg) {
        var bot = this.bottom;
        while (bot) {
            if (callback.call(thisArg, bot) === false) {
                return this;
            }
            bot = bot.next;
        }
        return this;
    };
    /*\
     * Paper.getElementsByPoint
     [ method ]
     **
     * Returns set of elements that have common point inside
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (object) @Set
    \*/
    paperproto.getElementsByPoint = function (x, y) {
        var set = this.set();
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                set.push(el);
            }
        });
        return set;
    };
    function x_y() {
        return this.x + S + this.y;
    }
    function x_y_w_h() {
        return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    /*\
     * Element.isPointInside
     [ method ]
     **
     * Determine if given point is inside this element’s shape
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point inside the shape
    \*/
    elproto.isPointInside = function (x, y) {
        var rp = this.realPath = this.realPath || getPath[this.type](this);
        return R.isPointInsidePath(rp, x, y);
    };
    /*\
     * Element.getBBox
     [ method ]
     **
     * Return bounding box for a given element
     **
     > Parameters
     **
     - isWithoutTransform (boolean) flag, `true` if you want to have bounding box before transformations. Default is `false`.
     = (object) Bounding box object:
     o {
     o     x: (number) top left corner x
     o     y: (number) top left corner y
     o     x2: (number) bottom right corner x
     o     y2: (number) bottom right corner y
     o     width: (number) width
     o     height: (number) height
     o }
    \*/
    elproto.getBBox = function (isWithoutTransform) {
        if (this.removed) {
            return {};
        }
        var _ = this._;
        if (isWithoutTransform) {
            if (_.dirty || !_.bboxwt) {
                this.realPath = getPath[this.type](this);
                _.bboxwt = pathDimensions(this.realPath);
                _.bboxwt.toString = x_y_w_h;
                _.dirty = 0;
            }
            return _.bboxwt;
        }
        if (_.dirty || _.dirtyT || !_.bbox) {
            if (_.dirty || !this.realPath) {
                _.bboxwt = 0;
                this.realPath = getPath[this.type](this);
            }
            _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
            _.bbox.toString = x_y_w_h;
            _.dirty = _.dirtyT = 0;
        }
        return _.bbox;
    };
    /*\
     * Element.clone
     [ method ]
     **
     = (object) clone of a given element
     **
    \*/
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var out = this.paper[this.type]().attr(this.attr());
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Element.glow
     [ method ]
     **
     * Return set of elements that create glow-like effect around given element. See @Paper.set.
     *
     * Note: Glow is not connected to the element. If you change element attributes it won’t adjust itself.
     **
     > Parameters
     **
     - glow (object) #optional parameters object with all properties optional:
     o {
     o     width (number) size of the glow, default is `10`
     o     fill (boolean) will it be filled, default is `false`
     o     opacity (number) opacity, default is `0.5`
     o     offsetx (number) horizontal offset, default is `0`
     o     offsety (number) vertical offset, default is `0`
     o     color (string) glow colour, default is `black`
     o }
     = (object) @Paper.set of elements that represents glow
    \*/
    elproto.glow = function (glow) {
        if (this.type == "text") {
            return null;
        }
        glow = glow || {};
        var s = {
            width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
            fill: glow.fill || false,
            opacity: glow.opacity || .5,
            offsetx: glow.offsetx || 0,
            offsety: glow.offsety || 0,
            color: glow.color || "#000"
        },
            c = s.width / 2,
            r = this.paper,
            out = r.set(),
            path = this.realPath || getPath[this.type](this);
        path = this.matrix ? mapPath(path, this.matrix) : path;
        for (var i = 1; i < c + 1; i++) {
            out.push(r.path(path).attr({
                stroke: s.color,
                fill: s.fill ? s.color : "none",
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-width": +(s.width / c * i).toFixed(3),
                opacity: +(s.opacity / c).toFixed(3)
            }));
        }
        return out.insertBefore(this).translate(s.offsetx, s.offsety);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        if (length == null) {
            return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
        } else {
            return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p.shift() + p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    /*\
     * Raphael.getTotalLength
     [ method ]
     **
     * Returns length of the given path in pixels.
     **
     > Parameters
     **
     - path (string) SVG path string.
     **
     = (number) length.
    \*/
    R.getTotalLength = getTotalLength;
    /*\
     * Raphael.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path.
     **
     > Parameters
     **
     - path (string) SVG path string
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    R.getPointAtLength = getPointAtLength;
    /*\
     * Raphael.getSubpath
     [ method ]
     **
     * Return subpath of a given path from given length to given length.
     **
     > Parameters
     **
     - path (string) SVG path string
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    R.getSubpath = function (path, from, to) {
        if (this.getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
        }
        var a = getSubpathsAtLength(path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns length of the path in pixels. Only works for element of “path” type.
     = (number) length.
    \*/
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path. Only works for element of “path” type.
     **
     > Parameters
     **
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    /*\
     * Element.getSubpath
     [ method ]
     **
     * Return subpath of a given element from given length to given length. Only works for element of “path” type.
     **
     > Parameters
     **
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        return R.getSubpath(this.attrs.path, from, to);
    };
    /*\
     * Raphael.easing_formulas
     [ property ]
     **
     * Object that contains easing formulas for animation. You could extend it with your own. By default it has following list of easing:
     # <ul>
     #     <li>“linear”</li>
     #     <li>“&lt;” or “easeIn” or “ease-in”</li>
     #     <li>“>” or “easeOut” or “ease-out”</li>
     #     <li>“&lt;>” or “easeInOut” or “ease-in-out”</li>
     #     <li>“backIn” or “back-in”</li>
     #     <li>“backOut” or “back-out”</li>
     #     <li>“elastic”</li>
     #     <li>“bounce”</li>
     # </ul>
     # <p>See also <a href="http://raphaeljs.com/easing.html">Easing demo</a>.</p>
    \*/
    var ef = R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 1.7);
        },
        ">": function (n) {
            return pow(n, .48);
        },
        "<>": function (n) {
            var q = .48 - n / 1.04,
                Q = math.sqrt(.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + .5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == !!n) {
                return n;
            }
            return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
    ef.easeIn = ef["ease-in"] = ef["<"];
    ef.easeOut = ef["ease-out"] = ef[">"];
    ef.easeInOut = ef["ease-in-out"] = ef["<>"];
    ef["back-in"] = ef.backIn;
    ef["back-out"] = ef.backOut;

    var animationElements = [],
        requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           window.oRequestAnimationFrame      ||
                           window.msRequestAnimationFrame     ||
                           function (callback) {
                               setTimeout(callback, 16);
                           },
        animation = function () {
            var Now = +new Date,
                l = 0;
            for (; l < animationElements.length; l++) {
                var e = animationElements[l];
                if (e.el.removed || e.paused) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now,
                    init = {},
                    key;
                if (e.initstatus) {
                    time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                    e.status = e.initstatus;
                    delete e.initstatus;
                    e.stop && animationElements.splice(l--, 1);
                } else {
                    e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                }
                if (time < 0) {
                    continue;
                }
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ].join(",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i].join(S);
                                }
                                now = now.join(S);
                                break;
                            case "transform":
                                if (diff[attr].real) {
                                    now = [];
                                    for (i = 0, ii = from[attr].length; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                            now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                    }
                                } else {
                                    var get = function (i) {
                                        return +from[attr][i] + pos * ms * diff[attr][i];
                                    };
                                    // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                    now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                }
                                break;
                            case "csv":
                                if (attr == "clip-rect") {
                                    now = [];
                                    i = 4;
                                    while (i--) {
                                        now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                    }
                                }
                                break;
                            default:
                                var from2 = [][concat](from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    (function (id, that, anim) {
                        setTimeout(function () {
                            eve("raphael.anim.frame." + id, that, anim);
                        });
                    })(that.id, that, e.anim);
                } else {
                    (function(f, el, a) {
                        setTimeout(function() {
                            eve("raphael.anim.frame." + el.id, el, a);
                            eve("raphael.anim.finish." + el.id, el, a);
                            R.is(f, "function") && f.call(el);
                        });
                    })(e.callback, that, e.anim);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                    if (e.repeat > 1 && !e.next) {
                        for (key in to) if (to[has](key)) {
                            init[key] = e.totalOrigin[key];
                        }
                        e.el.attr(init);
                        runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                    }
                    if (e.next && !e.stop) {
                        runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                    }
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements.length && requestAnimFrame(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : color < 0 ? 0 : color;
        };
    /*\
     * Element.animateWith
     [ method ]
     **
     * Acts similar to @Element.animate, but ensure that given animation runs in sync with another given element.
     **
     > Parameters
     **
     - el (object) element to sync with
     - anim (object) animation to sync with
     - params (object) #optional final attributes for the element, see also @Element.attr
     - ms (number) #optional number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept on of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - element (object) element to sync with
     - anim (object) animation to sync with
     - animation (object) #optional animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animateWith = function (el, anim, params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback),
            x, y;
        runAnimation(a, element, a.percents[0], null, element.attr());
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].anim == anim && animationElements[i].el == el) {
                animationElements[ii - 1].start = animationElements[i].start;
                break;
            }
        }
        return element;
        // 
        // 
        // var a = params ? R.animation(params, ms, easing, callback) : anim,
        //     status = element.status(anim);
        // return this.animate(a).status(a, status * anim.ms / a.ms);
    };
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
        return this;
    };
    function Animation(anim, ms) {
        var percents = [],
            newAnim = {};
        this.ms = ms;
        this.times = 1;
        if (anim) {
            for (var attr in anim) if (anim[has](attr)) {
                newAnim[toFloat(attr)] = anim[attr];
                percents.push(toFloat(attr));
            }
            percents.sort(sortByNumber);
        }
        this.anim = newAnim;
        this.top = percents[percents.length - 1];
        this.percents = percents;
    }
    /*\
     * Animation.delay
     [ method ]
     **
     * Creates a copy of existing animation object with given delay.
     **
     > Parameters
     **
     - delay (number) number of ms to pass between animation start and actual animation
     **
     = (object) new altered Animation object
     | var anim = Raphael.animation({cx: 10, cy: 20}, 2e3);
     | circle1.animate(anim); // run the given animation immediately
     | circle2.animate(anim.delay(500)); // run the given animation after 500 ms
    \*/
    Animation.prototype.delay = function (delay) {
        var a = new Animation(this.anim, this.ms);
        a.times = this.times;
        a.del = +delay || 0;
        return a;
    };
    /*\
     * Animation.repeat
     [ method ]
     **
     * Creates a copy of existing animation object with given repetition.
     **
     > Parameters
     **
     - repeat (number) number iterations of animation. For infinite animation pass `Infinity`
     **
     = (object) new altered Animation object
    \*/
    Animation.prototype.repeat = function (times) {
        var a = new Animation(this.anim, this.ms);
        a.del = this.del;
        a.times = math.floor(mmax(times, 0)) || 1;
        return a;
    };
    function runAnimation(anim, element, percent, status, totalOrigin, times) {
        percent = toFloat(percent);
        var params,
            isInAnim,
            isInAnimSet,
            percents = [],
            next,
            prev,
            timestamp,
            ms = anim.ms,
            from = {},
            to = {},
            diff = {};
        if (status) {
            for (i = 0, ii = animationElements.length; i < ii; i++) {
                var e = animationElements[i];
                if (e.el.id == element.id && e.anim == anim) {
                    if (e.percent != percent) {
                        animationElements.splice(i, 1);
                        isInAnimSet = 1;
                    } else {
                        isInAnim = e;
                    }
                    element.attr(e.totalOrigin);
                    break;
                }
            }
        } else {
            status = +to; // NaN
        }
        for (var i = 0, ii = anim.percents.length; i < ii; i++) {
            if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                percent = anim.percents[i];
                prev = anim.percents[i - 1] || 0;
                ms = ms / anim.top * (percent - prev);
                next = anim.percents[i + 1];
                params = anim.anim[percent];
                break;
            } else if (status) {
                element.attr(anim.anim[anim.percents[i]]);
            }
        }
        if (!params) {
            return;
        }
        if (!isInAnim) {
            for (var attr in params) if (params[has](attr)) {
                if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                    from[attr] = element.attr(attr);
                    (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                    to[attr] = params[attr];
                    switch (availableAnimAttrs[attr]) {
                        case nu:
                            diff[attr] = (to[attr] - from[attr]) / ms;
                            break;
                        case "colour":
                            from[attr] = R.getRGB(from[attr]);
                            var toColour = R.getRGB(to[attr]);
                            diff[attr] = {
                                r: (toColour.r - from[attr].r) / ms,
                                g: (toColour.g - from[attr].g) / ms,
                                b: (toColour.b - from[attr].b) / ms
                            };
                            break;
                        case "path":
                            var pathes = path2curve(from[attr], to[attr]),
                                toPath = pathes[1];
                            from[attr] = pathes[0];
                            diff[attr] = [];
                            for (i = 0, ii = from[attr].length; i < ii; i++) {
                                diff[attr][i] = [0];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                }
                            }
                            break;
                        case "transform":
                            var _ = element._,
                                eq = equaliseTransform(_[attr], to[attr]);
                            if (eq) {
                                from[attr] = eq.from;
                                to[attr] = eq.to;
                                diff[attr] = [];
                                diff[attr].real = true;
                                for (i = 0, ii = from[attr].length; i < ii; i++) {
                                    diff[attr][i] = [from[attr][i][0]];
                                    for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                    }
                                }
                            } else {
                                var m = (element.matrix || new Matrix),
                                    to2 = {
                                        _: {transform: _.transform},
                                        getBBox: function () {
                                            return element.getBBox(1);
                                        }
                                    };
                                from[attr] = [
                                    m.a,
                                    m.b,
                                    m.c,
                                    m.d,
                                    m.e,
                                    m.f
                                ];
                                extractTransform(to2, to[attr]);
                                to[attr] = to2._.transform;
                                diff[attr] = [
                                    (to2.matrix.a - m.a) / ms,
                                    (to2.matrix.b - m.b) / ms,
                                    (to2.matrix.c - m.c) / ms,
                                    (to2.matrix.d - m.d) / ms,
                                    (to2.matrix.e - m.e) / ms,
                                    (to2.matrix.f - m.f) / ms
                                ];
                                // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                // extractTransform(to2, to[attr]);
                                // diff[attr] = [
                                //     (to2._.sx - _.sx) / ms,
                                //     (to2._.sy - _.sy) / ms,
                                //     (to2._.deg - _.deg) / ms,
                                //     (to2._.dx - _.dx) / ms,
                                //     (to2._.dy - _.dy) / ms
                                // ];
                            }
                            break;
                        case "csv":
                            var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                            if (attr == "clip-rect") {
                                from[attr] = from2;
                                diff[attr] = [];
                                i = from2.length;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            }
                            to[attr] = values;
                            break;
                        default:
                            values = [][concat](params[attr]);
                            from2 = [][concat](from[attr]);
                            diff[attr] = [];
                            i = element.paper.customAttributes[attr].length;
                            while (i--) {
                                diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                            }
                            break;
                    }
                }
            }
            var easing = params.easing,
                easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy.length == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = pipe;
                }
            }
            timestamp = params.start || anim.start || +new Date;
            e = {
                anim: anim,
                percent: percent,
                timestamp: timestamp,
                start: timestamp + (anim.del || 0),
                status: 0,
                initstatus: status || 0,
                stop: false,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                callback: params.callback,
                prev: prev,
                next: next,
                repeat: times || anim.times,
                origin: element.attr(),
                totalOrigin: totalOrigin
            };
            animationElements.push(e);
            if (status && !isInAnim && !isInAnimSet) {
                e.stop = true;
                e.start = new Date - ms * status;
                if (animationElements.length == 1) {
                    return animation();
                }
            }
            if (isInAnimSet) {
                e.start = new Date - e.ms * status;
            }
            animationElements.length == 1 && requestAnimFrame(animation);
        } else {
            isInAnim.initstatus = status;
            isInAnim.start = new Date - isInAnim.ms * status;
        }
        eve("raphael.anim.start." + element.id, element, anim);
    }
    /*\
     * Raphael.animation
     [ method ]
     **
     * Creates an animation object that can be passed to the @Element.animate or @Element.animateWith methods.
     * See also @Animation.delay and @Animation.repeat methods.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     **
     = (object) @Animation
    \*/
    R.animation = function (params, ms, easing, callback) {
        if (params instanceof Animation) {
            return params;
        }
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
            easing = null;
        }
        params = Object(params);
        ms = +ms || 0;
        var p = {},
            json,
            attr;
        for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
            json = true;
            p[attr] = params[attr];
        }
        if (!json) {
            return new Animation(params, ms);
        } else {
            easing && (p.easing = easing);
            callback && (p.callback = callback);
            return new Animation({100: p}, ms);
        }
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Creates and starts animation for given element.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - animation (object) animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
        runAnimation(anim, element, anim.percents[0], null, element.attr());
        return element;
    };
    /*\
     * Element.setTime
     [ method ]
     **
     * Sets the status of animation of the element in milliseconds. Similar to @Element.status method.
     **
     > Parameters
     **
     - anim (object) animation object
     - value (number) number of milliseconds from the beginning of the animation
     **
     = (object) original element if `value` is specified
     * Note, that during animation following events are triggered:
     *
     * On each animation frame event `anim.frame.<id>`, on start `anim.start.<id>` and on end `anim.finish.<id>`.
    \*/
    elproto.setTime = function (anim, value) {
        if (anim && value != null) {
            this.status(anim, mmin(value, anim.ms) / anim.ms);
        }
        return this;
    };
    /*\
     * Element.status
     [ method ]
     **
     * Gets or sets the status of animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     - value (number) #optional 0 – 1. If specified, method works like a setter and sets the status of a given animation to the value. This will cause animation to jump to the given position.
     **
     = (number) status
     * or
     = (array) status if `anim` is not specified. Array of objects in format:
     o {
     o     anim: (object) animation object
     o     status: (number) status
     o }
     * or
     = (object) original element if `value` is specified
    \*/
    elproto.status = function (anim, value) {
        var out = [],
            i = 0,
            len,
            e;
        if (value != null) {
            runAnimation(anim, this, -1, mmin(value, 1));
            return this;
        } else {
            len = animationElements.length;
            for (; i < len; i++) {
                e = animationElements[i];
                if (e.el.id == this.id && (!anim || e.anim == anim)) {
                    if (anim) {
                        return e.status;
                    }
                    out.push({
                        anim: e.anim,
                        status: e.status
                    });
                }
            }
            if (anim) {
                return 0;
            }
            return out;
        }
    };
    /*\
     * Element.pause
     [ method ]
     **
     * Stops animation of the element with ability to resume it later on.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.pause = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                animationElements[i].paused = true;
            }
        }
        return this;
    };
    /*\
     * Element.resume
     [ method ]
     **
     * Resumes animation if it was paused with @Element.pause method.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.resume = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            var e = animationElements[i];
            if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
                delete e.paused;
                this.status(e.anim, e.status);
            }
        }
        return this;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.stop = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                animationElements.splice(i--, 1);
            }
        }
        return this;
    };
    function stopAnimation(paper) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.paper == paper) {
            animationElements.splice(i--, 1);
        }
    }
    eve.on("raphael.remove", stopAnimation);
    eve.on("raphael.clear", stopAnimation);
    elproto.toString = function () {
        return "Rapha\xebl\u2019s object";
    };

    // Set
    var Set = function (items) {
        this.items = [];
        this.length = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items.length; i < ii; i++) {
                if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                    this[this.items.length] = this.items[this.items.length] = items[i];
                    this.length++;
                }
            }
        }
    },
    setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set.
     = (object) original element
    \*/
    setproto.push = function () {
        var item,
            len;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                len = this.items.length;
                this[len] = this.items[len] = item;
                this.length++;
            }
        }
        return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it.
     = (object) element
    \*/
    setproto.pop = function () {
        this.length && delete this[this.length--];
        return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set.
     *
     * If function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
    \*/
    setproto.forEach = function (callback, thisArg) {
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            if (callback.call(thisArg, this.items[i], i) === false) {
                return this;
            }
        }
        return this;
    };
    for (var method in elproto) if (elproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname][apply](el, arg);
                });
            };
        })(method);
    }
    setproto.attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removeds all elements from the set
    \*/
    setproto.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
    \*/
    setproto.splice = function (index, count, insertion) {
        index = index < 0 ? mmax(this.length + index, 0) : index;
        count = mmax(0, mmin(this.length - index, count));
        var tail = [],
            todel = [],
            args = [],
            i;
        for (i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i = 0; i < count; i++) {
            todel.push(this[index + i]);
        }
        for (; i < this.length - index; i++) {
            tail.push(this[index + i]);
        }
        var arglen = args.length;
        for (i = 0; i < arglen + tail.length; i++) {
            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
        }
        i = this.items.length = this.length -= count - arglen;
        while (this[i]) {
            delete this[i++];
        }
        return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - element (object) element to remove
     = (boolean) `true` if object was found & removed from the set
    \*/
    setproto.exclude = function (el) {
        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
            this.splice(i, 1);
            return true;
        }
    };
    setproto.animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items.length,
            i = len,
            item,
            set = this,
            collector;
        if (!len) {
            return this;
        }
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        var anim = R.animation(params, ms, easing, collector);
        item = this.items[--i].animate(anim);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim, anim);
            (this.items[i] && !this.items[i].removed) || len--;
        }
        return this;
    };
    setproto.insertAfter = function (el) {
        var i = this.items.length;
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    setproto.getBBox = function () {
        var x = [],
            y = [],
            x2 = [],
            y2 = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            x2.push(box.x + box.width);
            y2.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        x2 = mmax[apply](0, x2);
        y2 = mmax[apply](0, y2);
        return {
            x: x,
            y: y,
            x2: x2,
            y2: y2,
            width: x2 - x,
            height: y2 - y
        };
    };
    setproto.clone = function (s) {
        s = this.paper.set();
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            s.push(this.items[i].clone());
        }
        return s;
    };
    setproto.toString = function () {
        return "Rapha\xebl\u2018s set";
    };

    setproto.glow = function(glowConfig) {
        var ret = this.paper.set();
        this.forEach(function(shape, index){
            var g = shape.glow(glowConfig);
            if(g != null){
                g.forEach(function(shape2, index2){
                    ret.push(shape2);
                });
            }
        });
        return ret;
    };


    /*\
     * Set.isPointInside
     [ method ]
     **
     * Determine if given point is inside this set’s elements
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point is inside any of the set's elements
     \*/
    setproto.isPointInside = function (x, y) {
        var isPointInside = false;
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                console.log('runned');
                isPointInside = true;
                return false; // stop loop
            }
        });
        return isPointInside;
    };

    /*\
     * Raphael.registerFont
     [ method ]
     **
     * Adds given font to the registered set of fonts for Raphaël. Should be used as an internal call from within Cufón’s font file.
     * Returns original parameter, so it could be used with chaining.
     # <a href="http://wiki.github.com/sorccu/cufon/about">More about Cufón and how to convert your font form TTF, OTF, etc to JavaScript file.</a>
     **
     > Parameters
     **
     - font (object) the font to register
     = (object) the font you passed in
     > Usage
     | Cufon.registerFont(Raphael.registerFont({…}));
    \*/
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family].push(fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    /*\
     * Paper.getFont
     [ method ]
     **
     * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”.
     **
     > Parameters
     **
     - family (string) font family name or any word from it
     - weight (string) #optional font weight
     - style (string) #optional font style
     - stretch (string) #optional font stretch
     = (object) the font object
     > Usage
     | paper.print(100, 100, "Test string", paper.getFont("Times", 800), 30);
    \*/
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    /*\
     * Paper.print
     [ method ]
     **
     * Creates path that represent given text written using given font at given position with given size.
     * Result of the method is path element that contains whole text as a separate path.
     **
     > Parameters
     **
     - x (number) x position of the text
     - y (number) y position of the text
     - string (string) text to print
     - font (object) font object, see @Paper.getFont
     - size (number) #optional size of the font, default is `16`
     - origin (string) #optional could be `"baseline"` or `"middle"`, default is `"middle"`
     - letter_spacing (number) #optional number in range `-1..1`, default is `0`
     - line_spacing (number) #optional number in range `1..3`, default is `1`
     = (object) resulting path element, which consist of all letters
     > Usage
     | var txt = r.print(10, 50, "print", r.getFont("Museo"), 30).attr({fill: "#fff"});
    \*/
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing, line_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        line_spacing = mmax(mmin(line_spacing || 1, 3), 1);
        var letters = Str(string)[split](E),
            shift = 0,
            notfirst = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox[split](separator),
                top = +bb[0],
                lineHeight = bb[3] - bb[1],
                shifty = 0,
                height = +bb[1] + (origin == "baseline" ? lineHeight + (+font.face.descent) : lineHeight / 2);
            for (var i = 0, ii = letters.length; i < ii; i++) {
                if (letters[i] == "\n") {
                    shift = 0;
                    curr = 0;
                    notfirst = 0;
                    shifty += lineHeight * line_spacing;
                } else {
                    var prev = notfirst && font.glyphs[letters[i - 1]] || {},
                        curr = font.glyphs[letters[i]];
                    shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                    notfirst = 1;
                }
                if (curr && curr.d) {
                    path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
                }
            }
        }
        return this.path(path).attr({
            fill: "#000",
            stroke: "none"
        });
    };

    /*\
     * Paper.add
     [ method ]
     **
     * Imports elements in JSON array in format `{type: type, <attributes>}`
     **
     > Parameters
     **
     - json (array)
     = (object) resulting set of imported elements
     > Usage
     | paper.add([
     |     {
     |         type: "circle",
     |         cx: 10,
     |         cy: 10,
     |         r: 5
     |     },
     |     {
     |         type: "rect",
     |         x: 10,
     |         y: 10,
     |         width: 10,
     |         height: 10,
     |         fill: "#fc0"
     |     }
     | ]);
    \*/
    paperproto.add = function (json) {
        if (R.is(json, "array")) {
            var res = this.set(),
                i = 0,
                ii = json.length,
                j;
            for (; i < ii; i++) {
                j = json[i] || {};
                elements[has](j.type) && res.push(this[j.type]().attr(j));
            }
        }
        return res;
    };

    /*\
     * Raphael.format
     [ method ]
     **
     * Simple format function. Replaces construction of type “`{<number>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - … (string) rest of arguments will be treated as parameters for replacement
     = (string) formated string
     > Usage
     | var x = 10,
     |     y = 20,
     |     width = 40,
     |     height = 50;
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.format("M{0},{1}h{2}v{3}h{4}z", x, y, width, height, -width));
    \*/
    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    /*\
     * Raphael.fullfill
     [ method ]
     **
     * A little bit more advanced format function than @Raphael.format. Replaces construction of type “`{<name>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - json (object) object which properties will be used as a replacement
     = (string) formated string
     > Usage
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.fullfill("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
     |     x: 10,
     |     y: 20,
     |     dim: {
     |         width: 40,
     |         height: 50,
     |         "negative width": -40
     |     }
     | }));
    \*/
    R.fullfill = (function () {
        var tokenRegex = /\{([^\}]+)\}/g,
            objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
            replacer = function (all, key, obj) {
                var res = obj;
                key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                    name = name || quotedName;
                    if (res) {
                        if (name in res) {
                            res = res[name];
                        }
                        typeof res == "function" && isFunc && (res = res());
                    }
                });
                res = (res == null || res == obj ? all : res) + "";
                return res;
            };
        return function (str, obj) {
            return String(str).replace(tokenRegex, function (all, key) {
                return replacer(all, key, obj);
            });
        };
    })();
    /*\
     * Raphael.ninja
     [ method ]
     **
     * If you want to leave no trace of Raphaël (Well, Raphaël creates only one global variable `Raphael`, but anyway.) You can use `ninja` method.
     * Beware, that in this case plugins could stop working, because they are depending on global variable existance.
     **
     = (object) Raphael object
     > Usage
     | (function (local_raphael) {
     |     var paper = local_raphael(10, 10, 320, 200);
     |     …
     | })(Raphael.ninja());
    \*/
    R.ninja = function () {
        oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    /*\
     * Raphael.st
     [ property (object) ]
     **
     * You can add your own method to elements and sets. It is wise to add a set method for each element method
     * you added, so you will be able to call the same method on sets too.
     **
     * See also @Raphael.el.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | Raphael.st.red = function () {
     |     this.forEach(function (el) {
     |         el.red();
     |     });
     | };
     | // then use it
     | paper.set(paper.circle(100, 100, 20), paper.circle(110, 100, 20)).red();
    \*/
    R.st = setproto;
    // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
    (function (doc, loaded, f) {
        if (doc.readyState == null && doc.addEventListener){
            doc.addEventListener(loaded, f = function () {
                doc.removeEventListener(loaded, f, false);
                doc.readyState = "complete";
            }, false);
            doc.readyState = "loading";
        }
        function isLoaded() {
            (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
        }
        isLoaded();
    })(document, "DOMContentLoaded");

    eve.on("raphael.DOMload", function () {
        loaded = true;
    });

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ SVG Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function(){
    if (!R.svg) {
        return;
    }
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        toInt = parseInt,
        math = Math,
        mmax = math.max,
        abs = math.abs,
        pow = math.pow,
        separator = /[, ]+/,
        eve = R.eve,
        E = "",
        S = " ";
    var xlink = "http://www.w3.org/1999/xlink",
        markers = {
            block: "M5,0 0,2.5 5,5z",
            classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
            diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
            open: "M6,1 1,3.5 6,6",
            oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
        },
        markerCounter = {};
    R.toString = function () {
        return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
    };
    var $ = function (el, attr) {
        if (attr) {
            if (typeof el == "string") {
                el = $(el);
            }
            for (var key in attr) if (attr[has](key)) {
                if (key.substring(0, 6) == "xlink:") {
                    el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                } else {
                    el.setAttribute(key, Str(attr[key]));
                }
            }
        } else {
            el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
            el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
        }
        return el;
    },
    addGradientFill = function (element, gradient) {
        var type = "linear",
            id = element.id + gradient,
            fx = .5, fy = .5,
            o = element.node,
            SVG = element.paper,
            s = o.style,
            el = R._g.doc.getElementById(id);
        if (!el) {
            gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient.split(/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = R._parseDots(gradient);
            if (!dots) {
                return null;
            }
            id = id.replace(/[\(\)\s,\xb0#]/g, "_");
            
            if (element.gradient && id != element.gradient.id) {
                SVG.defs.removeChild(element.gradient);
                delete element.gradient;
            }

            if (!element.gradient) {
                el = $(type + "Gradient", {id: id});
                element.gradient = el;
                $(el, type == "radial" ? {
                    fx: fx,
                    fy: fy
                } : {
                    x1: vector[0],
                    y1: vector[1],
                    x2: vector[2],
                    y2: vector[3],
                    gradientTransform: element.matrix.invert()
                });
                SVG.defs.appendChild(el);
                for (var i = 0, ii = dots.length; i < ii; i++) {
                    el.appendChild($("stop", {
                        offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                        "stop-color": dots[i].color || "#fff"
                    }));
                }
            }
        }
        $(o, {
            fill: "url(#" + id + ")",
            opacity: 1,
            "fill-opacity": 1
        });
        s.fill = E;
        s.opacity = 1;
        s.fillOpacity = 1;
        return 1;
    },
    updatePosition = function (o) {
        var bbox = o.getBBox(1);
        $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
    },
    addArrow = function (o, value, isEnd) {
        if (o.type == "path") {
            var values = Str(value).toLowerCase().split("-"),
                p = o.paper,
                se = isEnd ? "end" : "start",
                node = o.node,
                attrs = o.attrs,
                stroke = attrs["stroke-width"],
                i = values.length,
                type = "classic",
                from,
                to,
                dx,
                refX,
                attr,
                w = 3,
                h = 3,
                t = 5;
            while (i--) {
                switch (values[i]) {
                    case "block":
                    case "classic":
                    case "oval":
                    case "diamond":
                    case "open":
                    case "none":
                        type = values[i];
                        break;
                    case "wide": h = 5; break;
                    case "narrow": h = 2; break;
                    case "long": w = 5; break;
                    case "short": w = 2; break;
                }
            }
            if (type == "open") {
                w += 2;
                h += 2;
                t += 2;
                dx = 1;
                refX = isEnd ? 4 : 1;
                attr = {
                    fill: "none",
                    stroke: attrs.stroke
                };
            } else {
                refX = dx = w / 2;
                attr = {
                    fill: attrs.stroke,
                    stroke: "none"
                };
            }
            if (o._.arrows) {
                if (isEnd) {
                    o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                    o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                } else {
                    o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                    o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                }
            } else {
                o._.arrows = {};
            }
            if (type != "none") {
                var pathId = "raphael-marker-" + type,
                    markerId = "raphael-marker-" + se + type + w + h;
                if (!R._g.doc.getElementById(pathId)) {
                    p.defs.appendChild($($("path"), {
                        "stroke-linecap": "round",
                        d: markers[type],
                        id: pathId
                    }));
                    markerCounter[pathId] = 1;
                } else {
                    markerCounter[pathId]++;
                }
                var marker = R._g.doc.getElementById(markerId),
                    use;
                if (!marker) {
                    marker = $($("marker"), {
                        id: markerId,
                        markerHeight: h,
                        markerWidth: w,
                        orient: "auto",
                        refX: refX,
                        refY: h / 2
                    });
                    use = $($("use"), {
                        "xlink:href": "#" + pathId,
                        transform: (isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")",
                        "stroke-width": (1 / ((w / t + h / t) / 2)).toFixed(4)
                    });
                    marker.appendChild(use);
                    p.defs.appendChild(marker);
                    markerCounter[markerId] = 1;
                } else {
                    markerCounter[markerId]++;
                    use = marker.getElementsByTagName("use")[0];
                }
                $(use, attr);
                var delta = dx * (type != "diamond" && type != "oval");
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - delta * stroke;
                } else {
                    from = delta * stroke;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                attr = {};
                attr["marker-" + se] = "url(#" + markerId + ")";
                if (to || from) {
                    attr.d = R.getSubpath(attrs.path, from, to);
                }
                $(node, attr);
                o._.arrows[se + "Path"] = pathId;
                o._.arrows[se + "Marker"] = markerId;
                o._.arrows[se + "dx"] = delta;
                o._.arrows[se + "Type"] = type;
                o._.arrows[se + "String"] = value;
            } else {
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - from;
                } else {
                    from = 0;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                o._.arrows[se + "Path"] && $(node, {d: R.getSubpath(attrs.path, from, to)});
                delete o._.arrows[se + "Path"];
                delete o._.arrows[se + "Marker"];
                delete o._.arrows[se + "dx"];
                delete o._.arrows[se + "Type"];
                delete o._.arrows[se + "String"];
            }
            for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                var item = R._g.doc.getElementById(attr);
                item && item.parentNode.removeChild(item);
            }
        }
    },
    dasharray = {
        "": [0],
        "none": [0],
        "-": [3, 1],
        ".": [1, 1],
        "-.": [3, 1, 1, 1],
        "-..": [3, 1, 1, 1, 1, 1],
        ". ": [1, 3],
        "- ": [4, 3],
        "--": [8, 3],
        "- .": [4, 3, 1, 3],
        "--.": [8, 3, 1, 3],
        "--..": [8, 3, 1, 3, 1, 3]
    },
    addDashes = function (o, value, params) {
        value = dasharray[Str(value).toLowerCase()];
        if (value) {
            var width = o.attrs["stroke-width"] || "1",
                butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                dashes = [],
                i = value.length;
            while (i--) {
                dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
            }
            $(o.node, {"stroke-dasharray": dashes.join(",")});
        }
    },
    setFillAndStroke = function (o, params) {
        var node = o.node,
            attrs = o.attrs,
            vis = node.style.visibility;
        node.style.visibility = "hidden";
        for (var att in params) {
            if (params[has](att)) {
                if (!R._availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "blur":
                        o.blur(value);
                        break;
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (pn.tagName.toLowerCase() != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl.appendChild(node);
                            pn = hl;
                        }
                        if (att == "target") {
                            pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
                        } else {
                            pn.setAttributeNS(xlink, att, value);
                        }
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "transform":
                        o.transform(value);
                        break;
                    case "arrow-start":
                        addArrow(o, value);
                        break;
                    case "arrow-end":
                        addArrow(o, value, 1);
                        break;
                    case "clip-rect":
                        var rect = Str(value).split(separator);
                        if (rect.length == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = R.createUUID();
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el.appendChild(rc);
                            o.paper.defs.appendChild(el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var path = node.getAttribute("clip-path");
                            if (path) {
                                var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        }
                    break;
                    case "path":
                        if (o.type == "path") {
                            $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                            o._.dirty = 1;
                            if (o._.arrows) {
                                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                            }
                        }
                        break;
                    case "width":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "height":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node.setAttribute(att, value);
                        }
                        o._.dirty = 1;
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        if (o._.sx != 1 || o._.sy != 1) {
                            value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                        }
                        if (o.paper._vbSize) {
                            value *= o.paper._vbSize;
                        }
                        node.setAttribute(att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"], params);
                        }
                        if (o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value, params);
                        break;
                    case "fill":
                        var isURL = Str(value).match(R._ISURL);
                        if (isURL) {
                            el = $("pattern");
                            var ig = $("image");
                            el.id = R.createUUID();
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                            $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                            el.appendChild(ig);

                            (function (el) {
                                R._preload(isURL[1], function () {
                                    var w = this.offsetWidth,
                                        h = this.offsetHeight;
                                    $(el, {width: w, height: h});
                                    $(ig, {width: w, height: h});
                                    o.paper.safari();
                                });
                            })(el);
                            o.paper.defs.appendChild(el);
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        var clr = R.getRGB(value);
                        if (!clr.error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                            if ("opacity" in attrs || "fill-opacity" in attrs) {
                                var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                }
                            }
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                        clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                    case "stroke":
                        clr = R.getRGB(value);
                        node.setAttribute(att, clr.hex);
                        att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        if (att == "stroke" && o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "gradient":
                        (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                        break;
                    case "opacity":
                        if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                            $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                        }
                        // fall
                    case "fill-opacity":
                        if (attrs.gradient) {
                            gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                            if (gradient) {
                                stops = gradient.getElementsByTagName("stop");
                                $(stops[stops.length - 1], {"stop-opacity": value});
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att.replace(/(\-.)/g, function (w) {
                            return w.substring(1).toUpperCase();
                        });
                        node.style[cssrule] = value;
                        o._.dirty = 1;
                        node.setAttribute(att, value);
                        break;
                }
            }
        }

        tuneText(o, params);
        node.style.visibility = vis;
    },
    leading = 1.2,
    tuneText = function (el, params) {
        if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
            return;
        }
        var a = el.attrs,
            node = el.node,
            fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

        if (params[has]("text")) {
            a.text = params.text;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var texts = Str(params.text).split("\n"),
                tspans = [],
                tspan;
            for (var i = 0, ii = texts.length; i < ii; i++) {
                tspan = $("tspan");
                i && $(tspan, {dy: fontSize * leading, x: a.x});
                tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                node.appendChild(tspan);
                tspans[i] = tspan;
            }
        } else {
            tspans = node.getElementsByTagName("tspan");
            for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                $(tspans[i], {dy: fontSize * leading, x: a.x});
            } else {
                $(tspans[0], {dy: 0});
            }
        }
        $(node, {x: a.x, y: a.y});
        el._.dirty = 1;
        var bb = el._getBBox(),
            dif = a.y - (bb.y + bb.height / 2);
        dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
    },
    Element = function (node, svg) {
        var X = 0,
            Y = 0;
        /*\
         * Element.node
         [ property (object) ]
         **
         * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
         **
         * Note: Don’t mess with it.
         > Usage
         | // draw a circle at coordinate 10,10 with radius of 10
         | var c = paper.circle(10, 10, 10);
         | c.node.onclick = function () {
         |     c.attr("fill", "red");
         | };
        \*/
        this[0] = this.node = node;
        /*\
         * Element.raphael
         [ property (object) ]
         **
         * Internal reference to @Raphael object. In case it is not available.
         > Usage
         | Raphael.el.red = function () {
         |     var hsb = this.paper.raphael.rgb2hsb(this.attr("fill"));
         |     hsb.h = 1;
         |     this.attr({fill: this.paper.raphael.hsb2rgb(hsb).hex});
         | }
        \*/
        node.raphael = true;
        /*\
         * Element.id
         [ property (number) ]
         **
         * Unique id of the element. Especially usesful when you want to listen to events of the element, 
         * because all events are fired in format `<module>.<action>.<id>`. Also useful for @Paper.getById method.
        \*/
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.matrix = R.matrix();
        this.realPath = null;
        /*\
         * Element.paper
         [ property (object) ]
         **
         * Internal reference to “paper” where object drawn. Mainly for use in plugins and element extensions.
         > Usage
         | Raphael.el.cross = function () {
         |     this.attr({fill: "red"});
         |     this.paper.path("M10,10L50,50M50,10L10,50")
         |         .attr({stroke: "red"});
         | }
        \*/
        this.paper = svg;
        this.attrs = this.attrs || {};
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            deg: 0,
            dx: 0,
            dy: 0,
            dirty: 1
        };
        !svg.bottom && (svg.bottom = this);
        /*\
         * Element.prev
         [ property (object) ]
         **
         * Reference to the previous element in the hierarchy.
        \*/
        this.prev = svg.top;
        svg.top && (svg.top.next = this);
        svg.top = this;
        /*\
         * Element.next
         [ property (object) ]
         **
         * Reference to the next element in the hierarchy.
        \*/
        this.next = null;
    },
    elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;

    R._engine.path = function (pathString, SVG) {
        var el = $("path");
        SVG.canvas && SVG.canvas.appendChild(el);
        var p = new Element(el, SVG);
        p.type = "path";
        setFillAndStroke(p, {
            fill: "none",
            stroke: "#000",
            path: pathString
        });
        return p;
    };
    /*\
     * Element.rotate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds rotation by given angle around given point to the list of
     * transformations of the element.
     > Parameters
     - deg (number) angle in degrees
     - cx (number) #optional x coordinate of the centre of rotation
     - cy (number) #optional y coordinate of the centre of rotation
     * If cx & cy aren’t specified centre of the shape is used as a point of rotation.
     = (object) @Element
    \*/
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    /*\
     * Element.scale
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds scale by given amount relative to given point to the list of
     * transformations of the element.
     > Parameters
     - sx (number) horisontal scale amount
     - sy (number) vertical scale amount
     - cx (number) #optional x coordinate of the centre of scale
     - cy (number) #optional y coordinate of the centre of scale
     * If cx & cy aren’t specified centre of the shape is used instead.
     = (object) @Element
    \*/
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        return this;
    };
    /*\
     * Element.translate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds translation by given amount to the list of transformations of the element.
     > Parameters
     - dx (number) horisontal shift
     - dy (number) vertical shift
     = (object) @Element
    \*/
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    /*\
     * Element.transform
     [ method ]
     **
     * Adds transformation to the element which is separate to other attributes,
     * i.e. translation doesn’t change `x` or `y` of the rectange. The format
     * of transformation string is similar to the path string syntax:
     | "t100,100r30,100,100s2,2,100,100r45s1.5"
     * Each letter is a command. There are four commands: `t` is for translate, `r` is for rotate, `s` is for
     * scale and `m` is for matrix.
     *
     * There are also alternative “absolute” translation, rotation and scale: `T`, `R` and `S`. They will not take previous transformation into account. For example, `...T100,0` will always move element 100 px horisontally, while `...t100,0` could move it vertically if there is `r90` before. Just compare results of `r90t100,0` and `r90T100,0`.
     *
     * So, the example line above could be read like “translate by 100, 100; rotate 30° around 100, 100; scale twice around 100, 100;
     * rotate 45° around centre; scale 1.5 times relative to centre”. As you can see rotate and scale commands have origin
     * coordinates as optional parameters, the default is the centre point of the element.
     * Matrix accepts six parameters.
     > Usage
     | var el = paper.rect(10, 20, 300, 200);
     | // translate 100, 100, rotate 45°, translate -100, 0
     | el.transform("t100,100r45t-100,0");
     | // if you want you can append or prepend transformations
     | el.transform("...t50,50");
     | el.transform("s2...");
     | // or even wrap
     | el.transform("t50,50...t-50-50");
     | // to reset transformation call method with empty string
     | el.transform("");
     | // to get current value call it without parameters
     | console.log(el.transform());
     > Parameters
     - tstr (string) #optional transformation string
     * If tstr isn’t specified
     = (string) current transformation string
     * else
     = (object) @Element
    \*/
    elproto.transform = function (tstr) {
        var _ = this._;
        if (tstr == null) {
            return _.transform;
        }
        R._extractTransform(this, tstr);

        this.clip && $(this.clip, {transform: this.matrix.invert()});
        this.pattern && updatePosition(this);
        this.node && $(this.node, {transform: this.matrix});
    
        if (_.sx != 1 || _.sy != 1) {
            var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
            this.attr({"stroke-width": sw});
        }

        return this;
    };
    /*\
     * Element.hide
     [ method ]
     **
     * Makes element invisible. See @Element.show.
     = (object) @Element
    \*/
    elproto.hide = function () {
        !this.removed && this.paper.safari(this.node.style.display = "none");
        return this;
    };
    /*\
     * Element.show
     [ method ]
     **
     * Makes element visible. See @Element.hide.
     = (object) @Element
    \*/
    elproto.show = function () {
        !this.removed && this.paper.safari(this.node.style.display = "");
        return this;
    };
    /*\
     * Element.remove
     [ method ]
     **
     * Removes element from the paper.
    \*/
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        var paper = this.paper;
        paper.__set__ && paper.__set__.exclude(this);
        eve.unbind("raphael.*.*." + this.id);
        if (this.gradient) {
            paper.defs.removeChild(this.gradient);
        }
        R._tear(this, paper);
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.removeChild(this.node.parentNode);
        } else {
            this.node.parentNode.removeChild(this.node);
        }
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto._getBBox = function () {
        if (this.node.style.display == "none") {
            this.show();
            var hide = true;
        }
        var bbox = {};
        try {
            bbox = this.node.getBBox();
        } catch(e) {
            // Firefox 3.0.x plays badly here
        } finally {
            bbox = bbox || {};
        }
        hide && this.hide();
        return bbox;
    };
    /*\
     * Element.attr
     [ method ]
     **
     * Sets the attributes of the element.
     > Parameters
     - attrName (string) attribute’s name
     - value (string) value
     * or
     - params (object) object of name/value pairs
     * or
     - attrName (string) attribute’s name
     * or
     - attrNames (array) in this case method returns array of current values for given attribute names
     = (object) @Element if attrsName & value or params are passed in.
     = (...) value of the attribute if only attrsName is passed in.
     = (array) array of values of the attribute if attrsNames is passed in.
     = (object) object of attributes if nothing is passed in.
     > Possible parameters
     # <p>Please refer to the <a href="http://www.w3.org/TR/SVG/" title="The W3C Recommendation for the SVG language describes these properties in detail.">SVG specification</a> for an explanation of these parameters.</p>
     o arrow-end (string) arrowhead on the end of the path. The format for string is `<type>[-<width>[-<length>]]`. Possible types: `classic`, `block`, `open`, `oval`, `diamond`, `none`, width: `wide`, `narrow`, `medium`, length: `long`, `short`, `midium`.
     o clip-rect (string) comma or space separated values: x, y, width and height
     o cursor (string) CSS type of the cursor
     o cx (number) the x-axis coordinate of the center of the circle, or ellipse
     o cy (number) the y-axis coordinate of the center of the circle, or ellipse
     o fill (string) colour, gradient or image
     o fill-opacity (number)
     o font (string)
     o font-family (string)
     o font-size (number) font size in pixels
     o font-weight (string)
     o height (number)
     o href (string) URL, if specified element behaves as hyperlink
     o opacity (number)
     o path (string) SVG path string format
     o r (number) radius of the circle, ellipse or rounded corner on the rect
     o rx (number) horisontal radius of the ellipse
     o ry (number) vertical radius of the ellipse
     o src (string) image URL, only works for @Element.image element
     o stroke (string) stroke colour
     o stroke-dasharray (string) [“”, “`-`”, “`.`”, “`-.`”, “`-..`”, “`. `”, “`- `”, “`--`”, “`- .`”, “`--.`”, “`--..`”]
     o stroke-linecap (string) [“`butt`”, “`square`”, “`round`”]
     o stroke-linejoin (string) [“`bevel`”, “`round`”, “`miter`”]
     o stroke-miterlimit (number)
     o stroke-opacity (number)
     o stroke-width (number) stroke width in pixels, default is '1'
     o target (string) used with href
     o text (string) contents of the text element. Use `\n` for multiline text
     o text-anchor (string) [“`start`”, “`middle`”, “`end`”], default is “`middle`”
     o title (string) will create tooltip with a given text
     o transform (string) see @Element.transform
     o width (number)
     o x (number)
     o y (number)
     > Gradients
     * Linear gradient format: “`‹angle›-‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`90-#fff-#000`” – 90°
     * gradient from white to black or “`0-#fff-#f00:20-#000`” – 0° gradient from white via red (at 20%) to black.
     *
     * radial gradient: “`r[(‹fx›, ‹fy›)]‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`r#fff-#000`” –
     * gradient from white to black or “`r(0.25, 0.75)#fff-#000`” – gradient from white to black with focus point
     * at 0.25, 0.75. Focus point coordinates are in 0..1 range. Radial gradients can only be applied to circles and ellipses.
     > Path String
     # <p>Please refer to <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path’s data attribute’s format are described in the SVG specification.">SVG documentation regarding path string</a>. Raphaël fully supports it.</p>
     > Colour Parsing
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>rgba(•••, •••, •••, •••) — red, green and blue channels’ values: (“<code>rgba(200,&nbsp;100,&nbsp;0, .5)</code>”)</li>
     #     <li>rgba(•••%, •••%, •••%, •••%) — same as above, but in %: (“<code>rgba(100%,&nbsp;175%,&nbsp;0%, 50%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsba(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>hsl(•••, •••, •••) — almost the same as hsb, see <a href="http://en.wikipedia.org/wiki/HSL_and_HSV" title="HSL and HSV - Wikipedia, the free encyclopedia">Wikipedia page</a></li>
     #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsla(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>Optionally for hsb and hsl you could specify hue as a degree: “<code>hsl(240deg,&nbsp;1,&nbsp;.5)</code>” or, if you want to go fancy, “<code>hsl(240°,&nbsp;1,&nbsp;.5)</code>”</li>
     # </ul>
    \*/
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            if (name == "transform") {
                return this._.transform;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        if (value != null) {
            var params = {};
            params[name] = value;
        } else if (name != null && R.is(name, "object")) {
            params = name;
        }
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
            var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
            this.attrs[key] = params[key];
            for (var subkey in par) if (par[has](subkey)) {
                params[subkey] = par[subkey];
            }
        }
        setFillAndStroke(this, params);
        return this;
    };
    /*\
     * Element.toFront
     [ method ]
     **
     * Moves the element so it is the closest to the viewer’s eyes, on top of other elements.
     = (object) @Element
    \*/
    elproto.toFront = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.appendChild(this.node.parentNode);
        } else {
            this.node.parentNode.appendChild(this.node);
        }
        var svg = this.paper;
        svg.top != this && R._tofront(this, svg);
        return this;
    };
    /*\
     * Element.toBack
     [ method ]
     **
     * Moves the element so it is the furthest from the viewer’s eyes, behind other elements.
     = (object) @Element
    \*/
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        var parent = this.node.parentNode;
        if (parent.tagName.toLowerCase() == "a") {
            parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild); 
        } else if (parent.firstChild != this.node) {
            parent.insertBefore(this.node, this.node.parentNode.firstChild);
        }
        R._toback(this, this.paper);
        var svg = this.paper;
        return this;
    };
    /*\
     * Element.insertAfter
     [ method ]
     **
     * Inserts current object after the given one.
     = (object) @Element
    \*/
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[element.length - 1].node;
        if (node.nextSibling) {
            node.parentNode.insertBefore(this.node, node.nextSibling);
        } else {
            node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    /*\
     * Element.insertBefore
     [ method ]
     **
     * Inserts current object before the given one.
     = (object) @Element
    \*/
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[0].node;
        node.parentNode.insertBefore(this.node, node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        // Experimental. No Safari support. Use it on your own risk.
        var t = this;
        if (+size !== 0) {
            var fltr = $("filter"),
                blur = $("feGaussianBlur");
            t.attrs.blur = size;
            fltr.id = R.createUUID();
            $(blur, {stdDeviation: +size || 1.5});
            fltr.appendChild(blur);
            t.paper.defs.appendChild(fltr);
            t._blur = fltr;
            $(t.node, {filter: "url(#" + fltr.id + ")"});
        } else {
            if (t._blur) {
                t._blur.parentNode.removeChild(t._blur);
                delete t._blur;
                delete t.attrs.blur;
            }
            t.node.removeAttribute("filter");
        }
        return t;
    };
    R._engine.circle = function (svg, x, y, r) {
        var el = $("circle");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
        res.type = "circle";
        $(el, res.attrs);
        return res;
    };
    R._engine.rect = function (svg, x, y, w, h, r) {
        var el = $("rect");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
        res.type = "rect";
        $(el, res.attrs);
        return res;
    };
    R._engine.ellipse = function (svg, x, y, rx, ry) {
        var el = $("ellipse");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
        res.type = "ellipse";
        $(el, res.attrs);
        return res;
    };
    R._engine.image = function (svg, src, x, y, w, h) {
        var el = $("image");
        $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
        el.setAttributeNS(xlink, "href", src);
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, src: src};
        res.type = "image";
        return res;
    };
    R._engine.text = function (svg, x, y, text) {
        var el = $("text");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {
            x: x,
            y: y,
            "text-anchor": "middle",
            text: text,
            font: R._availableAttrs.font,
            stroke: "none",
            fill: "#000"
        };
        res.type = "text";
        setFillAndStroke(res, res.attrs);
        return res;
    };
    R._engine.setSize = function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        if (this._viewBox) {
            this.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con && con.container,
            x = con.x,
            y = con.y,
            width = con.width,
            height = con.height;
        if (!container) {
            throw new Error("SVG container not found.");
        }
        var cnvs = $("svg"),
            css = "overflow:hidden;",
            isFloating;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        $(cnvs, {
            height: height,
            version: 1.1,
            width: width,
            xmlns: "http://www.w3.org/2000/svg"
        });
        if (container == 1) {
            cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
            R._g.doc.body.appendChild(cnvs);
            isFloating = 1;
        } else {
            cnvs.style.cssText = css + "position:relative";
            if (container.firstChild) {
                container.insertBefore(cnvs, container.firstChild);
            } else {
                container.appendChild(cnvs);
            }
        }
        container = new R._Paper;
        container.width = width;
        container.height = height;
        container.canvas = cnvs;
        container.clear();
        container._left = container._top = 0;
        isFloating && (container.renderfix = function () {});
        container.renderfix();
        return container;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var size = mmax(w / this.width, h / this.height),
            top = this.top,
            aspectRatio = fit ? "meet" : "xMinYMin",
            vb,
            sw;
        if (x == null) {
            if (this._vbSize) {
                size = 1;
            }
            delete this._vbSize;
            vb = "0 0 " + this.width + S + this.height;
        } else {
            this._vbSize = size;
            vb = x + S + y + S + w + S + h;
        }
        $(this.canvas, {
            viewBox: vb,
            preserveAspectRatio: aspectRatio
        });
        while (size && top) {
            sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
            top.attr({"stroke-width": sw});
            top._.dirty = 1;
            top._.dirtyT = 1;
            top = top.prev;
        }
        this._viewBox = [x, y, w, h, !!fit];
        return this;
    };
    /*\
     * Paper.renderfix
     [ method ]
     **
     * Fixes the issue of Firefox and IE9 regarding subpixel rendering. If paper is dependant
     * on other elements after reflow it could shift half pixel which cause for lines to lost their crispness.
     * This method fixes the issue.
     **
       Special thanks to Mariusz Nowak (http://www.medikoo.com/) for this method.
    \*/
    R.prototype.renderfix = function () {
        var cnvs = this.canvas,
            s = cnvs.style,
            pos;
        try {
            pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
        } catch (e) {
            pos = cnvs.createSVGMatrix();
        }
        var left = -pos.e % 1,
            top = -pos.f % 1;
        if (left || top) {
            if (left) {
                this._left = (this._left + left) % 1;
                s.left = this._left + "px";
            }
            if (top) {
                this._top = (this._top + top) % 1;
                s.top = this._top + "px";
            }
        }
    };
    /*\
     * Paper.clear
     [ method ]
     **
     * Clears the paper, i.e. removes all the elements.
    \*/
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        var c = this.canvas;
        while (c.firstChild) {
            c.removeChild(c.firstChild);
        }
        this.bottom = this.top = null;
        (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
        c.appendChild(this.desc);
        c.appendChild(this.defs = $("defs"));
    };
    /*\
     * Paper.remove
     [ method ]
     **
     * Removes the paper from the DOM.
    \*/
    R.prototype.remove = function () {
        eve("raphael.remove", this);
        this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
    };
    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
})();

    // EXPOSE
    // SVG and VML are appended just before the EXPOSE line
    // Even with AMD, Raphael should be defined globally
    oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);

    return R;
}));
;(function (R) {
    R.fn.handle = function (x, y) {
        return this.path(icons.handle + c);
    };

    R.fn.editor = function (x, y) {
        return this.path(icons.editor + c);
    };

    R.fn.deleter = function (x, y) {
        return this.path(icons.deleter + c);
    };

    R.fn.searcher = function (x, y) {
        return this.path(icons.searcher + c);
    };

    R.fn.plus = function(x, y) {
        return this.path(icons.plus + c);
    };

    R.fn.link = function (x, y) {
        return this.path(icons.link + c);
    };

    R.fn.up = function (x, y) {
        return this.path(icons.up);
    };

    R.fn.down = function (x, y) {
        return this.path(icons.up).transform("r180");
    };

    R.fn.setting = function (x, y) {
        return this.path(icons.settings + c).transform("s,.9,.9");
    };

    R.fn.arrow = function() {
        return this.path(icons.arrow + c);
    };

    R.fn.linkArrow = function() {
        return this.path(icons.arrow + c).attr({ fill: '#648CB2' });
    };

    R.fn.speechbubble = function(x, y, txt) {
        var _bubble = this.set();
        _bubble.push(this.path(icons.speechbubble).transform(["t", x, ",", y].join()).scale(6,4).scale(-1,1)).attr({fill: "#fff", stroke: "#000", "stroke-width": 3});
        _bubble.push(this.text(x + 10, y + 10, txt).attr({"font-size": 12}));
        return _bubble;
    };

    R.fn.resize = function(img) {
        //return this.rect(0,0,10,10);
        //return this.path("M8.818,9.464l9.712,10.792L8.818,9.464zM 11.783,20.823 17.326,18.918 19.804,13.604 24.348,26.72 zM 15.565,8.896 10.022,10.802 7.544,16.115 3,3 z");
        //var _resize = this.set();
        //_resize.push(this.path("M 56.6875 0.125 L 29.875 26.625 L -0.3125 56.53125 L 25.46875 56.53125 L 56.6875 25.375 L 56.6875 0.125 z").attr({stroke: "#fff", fill: "#fff"}).transform("s.5") );
        //_resize.push(this.path("M 0,56.829931 56.539823,0.29010776 zM 14.289023,56.569787 56.693882,14.164916 zM 25.229778,56.521813 57.03342,24.71816 z").attr({stroke: "#000"}).transform("s.5") );
        //_resize.push(this.path(icons.resizeMarker2));
        //return _resize;
        return this.image(img, 0, 0, 22, 23);
    };

    R.fn.slider = function(length, start, end, initVal, onSlide, onDone) {
        
        var _slider = this.set();
        _slider.push(this.rect(10, 10, 10, length, 5).attr({fill: "#ccc", stroke: "#333", "stroke-width": 2}));
        _slider.push(this.path(icons.sliderHandle).attr({fill: "#eee", stroke: "#ccc"}).transform("r270"));

        _slider.setValue = function(val) {
            var _setCurrent = ((val * length) / end);
            _slider[1].transform(["t", _slider[1].attr("x"), _setCurrent, "r270"].join());
            _lockX = _slider[1].attr("x"), _initY = _slider[1].attr("y"), _lyp = _setCurrent, _lastDy = 0;
        };

        //globals
        var _lockX, _initY, _lyp, _lastDy = 0;

        //set current value
        _slider.setValue(initVal);

        var init = function (x, y) {
        };

        var move = function (dx, dy) {
            dy = _lyp + dy;
            if (dy < 0) dy = 0;
            if (dy > length - 15) dy = length - 15;
            _lastDy = dy;

            _slider[1].transform(["t", _lockX, dy, "r270"].join());

            var currentValue = (((dy - _initY) * end) / length) + start;
            if (Slatebox.isFunction(onSlide)) {
                onSlide.apply(this, [currentValue]);
            };
        };

        var up = function () {
            _lyp = _lastDy - _initY;
            var currentValue = ((_lyp * end) / length) + start;
            if (Slatebox.isFunction(onSlide)) {
                onSlide.apply(this, [currentValue]);
            };
            if (Slatebox.isFunction(onDone)) {
                onDone.apply(this, [currentValue]);
            };
        };

        _slider[1].drag(move, init, up);

        return _slider;
    };

    var c = "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z";

    var icons = {
        handle: "M26.33,15.836l-3.893-1.545l3.136-7.9c0.28-0.705-0.064-1.505-0.771-1.785c-0.707-0.28-1.506,0.065-1.785,0.771l-3.136,7.9l-4.88-1.937l3.135-7.9c0.281-0.706-0.064-1.506-0.77-1.786c-0.706-0.279-1.506,0.065-1.785,0.771l-3.136,7.9L8.554,8.781l-1.614,4.066l2.15,0.854l-2.537,6.391c-0.61,1.54,0.143,3.283,1.683,3.895l1.626,0.646L8.985,26.84c-0.407,1.025,0.095,2.188,1.122,2.596l0.93,0.369c1.026,0.408,2.188-0.095,2.596-1.121l0.877-2.207l1.858,0.737c1.54,0.611,3.284-0.142,3.896-1.682l2.535-6.391l1.918,0.761L26.33,15.836z"
        , editor: "M25.31,2.872l-3.384-2.127c-0.854-0.536-1.979-0.278-2.517,0.576l-1.334,2.123l6.474,4.066l1.335-2.122C26.42,4.533,26.164,3.407,25.31,2.872zM6.555,21.786l6.474,4.066L23.581,9.054l-6.477-4.067L6.555,21.786zM5.566,26.952l-0.143,3.819l3.379-1.787l3.14-1.658l-6.246-3.925L5.566,26.952z"
        , deleter: "M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z"
        , searcher: "M29.772,26.433l-7.126-7.126c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127L29.772,26.433zM7.203,13.885c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486c-0.007,3.58-2.905,6.476-6.484,6.484C10.106,20.361,7.209,17.465,7.203,13.885z"
        , up: "M1.67892,15.48059l23.55337,0l-11.37616,-13.92457l-12.17721,13.92457z"
        , arrow: "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM13.665,25.725l-3.536-3.539l6.187-6.187l-6.187-6.187l3.536-3.536l9.724,9.723L13.665,25.725z"
        , settings: "M16.015,12.03c-2.156,0-3.903,1.747-3.903,3.903c0,2.155,1.747,3.903,3.903,3.903c0.494,0,0.962-0.102,1.397-0.27l0.836,1.285l1.359-0.885l-0.831-1.276c0.705-0.706,1.142-1.681,1.142-2.757C19.918,13.777,18.171,12.03,16.015,12.03zM16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM26.174,20.809c-0.241,0.504-0.513,0.99-0.826,1.45L22.19,21.58c-0.481,0.526-1.029,0.994-1.634,1.385l0.119,3.202c-0.507,0.23-1.028,0.421-1.569,0.57l-1.955-2.514c-0.372,0.051-0.75,0.086-1.136,0.086c-0.356,0-0.706-0.029-1.051-0.074l-1.945,2.5c-0.541-0.151-1.065-0.342-1.57-0.569l0.117-3.146c-0.634-0.398-1.208-0.88-1.712-1.427L6.78,22.251c-0.313-0.456-0.583-0.944-0.826-1.448l2.088-2.309c-0.226-0.703-0.354-1.451-0.385-2.223l-2.768-1.464c0.055-0.563,0.165-1.107,0.301-1.643l3.084-0.427c0.29-0.702,0.675-1.352,1.135-1.942L8.227,7.894c0.399-0.389,0.83-0.744,1.283-1.07l2.663,1.672c0.65-0.337,1.349-0.593,2.085-0.75l0.968-3.001c0.278-0.021,0.555-0.042,0.837-0.042c0.282,0,0.56,0.022,0.837,0.042l0.976,3.028c0.72,0.163,1.401,0.416,2.036,0.75l2.704-1.697c0.455,0.326,0.887,0.681,1.285,1.07l-1.216,2.986c0.428,0.564,0.793,1.181,1.068,1.845l3.185,0.441c0.135,0.535,0.247,1.081,0.302,1.643l-2.867,1.516c-0.034,0.726-0.15,1.43-0.355,2.1L26.174,20.809z"
        , sliderHandle: "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584z"
        , speechbubble: "M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z"
        , resizeMarker: "M -0.124,19.563999 19.440001,0M 3.891,20.542999 20.047001,4.3850002M 8.8249998,20.936001 20.936001,8.8249998"
        , link: "M15.667,4.601c-1.684,1.685-2.34,3.985-2.025,6.173l3.122-3.122c0.004-0.005,0.014-0.008,0.016-0.012c0.21-0.403,0.464-0.789,0.802-1.126c1.774-1.776,4.651-1.775,6.428,0c1.775,1.773,1.777,4.652,0.002,6.429c-0.34,0.34-0.727,0.593-1.131,0.804c-0.004,0.002-0.006,0.006-0.01,0.01l-3.123,3.123c2.188,0.316,4.492-0.34,6.176-2.023c2.832-2.832,2.83-7.423,0-10.255C23.09,1.77,18.499,1.77,15.667,4.601zM14.557,22.067c-0.209,0.405-0.462,0.791-0.801,1.131c-1.775,1.774-4.656,1.774-6.431,0c-1.775-1.774-1.775-4.653,0-6.43c0.339-0.338,0.725-0.591,1.128-0.8c0.004-0.006,0.005-0.012,0.011-0.016l3.121-3.123c-2.187-0.316-4.489,0.342-6.172,2.024c-2.831,2.831-2.83,7.423,0,10.255c2.833,2.831,7.424,2.831,10.257,0c1.684-1.684,2.342-3.986,2.023-6.175l-3.125,3.123C14.565,22.063,14.561,22.065,14.557,22.067zM9.441,18.885l2.197,2.197c0.537,0.537,1.417,0.537,1.953,0l8.302-8.302c0.539-0.536,0.539-1.417,0.002-1.952l-2.199-2.197c-0.536-0.539-1.416-0.539-1.952-0.002l-8.302,8.303C8.904,17.469,8.904,18.349,9.441,18.885z"
        , resizeMarker2: "M22.5,8.5v3.168l3.832,3.832L22.5,19.332V22.5l7-7L22.5,8.5zM8.5,22.5v-3.168L4.667,15.5L8.5,11.668V8.5l-7,7L8.5,22.5zM15.5,14.101c-0.928,0-1.68,0.751-1.68,1.68c0,0.927,0.752,1.681,1.68,1.681c0.927,0,1.68-0.754,1.68-1.681C17.18,14.852,16.427,14.101,15.5,14.101zM10.46,14.101c-0.928,0-1.68,0.751-1.68,1.68c0,0.927,0.752,1.681,1.68,1.681s1.68-0.754,1.68-1.681C12.14,14.852,11.388,14.101,10.46,14.101zM20.541,14.101c-0.928,0-1.682,0.751-1.682,1.68c0,0.927,0.754,1.681,1.682,1.681s1.68-0.754,1.68-1.681C22.221,14.852,21.469,14.101,20.541,14.101z"
        , plus: "M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z"
    };
})(Raphael);
Raphael.fn.connection = function (_options) {
    var options = {
        sb: Slatebox
        , parent: null
        , child: null
        , lineColor: "#fff"
        , lineOpacity: 1
        , lineWidth: 20
        , blnStraight: false
        , showParentArrow: false
        , showChildArrow: false
        , isAnimating: false
    };
    _.extend(options, _options);

    function _in(val) {
        return !isNaN(parseFloat(val)) && isFinite(val);
    }

    function calcPath() {
        var bb1 = options.parent.vect.getBBox()
            , bb2 = options.child.vect.getBBox();

        var _px = _in(bb1.x) && bb1.x
            , _pcx = _in(bb1.cx) && bb1.cx
            , _py = _in(bb1.y) && bb1.y
            , _pcy = _in(bb1.cy) && bb1.cy
            , _cx = _in(bb2.x) && bb2.x
            , _ccx = _in(bb2.cx) && bb2.cx
            , _cy = _in(bb2.y) && bb2.y
            , _ccy = _in(bb2.cy) && bb2.cy;

        var p = [{ x: (_px || _pcx) + bb1.width / 2, y: (_py || _pcy) - 1 },
            { x: _px + bb1.width / 2, y: _py + bb1.height + 1 },
            { x: _px - 1, y: _py + bb1.height / 2 },
            { x: _px + bb1.width + 1, y: _py + bb1.height / 2 },
            { x: _cx + bb2.width / 2, y: _cy - 1 },
            { x: _cx + bb2.width / 2, y: _cy + bb2.height + 1 },
            { x: _cx - 1, y: _cy + bb2.height / 2 },
            { x: _cx + bb2.width + 1, y: _cy + bb2.height / 2}],
            d = {}, dis = [];

        for (var i = 0; i < 4; i++) {
            for (var j = 4; j < 8; j++) {
                var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
                if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
            }
        }

        var res = [0, 4];
        if (dis.length !== 0) {
            res = d[Math.min.apply(Math, dis)];
        }

        var x1 = p[res[0]].x,
            y1 = p[res[0]].y,
            x4 = p[res[1]].x,
            y4 = p[res[1]].y;
            dx = Math.max(Math.abs(x1 - x4) / 2, 10);
            dy = Math.max(Math.abs(y1 - y4) / 2, 10);

        var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
            y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
            x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
            y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);

        var size = 15;
        if (options.lineWidth > 10)
            size = 20;
        var shr = 2.4;
        var x1m = x1.toFixed(3), x4m = x4.toFixed(3), y1m = y1.toFixed(3), y4m = y4.toFixed(3);

        var path = ["M", x1m, y1.toFixed(3), "C", x2, y2, x3, y3, x4m, y4m].join(",");

        /*
        if (options.blnStraight) {
            x4m = (_cx + bb2.width / 2);
            y4m = (_cy + bb2.height / 2);
            path = ["M", x1m, y1.toFixed(3), "L", x4m, y4m].join(",");
        }

        if (options.showParentArrow) {
            var arrowAngle1 = Math.atan2(x3 - x4m, y4m - y3);
            if (options.blnStraight) {
                arrowAngle1 = Math.atan2(x1m - x4m, y4m - y1m);
            }
            arrowAngle1 = (arrowAngle1 / (2 * Math.PI)) * 360;
        }

        if (options.showChildArrow) {
            var arrowAngle2 = Math.atan2(x4m - x3, y3 - y4m);
            if (options.blnStraight) {
                arrowAngle2 = Math.atan2(x4m - x1m, y1m - y4m);
            }
            arrowAngle2 = (arrowAngle2 / (2 * Math.PI)) * 360;
        }

        var arrowPath1 = "M" + x4 + " " + y4 + " L" + (x4 - size) + " " + (y4 - size / shr) + " L" + (x4 - size) + " " + (y4 + size / shr) + " L" + x4 + " " + y4
            , arrowPath2 = "M" + x1 + " " + y1 + " L" + (x1 - size) + " " + (y1 - size / shr) + " L" + (x1 - size) + " " + (y1 + size / shr) + " L" + x1 + " " + y1;
        */
        return {
            path: path
            //, parent: { arrowPath: arrowPath1, arrowAngle: arrowAngle1, centerX: x4, centerY: y4 }
            //, child: { arrowPath: arrowPath2, arrowAngle: arrowAngle2, centerX: x1, centerY: y1 }
        };
    }

    this.removeConnection = function (options) {
        options.line.remove();
        /*
        if (options.showParentArrow) {
            options.parentArrow.remove();
        }
        if (options.showChildArrow) {
            options.childArrow.remove();
        }
        */
    };

    var details = calcPath()
        , _attr = { path: details.path, stroke: options.lineColor, fill: "none", "stroke-width": options.lineWidth, "fill-opacity": options.lineOpacity, opacity: options.lineOpacity };

    if (options.isAnimating === false) {
        _.extend(_attr, { "arrow-end": "classic" });
        /*
        if (options.line && !options.line.attr("arrow-end")) {
            options.line.remove();
            options.line = this.path(details.path).attr(_attr);
        }
        */
    } else {
        _.extend(_attr, { "arrow-end": "none" });
    }
    /*
    else if (options.line && options.line.attr("arrow-end")) {
        options.line.remove();
        options.line = this.path(details.path).attr(_attr);
        console.log("animating without arrow");
    }
    */

    if (options.line === undefined) {
        options.sb.extend(options, {
            line: this.path(details.path).attr(_attr) //.toBack() //, "arrow-end": "classic"
            //, parentArrow: this.path(details.parent.arrowPath).attr({ fill: options.lineColor, "fill-opacity": options.lineOpacity, stroke: "none", opacity: options.lineOpacity }).transform("r" + (90 + details.parent.arrowAngle) + "," + details.parent.centerX + "," + details.parent.centerY) //.toBack()
            //, childArrow: this.path(details.child.arrowPath).attr({ fill: options.lineColor, "fill-opacity": options.lineOpacity, stroke: "none", opacity: options.lineOpacity }).transform("r" + (90 + details.child.arrowAngle) + "," + details.child.centerX + "," + details.child.centerY) //.toBack()
        });

        //if (!options.showParentArrow) options.parentArrow.hide();
        //if (!options.showChildArrow) options.childArrow.hide();

    } else {
        options.line.attr(_attr); //.toBack(); //, "arrow-end": "classic"
        /*
        if (options.showParentArrow) {
            options.parentArrow.show();
            options.parentArrow.attr({ path: details.parent.arrowPath, fill: options.lineColor, "stroke-width": options.lineWidth, "fill-opacity": options.lineOpacity, opacity: options.lineOpacity }).transform("r" + (90 + details.parent.arrowAngle) + "," + details.parent.centerX + "," + details.parent.centerY); //.toBack();
        } else if (options.parentArrow) {
            options.parentArrow.hide();
        }

        if (options.showChildArrow) {
            options.childArrow.show();
            options.childArrow.attr({ path: details.child.arrowPath, fill: options.lineColor, "stroke-width": options.lineWidth, "fill-opacity": options.lineOpacity, opacity: options.lineOpacity }).transform("r" + (90 + details.child.arrowAngle) + "," + details.child.centerX + "," + details.child.centerY); //.toBack();
        } else if (options.childArrow) {
            options.childArrow.hide();
        }
        */
    }
    return options;
};
Raphael.el.tooltip = function (obj, w, h) {
    if (w === undefined) w = 80;
    if (h === undefined) h = 20;
    var _tt = this.paper.set();
    var pos = this.getBBox();

    if (obj.type === 'text') {
        //text tooltip
        _tt.push(this.paper.rect(pos.x, pos.y + (h * -1) - 10, w, h, 5).attr({ "fill": "#fff" }));
        _tt.push(this.paper.text(pos.x + 5, pos.y - 20, "").attr({ "stroke-width": 1, "text-anchor": "start", "stroke": "#fff", "font-size": 13, "fill": "#fff" }));
    } else {
        //image tooltip
        var xpad = (w * -1) - 5;
        _tt.push(this.paper.rect(pos.x + xpad, pos.y + (h / 2 * -1), w, h, 15).attr({ "stroke-width": 2, "stroke": "#fff" }));
        _tt.push(this.paper.rect(pos.x + xpad, pos.y + (h / 2 - 45), w, 47, 15)).attr({ "stroke-width": 2, fill: "90-#333-#000" });
        _tt.push(this.paper.text(pos.x + xpad + (w / 2), pos.y + (h / 2 - 20), "").attr({ "text-anchor": "middle", "stroke": "#fff", "font-weight": "normal", "font-family": "Verdana", "font-size": 11 }));
    }

    var s = this;
    if (!s.removed) {
        s.tt = _tt;
        if (obj.type === "text") {
            s.tt[0].animate({ "stroke": "#000", "fill": "#333" }, 200, function () {
                s.tt[1].attr({ text: obj.msg });
            });
        } else {
            s.tt[0].animate({ "stroke": "#000", "fill": "#333" }, 200, function () {
                //s.tt[1].attr({  });
                s.tt[2].attr({ text: obj.msg });
            });
        }
    }
    
    return s.tt;
};

Raphael.el.untooltip = function () {
    this.tt.remove();
    return this;
};
Raphael.el.button = function () {
    return this.attr({ "fill": "90-#000-#eee" });
};

Raphael.el.redbutton = function () {
    return this.attr({ "fill": "90-#990000-#eee" });
};

Raphael.el.buttonText = function () {
    return this.standard().attr({ "fill": "#fff" });
};

Raphael.el.activeColor = "#fffc51";

Raphael.el.active = function (anim, cb) {
    var pkg = { "stroke-width": 2, "stroke": this.activeColor };
    if (anim) {
        if (cb === undefined) return this.animate(pkg, 200);
        else return this.animate(pkg, 100, cb);
    } else {
        return this.attr(pkg);
    }
};

Raphael.el.isDisabled = function () {
    if (this.type === "text") {
        return this.attr("fill") === "#eee";
    } else {
        return this.attr("fill") === "#ccc";
    }
};

Raphael.el.disabled = function (anim, cb) {
    var pkg = { "fill": "#ccc", "stroke": "eee" };
    var tpkg = { "fill": "#eee" };
    if (this.type === "text") {
        return this.attr(tpkg);
    } else {
        return this.attr(pkg);
    }
};

Raphael.el.enabled = function (anim, cb) {
    if (this.type === "text") {
        return this.buttonText();
    } else {
        return this.button();
    }
};

Raphael.el.inactive = function (anim, cb) {
    var pkg = { "stroke-width": 1, "stroke": "#000" };
    if (anim) {
        if (cb === undefined) return this.animate(pkg, 200);
        else return this.animate(pkg, 100, cb);
    } else {
        return this.attr(pkg);
    }
};

Raphael.el.standard = function () {
    return this.attr({ "font-family": "Trebuchet MS", "font-size": "13pt" });
};

;(function($s) {
    Raphael.el.loop = function (_options) {
        var options = {
            pkg: [{"stroke-width": 3}, {"stroke-width": 1}]
            , duration: 200
            , repeat: false
        };
        $s.extend(options, _options);

        var _self = this;
        function loop() {
            _self.animate(options.pkg[0], options.duration, function() {
                _self.animate(options.pkg[1], options.duration, function() {
                    if (options.repeat) {
                        loop();
                    }
                });
            });
        };

        loop();

        return this;
    }
})(Slatebox);
; (function ($s) {
    Raphael.st.button = function (_options) {
        var options = {
            mousedown: null
            ,mouseover: null
            ,node: {}
        };
        $s.extend(options, _options);

        var _self = this, _glows = [];

        _self.emd = function(e) {
            _.invoke(_glows, 'remove');
            options.mousedown.apply(this, [e, options.node]);
        };
        _self.emo = function(e) {
            options.mouseover.apply(this, [e, options.node]);
        };

        _self.forEach(function (el) {
            el.node.style.cursor = 'pointer';
            if (options.mousedown !== null) {
                el.mousedown(_self.emd);
            }

            if (options.mouseover !== null) {
                el.mouseover(_self.emo);
            }
        });
       
        _self.gl = function (e) {
            _glows.push(this.glow());
        };
        _self.eg = function (e) {
            _.invoke(_glows, 'remove');
        };
        _self.kg = function (t) {
            _.invoke(_glows, 'remove');
            _glows.push(t.glow());
        };

        var _vect = this[0];
        _self.tmover = function(e) {
            _self.kg(_vect);
        };
        _self.tmout = function(e) {
            _.invoke(_glows, 'remove');
        };

        _self[0].mouseover(_self.gl);
        _self[0].mouseout(_self.eg);
        
        _self[1].mouseover(_self.tmover);
        _self[1].mouseout(_self.tmout);

        return _self;
    }
})(Slatebox);

(function ($s) {
    Raphael.st.unbutton = function () {
        var _self = this;

        _self.forEach(function (el) {
            el.unmousedown(_self.emd);
            el.unmouseover(_self.emo);
        });

        _self[0].unmouseover(_self.gl);
        _self[0].unmouseout(_self.eg);
        
        _self[1].unmouseover(_self.tmover);
        _self[1].unmouseout(_self.tmout);

        return _self;
    }
})(Slatebox);
// emile.js (c) 2009 Thomas Fuchs
// Licensed under the terms of the MIT license.

(function (emile, container) {
    var parseEl = document.createElement('div'),
    props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth ' +
    'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize ' +
    'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
    'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
    'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' ');

    function interpolate(source, target, pos) {
        return parseFloat(source + (target - source) * pos).toFixed(3);
    }
    function s(str, p, c) { return str.substr(p, c || 1); }
    function color(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];
        while (j = 3, c = arguments[i - 1], i--)
            if (s(c, 0) == 'r') { c = c.match(/\d+/g); while (j--) v.push(~ ~c[j]); } else {
                if (c.length == 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
        while (j--) { tmp = ~ ~(v[j + 3] + (v[j] - v[j + 3]) * pos); r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp); }
        return 'rgb(' + r.join(',') + ')';
    }

    function parse(prop) {
        var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/, '');
        return isNaN(p) ? { v: q, f: color, u: ''} : { v: p, f: interpolate, u: q };
    }

    function normalize(style) {
        var css, rules = {}, i = props.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.childNodes[0].style;
        while (i--) if (v = css[props[i]]) rules[props[i]] = parse(v);
        return rules;
    }

    container[emile] = function (el, style, opts) {
        el = typeof el == 'string' ? document.getElementById(el) : el;
        opts = opts || {};
        var target = normalize(style), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
                      prop, current = {}, start = +new Date, dur = opts.duration || 200, finish = start + dur, interval,
                      easing = opts.easing || function (pos) { return (-Math.cos(pos * Math.PI) / 2) + 0.5; };
        for (prop in target) current[prop] = parse(comp[prop]);
        interval = setInterval(function () {
            var time = +new Date, pos = time > finish ? 1 : (time - start) / dur;
            for (prop in target) {
                var tv = opts.onMove ? opts.onMove(prop) : target[prop].f(current[prop].v, target[prop].v, easing(pos));
                el.style[prop] = tv + target[prop].u;
            }
            if (time > finish) {
                clearInterval(interval);
                opts.after && opts.after();
            } else {
                opts.during && opts.during.apply(this, [(time - start) / dur]);
            }
        }, 10);
    }
})('emile', this);
// Notify.js 0.5.0
// (c) 2012 Tim Heckel
// Notify.js may be freely distributed under the MIT license.

(function ($s, $e) {
    var n = function () {
        var _self = this;

        if (!(_self instanceof Notify))
            return new Notify();

        var uid = $s.guid();
        var options = {
            msg: ''
            , hgt: 50
            , duration: 300
            , className: 'warningBar'
            , delayClose: 0
            , spinner: null //{innerDiameter: 16, outerDiameter: 8, ticks: 6, ticksWidth: 5, color: #fff}
            , hideClose: false
            , onOpen: null
            , msgBar: "messageBar" + uid
            , popFromBottom: false
        };

        _self.message = function (_options) {
            $s.extend(options, _options);

            //hide other bars if visible
            $s.each($s.select("div.notify"), function () {
                this.style.visibility = 'hidden';
            });

            if ($s.el(options.msgBar) && $s.el(options.msgBar).style.visibility === "visible") {
                var _height = $s.getDimensions($s.el(options.msgBar)).height;
                $e($s.el(options.msgBar), "top:" + _height * -1 + "px", {
                    duration: options.duration
                    , after: function () {
                        if ($s.el(options.msgBar) !== null) {
                            document.body.removeChild($s.el(options.msgBar));
                        }
                        buildBar();
                    }
                });
            } else {
                buildBar();
            }

            function buildBar() {
                var _inside = "<div style='min-width:950px;'><div id='msgSpinner_" + uid + "' style='padding:2px;float:left;width:30px;'></div><div style='text-align:left;padding: 10px;float:left;width:84%;' id='notifyBarMessage_" + uid + "'>" + options.msg + "</div><div style='float:right;margin-top:6px;padding-right:2px;width:4%;'><a href='javascript:' class='lnkCloseMessage' id='lnkCloseMessage_" + uid + "'>X</a></div></div>";
                var _notify = document.createElement("div");
                _notify.setAttribute("class", options.className + " notify");
                _notify.setAttribute("rel", options.popFromBottom); //for resizing window
                _notify.style.position = "absolute";
                _notify.style.height = options.hgt + "px";

                var _cssToAnimate = "top:0px";
                if (options.popFromBottom) {
                    var ws = $s.windowSize();
                    _notify.style.top = (ws.height + options.hgt) + "px";
                    _cssToAnimate = "top:" + (ws.height - options.hgt) + "px";
                } else {
                    _notify.style.top = (options.hgt * -1) + "px";
                }

                //_notify.style.display = "none";
                _notify.setAttribute("id", options.msgBar);
                _notify.innerHTML = _inside;
                document.body.appendChild(_notify);

                $e($s.el(options.msgBar), _cssToAnimate, {
                    duration: options.duration
                    , after: function () {
                        if (options.spinner) {
                            options.spinner = new spinner($s.el("msgSpinner_" + uid), options.spinner.innerDiameter, options.spinner.outerDiameter, options.spinner.ticks, options.spinner.ticksWidth, options.spinner.color);
                        }

                        if (!options.hideClose) {
                            $s.el('lnkCloseMessage_' + uid).onclick = function (e) {
                                e.preventDefault();
                                _self.closeMessage();
                            };
                        } else {
                            $s.el("lnkCloseMessage_" + uid).style.display = "none";
                        }

                        if (options.delayClose && options.delayClose > 0) {
                            setTimeout(function () {
                                if ($s.isFunction(options.spinner)) {
                                    options.spinner();
                                }
                                setTimeout(function () {
                                    _self.closeMessage();
                                }, options.duration);
                            }, options.delayClose);
                        }

                        if ($s.isFunction(options.onOpen)) {
                            options.onOpen.apply(this, [$s.el("notifyBarMessage_" + uid), _self]);
                        }
                    }
                });
            };
            return _self;
        }

        _self.changeMessage = function (msg) {
            $s.el("notifyBarMessage_" + uid).innerHTML = msg;
            return _self;
        };

        _self.visible = function () {
            return $s.el(options.msgBar) !== null;
        };

        _self.resize = function (h, d, cb) {
            if ($s.el(options.msgBar) !== null) {

                var _cssToAnimate = "top:" + (h * -1) + "px";
                if (options.popFromBottom)
                    _cssToAnimate = "top:" + ($s.windowSize().height - h) + "px";

                $e($s.el(options.msgBar), _cssToAnimate, {
                    duration: d
                    , after: function () {
                        if ($s.isFunction(cb)) {
                            cb.apply(this);
                        }
                    }
                });
            } else {
                if ($s.isFunction(cb)) {
                    cb.apply(this);
                }
            }
        };

        _self.closeMessage = function (cb) {
            if ($s.el(options.msgBar) !== null) {

                var _cssToAnimate = "top:" + (options.hgt * -1) + "px";
                if (options.popFromBottom)
                    _cssToAnimate = "top:" + ($s.windowSize().height + options.hgt) + "px";

                $e($s.el(options.msgBar), _cssToAnimate, {
                    duration: options.duration
                    , after: function () {
                        document.body.removeChild($s.el(options.msgBar));

                        //show other bars if hidden
                        $s.each($s.select("div.notify"), function () {
                            this.style.visibility = 'visible';
                        });

                        if ($s.isFunction(options.onClose)) {
                            options.onClose.apply(this);
                        }
                        if ($s.isFunction(cb)) {
                            cb.apply(this);
                        }
                    }
                });
            } else {
                if ($s.isFunction(cb)) {
                    cb.apply(this);
                }
            }
        };
    };
    $s.addEvent(window, "resize", function () {
        $s.each($s.select("div.notify"), function () {
            if (this.getAttribute("rel") === "true") {
                var ws = $s.windowSize();
                var d = $s.getDimensions(this);
                this.style.top = (ws.height - d.height) + "px";
            }
        });
    });
    window.Notify = n;
})(Slatebox, emile);
spinner = (function () {
    var _sp = function spinner(holderid, R1, R2, count, stroke_width, colour) {
        var sectorsCount = count || 12,
            color = colour || "#fff",
            width = stroke_width || 15,
            r1 = Math.min(R1, R2) || 35,
            r2 = Math.max(R1, R2) || 60,
            cx = r2 + width,
            cy = r2 + width,
            r = Raphael(holderid, r2 * 2 + width * 2, r2 * 2 + width * 2),
            sectors = [],
            opacity = [],
            beta = 2 * Math.PI / sectorsCount,
            pathParams = { stroke: color, "stroke-width": width, "stroke-linecap": "round" };

        Raphael.getColor.reset();
        for (var i = 0; i < sectorsCount; i++) {
            var alpha = beta * i - Math.PI / 2,
                        cos = Math.cos(alpha),
                        sin = Math.sin(alpha);
            opacity[i] = 1 / sectorsCount * i;
            sectors[i] = r.path([["M", cx + r1 * cos, cy + r1 * sin], ["L", cx + r2 * cos, cy + r2 * sin]]).attr(pathParams);
            if (color == "rainbow") {
                sectors[i].attr("stroke", Raphael.getColor());
            }
        }
        var tick;
        (function ticker() {
            opacity.unshift(opacity.pop());
            for (var i = 0; i < sectorsCount; i++) {
                sectors[i].attr("opacity", opacity[i]);
            }
            r.safari();
            tick = setTimeout(ticker, 1000 / sectorsCount);
        })();
        return function () {
            clearTimeout(tick);
            r.clear();
        };
    };
    return _sp;
})();