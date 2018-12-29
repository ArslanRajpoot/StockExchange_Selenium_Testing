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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAD8D0VYEMz3%2B0p2%2BiZbNJ9LUg4ZlBc%2Buc%2FAy2e3bW3DAAAAAAAOgAAAAAIAACAAAAACwLANMlHkJsG8%2F0P%2BuW6RzRbIOaQra3RcmzfkBxMzNTAAAABcia0WCxNSxmsvB1Zs3qUVy2TSEoP7n8GV2GrxIOVk%2FIZWsDsSogKVtnJkQpFP2edAAAAArWMirAEqHD8bsE1EfPYiSR5w0Fa0zxK2BUUcVaDj5wCklWpYuqkabx8xf5GOAVtFr94kaxT889%2FTn7W1IqO%2F7g%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FStockView&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/511d4a5645234507a308f7b0e4ee7bc1"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/perchasecompeted"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002982978"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-1"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-5"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-7"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-9"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1500, 700, 46.666666666666664, 277.08200000000033, 0, 2019, 2004.0, 2005.0, 2011.0, 21.375133594584966, 787.6453676077663, 13.518102066262914], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Portfolio/shareperchase", 100, 100, 100.0, 35.41000000000002, 14, 146, 58.80000000000001, 65.94999999999999, 145.26999999999964, 1.5610121602847287, 418.7382039920934, 6.407162216481166], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAD8D0VYEMz3%2B0p2%2BiZbNJ9LUg4ZlBc%2Buc%2FAy2e3bW3DAAAAAAAOgAAAAAIAACAAAAACwLANMlHkJsG8%2F0P%2BuW6RzRbIOaQra3RcmzfkBxMzNTAAAABcia0WCxNSxmsvB1Zs3qUVy2TSEoP7n8GV2GrxIOVk%2FIZWsDsSogKVtnJkQpFP2edAAAAArWMirAEqHD8bsE1EfPYiSR5w0Fa0zxK2BUUcVaDj5wCklWpYuqkabx8xf5GOAVtFr94kaxT889%2FTn7W1IqO%2F7g%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FStockView&browserName=Chrome", 100, 100, 100.0, 2005.33, 2001, 2019, 2008.9, 2012.95, 2018.97, 1.5299175374447318, 4.0967127809311075, 0.0], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/511d4a5645234507a308f7b0e4ee7bc1", 100, 100, 100.0, 5.92, 2, 30, 10.900000000000006, 13.899999999999977, 29.909999999999954, 1.5784821315822704, 8.690900642442228, 0.7198741752430863], "isController": false}, {"data": ["http://localhost:33143/Portfolio/perchasecompeted", 100, 100, 100.0, 9.980000000000004, 4, 46, 20.80000000000001, 23.94999999999999, 45.89999999999995, 1.560549313358302, 8.384904611423222, 1.2816620825530587], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002982978", 100, 100, 100.0, 2005.8600000000001, 2001, 2014, 2010.0, 2012.0, 2013.99, 1.5300814003304977, 4.09715156221311, 0.0], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-0", 100, 0, 0.0, 6.61, 3, 26, 12.0, 16.94999999999999, 25.95999999999998, 1.5614021391209307, 4.879549413498322, 0.7059855375126863], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-1", 100, 0, 0.0, 13.460000000000003, 6, 37, 26.900000000000006, 30.94999999999999, 36.969999999999985, 1.5632327653587619, 42.970581913396906, 0.6976536853212444], "isController": false}, {"data": ["Test", 100, 100, 100.0, 4062.5, 4031, 4220, 4088.0, 4099.95, 4219.0199999999995, 1.4664476771468795, 417.1783432944847, 7.892180809332474], "isController": true}, {"data": ["http://localhost:33143/Portfolio/shareperchase-2", 100, 0, 0.0, 6.390000000000001, 2, 25, 12.900000000000006, 17.94999999999999, 24.97999999999999, 1.5632816408204102, 2.32202282782016, 0.7068353512693847], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-3", 100, 0, 0.0, 11.770000000000003, 2, 36, 24.0, 26.0, 35.93999999999997, 1.5632572027075615, 144.40741071847302, 0.7144573934249402], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-4", 100, 0, 0.0, 11.29, 2, 34, 21.0, 25.799999999999955, 33.93999999999997, 1.5632572027075615, 34.07259522190436, 0.7175106301489784], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-5", 100, 0, 0.0, 11.690000000000001, 3, 34, 20.900000000000006, 25.899999999999977, 33.97999999999999, 1.5632572027075615, 9.422288530381904, 0.7358300504932076], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-6", 100, 100, 100.0, 0.62, 0, 3, 2.0, 2.0, 3.0, 1.5634282855445423, 3.573777203652168, 0.0], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-7", 100, 0, 0.0, 11.270000000000007, 3, 33, 20.900000000000006, 24.94999999999999, 32.95999999999998, 1.563501618224175, 85.0383033466752, 0.6947199573164058], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-8", 100, 100, 100.0, 5.950000000000003, 1, 20, 10.900000000000006, 12.0, 19.989999999999995, 1.5636972056730936, 8.252167675251364, 0.7039691521633751], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-9", 100, 0, 0.0, 14.680000000000003, 6, 43, 21.900000000000006, 25.94999999999999, 42.97999999999999, 1.563574957783476, 84.42846693429857, 0.7390334761398462], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, 14.285714285714286, 6.666666666666667], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 200, 28.571428571428573, 13.333333333333334], "isController": false}, {"data": ["404/Not Found", 300, 42.857142857142854, 20.0], "isController": false}, {"data": ["Assertion failed", 100, 14.285714285714286, 6.666666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1500, 700, "404/Not Found", 300, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 200, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, "Assertion failed", 100, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Portfolio/shareperchase", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAD8D0VYEMz3%2B0p2%2BiZbNJ9LUg4ZlBc%2Buc%2FAy2e3bW3DAAAAAAAOgAAAAAIAACAAAAACwLANMlHkJsG8%2F0P%2BuW6RzRbIOaQra3RcmzfkBxMzNTAAAABcia0WCxNSxmsvB1Zs3qUVy2TSEoP7n8GV2GrxIOVk%2FIZWsDsSogKVtnJkQpFP2edAAAAArWMirAEqHD8bsE1EfPYiSR5w0Fa0zxK2BUUcVaDj5wCklWpYuqkabx8xf5GOAVtFr94kaxT889%2FTn7W1IqO%2F7g%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FStockView&browserName=Chrome", 100, 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/511d4a5645234507a308f7b0e4ee7bc1", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Portfolio/perchasecompeted", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002982978", 100, 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-6", 100, 100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: ajax.googleapis.com", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
