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

    var data = {"OkPercent": 66.6, "KoPercent": 33.4};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.603225806451613, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-9"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/97edbf0f55ac45f0b172c6c367d41356"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/a8cb0b45d1d44ba0a5ce159f156d1757"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/CurrencyDelete/6"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABS4zysbczr6VM%2FMdxiUR%2BTn9z5QCb%2FQ5Iml%2FE9Z2VsYgAAAAAOgAAAAAIAACAAAADgqUYR5V%2F2VUtdehuPWXHPI2SF8gPwhBmaCVfVYdI3QjAAAAAlwDABXd6shGBKYhDW33e%2BWeyMiIRzZiwT0rwic2wuWabukz1v8LjEP5jwIWYOjTRAAAAAgwJfGYOhjDUOYrfby4AOf8BMrR6cwf9eLuDi4scws5lXRSWFriDSk4m8fDgTC578BadmTG3XpqRuy4YqffiHGg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencylist&browserName=Chrome"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencylist&browserName=Chrome&clientProtocol=1.3&_=1546070775645"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/Currencylist"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-0"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/EditSave"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-9"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-4"], "isController": false}, {"data": [0.265, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-5"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAA7gTtobozHsInwjuXrmraISLVkH3Z6QBYrKDa5t%2Bo9RAAAAAAOgAAAAAIAACAAAAAV7ewVhcjit%2FltqaKVEVhPCQ5JSRb6786Nm2k45DImsTAAAAD5OTUHLRHiNM22RUXXWAOJB98q7UCxqZgpVG%2Fe5eFGKEx6Jspux9jeQOtqIcmxmklAAAAAq8nEVq2ilVC95BVpXGdogHnKaHDqTGmOUXFxxRW%2BJkDUmsE9GZxLoobSon7eR3%2F6cwFPbTqvOODS%2BUQX%2FEcIXg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencyEdit%2F6&browserName=Chrome"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-7"], "isController": false}, {"data": [0.435, 500, 1500, "http://localhost:33143/Administator/Currencylist-6"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/CurrencyEdit/6-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencyEdit%2F6&browserName=Chrome&clientProtocol=1.3&_=1546070749267"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/Currencylist-7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3000, 1002, 33.4, 267.1193333333329, 1, 24283, 890.9000000000001, 1411.6499999999987, 4999.98, 8.319929003272506, 211.62955451113484, 8.596306644849964], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Administator/Currencylist-8", 100, 100, 100.0, 6.820000000000002, 2, 60, 10.0, 11.899999999999977, 59.639999999999816, 0.30580198098523287, 1.6138221730900373, 0.18336173469231734], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-9", 100, 0, 0.0, 12.27, 8, 64, 15.0, 17.0, 63.639999999999816, 0.30579917556542263, 16.51225958451066, 0.20516018907563024], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/97edbf0f55ac45f0b172c6c367d41356", 100, 100, 100.0, 5.319999999999999, 2, 17, 10.0, 11.949999999999989, 17.0, 0.30547222951961434, 1.6818871387027203, 0.18316401262211252], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/a8cb0b45d1d44ba0a5ce159f156d1757", 100, 100, 100.0, 6.379999999999999, 2, 44, 10.900000000000006, 12.0, 43.73999999999987, 0.3057776690568288, 1.683568845842188, 0.18394437904199856], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyDelete/6", 100, 100, 100.0, 12.33, 5, 26, 21.0, 23.0, 25.97999999999999, 0.30546289847635105, 3.5343011925271557, 0.16168055759197486], "isController": false}, {"data": ["Test", 100, 100, 100.0, 3974.349999999999, 1085, 25336, 7641.2, 9567.299999999996, 25247.339999999953, 0.3020481887680361, 120.66133439132005, 5.654920232848949], "isController": true}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABS4zysbczr6VM%2FMdxiUR%2BTn9z5QCb%2FQ5Iml%2FE9Z2VsYgAAAAAOgAAAAAIAACAAAADgqUYR5V%2F2VUtdehuPWXHPI2SF8gPwhBmaCVfVYdI3QjAAAAAlwDABXd6shGBKYhDW33e%2BWeyMiIRzZiwT0rwic2wuWabukz1v8LjEP5jwIWYOjTRAAAAAgwJfGYOhjDUOYrfby4AOf8BMrR6cwf9eLuDi4scws5lXRSWFriDSk4m8fDgTC578BadmTG3XpqRuy4YqffiHGg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencylist&browserName=Chrome", 100, 100, 100.0, 2.7600000000000007, 1, 16, 5.0, 6.0, 15.95999999999998, 0.3057645796195677, 0.03732477778559176, 0.3490613218508542], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencylist&browserName=Chrome&clientProtocol=1.3&_=1546070775645", 100, 0, 0.0, 4.979999999999997, 2, 12, 9.0, 10.0, 11.989999999999995, 0.30547782841921334, 0.27027628178496804, 0.23179323504075075], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist", 100, 100, 100.0, 1599.3100000000002, 354, 11117, 4682.400000000006, 5157.249999999999, 11112.629999999997, 0.3048761897793306, 19.721883960501764, 1.9847052904784117], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6", 100, 100, 100.0, 2323.180000000001, 527, 24283, 4380.9000000000015, 6770.149999999999, 24147.529999999933, 0.30307622367025305, 90.59814342135172, 1.747166355697833], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-1", 100, 0, 0.0, 10.169999999999998, 5, 39, 14.900000000000006, 18.0, 38.95999999999998, 0.30386177935380754, 8.352638052002906, 0.18041793149132324], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-2", 100, 0, 0.0, 4.890000000000001, 2, 27, 10.0, 13.0, 26.949999999999974, 0.3038636260046491, 0.45134431167292116, 0.18219947887388138], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-3", 100, 0, 0.0, 8.97, 2, 34, 17.900000000000006, 24.94999999999999, 33.989999999999995, 0.3038627026764227, 28.069613900655128, 0.18368262984053285], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-4", 100, 0, 0.0, 8.920000000000003, 2, 35, 17.0, 26.94999999999999, 34.93999999999997, 0.30386085603680363, 6.62292035730998, 0.18427499179575688], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-0", 100, 0, 0.0, 14.270000000000001, 6, 62, 28.700000000000017, 31.899999999999977, 61.72999999999986, 0.30374733082033045, 0.9340675365104292, 0.14030516355275027], "isController": false}, {"data": ["http://localhost:33143/Administator/EditSave", 100, 100, 100.0, 12.989999999999998, 5, 39, 24.900000000000006, 26.94999999999999, 38.949999999999974, 0.3057701892411701, 3.444393684469626, 0.2759098191980871], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-9", 100, 0, 0.0, 13.380000000000004, 7, 45, 18.900000000000006, 27.749999999999943, 44.929999999999964, 0.3038857875656013, 16.408942238149212, 0.18844479990640317], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-0", 100, 0, 0.0, 8.019999999999996, 5, 42, 11.0, 16.899999999999977, 41.8099999999999, 0.305787019341029, 0.865281706291568, 0.1845472440944882], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-1", 100, 0, 0.0, 5.4399999999999995, 1, 58, 8.0, 10.949999999999989, 57.64999999999982, 0.3057926297860369, 0.10123408349361963, 0.20694755121262068], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-2", 100, 0, 0.0, 5.709999999999999, 1, 26, 10.0, 16.0, 25.929999999999964, 0.305791694697572, 0.1033241468411718, 0.20844004189346219], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-3", 100, 0, 0.0, 4.549999999999999, 1, 22, 8.900000000000006, 10.0, 21.91999999999996, 0.30579449998012337, 0.10631136913371476, 0.21053234617772165], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-5", 100, 0, 0.0, 8.35, 2, 30, 16.900000000000006, 20.94999999999999, 29.989999999999995, 0.3038580861194588, 1.8314571362590815, 0.1878341489390795], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-4", 100, 0, 0.0, 5.119999999999998, 1, 27, 8.900000000000006, 11.949999999999989, 26.95999999999998, 0.30579449998012337, 0.10750587889926212, 0.21112960106049533], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-6", 100, 1, 1.0, 2304.6800000000003, 501, 24271, 4368.600000000002, 6758.899999999999, 24135.43999999993, 0.30319935964295247, 10.010585802955285, 0.14275537818814127], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-5", 100, 0, 0.0, 6.2, 2, 51, 10.0, 12.899999999999977, 50.70999999999985, 0.305795435085745, 0.112284261320547, 0.21471378694008855], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAA7gTtobozHsInwjuXrmraISLVkH3Z6QBYrKDa5t%2Bo9RAAAAAAOgAAAAAIAACAAAAAV7ewVhcjit%2FltqaKVEVhPCQ5JSRb6786Nm2k45DImsTAAAAD5OTUHLRHiNM22RUXXWAOJB98q7UCxqZgpVG%2Fe5eFGKEx6Jspux9jeQOtqIcmxmklAAAAAq8nEVq2ilVC95BVpXGdogHnKaHDqTGmOUXFxxRW%2BJkDUmsE9GZxLoobSon7eR3%2F6cwFPbTqvOODS%2BUQX%2FEcIXg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencyEdit%2F6&browserName=Chrome", 100, 100, 100.0, 2.7699999999999996, 1, 11, 5.0, 6.0, 10.949999999999974, 0.30547409579667645, 0.037289318334555226, 0.351116221438172], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-7", 100, 0, 0.0, 9.900000000000002, 2, 38, 17.700000000000017, 23.94999999999999, 37.87999999999994, 0.30387470638106495, 16.527638449114658, 0.1798321016278568], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-6", 100, 1, 1.0, 1589.0400000000002, 345, 11111, 4674.5000000000055, 5150.199999999999, 11106.619999999997, 0.30488548501182955, 0.15753111451651258, 0.1587280282369692], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-8", 100, 100, 100.0, 5.589999999999998, 2, 19, 10.0, 15.899999999999977, 18.989999999999995, 0.30387470638106495, 1.603651282503198, 0.18161261748555835], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencyEdit%2F6&browserName=Chrome&clientProtocol=1.3&_=1546070749267", 100, 0, 0.0, 4.33, 1, 9, 7.900000000000006, 8.0, 9.0, 0.305780474082047, 0.27054405226399864, 0.23381456172484652], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-7", 100, 0, 0.0, 6.939999999999999, 3, 54, 9.0, 14.849999999999966, 53.77999999999989, 0.305795435085745, 0.10153364055581378, 0.20665082136653862], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ajax.googleapis.com:443 failed to respond", 2, 0.1996007984031936, 0.06666666666666667], "isController": false}, {"data": ["500/Internal Server Error", 400, 39.920159680638726, 13.333333333333334], "isController": false}, {"data": ["404/Not Found", 400, 39.920159680638726, 13.333333333333334], "isController": false}, {"data": ["Assertion failed", 200, 19.960079840319363, 6.666666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3000, 1002, "500/Internal Server Error", 400, "404/Not Found", 400, "Assertion failed", 200, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ajax.googleapis.com:443 failed to respond", 2, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Administator/Currencylist-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/97edbf0f55ac45f0b172c6c367d41356", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/a8cb0b45d1d44ba0a5ce159f156d1757", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyDelete/6", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABS4zysbczr6VM%2FMdxiUR%2BTn9z5QCb%2FQ5Iml%2FE9Z2VsYgAAAAAOgAAAAAIAACAAAADgqUYR5V%2F2VUtdehuPWXHPI2SF8gPwhBmaCVfVYdI3QjAAAAAlwDABXd6shGBKYhDW33e%2BWeyMiIRzZiwT0rwic2wuWabukz1v8LjEP5jwIWYOjTRAAAAAgwJfGYOhjDUOYrfby4AOf8BMrR6cwf9eLuDi4scws5lXRSWFriDSk4m8fDgTC578BadmTG3XpqRuy4YqffiHGg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencylist&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/EditSave", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-6", 100, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ajax.googleapis.com:443 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAA7gTtobozHsInwjuXrmraISLVkH3Z6QBYrKDa5t%2Bo9RAAAAAAOgAAAAAIAACAAAAAV7ewVhcjit%2FltqaKVEVhPCQ5JSRb6786Nm2k45DImsTAAAAD5OTUHLRHiNM22RUXXWAOJB98q7UCxqZgpVG%2Fe5eFGKEx6Jspux9jeQOtqIcmxmklAAAAAq8nEVq2ilVC95BVpXGdogHnKaHDqTGmOUXFxxRW%2BJkDUmsE9GZxLoobSon7eR3%2F6cwFPbTqvOODS%2BUQX%2FEcIXg%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FCurrencyEdit%2F6&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/Currencylist-6", 100, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ajax.googleapis.com:443 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/CurrencyEdit/6-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
