/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 80.0, "KoPercent": 20.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7476923076923077, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-10"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.49, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-4"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-7"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-9"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:4943/6ac8ea9b6fa246e9be5c6d9b27f5cb64/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAB9YGMXALxjn849k3gIY764tjjxYZftafwkGtNWLW14dQAAAAAOgAAAAAIAACAAAAA6nv5Yphv%2Fdwev%2BszRVARsUWKQNpbkeYBuncrkUXNrcTAAAACWE2tXgQYXyEVRjg7BzVEQ%2FtUhSnYakIXTS1XLuO07PvtPuZKw0rvXBTz455V11exAAAAA1I%2FNnFJCAxuzR8VyDlYjxU8q8b2G9zMz%2FC3%2FXEDQTBS94JbtBRpkOcu1a0zcWbeJKHYyYbhVjN93wosYrj61jw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-9"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:4943/6ac8ea9b6fa246e9be5c6d9b27f5cb64/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome&clientProtocol=1.3&_=1545893207989"], "isController": false}, {"data": [0.95, 500, 1500, "http://localhost:33143/UserRegister-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-2"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignIn-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2500, 500, 20.0, 119.49080000000026, 1, 3437, 465.7000000000003, 701.9499999999998, 839.9899999999998, 20.14731718324388, 589.6032099209419, 23.259133282562093], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/UserRegister/DbSignIn-10", 100, 0, 0.0, 31.200000000000003, 10, 265, 55.0, 75.44999999999987, 263.20999999999907, 0.890519529093273, 48.08196703519333, 0.610492880296365], "isController": false}, {"data": ["Test", 100, 100, 100.0, 1322.46, 1121, 4285, 1480.6000000000001, 1736.4499999999994, 4276.349999999996, 0.8775085776463465, 321.44098974192474, 13.471984715994349], "isController": true}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-7", 100, 0, 0.0, 753.53, 661, 3085, 936.8000000000009, 975.55, 3076.579999999996, 0.8849870791886438, 29.495824243778543, 0.47965608295868883], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-6", 100, 0, 0.0, 28.590000000000007, 3, 176, 62.400000000000034, 82.94999999999999, 175.1999999999996, 0.8904719501335707, 5.36718054318789, 0.609590661175423], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-5", 100, 0, 0.0, 28.559999999999985, 3, 185, 64.20000000000005, 83.84999999999997, 184.0399999999995, 0.8904481625602165, 19.40811771502097, 0.5991394375038958], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-4", 100, 0, 0.0, 29.160000000000004, 3, 210, 65.80000000000001, 78.0, 208.8499999999994, 0.8904640208012395, 82.25748351528482, 0.5974109202055191], "isController": false}, {"data": ["http://localhost:33143/UserRegister-8", 100, 100, 100.0, 22.56000000000001, 3, 125, 48.0, 71.0, 124.66999999999983, 0.9100091910928301, 4.802431317056302, 0.5323198295552786], "isController": false}, {"data": ["http://localhost:33143/UserRegister-7", 100, 0, 0.0, 23.549999999999994, 3, 120, 48.900000000000006, 68.64999999999992, 119.91999999999996, 0.9099760676294213, 0.3021404912050813, 0.6016150368995296], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-9", 100, 100, 100.0, 13.169999999999996, 2, 78, 31.0, 43.849999999999966, 77.89999999999995, 0.890519529093273, 4.699577671113327, 0.5913606247885016], "isController": false}, {"data": ["http://localhost:4943/6ac8ea9b6fa246e9be5c6d9b27f5cb64/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAB9YGMXALxjn849k3gIY764tjjxYZftafwkGtNWLW14dQAAAAAOgAAAAAIAACAAAAA6nv5Yphv%2Fdwev%2BszRVARsUWKQNpbkeYBuncrkUXNrcTAAAACWE2tXgQYXyEVRjg7BzVEQ%2FtUhSnYakIXTS1XLuO07PvtPuZKw0rvXBTz455V11exAAAAA1I%2FNnFJCAxuzR8VyDlYjxU8q8b2G9zMz%2FC3%2FXEDQTBS94JbtBRpkOcu1a0zcWbeJKHYyYbhVjN93wosYrj61jw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome", 100, 100, 100.0, 6.949999999999999, 1, 60, 11.900000000000006, 23.799999999999955, 59.76999999999988, 0.910614118161288, 0.11115894997086034, 1.0137696237342464], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-8", 100, 0, 0.0, 23.920000000000012, 3, 84, 46.900000000000006, 64.5499999999999, 83.89999999999995, 0.8904878092218917, 48.43331888145826, 0.5861218588042529], "isController": false}, {"data": ["http://localhost:33143/UserRegister-9", 100, 0, 0.0, 37.59000000000002, 12, 198, 70.80000000000001, 85.79999999999995, 197.08999999999952, 0.9099595068019473, 49.13159294098913, 0.5962722940079167], "isController": false}, {"data": ["http://localhost:33143/UserRegister", 100, 100, 100.0, 485.5599999999999, 412, 925, 557.1, 748.7999999999997, 924.1399999999995, 0.9060679369739143, 58.71590990173693, 5.758486458814682], "isController": false}, {"data": ["http://localhost:33143/UserRegister-4", 100, 0, 0.0, 19.939999999999994, 2, 133, 47.80000000000001, 63.849999999999966, 132.8499999999999, 0.91000091000091, 0.3199221949221949, 0.6149615524615525], "isController": false}, {"data": ["http://localhost:33143/UserRegister-3", 100, 0, 0.0, 20.019999999999992, 2, 137, 41.60000000000002, 86.34999999999985, 136.99, 0.9098104864756671, 0.3163013019388062, 0.6130558942072366], "isController": false}, {"data": ["http://localhost:4943/6ac8ea9b6fa246e9be5c6d9b27f5cb64/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome&clientProtocol=1.3&_=1545893207989", 100, 0, 0.0, 9.58, 3, 79, 14.0, 21.94999999999999, 78.62999999999981, 0.9105809506465125, 0.8056507239118558, 0.6651509287925697], "isController": false}, {"data": ["http://localhost:33143/UserRegister-6", 100, 0, 0.0, 440.85999999999984, 395, 869, 532.0000000000002, 707.1999999999998, 868.0399999999995, 0.9068156262468715, 0.15054556295114077, 0.4640345587435163], "isController": false}, {"data": ["http://localhost:33143/UserRegister-5", 100, 0, 0.0, 19.839999999999993, 3, 117, 45.900000000000006, 61.799999999999955, 116.90999999999995, 0.9098684330245846, 0.33409231525121463, 0.6255345477044019], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-3", 100, 0, 0.0, 16.710000000000008, 2, 141, 36.80000000000001, 57.59999999999991, 140.25999999999962, 0.8906067703926686, 1.322864157975829, 0.5931580248123046], "isController": false}, {"data": ["http://localhost:33143/UserRegister-0", 100, 0, 0.0, 35.20000000000002, 9, 102, 58.900000000000006, 72.94999999999999, 101.87999999999994, 0.9094381491114789, 3.000311056266938, 0.5239926835700904], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-2", 100, 0, 0.0, 31.56, 8, 217, 64.9, 73.84999999999997, 215.65999999999931, 0.8904798796071203, 24.47776137810666, 0.587855858021888], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn", 100, 100, 100.0, 820.36, 689, 3437, 976.4000000000008, 1046.1499999999996, 3428.3099999999954, 0.8822387691004693, 265.1137322945707, 6.310936507481385], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-1", 100, 0, 0.0, 30.870000000000005, 9, 88, 62.10000000000005, 68.94999999999999, 87.88999999999994, 0.8894264977942223, 3.0792397015529387, 0.45687337679664153], "isController": false}, {"data": ["http://localhost:33143/UserRegister-2", 100, 0, 0.0, 18.290000000000006, 2, 101, 39.900000000000006, 58.0, 100.70999999999985, 0.9101085759531112, 0.3075171555466567, 0.6070353099374756], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-0", 100, 0, 0.0, 22.680000000000007, 6, 192, 35.900000000000006, 55.89999999999998, 191.25999999999962, 0.8879654048678264, 0.7787040366907305, 0.6529667479155011], "isController": false}, {"data": ["http://localhost:33143/UserRegister-1", 100, 0, 0.0, 17.02, 2, 89, 31.0, 57.799999999999955, 88.99, 0.9097939316744758, 0.3011915457398899, 0.6023830914797798], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 100, 20.0, 4.0], "isController": false}, {"data": ["404/Not Found", 200, 40.0, 8.0], "isController": false}, {"data": ["Assertion failed", 200, 40.0, 8.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2500, 500, "404/Not Found", 200, "Assertion failed", 200, "500/Internal Server Error", 100, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/UserRegister-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn-9", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:4943/6ac8ea9b6fa246e9be5c6d9b27f5cb64/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAB9YGMXALxjn849k3gIY764tjjxYZftafwkGtNWLW14dQAAAAAOgAAAAAIAACAAAAA6nv5Yphv%2Fdwev%2BszRVARsUWKQNpbkeYBuncrkUXNrcTAAAACWE2tXgQYXyEVRjg7BzVEQ%2FtUhSnYakIXTS1XLuO07PvtPuZKw0rvXBTz455V11exAAAAA1I%2FNnFJCAxuzR8VyDlYjxU8q8b2G9zMz%2FC3%2FXEDQTBS94JbtBRpkOcu1a0zcWbeJKHYyYbhVjN93wosYrj61jw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/UserRegister", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignIn", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
