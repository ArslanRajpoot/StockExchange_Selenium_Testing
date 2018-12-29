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

    var data = {"OkPercent": 62.40625, "KoPercent": 37.59375};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.555, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-7"], "isController": false}, {"data": [0.1725, 500, 1500, "http://localhost:33143/Administator/stockAccount-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome&clientProtocol=1.3&_=1546071149895"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-1"], "isController": false}, {"data": [0.985, 500, 1500, "http://localhost:33143/Administator/stockAccount-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-2"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/stockAccount"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/stockAccountDelete/1009"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-9"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/stockAccount-8"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/stockAccountDelete/1005"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/2d8ecb12bcbe4d9bbdbb0f7befba6821"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome&clientProtocol=1.3&_=1546071156478"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/d7ca7e153d724d3588e121a4d99293e0"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABD9BEp9HEklBYkmIeM0t4y5f0Hb6juu0hjk6My%2F2vsEAAAAAAOgAAAAAIAACAAAABQ1t4gk6SAIuWQoYfwDiN9wIN1iwwWtVZbHZ8fNGID6DAAAADOekj%2BD3EJNZoN1aZTWHIt%2F%2FhAF7Kuqr22ZbXElqNhD5ivlmx61ZspQzT8Jb%2F%2BUHtAAAAAWRUrBRFpvd0ZsKZJYrV%2BfPlONBz8ilap4RYmx1QATF7KUkVmwpcPzrjK4aYA31%2BGCfAXQww8J4VhERcp4cuMGQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACKl2K%2BHcY1wlWgx%2FCW3HIuy1cg1nHb1ve5KV1YthDXmQAAAAAOgAAAAAIAACAAAABNA82aD9mvgMgnzUoAx3g90E0cWck242ykM3N1eu4mkDAAAADYVviQoGzzFnZrBUEHq4Z9KWUrAHP%2BvVoO%2BtJcnY0v3xO8JzPnOseyK1g3TCblnv5AAAAALZnCYKgEui0I%2FUAZ1U2bSUPIZJ7DckoknC8AQzvdsX2BPgfrxxIiBWK%2B%2B4sX0TrXGy9x5RIZ6IXLXME1gIaSCg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3200, 1203, 37.59375, 381.49968749999954, 1, 18350, 1136.900000000001, 2604.0499999999965, 5886.419999999987, 13.797563867629622, 349.98901011911175, 10.82250626549531], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Administator/stockAccount-5", 200, 0, 0.0, 10.239999999999998, 1, 185, 23.900000000000006, 38.89999999999998, 78.81000000000017, 0.9438726149518861, 3.0178114661645266, 0.47746681107917677], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-4", 200, 0, 0.0, 10.515000000000002, 1, 287, 20.900000000000006, 32.94999999999999, 64.97000000000003, 0.9439260717100637, 10.45278290054323, 0.46643221902860565], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-7", 200, 0, 0.0, 9.355000000000002, 1, 121, 19.0, 28.899999999999977, 55.92000000000007, 0.9440463715577709, 25.829901577265474, 0.45266285979967336], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-6", 200, 3, 1.5, 2794.18, 352, 18248, 5116.8, 6750.95, 12809.800000000012, 0.8953152628869441, 15.027145364225442, 0.430280296629138], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome&clientProtocol=1.3&_=1546071149895", 100, 0, 0.0, 5.07, 2, 50, 9.0, 10.0, 49.659999999999826, 0.4935468746144165, 0.4366733089850208, 0.30461096167608515], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-1", 200, 0, 0.0, 9.475000000000001, 1, 228, 17.0, 25.94999999999999, 46.98000000000002, 0.9438815239911087, 13.12907860055406, 0.45396645563048926], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-0", 200, 0, 0.0, 191.70999999999998, 99, 1240, 290.70000000000005, 402.39999999999986, 1115.8600000000047, 0.9425559289124319, 7.849962916315172, 0.42249333141680295], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-3", 200, 0, 0.0, 10.490000000000002, 1, 273, 20.900000000000006, 36.849999999999966, 64.93000000000006, 0.9438904331985144, 43.7604749715653, 0.4645710725898937], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-2", 200, 0, 0.0, 7.140000000000003, 1, 159, 16.0, 24.0, 51.8900000000001, 0.9439171618298778, 0.8604947954767489, 0.45905346346804604], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount", 200, 200, 100.0, 2992.3850000000007, 483, 18350, 5499.8, 6935.499999999999, 13057.290000000012, 0.8940665274903106, 167.37097834207657, 4.29450974001663], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccountDelete/1009", 200, 200, 100.0, 15.335000000000006, 4, 128, 33.60000000000002, 61.849999999999966, 115.81000000000017, 0.9870742625321416, 12.308546150657145, 0.4270252913102917], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-9", 200, 0, 0.0, 16.675000000000015, 6, 116, 35.0, 46.94999999999999, 111.72000000000025, 0.9440374594063893, 50.975257073200666, 0.4637215254701307], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-8", 200, 200, 100.0, 6.559999999999999, 1, 69, 13.0, 23.94999999999999, 30.0, 0.9440686526724223, 4.982174803751729, 0.41948362984956267], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccountDelete/1005", 200, 200, 100.0, 12.829999999999998, 4, 240, 23.80000000000001, 41.69999999999993, 65.92000000000007, 1.0368765131916615, 12.929566598578443, 0.44857060092178325], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/2d8ecb12bcbe4d9bbdbb0f7befba6821", 100, 100, 100.0, 7.249999999999997, 2, 60, 16.0, 28.549999999999898, 59.93999999999997, 0.49356636246526525, 2.7175069839640287, 0.22605724999629825], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome&clientProtocol=1.3&_=1546071156478", 100, 0, 0.0, 5.26, 2, 24, 9.0, 12.949999999999989, 23.949999999999974, 0.47450035113025985, 0.41982159973048383, 0.2928556854632073], "isController": false}, {"data": ["Test", 100, 100, 100.0, 6075.310000000001, 1777, 30095, 9378.700000000003, 11641.099999999997, 29944.57999999992, 0.4582069445844521, 200.37763322223725, 7.099187233953593], "isController": true}, {"data": ["http://localhost:33143/__browserLink/requestData/d7ca7e153d724d3588e121a4d99293e0", 100, 100, 100.0, 7.970000000000004, 2, 65, 21.50000000000003, 25.94999999999999, 64.78999999999989, 0.4745026026467755, 2.6125446032446487, 0.21732589906380634], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABD9BEp9HEklBYkmIeM0t4y5f0Hb6juu0hjk6My%2F2vsEAAAAAAOgAAAAAIAACAAAABQ1t4gk6SAIuWQoYfwDiN9wIN1iwwWtVZbHZ8fNGID6DAAAADOekj%2BD3EJNZoN1aZTWHIt%2F%2FhAF7Kuqr22ZbXElqNhD5ivlmx61ZspQzT8Jb%2F%2BUHtAAAAAWRUrBRFpvd0ZsKZJYrV%2BfPlONBz8ilap4RYmx1QATF7KUkVmwpcPzrjK4aYA31%2BGCfAXQww8J4VhERcp4cuMGQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome", 100, 100, 100.0, 3.9200000000000013, 1, 48, 8.800000000000011, 13.0, 47.82999999999991, 0.49361021575702535, 0.0602551532906525, 0.4955383806623262], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACKl2K%2BHcY1wlWgx%2FCW3HIuy1cg1nHb1ve5KV1YthDXmQAAAAAOgAAAAAIAACAAAABNA82aD9mvgMgnzUoAx3g90E0cWck242ykM3N1eu4mkDAAAADYVviQoGzzFnZrBUEHq4Z9KWUrAHP%2BvVoO%2BtJcnY0v3xO8JzPnOseyK1g3TCblnv5AAAAALZnCYKgEui0I%2FUAZ1U2bSUPIZJ7DckoknC8AQzvdsX2BPgfrxxIiBWK%2B%2B4sX0TrXGy9x5RIZ6IXLXME1gIaSCg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome", 100, 100, 100.0, 4.74, 1, 70, 10.900000000000006, 16.799999999999955, 69.65999999999983, 0.5185915054711404, 0.06330462713270756, 0.5196043795052637], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 600, 49.87531172069826, 18.75], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 3, 0.24937655860349128, 0.09375], "isController": false}, {"data": ["404/Not Found", 400, 33.25020781379884, 12.5], "isController": false}, {"data": ["Assertion failed", 200, 16.62510390689942, 6.25], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3200, 1203, "500/Internal Server Error", 600, "404/Not Found", 400, "Assertion failed", 200, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 3, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-6", 200, 3, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount", 200, 200, "Assertion failed", 200, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccountDelete/1009", 200, 200, "500/Internal Server Error", 200, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccount-8", 200, 200, "404/Not Found", 200, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/stockAccountDelete/1005", 200, 200, "500/Internal Server Error", 200, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/2d8ecb12bcbe4d9bbdbb0f7befba6821", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/d7ca7e153d724d3588e121a4d99293e0", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABD9BEp9HEklBYkmIeM0t4y5f0Hb6juu0hjk6My%2F2vsEAAAAAAOgAAAAAIAACAAAABQ1t4gk6SAIuWQoYfwDiN9wIN1iwwWtVZbHZ8fNGID6DAAAADOekj%2BD3EJNZoN1aZTWHIt%2F%2FhAF7Kuqr22ZbXElqNhD5ivlmx61ZspQzT8Jb%2F%2BUHtAAAAAWRUrBRFpvd0ZsKZJYrV%2BfPlONBz8ilap4RYmx1QATF7KUkVmwpcPzrjK4aYA31%2BGCfAXQww8J4VhERcp4cuMGQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAACKl2K%2BHcY1wlWgx%2FCW3HIuy1cg1nHb1ve5KV1YthDXmQAAAAAOgAAAAAIAACAAAABNA82aD9mvgMgnzUoAx3g90E0cWck242ykM3N1eu4mkDAAAADYVviQoGzzFnZrBUEHq4Z9KWUrAHP%2BvVoO%2BtJcnY0v3xO8JzPnOseyK1g3TCblnv5AAAAALZnCYKgEui0I%2FUAZ1U2bSUPIZJ7DckoknC8AQzvdsX2BPgfrxxIiBWK%2B%2B4sX0TrXGy9x5RIZ6IXLXME1gIaSCg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FstockAccount&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
