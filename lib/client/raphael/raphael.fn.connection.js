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

        return {
            path: path
        };
    };

    this.removeConnection = function (options) {
        options.line.remove();
    };

    var details = calcPath()
        , _attr = { path: details.path, stroke: options.lineColor, fill: "none", "stroke-width": options.lineWidth, "fill-opacity": options.lineOpacity, opacity: options.lineOpacity };

    if (options.showChildArrow) {
        _.extend(_attr, {"arrow-end": "classic"});
    } else {
        _.extend(_attr, {"arrow-end": "none"});
    }

    if (options.showParentArrow) {
        _.extend(_attr, {"arrow-start": "classic"});
    } else {
        _.extend(_attr, {"arrow-start": "none"});
    }

    if (options.line === undefined) {
        options.sb.extend(options, {
            line: this.path(details.path).attr(_attr)
        });

    } else {
        options.line.attr(_attr);
    }
    return options;
};