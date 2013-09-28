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
                hoverNode.context && hoverNode.context.remove();
                switch (_key) {
                    case 39: //left
                        hoverNode.connectors.addNode(true);
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