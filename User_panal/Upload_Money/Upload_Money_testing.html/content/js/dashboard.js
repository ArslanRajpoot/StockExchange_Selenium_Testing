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

    var data = {"OkPercent": 53.333333333333336, "KoPercent": 46.666666666666664};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/9ad2ca3e42a84b6ebf5d25051c4e9230"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/MoneySave"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-1"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-5"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-7"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-9"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002741671"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADA9bX9Qvf6Quv8sgxl%2FLXIrEmO7g62WXD4%2BPTBhZD%2BBQAAAAAOgAAAAAIAACAAAAC9U%2FK387AYegYQVQ5wof5WNTmAq39JRMcyFmMJ0NiP2jAAAABUp%2BjWUwa3fowHd3euCp3RPURJQP2OCWcMjaDNwbGgC71mflKTAu%2Bt73Ibgh0ZyklAAAAAoQuixmpA%2BgB03bRf5xyQj%2BGBiJxUh3HLO%2BSGOLu4foTwiniUTdZh9aXAVI5sveIhyiBn5%2Bcc%2Fy27JQ5PWg90JQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FUploadMoney&browserName=Chrome"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1500, 700, 46.666666666666664, 280.17399999999947, 0, 2044, 2006.0, 2015.95, 2027.0, 20.720521604597195, 773.4239021576971, 13.127043993120788], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Portfolio/shareperchase", 100, 100, 100.0, 43.15000000000001, 17, 146, 73.60000000000002, 89.94999999999999, 145.48999999999972, 1.5154040824985981, 406.50385978155447, 6.2466021799087725], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/9ad2ca3e42a84b6ebf5d25051c4e9230", 100, 100, 100.0, 6.190000000000001, 2, 15, 11.0, 12.0, 14.97999999999999, 1.537373551025428, 8.464562578790394, 0.7011264143836669], "isController": false}, {"data": ["http://localhost:33143/Portfolio/MoneySave", 100, 100, 100.0, 13.149999999999999, 5, 132, 24.900000000000006, 34.74999999999994, 131.42999999999972, 1.514142087093453, 18.987400918327175, 1.2154539019441586], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-0", 100, 0, 0.0, 9.500000000000005, 3, 22, 17.0, 17.0, 21.97999999999999, 1.5158405335758678, 4.737090486205851, 0.6883455547976353], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-1", 100, 0, 0.0, 16.610000000000003, 6, 51, 35.70000000000002, 41.849999999999966, 50.97999999999999, 1.5174046311189342, 41.71084527024976, 0.6801647711753817], "isController": false}, {"data": ["Test", 100, 100, 100.0, 4088.8899999999994, 4045, 4250, 4128.8, 4134.95, 4249.99, 1.424521716833573, 415.46061798423057, 7.665151034915027], "isController": true}, {"data": ["http://localhost:33143/Portfolio/shareperchase-2", 100, 0, 0.0, 7.860000000000001, 2, 33, 14.0, 17.899999999999977, 32.929999999999964, 1.5175658244176342, 2.2541187684953337, 0.6891290120646484], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-3", 100, 0, 0.0, 14.4, 3, 52, 27.900000000000006, 31.94999999999999, 51.949999999999974, 1.5174737097679782, 140.17811584773668, 0.6964967222567869], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-4", 100, 0, 0.0, 14.010000000000002, 2, 50, 28.900000000000006, 35.94999999999999, 49.89999999999995, 1.5174967373820147, 33.075204767216, 0.6994711523870224], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-5", 100, 0, 0.0, 14.290000000000001, 2, 49, 25.900000000000006, 37.849999999999966, 48.95999999999998, 1.5175427947068107, 9.146752079033629, 0.717276086560641], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-6", 100, 100, 100.0, 0.91, 0, 7, 2.0, 3.0, 7.0, 1.5176579502511724, 3.4691526536249255, 0.0], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-7", 100, 0, 0.0, 13.590000000000005, 3, 46, 25.0, 35.89999999999998, 45.969999999999985, 1.5176349177441875, 82.54362963258059, 0.6773038646573181], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-8", 100, 100, 100.0, 6.899999999999998, 2, 29, 13.0, 14.949999999999989, 28.889999999999944, 1.5179343948754533, 8.010661591706006, 0.6863316648704443], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-9", 100, 0, 0.0, 15.65, 7, 54, 24.0, 31.0, 53.89999999999995, 1.51775008727063, 81.95405817915523, 0.7203384203257092], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002741671", 100, 100, 100.0, 2013.7800000000002, 2002, 2044, 2028.9, 2030.95, 2043.93, 1.4913798246137326, 3.9935190225496626, 0.0], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADA9bX9Qvf6Quv8sgxl%2FLXIrEmO7g62WXD4%2BPTBhZD%2BBQAAAAAOgAAAAAIAACAAAAC9U%2FK387AYegYQVQ5wof5WNTmAq39JRMcyFmMJ0NiP2jAAAABUp%2BjWUwa3fowHd3euCp3RPURJQP2OCWcMjaDNwbGgC71mflKTAu%2Bt73Ibgh0ZyklAAAAAoQuixmpA%2BgB03bRf5xyQj%2BGBiJxUh3HLO%2BSGOLu4foTwiniUTdZh9aXAVI5sveIhyiBn5%2Bcc%2Fy27JQ5PWg90JQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FUploadMoney&browserName=Chrome", 100, 100, 100.0, 2012.6200000000001, 2002, 2036, 2023.0, 2027.0, 2035.96, 1.4920919128618322, 3.9954258057296332, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 100, 14.285714285714286, 6.666666666666667], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, 14.285714285714286, 6.666666666666667], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 200, 28.571428571428573, 13.333333333333334], "isController": false}, {"data": ["404/Not Found", 200, 28.571428571428573, 13.333333333333334], "isController": false}, {"data": ["Assertion failed", 100, 14.285714285714286, 6.666666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1500, 700, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 200, "404/Not Found", 200, "500/Internal Server Error", 100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, "Assertion failed", 100], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Portfolio/shareperchase", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/9ad2ca3e42a84b6ebf5d25051c4e9230", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Portfolio/MoneySave", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-6", 100, 100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002741671", 100, 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADA9bX9Qvf6Quv8sgxl%2FLXIrEmO7g62WXD4%2BPTBhZD%2BBQAAAAAOgAAAAAIAACAAAAC9U%2FK387AYegYQVQ5wof5WNTmAq39JRMcyFmMJ0NiP2jAAAABUp%2BjWUwa3fowHd3euCp3RPURJQP2OCWcMjaDNwbGgC71mflKTAu%2Bt73Ibgh0ZyklAAAAAoQuixmpA%2BgB03bRf5xyQj%2BGBiJxUh3HLO%2BSGOLu4foTwiniUTdZh9aXAVI5sveIhyiBn5%2Bcc%2Fy27JQ5PWg90JQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FUploadMoney&browserName=Chrome", 100, 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 100, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
