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

    var data = {"OkPercent": 73.07692307692308, "KoPercent": 26.923076923076923};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6894444444444444, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002180669"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADdX51EVy%2Bmxnxmge%2F2HSgVP1uGx7Tm67CHspnm%2FVtDxgAAAAAOgAAAAAIAACAAAAAX0FyER3%2BcujfmXOMYoG4v1yymndebhDUk7DsArXD69zAAAACJV%2F1yxzf25jG8B6UpIgw2wW4OzTBtIn0di3NmUrlyskldkmRnvnvQQ4hdQflQEZlAAAAAcMrFVaX2we85LDNaD%2FrDQ3c2m%2BXnEAIM%2BgnX0q%2F%2FFf%2BY5gFSZT783cXfKoUC%2F4ltVUG%2BHEQs7BZO5tZCOF1NJw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FinvestmentAccount&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/ece11d5679c341f5a9ba4d251bb88fd6"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-9"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-8"], "isController": false}, {"data": [0.655, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-7"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-5"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-4"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-2"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-3"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-1"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-4"], "isController": false}, {"data": [0.985, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-0"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-5"], "isController": false}, {"data": [0.975, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-6"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-7"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-8"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/shareperchase-9"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:33143/Portfolio/Investmentpick-10"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2600, 700, 26.923076923076923, 249.26423076923052, 1, 5078, 851.9000000000001, 2007.0, 2019.0, 30.29137977234863, 862.7125584711009, 27.420843745995132], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Portfolio/shareperchase", 100, 100, 100.0, 181.12000000000006, 86, 852, 272.10000000000025, 591.0, 850.2199999999991, 1.3529419723188072, 87.43645136427287, 7.08841179833047], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002180669", 100, 100, 100.0, 2008.0099999999998, 2003, 2027, 2012.9, 2018.95, 2026.97, 1.3284799532375056, 3.5573164372824615, 0.0], "isController": false}, {"data": ["Test", 100, 100, 100.0, 5098.26, 4522, 9712, 5655.300000000001, 7432.199999999991, 9708.339999999998, 1.2028772824596436, 451.89296703965886, 14.429828650131114], "isController": true}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADdX51EVy%2Bmxnxmge%2F2HSgVP1uGx7Tm67CHspnm%2FVtDxgAAAAAOgAAAAAIAACAAAAAX0FyER3%2BcujfmXOMYoG4v1yymndebhDUk7DsArXD69zAAAACJV%2F1yxzf25jG8B6UpIgw2wW4OzTBtIn0di3NmUrlyskldkmRnvnvQQ4hdQflQEZlAAAAAcMrFVaX2we85LDNaD%2FrDQ3c2m%2BXnEAIM%2BgnX0q%2F%2FFf%2BY5gFSZT783cXfKoUC%2F4ltVUG%2BHEQs7BZO5tZCOF1NJw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FinvestmentAccount&browserName=Chrome", 100, 100, 100.0, 2010.4000000000008, 2003, 2050, 2019.9, 2025.8, 2049.9, 1.3282505611858622, 3.5567021863004236, 0.0], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick", 100, 100, 100.0, 884.3000000000003, 403, 5078, 1276.4000000000005, 2730.6999999999894, 5074.229999999998, 1.2671540986099321, 380.38504605709164, 7.98406078538211], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/ece11d5679c341f5a9ba4d251bb88fd6", 100, 100, 100.0, 14.430000000000003, 3, 100, 25.900000000000006, 33.0, 99.99, 1.3647591882412349, 7.514172171195393, 0.6224048251061101], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-9", 100, 100, 100.0, 10.219999999999997, 2, 35, 22.0, 26.899999999999977, 34.95999999999998, 1.3014224547430342, 6.868053657647809, 0.6990062012779968], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-8", 100, 0, 0.0, 21.26, 2, 78, 46.0, 54.799999999999955, 77.90999999999995, 1.3012700395586092, 70.77561997384447, 0.6912997085155111], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-7", 100, 0, 0.0, 799.8000000000002, 359, 3951, 1231.1000000000006, 2693.3499999999894, 3949.7999999999993, 1.2946156933314346, 43.14837792744974, 0.7206356886708181], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-6", 100, 0, 0.0, 24.359999999999992, 2, 110, 50.80000000000001, 71.5499999999999, 109.93999999999997, 1.3008637735456343, 7.840753135081695, 0.7253839987251535], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-5", 100, 0, 0.0, 24.01, 3, 99, 56.400000000000034, 68.74999999999994, 98.97999999999999, 1.300948391377314, 28.355339010888937, 0.7101856941210142], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-0", 100, 0, 0.0, 18.230000000000008, 4, 91, 28.900000000000006, 47.64999999999992, 91.0, 1.3545179947715604, 4.230157052128625, 0.6230253667357472], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-4", 100, 0, 0.0, 24.290000000000013, 3, 103, 51.0, 67.69999999999993, 102.99, 1.300999167360533, 120.1810685919286, 0.7076723986521648], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-1", 100, 0, 0.0, 12.769999999999996, 2, 50, 28.0, 35.849999999999966, 49.969999999999985, 1.3552522802119613, 0.4486626201092333, 0.7252717280821824], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-3", 100, 0, 0.0, 13.61, 2, 70, 27.900000000000006, 34.799999999999955, 69.99, 1.3011684492674422, 1.9326925891950972, 0.7014111171832306], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-2", 100, 0, 0.0, 13.72, 1, 62, 31.0, 40.94999999999999, 61.989999999999995, 1.3553624916984048, 0.45796427942153123, 0.7319486893644704], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-2", 100, 0, 0.0, 30.48, 7, 90, 52.70000000000002, 75.69999999999993, 90.0, 1.3005254122665557, 35.749208305155285, 0.6934442139624408], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-3", 100, 0, 0.0, 13.010000000000002, 1, 76, 27.0, 32.94999999999999, 75.85999999999993, 1.355325752544624, 0.47118746865809197, 0.7411937709228413], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-1", 100, 0, 0.0, 14.600000000000003, 4, 65, 24.900000000000006, 30.0, 64.76999999999988, 1.2992412431140214, 4.0575786162755945, 0.7003722326161521], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-4", 100, 0, 0.0, 14.839999999999996, 1, 71, 35.400000000000034, 48.74999999999994, 70.97999999999999, 1.355527842541886, 0.4765527571436317, 0.7439518042075584], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-0", 100, 0, 0.0, 58.91, 7, 1524, 69.30000000000004, 144.64999999999947, 1514.8799999999953, 1.2740638815630216, 1.1508877836384717, 1.0924102421995439], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-5", 100, 0, 0.0, 15.319999999999999, 1, 76, 32.80000000000001, 43.849999999999966, 75.87999999999994, 1.3552522802119613, 0.4976316966403296, 0.7596824305094393], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-6", 100, 0, 0.0, 155.23999999999995, 77, 764, 250.60000000000025, 531.7999999999995, 762.9499999999995, 1.3539861351819757, 0.22478285447357021, 0.7126938738897314], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-7", 100, 0, 0.0, 20.01, 1, 127, 40.900000000000006, 64.39999999999986, 126.55999999999977, 1.3556748549427904, 0.45012641668022346, 0.7241739703649477], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-8", 100, 100, 100.0, 19.760000000000005, 2, 116, 42.70000000000002, 59.89999999999998, 115.78999999999989, 1.3556380988531302, 7.154168248244448, 0.6208928401973809], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-9", 100, 0, 0.0, 42.739999999999995, 8, 165, 75.0, 91.94999999999999, 164.86999999999995, 1.35556459265284, 73.19122144842078, 0.7174961027517962], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-10", 100, 0, 0.0, 35.43000000000003, 9, 139, 68.9, 75.79999999999995, 138.71999999999986, 1.3000520020800832, 70.19392103809152, 0.7274705050702028], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 200, 28.571428571428573, 7.6923076923076925], "isController": false}, {"data": ["404/Not Found", 300, 42.857142857142854, 11.538461538461538], "isController": false}, {"data": ["Assertion failed", 200, 28.571428571428573, 7.6923076923076925], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2600, 700, "404/Not Found", 300, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 200, "Assertion failed", 200, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Portfolio/shareperchase", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2Fshareperchase&browserName=Chrome&clientProtocol=1.3&_=1546002180669", 100, 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:35852/fb20eca1c46d47b7ab0ec7ce96520416/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADdX51EVy%2Bmxnxmge%2F2HSgVP1uGx7Tm67CHspnm%2FVtDxgAAAAAOgAAAAAIAACAAAAAX0FyER3%2BcujfmXOMYoG4v1yymndebhDUk7DsArXD69zAAAACJV%2F1yxzf25jG8B6UpIgw2wW4OzTBtIn0di3NmUrlyskldkmRnvnvQQ4hdQflQEZlAAAAAcMrFVaX2we85LDNaD%2FrDQ3c2m%2BXnEAIM%2BgnX0q%2F%2FFf%2BY5gFSZT783cXfKoUC%2F4ltVUG%2BHEQs7BZO5tZCOF1NJw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FPortfolio%2FinvestmentAccount&browserName=Chrome", 100, 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:35852 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick", 100, 100, "Assertion failed", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/ece11d5679c341f5a9ba4d251bb88fd6", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Portfolio/Investmentpick-9", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/Portfolio/shareperchase-8", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
