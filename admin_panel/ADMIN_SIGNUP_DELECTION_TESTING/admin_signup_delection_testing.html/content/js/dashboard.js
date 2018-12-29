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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2222222222222222, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "http://localhost:33143/Administator/signupDelete/8"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABVFSp4EbwRJczNPV3dVLo4A%2FaYqNDNx4WX%2Bxwea75olAAAAAAOgAAAAAIAACAAAADF3k51ww7FTHv5KxykqME1nAO%2FZpw2c4MZoTp6rmq1TDAAAABEIubmNLb5IF55J32ACPNkNVV7y6M%2FEKJ2XwEzTk7RwFGk4RcrMhvhH5ZGraHSX6hAAAAASg0xYyFbcK5v0inhXAGvwZSERbFyJajZs%2BB88tJI3BxrwnkIoHD1ZXdjleIgXuZ0p7YzYkBuo1lHrmqY5Edx2A%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/333d6ee6264e45f6ae90103d355f7324"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/Administator/signupDelete/12"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome&clientProtocol=1.3&_=1546070436073"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADmAvb5l5xXUu%2BPukarcW%2BS0Oe6yonGKqs5dGtn2hWTXAAAAAAOgAAAAAIAACAAAABhLYEq8s8VtR1uJOwK9iJP3lKgdedubMOCCxGhIwLXkDAAAADKhP%2FUc3SuGl363NDuG0Pt9l2Q06qKA3nO4PD4d7TXsmzkJxDnJ%2Fl%2FsLB9oA6JXRtAAAAAjmZS%2Fv1ivh8VDx5P9WW8VodfON4GhaENPpTH1Xv2ho1NrTdg3hGCZDMHzrxffIBhqHJMBLvcWjYp2Cw0GIyPdw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome&clientProtocol=1.3&_=1546070433808"], "isController": false}, {"data": [0.0, 500, 1500, "http://localhost:33143/__browserLink/requestData/653d13c43d2646d989babfaff809f3bc"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 600, 75.0, 7.710000000000004, 1, 65, 17.0, 24.949999999999932, 39.99000000000001, 16.468021161407194, 77.90950050433315, 10.395036306840405], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://localhost:33143/Administator/signupDelete/8", 100, 100, 100.0, 14.430000000000001, 5, 46, 24.900000000000006, 31.899999999999977, 45.929999999999964, 2.240293926563165, 27.804585461612565, 1.0304476947375496], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABVFSp4EbwRJczNPV3dVLo4A%2FaYqNDNx4WX%2Bxwea75olAAAAAAOgAAAAAIAACAAAADF3k51ww7FTHv5KxykqME1nAO%2FZpw2c4MZoTp6rmq1TDAAAABEIubmNLb5IF55J32ACPNkNVV7y6M%2FEKJ2XwEzTk7RwFGk4RcrMhvhH5ZGraHSX6hAAAAASg0xYyFbcK5v0inhXAGvwZSERbFyJajZs%2BB88tJI3BxrwnkIoHD1ZXdjleIgXuZ0p7YzYkBuo1lHrmqY5Edx2A%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome", 100, 100, 100.0, 4.259999999999999, 1, 22, 8.0, 9.0, 21.889999999999944, 2.243259006684912, 0.27383532796446675, 2.2301149109426173], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/333d6ee6264e45f6ae90103d355f7324", 100, 100, 100.0, 5.480000000000002, 2, 20, 11.0, 12.0, 19.989999999999995, 2.2429571146599674, 12.349406457473533, 1.0229111060021532], "isController": false}, {"data": ["http://localhost:33143/Administator/signupDelete/12", 100, 100, 100.0, 17.139999999999993, 5, 65, 32.0, 39.849999999999966, 64.89999999999995, 2.2429571146599674, 27.837638642786647, 1.0338630450385788], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome&clientProtocol=1.3&_=1546070436073", 100, 0, 0.0, 5.719999999999996, 1, 25, 10.0, 14.899999999999977, 24.95999999999998, 2.243661655822302, 1.985114707202154, 1.3759956248597711], "isController": false}, {"data": ["Test", 100, 100, 100.0, 61.68000000000002, 22, 117, 88.9, 97.0, 116.89999999999995, 2.23448707349228, 84.5700986526043, 11.283723297879472], "isController": true}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADmAvb5l5xXUu%2BPukarcW%2BS0Oe6yonGKqs5dGtn2hWTXAAAAAAOgAAAAAIAACAAAABhLYEq8s8VtR1uJOwK9iJP3lKgdedubMOCCxGhIwLXkDAAAADKhP%2FUc3SuGl363NDuG0Pt9l2Q06qKA3nO4PD4d7TXsmzkJxDnJ%2Fl%2FsLB9oA6JXRtAAAAAjmZS%2Fv1ivh8VDx5P9WW8VodfON4GhaENPpTH1Xv2ho1NrTdg3hGCZDMHzrxffIBhqHJMBLvcWjYp2Cw0GIyPdw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome", 100, 100, 100.0, 3.12, 1, 10, 6.0, 7.949999999999989, 9.97999999999999, 2.2425547183351275, 0.27374935526551847, 2.233794738966631], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/negotiate?requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome&clientProtocol=1.3&_=1546070433808", 100, 0, 0.0, 5.889999999999999, 1, 53, 10.900000000000006, 20.799999999999955, 52.95999999999998, 2.242705600035883, 1.9842688219067484, 1.3754092937720066], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/653d13c43d2646d989babfaff809f3bc", 100, 100, 100.0, 5.6400000000000015, 2, 18, 11.0, 13.949999999999989, 17.989999999999995, 2.2437623406928737, 12.353839918775805, 1.0232783331089572], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 400, 66.66666666666667, 50.0], "isController": false}, {"data": ["404/Not Found", 200, 33.333333333333336, 25.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 600, "500/Internal Server Error", 400, "404/Not Found", 200, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:33143/Administator/signupDelete/8", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAABVFSp4EbwRJczNPV3dVLo4A%2FaYqNDNx4WX%2Bxwea75olAAAAAAOgAAAAAIAACAAAADF3k51ww7FTHv5KxykqME1nAO%2FZpw2c4MZoTp6rmq1TDAAAABEIubmNLb5IF55J32ACPNkNVV7y6M%2FEKJ2XwEzTk7RwFGk4RcrMhvhH5ZGraHSX6hAAAAASg0xYyFbcK5v0inhXAGvwZSERbFyJajZs%2BB88tJI3BxrwnkIoHD1ZXdjleIgXuZ0p7YzYkBuo1lHrmqY5Edx2A%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/333d6ee6264e45f6ae90103d355f7324", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["http://localhost:33143/Administator/signupDelete/12", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:45157/6639822e5924419d907fe0f7a5fe5d63/arterySignalR/abort?transport=webSockets&connectionToken=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAAxjzWcLo0lUGw9PxkRdhOIgAAAAACAAAAAAAQZgAAAAEAACAAAADmAvb5l5xXUu%2BPukarcW%2BS0Oe6yonGKqs5dGtn2hWTXAAAAAAOgAAAAAIAACAAAABhLYEq8s8VtR1uJOwK9iJP3lKgdedubMOCCxGhIwLXkDAAAADKhP%2FUc3SuGl363NDuG0Pt9l2Q06qKA3nO4PD4d7TXsmzkJxDnJ%2Fl%2FsLB9oA6JXRtAAAAAjmZS%2Fv1ivh8VDx5P9WW8VodfON4GhaENPpTH1Xv2ho1NrTdg3hGCZDMHzrxffIBhqHJMBLvcWjYp2Cw0GIyPdw%3D%3D&requestUrl=http%3A%2F%2Flocalhost%3A33143%2FAdministator%2FUserSignUp&browserName=Chrome", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["http://localhost:33143/__browserLink/requestData/653d13c43d2646d989babfaff809f3bc", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
