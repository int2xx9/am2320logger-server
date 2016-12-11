"use strict";

var tempCount = 60;
var humidityCount = 60;

var chartTemp = new Chart("chartTemp", {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: "温度",
        borderColor: "#ff8c00",
        backgroundColor: "#f5deb3",
        pointRadius: 1,
        pointHoverRadius: 3,
        type: 'line',
        data: []
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: "温度 (1h)"
    },
  },
});

var chartHumidity = new Chart("chartHumidity", {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: "湿度",
        borderColor: "#1e90ff",
        backgroundColor: "#87cefa",
        pointRadius: 1,
        pointHoverRadius: 3,
        type: 'line',
        data: []
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: "湿度 (1h)"
    },
  },
});

function zeropad(str, len) {
  str = str.toString();
  for (var i = 0; i < len-str.length; i++) {
    str = "0" + str;
  }
  return str;
}

function formatTime(time) {
  return ""  + time.getFullYear() +
         "-" + zeropad(time.getMonth()+1, 2) +
         "-" + zeropad(time.getDate(), 2) +
         " " +
         ""  + zeropad(time.getHours(), 2) +
         ":" + zeropad(time.getMinutes(), 2);
}

function updateChart() {
  var count = Math.max(tempCount, humidityCount);
  $.getJSON("./sensor.json?count="+count).then(function(json) {
    chartTemp.data.labels = [];
    chartTemp.data.datasets[0].data = [];
    json.slice(json.length-tempCount).forEach((x, i) => {
      var time = new Date(x.time + " UTC");
      chartTemp.data.labels.push(formatTime(time));
      chartTemp.data.datasets[0].data.push(x.temperature);
    });

    chartHumidity.data.labels = [];
    chartHumidity.data.datasets[0].data = [];
    json.slice(json.length-humidityCount).forEach((x, i) => {
      var time = new Date(x.time + " UTC");
      chartHumidity.data.labels.push(formatTime(time));
      chartHumidity.data.datasets[0].data.push(x.humidity);
    });
    chartTemp.update();
    chartHumidity.update();

    document.querySelector("#lastDatetime").innerText =
      formatTime(new Date(json[json.length-1].time + " UTC"));

    var tempData = chartTemp.data.datasets[0].data;
    document.querySelector("#tempCur").innerText =
      tempData[tempData.length-1];
    document.querySelector("#tempAvr").innerText =
      (tempData.reduce((cur,sum)=>cur+sum) / tempData.length).toFixed(2);
    document.querySelector("#tempMax").innerText =
      (tempData.reduce((cur,max)=>cur>max?cur:max)).toFixed(1);
    document.querySelector("#tempMin").innerText =
      (tempData.reduce((cur,min)=>cur<min?cur:min)).toFixed(1);

    var humidityData = chartHumidity.data.datasets[0].data;
    document.querySelector("#humidityCur").innerText =
      humidityData[humidityData.length-1];
    document.querySelector("#humidityAvr").innerText =
      (humidityData.reduce((cur,sum)=>cur+sum) / humidityData.length).toFixed(2);
    document.querySelector("#humidityMax").innerText =
      (humidityData.reduce((cur,max)=>cur>max?cur:max)).toFixed(1);
    document.querySelector("#humidityMin").innerText =
      (humidityData.reduce((cur,min)=>cur<min?cur:min)).toFixed(1);
  });
}

updateChart();
setInterval(updateChart, 60000);

function setTempRangeButtonEvent(button, count, title) {
  button.addEventListener("click", function() {
    button.parentNode.querySelectorAll("button").forEach(
      e => e.classList.remove("active"));
    this.classList.add("active");
    tempCount = count;
    chartTemp.options.title.text = title;
    updateChart();
  }, false);
}

function setHumidityRangeButtonEvent(button, count, title) {
  button.addEventListener("click", function() {
    button.parentNode.querySelectorAll("button").forEach(
      e => e.classList.remove("active"));
    this.classList.add("active");
    humidityCount = count;
    chartHumidity.options.title.text = title;
    updateChart();
  }, false);
}

setTempRangeButtonEvent(document.querySelector("#btnTemp10min"), 10, "温度 (10min)");
setTempRangeButtonEvent(document.querySelector("#btnTemp1h"), 60, "温度 (1h)");
setTempRangeButtonEvent(document.querySelector("#btnTemp1d"), 60*24, "温度 (1d)");
setTempRangeButtonEvent(document.querySelector("#btnTemp1w"), 60*24*7, "温度 (1w)");
setTempRangeButtonEvent(document.querySelector("#btnTemp1m"), 60*24*30, "温度 (1m)");

setHumidityRangeButtonEvent(document.querySelector("#btnHumidity10min"), 10, "湿度 (10min)");
setHumidityRangeButtonEvent(document.querySelector("#btnHumidity1h"), 60, "湿度 (1h)");
setHumidityRangeButtonEvent(document.querySelector("#btnHumidity1d"), 60*24, "湿度 (1d)");
setHumidityRangeButtonEvent(document.querySelector("#btnHumidity1w"), 60*24*7, "湿度 (1w)");
setHumidityRangeButtonEvent(document.querySelector("#btnHumidity1m"), 60*24*30, "湿度 (1m)");

