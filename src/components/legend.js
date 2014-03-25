(function(d3, _, helpers, extensions) {
  var property = helpers.property;

  /**
    Legend component
  */
  d3.chart('Component')
    .mixin()
    .extend('Legend', {
      initialize: function() {
        this.legend = this.base.append('g')
          .classed('legend', true);

        this.layer('Legend', this.legend, {
          dataBind: function(data) {
            var chart = this.chart();
            return this.selectAll('g')
              .data(data, chart.dataKey.bind(chart));
          },
          insert: function() {
            var chart = this.chart();
            var groups = this.append('g')
              .attr('class', function(d, i) {
                return 'legend-group index-' + i;
              });

            groups.append('g')
              .attr('width', 20)
              .attr('height', 20)
              .attr('class', 'legend-swatch');
            groups.append('text')
              .attr('class', 'legend-label')
              .attr('transform', helpers.translate(25, 0));
            
            return groups;
          },
          events: {
            merge: function() {
              var chart = this.chart();

              this.select('g').each(chart.createSwatches());
              this.select('text')
                .text(chart.dataValue.bind(chart))
                .attr('alignment-baseline', 'before-edge');

              // Position groups after positioning everything inside
              this.call(helpers.stack.bind(this, {origin: 'top', padding: 5}));
            }
          }
        });
      },

      dataKey: function(d, i) {
        return d.key;
      },
      dataValue: function(d, i) {
        return d.name;
      },
      dataSwatchProperties: function(d, i) {
        // Extract swatch properties from data
        return _.defaults({}, d, {
          type: 'swatch',
          color: 'blue',
          'class': ''
        });
      },

      createSwatches: function() {
        var chart = this;
        return function(d, i) {
          chart.createSwatch(d3.select(this), d, i);
        };
      },
      createSwatch: function(selection, d, i) {
        var properties = this.dataSwatchProperties(d, i);

        // Clear existing swatch
        selection.empty();
        selection
          .classed(properties['class'], true);

        if (properties.type == 'Line' || properties.type == 'LineValues') {
          var line = selection.append('line')
            .attr('x1', 0).attr('y1', 10)
            .attr('x2', 20).attr('y2', 10)
            .attr('class', 'line');
        }
        else {
          // Simple colored swatch
          selection.append('circle')
            .attr('cx', 10)
            .attr('cy', 10)
            .attr('r', 10)
            .attr('class', 'bar'); // TODO: Temporary
        }
      },

      // Position legend: top, right, bottom, left
      legendPosition: property('legendPosition', {
        defaultValue: 'right',
        set: function(value) {
          var offset = {top: 0, right: 0, bottom: 0, left: 0};

          offset[value] = 100;
          this.chartOffset(offset);
        }
      })
    });

  d3.chart('Legend').extend('InsetLegend', {
    initialize: function() {
      this.positionLegend();
    },

    positionLegend: function() {
      if (this.legend) {
        var position = this.legendPosition();
        this.legend.attr('transform', helpers.translate(position.x, position.y));
      }
    },

    // Position legend: (x,y) of top left corner
    legendPosition: property('legendPosition', {
      defaultValue: {x: 10, y: 10},
      set: function(value, previous) {
        value = (value && _.isObject(value)) ? value : {};
        value = _.defaults(value, previous || {}, {x: 0, y: 0});

        return {
          override: value,
          after: function() {
            this.positionLegend();
          }
        };
      }
    })
  });

})(d3, _, d3.chart.helpers, d3.chart.extensions);