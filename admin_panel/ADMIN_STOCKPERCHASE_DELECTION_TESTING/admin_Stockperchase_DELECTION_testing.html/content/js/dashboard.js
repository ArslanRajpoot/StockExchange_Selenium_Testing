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

    var data = {"OkPercent": 20.0, "KoPercent": 80.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18181818181818182, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Administator/perchaseDelete/4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome&clientProtocol=1.3&_=1546071060944"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAAaaMnSmHaY2k9J8c%2BwKVlnhygsD2l7n1Xdlamthvr4eQAAAAAOgAAAAAIAACAAAADfDNw2pjYBsCfEPYUj9EctC5HCdCkL0gmxfM7d46SioDAAAADdN8wXnx9viNf%2FsRWpAeqYwqJbZEADACjxO0umsdAjWF%2Fl230MHvV8p04trpS6KAZAAAAAi2sAPHBFCAsDwIEQ4Acj6rAyCmzHZ8UMxIIeS0f4V00xSkx3SeIVoKYxLgAL5Z5z6WzjUnGzaKK7lUx2qo5iEQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/perchaseDelete4"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/perchaseDelete/1004"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome&clientProtocol=1.3&_=1546071065150"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/perchaseDelete1004"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABXzpKG23owZ5KtV2R7OeTtpQkUFpV9T9QQxeU3x%2FI4swAAAAAOgAAAAAIAACAAAAAHPhDSeCHN9eh%2FLG%2B8%2Bph80UoPZGyt5daCt5bB23D%2FGjAAAAArcxmz4XbmmdTrnEG6XLt985jWzeWNV7m3RBTPMT%2BGNql4m8dvfJXbRsf1nEk5iPZAAAAAiKRd2FVIQ5kXrXVYyW6wbnSCoFP5crHxxOJBWTFD1SPRb1%2FqLCVNn7eNLiB2EzGkBv0F3HgcMXuefRJAJZVsUQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/75026b2fbdb046d89da7b3318e9b321d"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/4cef088952f14813b979a10c7878c90b"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1000, 800, 80.0, 5.826000000000005, 1, 197, 11.0, 16.0, 26.0, 15.855650160934848, 73.65754669488972, 9.302807242860993], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Administator/perchaseDelete/4", 100, 100, 100.0, 10.920000000000003, 4, 97, 21.0, 23.0, 96.31999999999965, 1.735749496632646, 21.588384364368533, 0.8068523050753315], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome&clientProtocol=1.3&_=1546071060944", 100, 0, 0.0, 3.879999999999999, 1, 24, 7.0, 7.949999999999989, 23.929999999999964, 1.7355085039916696, 1.5355182662270046, 1.0745238198542173], "isController": false}, {"data": ["Test", 100, 100, 100.0, 58.260000000000005, 34, 251, 75.0, 91.69999999999993, 250.06999999999954, 1.730223544881999, 80.3776699512077, 10.151545954737353], "isController": true}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAAaaMnSmHaY2k9J8c%2BwKVlnhygsD2l7n1Xdlamthvr4eQAAAAAOgAAAAAIAACAAAADfDNw2pjYBsCfEPYUj9EctC5HCdCkL0gmxfM7d46SioDAAAADdN8wXnx9viNf%2FsRWpAeqYwqJbZEADACjxO0umsdAjWF%2Fl230MHvV8p04trpS6KAZAAAAAi2sAPHBFCAsDwIEQ4Acj6rAyCmzHZ8UMxIIeS0f4V00xSkx3SeIVoKYxLgAL5Z5z6WzjUnGzaKK7lUx2qo5iEQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome", 100, 100, 100.0, 2.86, 1, 24, 5.0, 6.0, 23.85999999999993, 1.7360508315683483, 0.21192026752543316, 1.7292693830075345], "isController": false}, {"data": ["http://localhost:33143/Administator/perchaseDelete4", 100, 100, 100.0, 7.3599999999999985, 2, 33, 13.900000000000006, 23.94999999999999, 32.93999999999997, 1.7357193688924373, 7.412403125162724, 0.6729302631350563], "isController": false}, {"data": ["http://localhost:33143/Administator/perchaseDelete/1004", 100, 100, 100.0, 10.739999999999997, 4, 197, 18.80000000000001, 22.0, 195.31999999999914, 1.7349063150589867, 21.58467427133935, 0.8115430907356003], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome&clientProtocol=1.3&_=1546071065150", 100, 0, 0.0, 3.659999999999998, 1, 16, 7.0, 8.0, 15.93999999999997, 1.736231682755747, 1.5361581099381902, 1.074971569206195], "isController": false}, {"data": ["http://localhost:33143/Administator/perchaseDelete1004", 100, 100, 100.0, 6.719999999999998, 2, 40, 12.0, 13.949999999999989, 39.84999999999992, 1.733733247802493, 7.420852368279617, 0.6772395499228488], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABXzpKG23owZ5KtV2R7OeTtpQkUFpV9T9QQxeU3x%2FI4swAAAAAOgAAAAAIAACAAAAAHPhDSeCHN9eh%2FLG%2B8%2Bph80UoPZGyt5daCt5bB23D%2FGjAAAAArcxmz4XbmmdTrnEG6XLt985jWzeWNV7m3RBTPMT%2BGNql4m8dvfJXbRsf1nEk5iPZAAAAAiKRd2FVIQ5kXrXVYyW6wbnSCoFP5crHxxOJBWTFD1SPRb1%2FqLCVNn7eNLiB2EzGkBv0F3HgcMXuefRJAJZVsUQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome", 100, 100, 100.0, 2.3399999999999994, 1, 16, 4.900000000000006, 5.0, 15.949999999999974, 1.7352073572791948, 0.21181730435537047, 1.7419855110185667], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/75026b2fbdb046d89da7b3318e9b321d", 100, 100, 100.0, 5.57, 2, 39, 9.0, 12.0, 38.91999999999996, 1.7365331851491683, 9.56110751745216, 0.7970415986524503], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/4cef088952f14813b979a10c7878c90b", 100, 100, 100.0, 4.210000000000001, 2, 18, 9.0, 10.0, 17.93999999999997, 1.7356591165495097, 9.556295018658336, 0.7966404148225288], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 400, 50.0, 40.0], "isController": false}, {"data": ["404/Not Found", 400, 50.0, 40.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1000, 800, "500/Internal Server Error", 400, "404/Not Found", 400, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Administator/perchaseDelete/4", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAAaaMnSmHaY2k9J8c%2BwKVlnhygsD2l7n1Xdlamthvr4eQAAAAAOgAAAAAIAACAAAADfDNw2pjYBsCfEPYUj9EctC5HCdCkL0gmxfM7d46SioDAAAADdN8wXnx9viNf%2FsRWpAeqYwqJbZEADACjxO0umsdAjWF%2Fl230MHvV8p04trpS6KAZAAAAAi2sAPHBFCAsDwIEQ4Acj6rAyCmzHZ8UMxIIeS0f4V00xSkx3SeIVoKYxLgAL5Z5z6WzjUnGzaKK7lUx2qo5iEQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/perchaseDelete4", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/perchaseDelete/1004", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/perchaseDelete1004", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABXzpKG23owZ5KtV2R7OeTtpQkUFpV9T9QQxeU3x%2FI4swAAAAAOgAAAAAIAACAAAAAHPhDSeCHN9eh%2FLG%2B8%2Bph80UoPZGyt5daCt5bB23D%2FGjAAAAArcxmz4XbmmdTrnEG6XLt985jWzeWNV7m3RBTPMT%2BGNql4m8dvfJXbRsf1nEk5iPZAAAAAiKRd2FVIQ5kXrXVYyW6wbnSCoFP5crHxxOJBWTFD1SPRb1%2FqLCVNn7eNLiB2EzGkBv0F3HgcMXuefRJAJZVsUQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockperchase&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/75026b2fbdb046d89da7b3318e9b321d", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/4cef088952f14813b979a10c7878c90b", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
