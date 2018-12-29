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

    var data = {"OkPercent": 25.0, "KoPercent": 75.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FByerShareList&browserName=Chrome&clientProtocol=1.3&_=1546070906946"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/9b938125ad7a4d528ce63376fcc5b407"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACtoAEFRKRlqOC0m5l0MDi6fj7VAl8P%2B5EkojNKoBkN%2BQAAAAAOgAAAAAIAACAAAABfpcaFXEMmi3CLBMAxUFKGzMc1gxfPnfdFvIN3RcAk%2FzAAAACGJAAmTny1FxGalbRBmdKcs7mvxgDOg4PS2aqYJR4Wz3LWCFItKxinSxI17zOBBs1AAAAAtKjjXslYelCldJYlFEl1bP5GkP9Kb8mkYj9pElqB0Jc6fVzCNwXpJOsyw%2FvGGf1SUOCMPvtyhdllVU%2BHiVhVhA%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FByerShareList&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/byerDelete/2"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 400, 300, 75.0, 7.142499999999998, 1, 46, 17.0, 22.94999999999999, 37.960000000000036, 19.581925882410534, 92.62212696431195, 12.429933421452], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FByerShareList&browserName=Chrome&clientProtocol=1.3&_=1546070906946", 100, 0, 0.0, 5.150000000000002, 1, 34, 8.900000000000006, 11.0, 33.91999999999996, 5.199126546740148, 4.600008448580638, 3.2189904596027863], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/9b938125ad7a4d528ce63376fcc5b407", 100, 100, 100.0, 6.809999999999999, 2, 24, 11.0, 12.949999999999989, 24.0, 5.198315745698394, 28.62119548266362, 2.385945703592036], "isController": false}, {"data": ["Test", 100, 100, 100.0, 28.58000000000001, 11, 64, 41.900000000000006, 51.89999999999998, 64.0, 5.162356099323731, 97.67137409013475, 13.107544783439163], "isController": true}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACtoAEFRKRlqOC0m5l0MDi6fj7VAl8P%2B5EkojNKoBkN%2BQAAAAAOgAAAAAIAACAAAABfpcaFXEMmi3CLBMAxUFKGzMc1gxfPnfdFvIN3RcAk%2FzAAAACGJAAmTny1FxGalbRBmdKcs7mvxgDOg4PS2aqYJR4Wz3LWCFItKxinSxI17zOBBs1AAAAAtKjjXslYelCldJYlFEl1bP5GkP9Kb8mkYj9pElqB0Jc6fVzCNwXpJOsyw%2FvGGf1SUOCMPvtyhdllVU%2BHiVhVhA%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FByerShareList&browserName=Chrome", 100, 100, 100.0, 1.9500000000000006, 1, 10, 2.0, 3.9499999999999886, 9.989999999999995, 5.198045534878885, 0.6345270428318952, 5.198045534878886], "isController": false}, {"data": ["http://localhost:33143/Administator/byerDelete/2", 100, 100, 100.0, 14.660000000000002, 5, 46, 27.700000000000017, 32.799999999999955, 45.989999999999995, 5.183495749533486, 64.3128061502177, 2.3892675720505907], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 200, 66.66666666666667, 50.0], "isController": false}, {"data": ["404/Not Found", 100, 33.333333333333336, 25.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 400, 300, "500/Internal Server Error", 200, "404/Not Found", 100, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/9b938125ad7a4d528ce63376fcc5b407", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACtoAEFRKRlqOC0m5l0MDi6fj7VAl8P%2B5EkojNKoBkN%2BQAAAAAOgAAAAAIAACAAAABfpcaFXEMmi3CLBMAxUFKGzMc1gxfPnfdFvIN3RcAk%2FzAAAACGJAAmTny1FxGalbRBmdKcs7mvxgDOg4PS2aqYJR4Wz3LWCFItKxinSxI17zOBBs1AAAAAtKjjXslYelCldJYlFEl1bP5GkP9Kb8mkYj9pElqB0Jc6fVzCNwXpJOsyw%2FvGGf1SUOCMPvtyhdllVU%2BHiVhVhA%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FByerShareList&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/byerDelete/2", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
