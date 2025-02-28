"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var distance_fn_1 = require("../optimizer-helpers/distance-fn");
var distance_fn_2 = require("../optimizer-helpers/distance-fn");
var distance_fn_3 = require("../optimizer-helpers/distance-fn");
var coords_1 = require("../optimizer-helpers/coords");
var fs_1 = require("fs");
var path = require("path");
// const distance = euclideanDistance(37.423021, -122.083739, 34.052235, -118.243683); 
// console.log('Euclidean distance:', distance);
// // Example usage:
// const distKm = haversineDistance(37.423021, -122.083739, 34.052235, -118.243683);
// console.log(`Haversine (Straight-line distance): ${distKm} km`);
// // Example usage
// (async () => {
//     const apiKey = 'AIzaSyCGFoau74-eJjeaKFqh0CXiqsGPe5Rx5Yc';
//     const origin = { lat: 37.423021, lon: -122.083739 }; // e.g. Mountain View
//     const dest = { lat: 34.052235, lon: -118.243683 };   // e.g. Los Angeles
//     try {
//       const result = await getDrivingDistance(origin.lat, origin.lon, dest.lat, dest.lon, apiKey);
//       console.log('Driving distance and duration:', result);
//       // Example output:
//       // {
//       //   distanceText: '341 mi', miles
//       //   distanceValue: 548936, meters
//       //   durationText: '5 hours 31 mins',
//       //   durationValue: 19860 seconds
//       // }
//     } catch (error) {
//       console.error(error);
//     }
//   })(); //! results in  5 hour 30 min, while actual google maps is 5 hour 45 min (mountain view to los angeles)
//testing with test_data1.json
function testDistances() {
    return __awaiter(this, void 0, void 0, function () {
        var jsonPath, raw, data, firstFiveUsers, coordsArray, apiKey, _i, firstFiveUsers_1, user, _a, address, city, state, zipCode, _b, lat, lng, i, j, userA, userB, eucDist, havDistKm, driveInfo, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    jsonPath = path.join(__dirname, '..', 'test-data', 'test_data1.json');
                    raw = (0, fs_1.readFileSync)(jsonPath, 'utf8');
                    data = JSON.parse(raw);
                    firstFiveUsers = data.users.slice(0, 5);
                    coordsArray = [];
                    apiKey = 'AIzaSyCGFoau74-eJjeaKFqh0CXiqsGPe5Rx5Yc';
                    _i = 0, firstFiveUsers_1 = firstFiveUsers;
                    _c.label = 1;
                case 1:
                    if (!(_i < firstFiveUsers_1.length)) return [3 /*break*/, 4];
                    user = firstFiveUsers_1[_i];
                    _a = user.location, address = _a.address, city = _a.city, state = _a.state, zipCode = _a.zipCode;
                    return [4 /*yield*/, (0, coords_1.getCoordinatesFromAddress)(address, city, state, zipCode, apiKey)];
                case 2:
                    _b = _c.sent(), lat = _b.lat, lng = _b.lng;
                    coordsArray.push({
                        userId: user.userId,
                        name: user.name,
                        lat: lat,
                        lng: lng,
                    });
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    i = 0;
                    _c.label = 5;
                case 5:
                    if (!(i < coordsArray.length)) return [3 /*break*/, 12];
                    j = i + 1;
                    _c.label = 6;
                case 6:
                    if (!(j < coordsArray.length)) return [3 /*break*/, 11];
                    userA = coordsArray[i];
                    userB = coordsArray[j];
                    eucDist = (0, distance_fn_1.euclideanDistance)(userA.lat, userA.lng, userB.lat, userB.lng);
                    havDistKm = (0, distance_fn_2.haversineDistance)(userA.lat, userA.lng, userB.lat, userB.lng);
                    console.log("\n===== ".concat(userA.name, " <-> ").concat(userB.name, " ====="));
                    console.log("Euclidean distance (degrees): ".concat(eucDist.toFixed(3)));
                    console.log("Haversine distance (km):      ".concat(havDistKm.toFixed(3)));
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, distance_fn_3.getDrivingDistance)(userA.lat, userA.lng, userB.lat, userB.lng, apiKey)];
                case 8:
                    driveInfo = _c.sent();
                    console.log("Driving distance:            ".concat(driveInfo.distanceText));
                    console.log("Driving time:                ".concat(driveInfo.durationText));
                    return [3 /*break*/, 10];
                case 9:
                    err_1 = _c.sent();
                    console.warn('Could not get driving distance:', err_1);
                    return [3 /*break*/, 10];
                case 10:
                    j++;
                    return [3 /*break*/, 6];
                case 11:
                    i++;
                    return [3 /*break*/, 5];
                case 12: return [2 /*return*/];
            }
        });
    });
}
testDistances().catch(console.error);
