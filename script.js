var app = angular.module('myApp', ['ngRoute']);
app.controller('currencyCtrl', function($scope, $http) {
  $http.get("http://api.nbp.pl/api/exchangerates/tables/C/?format=json")
  .then(function (response) {
      $scope.myData = response.data[0];
      console.log($scope.myData);
  }, function(response) {
      $scope.myData = "Error";
  });



});
app.controller('chartCtrl', function($scope, $http) {
  $scope.terms = [{'count': '1', 'text': '1 dzień'},{'count': '2', 'text': '2 dni'},{'count': '7', 'text': '1 tydzień'}, {'count': '14', 'text': '2 tygodnie'}, {'count': '30', 'text': '1 miesiąc'}, {'count': '60', 'text': '2 miesiące'}, {'count': '90', 'text': '3 miesiące'}];
  $scope.selectedTerm = $scope.terms[3].count;
  $scope.currencyForPlot = 'EUR';

  $scope.rateCheckbox = {
       sell : false,
       buy : true
     };

  createData = function(actual, date, table, key) {
    table.push([date, actual[key]]);

    if (date.getDay() == 5) {
        var std = new Date((new Date(actual.effectiveDate)).valueOf() + 1000*60*60*24);
        table.push([std, actual[key]]);
        var sun = new Date((new Date(actual.effectiveDate)).valueOf() + 1000*60*60*48);
        table.push([sun, actual[key]]);
    }
    var dif = table.length - $scope.selectedTerm;
    console.log('dif: ' + dif);
    if (dif > 0)  {
      table = table.slice(dif);
    }
  };

  createData2 = function(rates, keyText) {
    var table = [];
    for (key in rates) {
      var actual = rates[key];
      var date = new Date(actual.effectiveDate);

      table.push([date, actual[keyText]]);

      if (date.getDay() == 5) {
          var std = new Date((new Date(actual.effectiveDate)).valueOf() + 1000*60*60*24);
          table.push([std, actual[keyText]]);
          var sun = new Date((new Date(actual.effectiveDate)).valueOf() + 1000*60*60*48);
          table.push([sun, actual[keyText]]);
      }
    }
    var dif = table.length - $scope.selectedTerm;
    console.log('dif: ' + dif);
    if (dif > 0)  {
      console.log('wieksze');
      table = table.slice(dif);
    }
    return table;
  };

  $scope.getChartData = function(){
    $http.get("http://api.nbp.pl/api/exchangerates/rates/c/" + $scope.currencyForPlot + "/last/" + $scope.selectedTerm + "/?format=json")
    .then(function (response) {
        $scope.chartData = response.data;
        var keyText = ($scope.rateForPlot == '0') ? 'bid' : 'ask';

        var dataToChart = createData2($scope.chartData.rates, keyText);
        getChart(dataToChart, $scope.currencyForPlot);



    }, function(response) {
        $scope.chartData = "Error";
    });
  };

  $scope.getChartData();
});


function getChart(data, currency) {
  var chart = {
     zoomType: 'x'
  };
  var title = {
     text: 'Wykres kursu ' + currency
  };
  var subtitle = {
     text: document.ontouchstart === undefined ?
                   'Click and drag in the plot area to zoom in' :
                   'Pinch the chart to zoom in'
  };
  var xAxis = {
     type: 'datetime',
     //minRange: 14 * 24 * 3600000 // fourteen days
  };
  var yAxis = {
     title: {
        text: 'Exchange rate'
     }
  };
  var legend = {
     enabled: false
  };
  var plotOptions = {
     area: {
        fillColor: {
           linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
           stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
           ]
        },
        marker: {
           radius: 2
        },
        lineWidth: 1,
        states: {
           hover: {
              lineWidth: 1
           }
        },
        threshold: null
     }
  };
  var series= [{
     type: 'area',
     name: currency + ' - PLN',
     pointInterval: 24 * 3600 * 1000,
     pointStart: Date.UTC(data[0][0].getYear(), data[0][0].getMonth(), data[0][0].getDate()),
     data: data
   }


  ];

  var json = {};
  json.chart = chart;
  json.title = title;
  json.subtitle = subtitle;
  json.legend = legend;
  json.xAxis = xAxis;
  json.yAxis = yAxis;
  json.series = series;
  json.plotOptions = plotOptions;
  $('#chart_content').highcharts(json);
}
