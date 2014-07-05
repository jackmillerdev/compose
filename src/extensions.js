(function(d3, _, helpers) {
  var property = helpers.property;
  var valueOrDefault = helpers.valueOrDefault;
  var di = helpers.di;

  /**
    Extensions for handling series data
  */
  var Series = {
    seriesKey: di(function(chart, d, i) {
      return d.key;
    }),
    seriesValues: di(function(chart, d, i) {
      // Store seriesIndex on series
      d.seriesIndex = i;
      return d.values;
    }),
    seriesClass: di(function(chart, d, i) {
      return 'chart-series chart-index-' + i + (d['class'] ? ' ' + d['class'] : '');
    }),
    seriesIndex: di(function(chart, d, i) {
      var series = chart.seriesData.call(this, d, i);
      return series && series.seriesIndex || 0;
    }),
    seriesCount: di(function(chart, d, i) {
      return chart.data() ? chart.data().length : 1;
    }),
    seriesData: di(function(chart, d, i) {
      return helpers.getParentData(this);
    }),
    itemStyle: di(function(chart, d, i) {
      // Get style for data item in the following progression
      // data.style -> series.style -> chart.style
      var series = chart.seriesData.call(this, d, i) || {};
      var styles = _.defaults({}, d.style, series.style, chart.options().style);
      
      return helpers.style(styles) || null;
    }),

    /**
      seriesLayer

      extension of layer()
      - updates dataBind method to access underlying series values
      - handles appending series groups to chart
      -> should be used just like layer() would be used without series
      
      @param {String} name
      @param {Selection} selection
      @param {Object} options (`dataBind` and `insert` required)
    */
    seriesLayer: function(name, selection, options) {
      if (options && options.dataBind) {
        var dataBind = options.dataBind;

        options.dataBind = function(data) {
          var chart = this.chart();
          var series = this.selectAll('g')
            .data(data, chart.seriesKey);

          series.enter()
            .append('g')
            .attr('class', chart.seriesClass);
          series.chart = function() { return chart; };

          return dataBind.call(series, chart.seriesValues);
        };
      }
      
      return d3.chart().prototype.layer.call(this, name, selection, options);
    }
  };

  /**
    Extensions for handling XY data

    Properties:
    - xScale {d3.scale}
    - yScale {d3.scale}
    - xMin {Number}
    - xMax {Number}
    - yMin {Number}
    - yMax {Number}
    - [invertedXY = false] {Boolean} invert x and y axes

    Notes:
      Inverted XY
      - (x, y) position is updated to properly place point in inverted space
      - To invert, change range for scale (from width to height or vice-versa) and swap x and y coordinates
  */
  var XY = {
    xScale: property('xScale', {type: 'Function', setFromOptions: false}),
    yScale: property('yScale', {type: 'Function', setFromOptions: false}),

    xMin: property('xMin', {
      get: function(value) {
        var min = this.data() && d3.extent(this.data(), this.xValue)[0];

        // Default behavior: if min is less than zero, use min, otherwise use 0
        return valueOrDefault(value, (min < 0 ? min : 0));
      }
    }),
    xMax: property('xMax', {
      get: function(value) {
        var max = this.data() && d3.extent(this.data(), this.xValue)[1];
        return valueOrDefault(value, max);
      }
    }),
    yMin: property('yMin', {
      get: function(value) {
        var min = this.data() && d3.extent(this.data(), this.yValue)[0];

        // Default behavior: if min is less than zero, use min, otherwise use 0
        return valueOrDefault(value, (min < 0 ? min : 0));
      }
    }),
    yMax: property('yMax', {
      get: function(value) {
        var max = this.data() && d3.extent(this.data(), this.yValue)[1];
        return valueOrDefault(value, max);
      }
    }),

    invertedXY: property('invertedXY', {
      defaultValue: false
    }),

    initialize: function() {
      this.on('change:data', this.setScales);
      this.on('change:options', createScalesFromOptions.bind(this));

      createScalesFromOptions.call(this);

      function createScalesFromOptions() {
        if (this.options().xScale)
          this.xScale(helpers.createScaleFromOptions(this.options().xScale));
        if (this.options().yScale)
          this.yScale(helpers.createScaleFromOptions(this.options().yScale));

        this.setScales(); 
      }
    },

    x: di(function(chart, d, i) {
      if (chart.invertedXY())
        return chart._yScale()(chart.yValue.call(this, d, i));
      else
        return chart._xScale()(chart.xValue.call(this, d, i));
    }),
    y: di(function(chart, d, i) {
      if (chart.invertedXY())
        return chart._xScale()(chart.xValue.call(this, d, i));
      else
        return chart._yScale()(chart.yValue.call(this, d, i));
    }),
    x0: di(function(chart, d, i) {
      if (chart.invertedXY())
        return chart._yScale()(0);
      else
        return chart._xScale()(0);
    }),
    y0: di(function(chart, d, i) {
      if (chart.invertedXY())
        return chart._xScale()(0);
      else
        return chart._yScale()(0);
    }),

    xValue: di(function(chart, d, i) {
      return d.x;
    }),
    yValue: di(function(chart, d, i) {
      return d.y;
    }),
    keyValue: di(function(chart, d, i) {
      return !_.isUndefined(d.key) ? d.key : chart.xValue.call(this, d, i);
    }),

    setScales: function() {
      var xScale = this.xScale();
      var yScale = this.yScale();

      // If no user-defined scales, create default and set domain
      if (!xScale)
        xScale = this.setXScaleDomain(this.defaultXScale(), this.data() || [], this);
      if (!yScale)
        yScale = this.setYScaleDomain(this.defaultYScale(), this.data() || [], this);

      // Range is dependent on chart dimensions, set separately even if scale is user-defined
      xScale = this.setXScaleRange(xScale, this.data() || [], this);
      yScale = this.setYScaleRange(yScale, this.data() || [], this);

      this._xScale(xScale)._yScale(yScale);
    },

    setXScaleDomain: function(xScale, data, chart) {
      return xScale.domain([this.xMin(), this.xMax()]);
    },
    setYScaleDomain: function(yScale, data, chart) {
      return yScale.domain([this.yMin(), this.yMax()]);
    },

    setXScaleRange: function(xScale, data, chart) {
      if (this.invertedXY())
        return xScale.range([chart.height(), 0]);
      else
        return xScale.range([0, chart.width()]);
    },
    setYScaleRange: function(yScale, data, chart) {
      if (this.invertedXY())
        return yScale.range([0, chart.width()]);
      else
        return yScale.range([chart.height(), 0]);
    },

    defaultXScale: function() {
      return d3.scale.linear();
    },
    defaultYScale: function() {
      return d3.scale.linear();
    },

    // _xScale and _yScale used to differentiate between user- and internally-set values
    _xScale: property('_xScale', {type: 'Function'}),
    _yScale: property('_yScale', {type: 'Function'}),
    
  };

  /**
    Extensions for handling series XY data
  
    Properties:
    - xMin {Number}
    - xMax {Number}
    - yMin {Number}
    - yMax {Number}
    Dependencies: Series, XY
  */
  var XYSeries = {
    xMin: property('xMin', {
      get: function(value) {
        // Calculate minimum from series data
        var min = _.reduce(this.data(), function(memo, series, index) {
          var seriesValues = this.seriesValues(series, index);
          if (_.isArray(seriesValues)) {
            var seriesMin = d3.extent(seriesValues, this.xValue)[0];
            return seriesMin < memo ? seriesMin : memo;  
          }
          else {
            return memo;
          }          
        }, Infinity, this);

        // Default behavior: if min is less than zero, use min, otherwise use 0
        return valueOrDefault(value, (min < 0 ? min : 0));
      }
    }),
    xMax: property('xMax', {
      get: function(value) {
        // Calculate maximum from series data
        var max = _.reduce(this.data(), function(memo, series, index) {
          var seriesValues = this.seriesValues(series, index);
          if (_.isArray(seriesValues)) {
            var seriesMax = d3.extent(seriesValues, this.xValue)[1];
            return seriesMax > memo ? seriesMax : memo;
          }
          else {
            return memo;
          }
        }, -Infinity, this);

        return valueOrDefault(value, max);
      }
    }),
    yMin: property('yMin', {
      get: function(value) {
        // Calculate minimum from series data
        var min = _.reduce(this.data(), function(memo, series, index) {
          var seriesValues = this.seriesValues(series, index);
          if (_.isArray(seriesValues)) {
            var seriesMin = d3.extent(seriesValues, this.yValue)[0];
            return seriesMin < memo ? seriesMin : memo;
          }
          else {
            return memo;
          }
        }, Infinity, this);
        
        // Default behavior: if min is less than zero, use min, otherwise use 0
        return valueOrDefault(value, (min < 0 ? min : 0));
      }
    }),
    yMax: property('yMax', {
      get: function(value) {
        // Calculate maximum from series data
        var max = _.reduce(this.data(), function(memo, series, index) {
          var seriesValues = this.seriesValues(series, index);
          if (_.isArray(seriesValues)) {
            var seriesMax = d3.extent(seriesValues, this.yValue)[1];
            return seriesMax > memo ? seriesMax : memo;
          }
          else {
            return memo;
          }
        }, -Infinity, this);

        return valueOrDefault(value, max);
      }
    })
  };

  /**
    Extensions for charts of centered key,value data (x: index, y: value, key)
  
    Properties:
    - [itemPadding = 0.1] {Number} % padding between each item (for ValuesSeries, padding is just around group, not individual series items)
    Dependencies: XY
  */
  var Values = {
    // Define % padding between each item
    // (If series is displayed adjacent, padding is just around group, not individual series)
    itemPadding: property('itemPadding', {defaultValue: 0.1}),
    isValues: true,

    transform: function(data) {
      // Transform series data from values to x,y
      return _.map(data, function(item, index) {
        item = _.isObject(item) ? item : {y: item};
        item.x = valueOrDefault(item.x, item.key);

        return item;
      }, this);
    },

    defaultXScale: function() {
      return d3.scale.ordinal();
    },

    setXScaleDomain: function(xScale, data, chart) {
      // Extract keys from all series
      var allKeys = _.map(this.data(), this.xValue);
      var uniqueKeys = _.uniq(_.flatten(allKeys));

      return xScale.domain(uniqueKeys);
    },

    setXScaleRange: function(xScale, data, chart) {
      if (_.isFunction(xScale.rangeBands)) {
        if (this.invertedXY())
          return xScale.rangeBands([chart.height(), 0], this.itemPadding(), this.itemPadding() / 2);
        else
          return xScale.rangeBands([0, chart.width()], this.itemPadding(), this.itemPadding() / 2);
      }
      else {
        return XY.setXScaleRange.call(this, xScale, data, chart);
      }
    }
  };

  /**
    Extensions for charts of centered key,value series data (x: index, y: value, key)

    Properties:
    - [displayAdjacent = false] {Boolean} Display series next to each other (default is stacked)
    Dependencies: Series, XY, XYSeries, Values
  */
  var ValuesSeries = {
    displayAdjacent: property('displayAdjacent', {defaultValue: false}),

    transform: function(data) {
      // Transform series data from values to x,y
      _.each(data, function(series) {
        series.values = _.map(series.values, function(item, index) {
          item = _.isObject(item) ? item : {y: item};
          item.x = valueOrDefault(item.x, item.key);

          return item;
        }, this);
      }, this);

      return data;
    },

    // determine centered-x based on series display type (adjacent or layered)
    x: di(function(chart, d, i) {
      if (chart.invertedXY())
        return XY.x.original.call(this, chart, d, i);
      else
        return chart.displayAdjacent() ? chart.adjacentX.call(this, d, i) : chart.layeredX.call(this, d, i);
    }),
    y: di(function(chart, d, i) {
      if (chart.invertedXY())
        return chart.displayAdjacent() ? chart.adjacentX.call(this, d, i) : chart.layeredX.call(this, d, i);
      else
        return XY.y.original.call(this, chart, d, i);
    }),

    setXScaleDomain: function(xScale, data, chart) {
      // Extract keys from all series
      var allKeys = _.map(data, function(series, index) {
        return _.map(this.seriesValues(series, index), this.xValue);
      }, this);
      var uniqueKeys = _.uniq(_.flatten(allKeys));

      return xScale.domain(uniqueKeys);
    },

    // AdjacentX/Width is used in cases where series are presented next to each other at each value
    adjacentX: di(function(chart, d, i) {
      var adjacentWidth = chart.adjacentWidth.call(this, d, i);
      var left = chart.layeredX.call(this, d, i) - chart.layeredWidth.call(this, d, i) / 2 + adjacentWidth / 2;
      
      return left + adjacentWidth * chart.seriesIndex.call(this, d, i);
    }),
    adjacentWidth: di(function(chart, d, i) {
      return chart.layeredWidth.call(this, d, i) / chart.seriesCount.call(this);
    }),

    // LayeredX/Width is used in cases where sereis are presented on top of each other at each value
    layeredX: di(function(chart, d, i) {
      return chart._xScale()(chart.xValue.call(this, d, i)) + 0.5 * chart.layeredWidth.call(this);
    }),
    layeredWidth: di(function(chart, d, i) {
      return chart._xScale().rangeBand();
    }),

    // determine item width based on series display type (adjacent or layered)
    itemWidth: di(function(chart, d, i) {
      return chart.displayAdjacent() ? chart.adjacentWidth.call(this, d, i) : chart.layeredWidth.call(this, d, i);
    })
  };

  // Expose extensions
  d3.chart.extensions = _.extend(d3.chart.extensions || {}, {
    Series: Series,
    XY: XY,
    XYSeries: _.extend({}, Series, XY, XYSeries),
    Values: _.extend({}, XY, Values),
    ValuesSeries: _.extend({}, Series, XY, XYSeries, Values, ValuesSeries)
  });

})(d3, _, d3.chart.helpers);
