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

    var data = {"OkPercent": 76.84615384615384, "KoPercent": 23.153846153846153};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7072222222222222, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:39400/410ca67ca57a4811979f53c7de2dd2fa/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACJ65TvR%2Bk8IjqmECWRr3UEvdCM3rZlWlIzw2uuMwabVQAAAAAOgAAAAAIAACAAAAAQrdEItF1t69HcU6PxwbnxIdqFx9doRK%2FU7hOpQkxQsjAAAAAeWYQCQuW0RdzXC089Lq9qG5Xq6WlkQPFe%2Bc68tVpL2snOJgzQcGH2%2FgpwcNATeaNAAAAA8u5f1vxqkylKi5j5Yt0NvVgBvH7228ULKjuitp4i4ab6QXg4zhNAkWKI%2FG0OfoBB8bJupD%2FwHsDnZ825XIewMw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:39400/410ca67ca57a4811979f53c7de2dd2fa/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome&clientProtocol=1.3&_=1545717227805"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-9"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister"], "isController": false}, {"data": [0.44, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-6"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-9"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-1"], "isController": false}, {"data": [0.655, 500, 1500, "http://localhost:33143/UserRegister-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-0"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/1e0d4d5a27a6477a9a8cc3749b588ec9"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-10"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister/DbSignUp-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/UserRegister-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2600, 602, 23.153846153846153, 215.7742307692306, 1, 22863, 839.9000000000001, 1115.6499999999987, 1571.5299999999897, 19.901106807709382, 564.3024464727202, 22.677873317973763], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/UserRegister/DbSignUp", 100, 100, 100.0, 1856.740000000001, 587, 22863, 1819.4, 2905.3499999999913, 22845.33999999999, 0.8132792231556861, 243.89784844440015, 5.889841202148683], "isController": false}, {"data": ["Test", 100, 100, 100.0, 2641.58, 987, 23762, 2564.8, 3560.999999999991, 23750.149999999994, 0.8054837332560069, 299.53977459796295, 12.912045833031277], "isController": true}, {"data": ["http://localhost:39400/410ca67ca57a4811979f53c7de2dd2fa/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACJ65TvR%2Bk8IjqmECWRr3UEvdCM3rZlWlIzw2uuMwabVQAAAAAOgAAAAAIAACAAAAAQrdEItF1t69HcU6PxwbnxIdqFx9doRK%2FU7hOpQkxQsjAAAAAeWYQCQuW0RdzXC089Lq9qG5Xq6WlkQPFe%2Bc68tVpL2snOJgzQcGH2%2FgpwcNATeaNAAAAA8u5f1vxqkylKi5j5Yt0NvVgBvH7228ULKjuitp4i4ab6QXg4zhNAkWKI%2FG0OfoBB8bJupD%2FwHsDnZ825XIewMw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome", 100, 100, 100.0, 4.87, 1, 15, 9.0, 10.0, 15.0, 0.8305371914554334, 0.10138393450383708, 0.9254325541510249], "isController": false}, {"data": ["http://localhost:39400/410ca67ca57a4811979f53c7de2dd2fa/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome&clientProtocol=1.3&_=1545717227805", 100, 0, 0.0, 7.750000000000004, 2, 52, 12.900000000000006, 16.94999999999999, 51.77999999999989, 0.8305716824890572, 0.7348612737647323, 0.6075177638518592], "isController": false}, {"data": ["http://localhost:33143/UserRegister-8", 100, 100, 100.0, 22.099999999999994, 2, 90, 46.900000000000006, 60.69999999999993, 89.84999999999992, 0.8329307501374336, 4.395661888420596, 0.48723195247297135], "isController": false}, {"data": ["http://localhost:33143/UserRegister-7", 100, 0, 0.0, 23.010000000000005, 3, 85, 46.60000000000002, 71.64999999999992, 84.99, 0.8330348291862083, 0.2765935956282332, 0.550746659530335], "isController": false}, {"data": ["http://localhost:33143/UserRegister-9", 100, 0, 0.0, 39.67, 10, 123, 70.70000000000002, 86.64999999999992, 122.94999999999997, 0.8328752519447638, 44.97038347658788, 0.5465743840887511], "isController": false}, {"data": ["http://localhost:33143/UserRegister", 100, 100, 100.0, 761.1999999999999, 367, 1452, 998.9, 1062.8, 1450.119999999999, 0.8263506701703934, 54.100008250594975, 5.251845860809493], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-7", 100, 2, 2.0, 1776.3199999999997, 500, 22828, 1705.6000000000001, 2710.9999999999927, 22809.80999999999, 0.8146042245375084, 26.65329336851066, 0.43267894309174887], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-6", 100, 0, 0.0, 25.67, 2, 128, 52.70000000000002, 70.69999999999993, 127.71999999999986, 0.8207754686627926, 4.947095891198004, 0.5618785190748219], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-9", 100, 100, 100.0, 12.750000000000004, 2, 81, 31.50000000000003, 34.0, 80.71999999999986, 0.8210315440319217, 4.332865687449711, 0.545216259708698], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-8", 100, 0, 0.0, 21.930000000000003, 3, 93, 44.70000000000002, 59.69999999999993, 92.81999999999991, 0.8210450261092318, 44.65635032143913, 0.5404144019508029], "isController": false}, {"data": ["http://localhost:33143/UserRegister-4", 100, 0, 0.0, 19.860000000000007, 2, 95, 39.900000000000006, 47.74999999999994, 94.92999999999996, 0.8332916687498958, 0.2929541022948853, 0.5631228855223905], "isController": false}, {"data": ["http://localhost:33143/UserRegister-3", 100, 0, 0.0, 19.009999999999994, 2, 107, 38.80000000000001, 44.0, 106.88999999999994, 0.8333333333333334, 0.2897135416666667, 0.5615234375], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-1", 100, 0, 0.0, 31.369999999999994, 9, 97, 47.0, 56.849999999999966, 96.96999999999998, 0.8202570685652883, 2.840652760575164, 0.42134298639193524], "isController": false}, {"data": ["http://localhost:33143/UserRegister-6", 100, 0, 0.0, 714.9100000000002, 348, 1384, 950.8000000000001, 1002.1499999999999, 1382.139999999999, 0.8266102367411717, 0.6854891414412776, 0.422184720523079], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-0", 100, 0, 0.0, 38.09999999999999, 8, 157, 55.900000000000006, 71.74999999999994, 156.89999999999995, 0.8200350975021731, 0.7199331568891149, 0.6838964582684139], "isController": false}, {"data": ["http://localhost:33143/UserRegister-5", 100, 0, 0.0, 20.680000000000003, 2, 79, 46.50000000000003, 57.94999999999999, 78.85999999999993, 0.8331805835596807, 0.3059334955258203, 0.5728116511972805], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-3", 100, 0, 0.0, 15.53, 2, 98, 31.900000000000006, 48.5499999999999, 97.71999999999986, 0.8209641402863523, 1.2194203685308025, 0.5467749449954026], "isController": false}, {"data": ["http://localhost:33143/UserRegister-0", 100, 0, 0.0, 35.65, 10, 139, 57.60000000000002, 72.94999999999999, 138.76999999999987, 0.8333472224537076, 2.750412051138352, 0.48015123168719476], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/1e0d4d5a27a6477a9a8cc3749b588ec9", 100, 100, 100.0, 11.02, 3, 33, 17.0, 25.0, 32.97999999999999, 0.8304337355400725, 4.57225136813958, 0.48739323736287465], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-2", 100, 0, 0.0, 29.12, 7, 89, 50.0, 64.94999999999999, 88.87999999999994, 0.820755258989322, 22.561151396515072, 0.5418267139421696], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-5", 100, 0, 0.0, 25.250000000000004, 3, 137, 53.0, 63.74999999999994, 136.57999999999979, 0.8209169642490662, 17.892622778393466, 0.5523552620777409], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-10", 100, 0, 0.0, 31.689999999999984, 9, 252, 53.80000000000001, 65.69999999999993, 250.39999999999918, 0.8208226284382207, 44.319612428075416, 0.5635139724531926], "isController": false}, {"data": ["http://localhost:33143/UserRegister-2", 100, 0, 0.0, 19.349999999999998, 2, 85, 42.80000000000001, 52.94999999999999, 84.89999999999995, 0.8334236208922633, 0.2816060281530499, 0.5558870440131014], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-4", 100, 0, 0.0, 26.72000000000001, 3, 122, 57.50000000000003, 76.5499999999999, 121.82999999999991, 0.8209034863771066, 75.83176121764615, 0.5507428663487034], "isController": false}, {"data": ["http://localhost:33143/UserRegister-1", 100, 0, 0.0, 19.85999999999999, 2, 114, 43.0, 53.64999999999992, 113.52999999999976, 0.8330417687142834, 0.2757823824161543, 0.5515647648323087], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 100, 16.611295681063122, 3.8461538461538463], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to ajax.googleapis.com:443 [ajax.googleapis.com\/172.217.194.95] failed: Connection timed out: connect", 2, 0.33222591362126247, 0.07692307692307693], "isController": false}, {"data": ["404/Not Found", 300, 49.83388704318937, 11.538461538461538], "isController": false}, {"data": ["Assertion failed", 200, 33.222591362126245, 7.6923076923076925], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2600, 602, "404/Not Found", 300, "Assertion failed", 200, "500/Internal Server Error", 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to ajax.googleapis.com:443 [ajax.googleapis.com\/172.217.194.95] failed: Connection timed out: connect", 2, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/UserRegister/DbSignUp", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:39400/410ca67ca57a4811979f53c7de2dd2fa/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACJ65TvR%2Bk8IjqmECWRr3UEvdCM3rZlWlIzw2uuMwabVQAAAAAOgAAAAAIAACAAAAAQrdEItF1t69HcU6PxwbnxIdqFx9doRK%2FU7hOpQkxQsjAAAAAeWYQCQuW0RdzXC089Lq9qG5Xq6WlkQPFe%2Bc68tVpL2snOJgzQcGH2%2FgpwcNATeaNAAAAA8u5f1vxqkylKi5j5Yt0NvVgBvH7228ULKjuitp4i4ab6QXg4zhNAkWKI%2FG0OfoBB8bJupD%2FwHsDnZ825XIewMw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FUserRegister&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/UserRegister-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/UserRegister", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-7", 100, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to ajax.googleapis.com:443 [ajax.googleapis.com\/172.217.194.95] failed: Connection timed out: connect", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/UserRegister/DbSignUp-9", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/1e0d4d5a27a6477a9a8cc3749b588ec9", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
