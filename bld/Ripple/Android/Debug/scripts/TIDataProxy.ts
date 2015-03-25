module ti {
    export class TiDataProxy {
        calculateTargetTemperature(data):number {
            var S0 = 5.593E-14, a1 = 1.75E-3, a2 = -1.678E-5, b0 = -2.94E-5, b1 = -5.7E-7, b2 = 4.63E-9, c2 = 13.4, Tref = 298.15;
            var t: Int16Array = new Int16Array(data);
            var amb: number = t[1] / 128.0;
            var Vobj2 = t[0] * 0.00000015625;
            var Tdie = amb + 273.15;
            var S = S0 * (1 + a1 * (Tdie - Tref) + a2 * Math.pow((Tdie - Tref), 2));
            var Vos = b0 + b1 * (Tdie - Tref) + b2 * Math.pow((Tdie - Tref), 2);
            var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2);
            var tObj: number = Math.pow(Math.pow(Tdie, 4) + (fObj / S), 0.25) - 273.15;

            return tObj;

        }

    }
} 