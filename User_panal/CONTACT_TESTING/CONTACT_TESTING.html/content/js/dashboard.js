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

    var data = {"OkPercent": 54.54545454545455, "KoPercent": 45.45454545454545};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5217391304347826, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Contact-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact-7"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAA4JrUpc4QZ4eV7hVlHtcDaXFBTtbFJAyIRFE1SEikjawAAAAAOgAAAAAIAACAAAADlW6QYEfKyzysDFvd4xvpUtQYf1ajyCzW2sMrKA%2Bp%2BIjAAAADG01tT5LhOBBABJ4WOvGXUI1FFfxNWaUWMgMZvlCaw8ukVJz8lkgegg9Huzz1B%2BolAAAAAYDl%2FlcZZm8RKAI%2FBfGedf66OlMvTe8LjC%2BHnCutIB3iow7zmBEhSUXxUvZcgwRZ3nTApuQ5VM%2FCGzST5iEXq9Q%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FContact&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/237824fa32b34b9c88623f4040fc7958"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Contact"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FContact&browserName=Chrome&clientProtocol=1.3&_=1546070065408"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-8"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact-0"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact-1"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Contact-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Contact/QuestionReceived-0"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Contact-3"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2200, 1000, 45.45454545454545, 10.74045454545454, 0, 227, 26.0, 39.0, 67.97999999999956, 35.39082734102279, 721.0681557457813, 30.819302680050836], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Contact-6", 100, 100, 100.0, 5.879999999999999, 1, 21, 12.900000000000006, 15.0, 21.0, 1.7836121713694575, 9.412734545000534, 1.0346344040951736], "isController": false}, {"data": ["http://localhost:33143/Contact-5", 100, 0, 0.0, 5.369999999999999, 1, 26, 11.0, 16.899999999999977, 25.95999999999998, 1.7834849295523454, 0.5921727305154272, 1.1704119850187267], "isController": false}, {"data": ["http://localhost:33143/Contact-7", 100, 0, 0.0, 13.779999999999996, 6, 37, 20.900000000000006, 30.0, 36.989999999999995, 1.783771249175006, 96.31842156311875, 1.1618900617184853], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAA4JrUpc4QZ4eV7hVlHtcDaXFBTtbFJAyIRFE1SEikjawAAAAAOgAAAAAIAACAAAADlW6QYEfKyzysDFvd4xvpUtQYf1ajyCzW2sMrKA%2Bp%2BIjAAAADG01tT5LhOBBABJ4WOvGXUI1FFfxNWaUWMgMZvlCaw8ukVJz8lkgegg9Huzz1B%2BolAAAAAYDl%2FlcZZm8RKAI%2FBfGedf66OlMvTe8LjC%2BHnCutIB3iow7zmBEhSUXxUvZcgwRZ3nTApuQ5VM%2FCGzST5iEXq9Q%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FContact&browserName=Chrome", 100, 100, 100.0, 1.9099999999999997, 1, 14, 2.0, 3.9499999999999886, 13.97999999999999, 1.7843123260295481, 0.21781156323602885, 1.9742440091713656], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/237824fa32b34b9c88623f4040fc7958", 100, 100, 100.0, 8.029999999999998, 2, 61, 12.0, 14.949999999999989, 60.68999999999984, 1.7843760037115022, 9.824523348560009, 1.0385625959102103], "isController": false}, {"data": ["http://localhost:33143/Contact", 100, 100, 100.0, 28.830000000000002, 13, 61, 45.80000000000001, 51.89999999999998, 61.0, 1.782658300057045, 122.53362957029023, 6.7267496791215065], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FContact&browserName=Chrome&clientProtocol=1.3&_=1546070065408", 100, 0, 0.0, 5.12, 2, 12, 9.0, 11.0, 12.0, 1.784598911394664, 1.5789517712144197, 1.2879087846881414], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived", 100, 100, 100.0, 55.97999999999999, 25, 227, 83.9, 92.94999999999999, 225.7999999999994, 1.7574383578495985, 267.35204359875047, 8.085246195145954], "isController": false}, {"data": ["Test", 100, 100, 100.0, 99.86999999999999, 55, 302, 130.50000000000003, 143.74999999999994, 300.52999999999923, 1.7538013644574615, 398.7708421480121, 18.913309050491943], "isController": true}, {"data": ["http://localhost:33143/Contact/QuestionReceived-7", 100, 100, 100.0, 7.639999999999999, 2, 34, 15.900000000000006, 19.94999999999999, 33.95999999999998, 1.7629532993670998, 9.303710575956844, 1.1621030049538987], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-8", 100, 0, 0.0, 16.69, 7, 65, 27.900000000000006, 35.849999999999966, 64.73999999999987, 1.7633263388055227, 95.21445630036501, 1.2019548676623584], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-5", 100, 100, 100.0, 0.5400000000000001, 0, 5, 1.0, 2.0, 4.989999999999995, 1.763668430335097, 4.014619157848324, 0.0], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-6", 100, 0, 0.0, 11.620000000000005, 2, 44, 23.900000000000006, 26.0, 43.929999999999964, 1.7627979128472713, 95.87795874612185, 1.151671683295727], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-3", 100, 0, 0.0, 6.429999999999998, 2, 26, 11.900000000000006, 15.949999999999989, 25.949999999999974, 1.763108713283261, 2.6188362821326563, 1.1656490223562184], "isController": false}, {"data": ["http://localhost:33143/Contact-0", 100, 0, 0.0, 11.25, 5, 34, 21.0, 26.849999999999966, 33.969999999999985, 1.783198701831345, 6.962938165356015, 1.0100148897091603], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-4", 100, 100, 100.0, 0.8400000000000001, 0, 5, 2.0, 3.0, 5.0, 1.763668430335097, 4.0077298280423275, 0.0], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-1", 100, 0, 0.0, 10.420000000000002, 5, 37, 18.900000000000006, 25.849999999999966, 36.909999999999954, 1.7601295455345514, 7.1594128702872535, 0.88694027880452], "isController": false}, {"data": ["http://localhost:33143/Contact-2", 100, 0, 0.0, 5.689999999999999, 1, 19, 12.900000000000006, 17.899999999999977, 18.989999999999995, 1.7834849295523454, 0.602622837524523, 1.1808620920278223], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-2", 100, 0, 0.0, 11.25, 6, 26, 18.900000000000006, 20.899999999999977, 25.989999999999995, 1.762891141472014, 48.45884750991626, 1.1551757382106655], "isController": false}, {"data": ["http://localhost:33143/Contact-1", 100, 0, 0.0, 5.24, 1, 20, 10.0, 12.949999999999989, 19.969999999999985, 1.7835167383045891, 0.5904415764504449, 1.172174575077137], "isController": false}, {"data": ["http://localhost:33143/Contact-4", 100, 100, 100.0, 0.43000000000000005, 0, 15, 1.0, 1.0, 14.869999999999933, 1.7837076146478068, 4.067062389633091, 0.0], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-0", 100, 0, 0.0, 22.800000000000008, 5, 60, 35.0, 38.94999999999999, 59.86999999999993, 1.7591077805337134, 1.5340656718912167, 1.3828923470016008], "isController": false}, {"data": ["http://localhost:33143/Contact-3", 100, 100, 100.0, 0.5500000000000002, 0, 4, 1.9000000000000057, 2.0, 3.989999999999995, 1.7836121713694575, 4.059877532729283, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: maps.google.com", 200, 20.0, 9.090909090909092], "isController": false}, {"data": ["500/Internal Server Error", 100, 10.0, 4.545454545454546], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 200, 20.0, 9.090909090909092], "isController": false}, {"data": ["404/Not Found", 300, 30.0, 13.636363636363637], "isController": false}, {"data": ["Assertion failed", 200, 20.0, 9.090909090909092], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2200, 1000, "404/Not Found", 300, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: maps.google.com", 200, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 200, "Assertion failed", 200, "500/Internal Server Error", 100], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Contact-6", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAA4JrUpc4QZ4eV7hVlHtcDaXFBTtbFJAyIRFE1SEikjawAAAAAOgAAAAAIAACAAAADlW6QYEfKyzysDFvd4xvpUtQYf1ajyCzW2sMrKA%2Bp%2BIjAAAADG01tT5LhOBBABJ4WOvGXUI1FFfxNWaUWMgMZvlCaw8ukVJz8lkgegg9Huzz1B%2BolAAAAAYDl%2FlcZZm8RKAI%2FBfGedf66OlMvTe8LjC%2BHnCutIB3iow7zmBEhSUXxUvZcgwRZ3nTApuQ5VM%2FCGzST5iEXq9Q%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FContact&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/237824fa32b34b9c88623f4040fc7958", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Contact", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-7", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-5", 100, 100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Contact/QuestionReceived-4", 100, 100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: maps.google.com", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Contact-4", 100, 100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Contact-3", 100, 100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: maps.google.com", 100, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
