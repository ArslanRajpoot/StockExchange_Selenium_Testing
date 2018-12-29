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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7123809523809523, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-0"], "isController": false}, {"data": [0.38, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-4"], "isController": false}, {"data": [0.58, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-6"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4-8"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/4"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/UserSignUp/1004-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 500, 100, 20.0, 240.63799999999983, 2, 3054, 1024.7000000000005, 1381.7999999999997, 1807.7000000000003, 17.568517217146873, 499.91860835382994, 13.142074402670413], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Administator/UserSignUp/1004-7", 25, 25, 100.0, 6.76, 2, 21, 13.00000000000001, 19.499999999999996, 21.0, 1.0769363315240803, 5.683363218316534, 0.40910960250280004], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-6", 25, 0, 0.0, 14.639999999999999, 2, 108, 21.60000000000001, 82.79999999999994, 108.0, 1.0760556105539534, 58.52628635722894, 0.4024700184005509], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-0", 25, 0, 0.0, 98.88, 71, 164, 138.00000000000003, 158.89999999999998, 164.0, 1.1447934792563421, 11.218797222731018, 0.43935921615990475], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-5", 25, 0, 0.0, 1268.0399999999997, 486, 2855, 1758.6000000000006, 2577.1999999999994, 2855.0, 1.0171698266742615, 33.901356459536984, 0.40627193272438766], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-1", 25, 0, 0.0, 6.7200000000000015, 2, 16, 14.0, 15.399999999999999, 16.0, 1.149213937666636, 0.3804526610048726, 0.5252266824492047], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-4", 25, 0, 0.0, 13.4, 3, 74, 27.400000000000013, 61.099999999999966, 74.0, 1.076287239538488, 6.487153166437058, 0.4309353205183399], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-2", 25, 0, 0.0, 6.960000000000001, 3, 15, 11.200000000000006, 14.399999999999999, 15.0, 1.1492667678021422, 0.3883264664643957, 0.5308624816117317], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-3", 25, 0, 0.0, 6.08, 2, 13, 13.0, 13.0, 13.0, 1.1491611123879566, 0.40400195357389107, 0.5409137267294875], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-4", 25, 0, 0.0, 7.039999999999999, 2, 15, 11.800000000000004, 14.399999999999999, 15.0, 1.1492667678021422, 0.4219963913023491, 0.5544314289982991], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-5", 25, 0, 0.0, 861.0799999999999, 353, 1268, 1200.0000000000002, 1263.8, 1268.0, 1.1019526601137215, 0.18294135958919203, 0.49394167089081853], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-8", 25, 0, 0.0, 20.0, 10, 95, 40.00000000000003, 81.19999999999996, 95.0, 1.0767044231017702, 58.138884440006024, 0.4332052952323528], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-6", 25, 0, 0.0, 8.919999999999996, 2, 16, 15.0, 15.7, 16.0, 1.1494252873563218, 0.38164511494252873, 0.5242007902298851], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-7", 25, 25, 100.0, 7.679999999999999, 3, 22, 13.0, 19.299999999999994, 22.0, 1.1494252873563218, 6.065912356321839, 0.4366469109195402], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-8", 25, 0, 0.0, 14.8, 9, 30, 26.800000000000004, 29.4, 30.0, 1.1490554763984004, 62.04562935204761, 0.5184215137656846], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4", 25, 25, 100.0, 965.28, 451, 1359, 1317.4, 1357.5, 1359.0, 1.0974539069359088, 77.87532923617208, 4.380170036764706], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004", 25, 25, 100.0, 1373.1199999999997, 580, 3054, 1921.2000000000005, 2765.0999999999995, 3054.0, 1.009000282520079, 215.51607526637608, 3.520662118597893], "isController": false}, {"data": ["Test", 25, 25, 100.0, 2338.3999999999996, 1219, 4413, 3220.600000000001, 4122.599999999999, 4413.0, 0.9654373431164317, 274.7187409490249, 7.221923875265495], "isController": true}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-3", 25, 0, 0.0, 14.959999999999997, 3, 72, 26.00000000000002, 59.99999999999997, 72.0, 1.0762409057643463, 23.457637476322702, 0.4183045707951268], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-2", 25, 0, 0.0, 9.200000000000001, 2, 54, 18.400000000000002, 43.49999999999997, 54.0, 1.0762409057643463, 1.598596111003487, 0.41094745522837833], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-1", 25, 0, 0.0, 14.800000000000004, 6, 82, 32.80000000000005, 71.19999999999997, 82.0, 1.0759629868732514, 29.576373197762, 0.40453686518183773], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004-0", 25, 0, 0.0, 94.39999999999999, 60, 155, 144.20000000000002, 152.29999999999998, 155.0, 1.0673725557168474, 10.46412861038767, 0.4127729805311246], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 50, 50.0, 10.0], "isController": false}, {"data": ["Assertion failed", 50, 50.0, 10.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 500, 100, "404/Not Found", 50, "Assertion failed", 50, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Administator/UserSignUp/1004-7", 25, 25, "404/Not Found", 25, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4-7", 25, 25, "404/Not Found", 25, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/4", 25, 25, "Assertion failed", 25, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/UserSignUp/1004", 25, 25, "Assertion failed", 25, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
