(function(d3, _, helpers, extensions) {
  var property = helpers.property;

  /**
    Configurable chart

    Configure chart based on given options, including adding charts, axes, legend, and other properties

    @example
    ```javascript
    var chart = d3.select('#chart')
      .append('svg')
      .chart('Configurable', {
        charts: [
          {type: 'Bars', dataKey: 'participation', yScale: {domain: [0, 20000]}, itemPadding: 20},
          {type: 'LineValues', dataKey: 'results', yScale: {domain: [0, 70]}, labelPosition: 'top'}
        ]
      })
      .width(600)
      .height(400)
      .chartMargins({top: 10, right: 10, bottom: 10, left: 10});
    ```

    @param {Object} options
    - charts: {Array} of chart definitions
      - type: Matches Chart name (Line, LineValues, Bars)
      - dataKey: Key for extracting chart data from data object
      - other chart properties (e.g. xScale/yScale: {type, domain}, itemPadding, labelPosition, etc.)
    - axes: {Array} of axis definitions
      - type: [Axis] Matches Axis name (Axis, AxisValues)
      - dataKey: Key for extracting axis data from data object
      - other axis properties
    - legend: {Object} of legend properties
      - dataKey: Key for extracting legend data from data object
      - position: top, right, bottom, left
      - other legend properties
  */
  d3.chart('Container').extend('Configurable', {
    initialize: function() {
      // Setup charts
      _.each(this.options.charts, function(chartOptions, i) {
        chartOptions = _.defaults(chartOptions || {}, d3.chart('Configurable').defaultChartOptions);

        if (!d3.chart(chartOptions.type))
          return; // No matching chart found...

        var chart = this.chartBase().chart(chartOptions.type, chartOptions);
        var id = 'chart_' + i;

        this.attachChart(id, chart);
      }, this);

      // Setup axes
      _.each(this.options.axes, function(axisOptions, i) {
        axisOptions = _.defaults(axisOptions || {}, d3.chart('Configurable').defaultAxisOptions);

        if (!d3.chart(axisOptions.type))
          return; // No matching axis found...

        var axis = this.chartBase().chart(axisOptions.type, axisOptions);
        var id = 'axis_' + i;

        this.attachComponent(id, axis);
      }, this);

      // Setup legend
      if (this.options.legend) {
        var legendOptions = _.defaults(this.options.legend, d3.chart('Configurable').defaultLegendOptions);

        if (!d3.chart(legendOptions.type))
          return; // No matching legend founct

        var base = legendOptions.type == 'InsetLegend' ? this.chartBase() : this.base;
        var legend = base.chart(legendOptions.type, legendOptions);

        this.attachComponent('legend', legend);
      }
    },
    demux: function(name, data) {
      var item = this.chartsById[name] || this.componentsById[name];
      return name == 'legend' ? this.extractLegendData(item, data) : this.extractData(item, name, data);
    },
    extractData: function(item, name, data) {
      var dataKey = item && item.options && item.options.dataKey || name;
      return data[dataKey] || [];
    },
    extractLegendData: function(legend, data) {
      if (legend && legend.options && legend.options.dataKey) return this.extractData(legend, 'legend', data);
      var options = legend && legend.options && legend.options.data || {};

      var series;
      if (options.charts) {
        series = _.reduce(options.charts, function(memo, index) {
          return memo.concat(getChartData.call(this, this.charts && this.charts[index]));
        }, [], this);
      }
      else {
        series = _.reduce(this.charts, function(memo, chart) {
          return memo.concat(getChartData.call(this, chart));
        }, [], this);
      }

      function getChartData(chart) {
        if (chart) {
          var chartData = this.extractData(chart, chart.id, data);

          // Extend each series in data with information from chart
          // (Don't overwrite series information with chart information)
          return _.map(chartData, function(chartSeries) {
            // TODO: Be much more targeted in options transferred from chart (e.g. just styles, name, etc.)
            return _.defaults(chartSeries, chart.options);
          }, this);
        }
        else {
          return [];
        }
      }
      
      return series;
    }
  }, {
    defaultChartOptions: {},
    defaultAxisOptions: {
      type: 'Axis'
    },
    defaultLegendOptions: {
      type: 'Legend',
      legendPosition: 'right'
    }
  });

})(d3, _, d3.chart.helpers, d3.chart.extensions);
