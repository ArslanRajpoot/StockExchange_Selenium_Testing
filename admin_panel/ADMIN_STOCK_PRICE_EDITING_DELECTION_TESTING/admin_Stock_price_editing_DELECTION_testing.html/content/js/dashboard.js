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

    var data = {"OkPercent": 66.66666666666667, "KoPercent": 33.333333333333336};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6041935483870968, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/74d4f3650adc43cc8cf9df3da478c2ec"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/StockDBEdit"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-9"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-9"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-8"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockEdit%2F10&browserName=Chrome&clientProtocol=1.3&_=1546070583946"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAApTU%2FdqYqhKx257KivIhVnwLLHk%2BYtIYd60SFwQ2KLCAAAAAAOgAAAAAIAACAAAACdSyu%2FjQk%2F4mPbL7TEFvMs%2BmJBJ4LJ9k%2BscqR%2F8YWZKDAAAACpxWJiUC8vWWvbwkcWbzfv2Z2k6oq%2FQud0nAtBDIy1YTaeYK6UvDj0o3JjOfM3B3FAAAAAZDbsISlsW9n05CzPcKmN5JDIAVZrx1xB1inu%2FzuxGMKTlPoWdmqM0iKHvSNLjeUgfODc9FMsGIfJ5isMjWk0%2BA%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockEdit%2F10&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAAowf9fahghUojnHeOZ6OmU4FkL4dnF5tpS0jYG4G7zqwAAAAAOgAAAAAIAACAAAABmR%2BOAQqqxvjUJmocUKXMYPNzuzvrTn0MfW8TRcn4qcTAAAADKCBZb5nWsDOQgwR%2BZv861UPRBZX6fNdY6NQ%2FM9DQXqhDsbPZPTYFCH16zHEB%2FiLhAAAAA0iwhb3CMLFm5Lyt5JTsPYLBzHZvE6SbXnCOEdHzLpTM8%2B0eS06czRm%2B9hzSrf4F4XGJdtjwacuN6XTtfGZ2y%2BQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockPriceTable&browserName=Chrome"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockPriceTable&browserName=Chrome&clientProtocol=1.3&_=1546070601799"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/StockDelete/10"], "isController": false}, {"data": [0.23, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-4"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-7"], "isController": false}, {"data": [0.5, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-4"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockEdit/10-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Administator/StockPriceTable-2"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/f1681be699654f91bca3e0163270087d"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3000, 1000, 33.333333333333336, 297.4339999999996, 1, 21872, 676.9000000000001, 1668.7999999999993, 5121.929999999977, 9.365780559761484, 238.55621736610837, 9.689558520518863], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/__browserLink/requestData/74d4f3650adc43cc8cf9df3da478c2ec", 100, 100, 100.0, 7.339999999999998, 2, 58, 13.0, 14.899999999999977, 57.6099999999998, 0.3433405663745983, 1.890384876191392, 0.2058702224160189], "isController": false}, {"data": ["http://localhost:33143/Administator/StockDBEdit", 100, 100, 100.0, 14.540000000000001, 5, 93, 23.0, 26.899999999999977, 92.54999999999977, 0.34335353396624835, 4.26844774159213, 0.3044580164466343], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10", 100, 100, 100.0, 2741.6299999999997, 394, 21872, 5279.100000000001, 7559.949999999999, 21770.259999999947, 0.33923488962992865, 101.4965645311689, 1.9665022508234926], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-9", 100, 0, 0.0, 12.400000000000002, 6, 55, 17.0, 19.899999999999977, 54.78999999999989, 0.3433723976664412, 18.541103500166535, 0.22969735586085177], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-9", 100, 0, 0.0, 11.919999999999991, 7, 31, 16.0, 19.94999999999999, 30.989999999999995, 0.3598585036363702, 19.431304923404117, 0.22420871613281657], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-8", 100, 100, 100.0, 6.499999999999999, 2, 19, 10.900000000000006, 14.0, 18.989999999999995, 0.3433759348409826, 1.8121128436334668, 0.205220773557306], "isController": false}, {"data": ["Test", 100, 100, 100.0, 4432.400000000001, 770, 22866, 8929.800000000001, 11566.19999999999, 22829.32999999998, 0.33799884404395336, 135.3971712190182, 6.334507632858896], "isController": true}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockEdit%2F10&browserName=Chrome&clientProtocol=1.3&_=1546070583946", 100, 0, 0.0, 3.940000000000001, 1, 15, 7.900000000000006, 8.949999999999989, 15.0, 0.3433417452060909, 0.3037769737858578, 0.2611945503081492], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAApTU%2FdqYqhKx257KivIhVnwLLHk%2BYtIYd60SFwQ2KLCAAAAAAOgAAAAAIAACAAAACdSyu%2FjQk%2F4mPbL7TEFvMs%2BmJBJ4LJ9k%2BscqR%2F8YWZKDAAAACpxWJiUC8vWWvbwkcWbzfv2Z2k6oq%2FQud0nAtBDIy1YTaeYK6UvDj0o3JjOfM3B3FAAAAAZDbsISlsW9n05CzPcKmN5JDIAVZrx1xB1inu%2FzuxGMKTlPoWdmqM0iKHvSNLjeUgfODc9FMsGIfJ5isMjWk0%2BA%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockEdit%2F10&browserName=Chrome", 100, 100, 100.0, 2.6799999999999997, 1, 9, 5.0, 6.0, 8.989999999999995, 0.3425584319045221, 0.04181621483209499, 0.3944105382963199], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAAowf9fahghUojnHeOZ6OmU4FkL4dnF5tpS0jYG4G7zqwAAAAAOgAAAAAIAACAAAABmR%2BOAQqqxvjUJmocUKXMYPNzuzvrTn0MfW8TRcn4qcTAAAADKCBZb5nWsDOQgwR%2BZv861UPRBZX6fNdY6NQ%2FM9DQXqhDsbPZPTYFCH16zHEB%2FiLhAAAAA0iwhb3CMLFm5Lyt5JTsPYLBzHZvE6SbXnCOEdHzLpTM8%2B0eS06czRm%2B9hzSrf4F4XGJdtjwacuN6XTtfGZ2y%2BQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockPriceTable&browserName=Chrome", 100, 100, 100.0, 2.870000000000001, 1, 13, 5.0, 6.0, 12.989999999999995, 0.3433334935556303, 0.04191082685005253, 0.39463234562009464], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-0", 100, 0, 0.0, 13.24, 6, 45, 22.0, 28.899999999999977, 44.91999999999996, 0.35966694840577623, 1.0885580109069002, 0.1664864585393925], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockPriceTable&browserName=Chrome&clientProtocol=1.3&_=1546070601799", 100, 0, 0.0, 4.21, 1, 11, 8.0, 8.949999999999989, 10.97999999999999, 0.3425549115523218, 0.3030808104164098, 0.26193407787643364], "isController": false}, {"data": ["http://localhost:33143/Administator/StockDelete/10", 100, 100, 100.0, 12.249999999999998, 5, 29, 22.0, 24.0, 28.97999999999999, 0.3425631258200105, 3.967242294042485, 0.18165212628932198], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-6", 100, 0, 0.0, 2724.7300000000005, 379, 21860, 5172.5, 7551.5999999999985, 21758.259999999947, 0.33936958705508646, 11.310883434182664, 0.16239365005565662], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-5", 100, 0, 0.0, 5.660000000000001, 2, 22, 10.900000000000006, 13.0, 21.989999999999995, 0.3433676815470774, 0.12608032056806748, 0.24042444108325636], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-5", 100, 0, 0.0, 8.209999999999997, 2, 44, 16.0, 23.899999999999977, 43.91999999999996, 0.3598093010704327, 2.168694341998741, 0.22347530808671404], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-4", 100, 0, 0.0, 5.8300000000000045, 2, 33, 10.0, 13.0, 32.85999999999993, 0.34337003959056556, 0.12071602954355821, 0.2364022245228015], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-8", 100, 100, 100.0, 5.1400000000000015, 1, 18, 9.0, 10.0, 17.989999999999995, 0.3598610936178635, 1.899110693272397, 0.21612751228025984], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-7", 100, 0, 0.0, 6.750000000000001, 2, 20, 11.900000000000006, 14.949999999999989, 19.969999999999985, 0.3433688605647731, 0.11400919198439731, 0.23137159549774747], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-7", 100, 0, 0.0, 8.740000000000002, 2, 35, 14.900000000000006, 18.94999999999999, 34.949999999999974, 0.3598597986224567, 19.572647933864964, 0.21401818101667588], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-6", 100, 0, 0.0, 1623.43, 240, 12132, 4624.000000000003, 4930.299999999999, 12131.01, 0.3422547744541036, 0.056819640290232044, 0.1794832166814977], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-2", 100, 0, 0.0, 4.240000000000002, 2, 16, 7.900000000000006, 10.0, 15.97999999999999, 0.3598093010704327, 0.5344433075470001, 0.21679915894575874], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-1", 100, 0, 0.0, 6.160000000000001, 1, 25, 11.0, 14.899999999999977, 24.97999999999999, 0.3433665025374784, 0.11367309019551289, 0.23170532544277112], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-1", 100, 0, 0.0, 9.339999999999998, 5, 22, 13.900000000000006, 16.94999999999999, 21.969999999999985, 0.3598041226356372, 9.890396917917887, 0.2146878114554437], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-0", 100, 0, 0.0, 10.649999999999999, 5, 85, 22.0, 29.899999999999977, 84.53999999999976, 0.3433582496969863, 0.977276711984233, 0.2075573794555025], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-4", 100, 0, 0.0, 7.9600000000000035, 2, 42, 17.700000000000017, 21.94999999999999, 41.85999999999993, 0.35980800644775945, 7.842338765534711, 0.21925800392910344], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable", 100, 100, 100.0, 1636.8000000000006, 252, 12143, 4632.300000000002, 4937.4, 12142.07, 0.34224071843171616, 22.02457389961053, 2.224230450354561], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-3", 100, 0, 0.0, 5.669999999999999, 1, 29, 11.0, 13.949999999999989, 28.969999999999985, 0.34337003959056556, 0.11937474032640756, 0.23573157991422616], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-3", 100, 0, 0.0, 7.940000000000005, 2, 34, 13.900000000000006, 21.94999999999999, 33.95999999999998, 0.35983131108136507, 33.239768758905825, 0.21856940966075103], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-2", 100, 0, 0.0, 6.13, 1, 35, 12.800000000000011, 14.949999999999989, 34.889999999999944, 0.34337003959056556, 0.11602151728353094, 0.23338432378421253], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/f1681be699654f91bca3e0163270087d", 100, 100, 100.0, 6.120000000000001, 1, 27, 12.0, 14.849999999999966, 26.929999999999964, 0.34256429931898214, 1.886110858945724, 0.2064083717576289], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 400, 40.0, 13.333333333333334], "isController": false}, {"data": ["404/Not Found", 400, 40.0, 13.333333333333334], "isController": false}, {"data": ["Assertion failed", 200, 20.0, 6.666666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3000, 1000, "500/Internal Server Error", 400, "404/Not Found", 400, "Assertion failed", 200, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/__browserLink/requestData/74d4f3650adc43cc8cf9df3da478c2ec", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/StockDBEdit", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAApTU%2FdqYqhKx257KivIhVnwLLHk%2BYtIYd60SFwQ2KLCAAAAAAOgAAAAAIAACAAAACdSyu%2FjQk%2F4mPbL7TEFvMs%2BmJBJ4LJ9k%2BscqR%2F8YWZKDAAAACpxWJiUC8vWWvbwkcWbzfv2Z2k6oq%2FQud0nAtBDIy1YTaeYK6UvDj0o3JjOfM3B3FAAAAAZDbsISlsW9n05CzPcKmN5JDIAVZrx1xB1inu%2FzuxGMKTlPoWdmqM0iKHvSNLjeUgfODc9FMsGIfJ5isMjWk0%2BA%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockEdit%2F10&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAAAowf9fahghUojnHeOZ6OmU4FkL4dnF5tpS0jYG4G7zqwAAAAAOgAAAAAIAACAAAABmR%2BOAQqqxvjUJmocUKXMYPNzuzvrTn0MfW8TRcn4qcTAAAADKCBZb5nWsDOQgwR%2BZv861UPRBZX6fNdY6NQ%2FM9DQXqhDsbPZPTYFCH16zHEB%2FiLhAAAAA0iwhb3CMLFm5Lyt5JTsPYLBzHZvE6SbXnCOEdHzLpTM8%2B0eS06czRm%2B9hzSrf4F4XGJdtjwacuN6XTtfGZ2y%2BQ%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FStockPriceTable&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/StockDelete/10", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/StockEdit/10-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Administator/StockPriceTable", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/f1681be699654f91bca3e0163270087d", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
