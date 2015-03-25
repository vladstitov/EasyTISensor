var ti;
(function (ti) {
    var TiDataProxy = (function () {
        function TiDataProxy() {
        }
        TiDataProxy.prototype.calculateTargetTemperature = function (data) {
            var S0 = 5.593E-14, a1 = 1.75E-3, a2 = -1.678E-5, b0 = -2.94E-5, b1 = -5.7E-7, b2 = 4.63E-9, c2 = 13.4, Tref = 298.15;
            var t = new Int16Array(data);
            var amb = t[1] / 128.0;
            var Vobj2 = t[0] * 0.00000015625;
            var Tdie = amb + 273.15;
            var S = S0 * (1 + a1 * (Tdie - Tref) + a2 * Math.pow((Tdie - Tref), 2));
            var Vos = b0 + b1 * (Tdie - Tref) + b2 * Math.pow((Tdie - Tref), 2);
            var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2);
            var tObj = Math.pow(Math.pow(Tdie, 4) + (fObj / S), 0.25) - 273.15;
            return tObj;
        };
        return TiDataProxy;
    })();
    ti.TiDataProxy = TiDataProxy;
})(ti || (ti = {}));
//# sourceMappingURL=TIDataProxy.js.map