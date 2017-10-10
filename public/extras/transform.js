fs = require('fs');

// 48_231_1006|20170601043000|42602|1|99|8|4.68705|VAL|N|1913.07|0.0333333|1

// {
// 	"_id": "48_231_1006_20170601043000",
// 	"epoch": 20170601043000,
// 	"site": "48_231_1006",
// 	"measurements": [
// 		{
// 			"param": 42602,
// 			"value": 4.68705,
// 			"flag": "VAL",
// 			// everything else
// 		},
// 		{
// 			// another kind of measurement for this site
// 		}
// 	]
// }

function exportGeoJSON(epoch) {
    db.TCEQdata.aggregate([
        { $match: { "epoch": epoch } },
        { $lookup: {
            from: "sites",
            localField: "site",
            foreignField: "_id",
            as: "site" }
        }
    ]);
}

var sites = {
    "48_231_1006": [-95.220556, 29.767778],
    "48_085_0009": [-95.326111, 29.901111],
    "48_039_1012": [-95.125556, 29.8025],
    "48_135_1014": [-95.673889, 30.039444],
    "48_039_1016": [-95.128333, 29.67],
    "48_201_1017": [-95.015556, 29.583056],
    "48_245_0018": [-95.499167, 29.695833],
    "48_201_6000": [-95.425, 30.350278],
    "48_167_0005": [-95.315556, 29.735],
    "48_061_1023": [-95.3925, 29.520278],
    "48_355_1024": [-95.2575, 29.733611],
    "48_375_1025": [-95.284167, 29.828056],
    "48_201_0307": [-95.267222, 29.625556],
    "48_121_1032": [-95.489167, 29.834167],
    "48_167_1034": [-95.474167, 29.623889],
    "48_245_1035": [-95.635833, 29.723333],
    "48_201_0036": [-95.350278, 29.752778],
    "48_309_1037": [-95.294722, 29.686389],
    "48_493_1038": [-95.160278, 29.858611],
    "48_139_1044": [-94.984722, 29.733056],
    "48_027_1045": [-95.068333, 29.920833],
    "48_027_1047": [-95.656944, 29.833056],
    "48_065_0004": [-95.009722, 29.655278],
    "48_349_1051": [-95.381111, 30.038056],
    "48_201_1052": [-95.353611, 29.589444],
    "48_439_1053": [-95.806111, 29.810556],
    "48_065_0005": [-95.235, 29.961944],
    "48_201_1066": [-95.5225, 30.011667],
    "48_113_1067": [-95.538056, 29.761667],
    "48_453_1068": [-95.185278, 29.548889],
    "48_029_1069": [-95.070556, 29.525556],
    "48_245_0014": [-95.105, 29.583333],
    "48_039_1003": [-94.99, 29.821389],
    "48_141_0047": [-95.765, 29.148889],
    "48_141_0037": [-95.201389, 29.313611],
    "48_245_0017": [-94.946389, 29.402222],
    "48_439_1002": [-95.077778, 29.764444],
    "48_029_0051": [-95.472778, 29.043611],
    "48_201_0061": [-94.861111, 29.254444]
};

function parseTimestamp(str) {
    var yr  = parseInt(str.substr(0, 4));
    var mo  = parseInt(str.substr(4, 2));
    var day = parseInt(str.substr(6, 2));
    var hr  = parseInt(str.substr(8, 2));
    var min = parseInt(str.substr(10, 2));
    var sec = parseInt(str.substr(12, 2));
    return new Date(yr, mo, day, hr, min, sec);
}

function parseRow(str) {
    if (str === "") return null;
    var data = str.split("|");
    return {
        "siteID": data[0],
        "timeStamp": parseTimestamp(data[1]),
        "param": parseInt(data[2]), //measurement
        "poc": parseInt(data[3]),
        "method": parseInt(data[4]),
        "units": parseInt(data[5]),
        "value": parseFloat(data[6]),
        "flag": data[7],
        "verified": data[8],
        "slope": parseFloat(data[9]),
        "intercept": parseFloat(data[10]),
        "sample": parseInt(data[11])
    }
}

function notNull(val) { return val !== null; }
function toUnix(date) { return Math.floor(date.getTime() / 1000); }

function parseFile(text) {
    return text.split("\n").map(parseRow).filter(notNull);
}

function aggregateBySiteAndEpoch(data) {
    var result_array = [];
    var result_map = data.reduce(function (result, row) {
        var key = row.siteID + "_" + toUnix(row.timeStamp);
        // console.log(result);
        if (!result.hasOwnProperty(key)) result[key] = [];
        result[key].push(row);
        return result;
    }, {});
    
    for (var key in result_map) {
        var val = result_map[key];
        result_array.push({
            _id: key,
            epoch: toUnix(val[0].timeStamp),
            site: val[0].siteID,
            measurements: val
        });
    }
    return result_array;
}

function toGeoJSON(aggregated_data) {
    return aggregated_data.filter(function (data) {
        // only sites for which we have a lat/long
        return sites.hasOwnProperty(data.site);
    }).filter(function (data) {
        // only the first timestamp
        return data.epoch == 1498901400;
    }).filter(function (data) {
        // only sites with temperature measurements
        return data.measurements.reduce(function (found, m) {
            return found || m.param === 62101;
        }, false);
    }).map(function (data) {
        var i = 0;
        for (; i < data.measurements.length; i++)
            if (data.measurements[i].param == 62101) break;

        return {
            "type": "Feature",
            "properties": {
                "temp": data.measurements[i].value
            },
            "geometry": {
                "type": "Point",
                "coordinates": sites[data.site]
            }
        }
    });
}

function main() {
    var time = '20170601000102';
    fs.readFile('sampledatatceq/' + time + '_5m_UH.tems', 'utf8', function (err, data) {
        if (err) console.log(err);
        var agg = aggregateBySiteAndEpoch(parseFile(data));
        var out = JSON.stringify(toGeoJSON(agg));
        console.log(out);
    });
}

main();
