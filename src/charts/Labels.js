(function(d3, _, helpers, extensions) {
  var mixin = helpers.mixin;
  var property = helpers.property;
  var di = helpers.di;

  /**
    Labels
    Draw labels from _getLabels for each chart on container
  */
  d3.chart('Chart').extend('Labels', {
    initialize: function() {
      this.layer('Labels', this.base.append('g').classed('chart-labels', true), {
        dataBind: function(data) {
          var chart = this.chart();
          var series = this.selectAll('g')
            .data(data, chart.seriesKey);

          series.enter()
            .append('g')
            .attr('class', chart.seriesClass)
            .attr('data-chart-id', chart.seriesChartId)
            .attr('data-series-key', chart.seriesSeriesKey);
          series.exit()
            .remove();

          return series.selectAll('g')
            .data(chart.seriesLabels, chart.labelKey);
        },
        insert: function() {
          return this.chart().insertLabels(this);
        },
        events: {
          'merge:transition': function() {
            var chart = this.chart();

            // 1. Draw all labels
            chart.drawLabels(this);

            if (chart.handleCollisions()) {
              // 2. Remove overlapping labels within series
              chart.removeLabels();

              // 3. Group overlapping labels between series
              chart.groupLabels();
            }            
          },
          'exit': function() {
            this.remove();
          }
        }
      });
    },

    transform: function(data) {
      return this.extractLabels(data);
    },

    excludeFromLegend: true,
    labels: property('labels', {defaultValue: []}),
    handleCollisions: property('handleCollisions', {defaultValue: true}),
    
    format: property('format', {
      type: 'Function',
      set: function(value) {
        if (_.isString(value)) {
          return {
            override: d3.format(value)
          };
        }
      }
    }),
    position: property('position', {
      defaultValue: 'top',
      validate: function(value) {
        return _.contains(['top', 'right', 'bottom', 'left'], value);
      }
    }),
    offset: property('offset', {
      defaultValue: 0,
      get: function(offset) {
        return this.offsetByPosition(offset, this.position());
      }
    }),
    padding: property('padding', {defaultValue: 2}),
    anchor: property('anchor', {
      defaultValue: function() {
        var position = this.position();

        if (position == 'right')
          return 'start';
        else if (position == 'left')
          return 'end';
        else
          return 'middle';
      },
      validate: function(value) {
        return _.contains(['start', 'middle', 'end'], value);
      }
    }),

    labelKey: di(function(chart, d, i) {
      return d.key;
    }),
    labelX: di(function(chart, d, i) {
      var offset = _.defaults({}, chart.offset(), d.offset);
      return d.coordinates.x + offset.x;
    }),
    labelY: di(function(chart, d, i) {
      var offset = _.defaults({}, chart.offset(), d.offset);
      return d.coordinates.y + offset.y;
    }),
    labelText: di(function(chart, d, i) {
      var format = chart.format();
      return format ? format(d.text) : d.text;
    }),
    labelStyle: di(function(chart, d, i) {
      var styles = _.defaults({}, d.style, chart.options().style);
      return helpers.style(styles) || null;
    }),

    seriesKey: di(function(chart, d, i) {
      return d.key || i;
    }),
    seriesChartId: di(function(chart, d, i) {
      return d.chartId;
    }),
    seriesSeriesKey: di(function(chart, d, i) {
      return d.seriesKey;
    }),
    seriesClass: di(function(chart, d, i) {
      var seriesIndex = !_.isUndefined(d.index) ? 'chart-index-' + d.index : '';
      var seriesClass = d['class'] ? ' ' + d['class'] : '';

      return _.compact(['chart-series', seriesIndex, seriesClass]).join(' ');
    }),
    seriesLabels: di(function(chart, d, i) {
      return d.labels;
    }),
    seriesData: di(function(chart, d, i) {
      var parentData = helpers.getParentData(this);

      // Element may be two-deep (text / rect)
      if (!parentData.seriesKey && this.parentNode)
        return helpers.getParentData(this.parentNode);
      else
        return parentData;
    }),

    insertLabels: function(base) {
      var groups = base.append('g')
        .classed('chart-label', true)
        .attr('style', this.labelStyle);

      groups.append('rect')
        .classed('chart-label-bg', true);
      groups.append('text')
        .classed('chart-label-text', true);

      return groups;
    },
    drawLabels: function(selection) {
      helpers.log.time('Labels#drawLabels');
      var labels = [];
      
      selection.call(function(data) {
        _.each(data, function(series, seriesIndex) {
          labels.push([]);

          _.each(series, function(labelElement, labelIndex) {
            var label = new Label(labelElement, d3.select(labelElement).data()[0], {
              labelX: this.labelX,
              labelY: this.labelY,
              labelText: this.labelText,
              padding: this.padding(),
              anchor: this.anchor()
            });
            labels[seriesIndex].push(label);
            label.draw();
          }, this);
        }, this);
      }.bind(this));
      
      this.labels(labels);
      helpers.log.timeEnd('Labels#drawLabels');
    },
    removeLabels: function() {
      _.each(this.labels(), function(series) {
        var prev;
        _.each(series, function(label) {
          if (label.checkForOverlap(prev, {compare: 'LR'})) {
            label.remove();
          }
          else {
            prev = label;
          }
        }, this);
      }, this);
    },
    groupLabels: function(selection) {
      checkForCollisions(this.labels());

      function checkForCollisions(labels) {
        _.each(labels, function(seriesA, seriesIndex) {
          // Check through remaining series for collisions
          _.each(labels.slice(seriesIndex + 1), function(seriesB) {
            _.each(seriesB, function(labelB) {
              if (!labelB.removed) {
                _.each(seriesA, function(labelA) {
                  if (!labelA.removed && labelA.checkForOverlap(labelB)) {
                    groupLabels(labelA, labelB);
                  }
                });
              }
            });
          });
        });
      }

      function groupLabels(labelA, labelB) {
        if (labelA.group && labelB.group) {
          // Move labelB group labels into labelA group
          _.each(labelB.group.labels, function(label) {
            labelA.group.labels.push(label);
            label.group = labelA.group;
          });

          updateGroupPositions(labelA.group);
        }
        else if (labelA.group) {
          addLabelToGroup(labelB, labelA.group);
        }
        else if (labelB.group) {
          addLabelToGroup(labelA, labelB.group);
        }
        else {
          var group = {labels: []};
          addLabelToGroup(labelA, group);
          addLabelToGroup(labelB, group);
        }
      }

      function addLabelToGroup(label, group) {
        group.labels.push(label);
        label.group = group;
        label.selection.attr('data-group-index', group.index);

        updateGroupPositions(group);
      }

      function updateGroupPositions(group) {
        var positions = findLabelPositions(group.labels);
        _.each(group.labels, function(label, index) {
          label.xCenter(positions[index].xCenter).y(positions[index].y);
        });
      }

      function findLabelPositions(labels) {
        // First, sort labels by y
        var byY = _.chain(labels)
          .map(function(label, index) {
            label.index = index;
            return label;
          })
          .sortBy(function(label) {
            return label.y();
          })
          .reverse()
          .value();

        // Then, adjust for label height
        _.each(byY, function(label, index) {
          var prev = _.first(byY, index);
          var overlap;
          for (var i = prev.length - 1; i >= 0; i--) {
            if (label.checkForOverlap(prev[i])) {
              overlap = prev[i];
              break;
            }
          }

          if (overlap) {
            label.groupedY = overlap.y() - label.height();
          }
          else {
            label.groupedY = label.y();
          }
        });

        // Then, unsort by index
        byY = _.sortBy(byY, 'index');

        positions = _.map(labels, function(label, index) {
          // Remove added index
          delete label.index;

          return {
            xCenter: byY[index].xCenter(),
            y: byY[index].groupedY
          };
        });

        return positions;
      }

      function findCenter(labels) {
        var center = labels[0].xCenter();
        for (var i = 1, l = labels.length; i < l; i++) {
          center += (labels[i].xCenter() - center) / 2;
        }
        return center;
      }
    },

    extractLabels: function(data) {
      // Get labels from container
      if (this.container && _.isFunction(this.container._getLabels)) {
        return this.container._getLabels();
      }
      else {
        return [];
      }
    },

    offsetByPosition: function(offset, position) {
      if (_.isNumber(offset)) {
        offset = {
          top: {x: 0, y: -offset},
          right: {x: offset, y: 0},
          bottom: {x: 0, y: offset},
          left: {x: -offset, y: 0}
        }[position];

        if (!offset) {
          offset = {x: 0, y: 0};
        }
      }

      return offset;
    }
  });
  
  /**
    HoverLabels
    Listen to points events and draw labels
  */
  d3.chart('Labels').extend('HoverLabels', {
    initialize: function() {
      _.bindAll(this, 'onLabelsEnter', 'onLabelsMove', 'onLabelsLeave');

      this.on('attached', function() {
        this.container.on('labels:enter:mouse', this.onLabelsEnter);
        this.container.on('labels:move:mouse', this.onLabelsMove);
        this.container.on('labels:leave:mouse', this.onLabelsLeave);
      });
      this.on('detached', function() {
        this.container.off('labels:enter:mouse', this.onLabelsEnter);
        this.container.off('labels:move:mouse', this.onLabelsMove);
        this.container.off('labels:leave:mouse', this.onLabelsLeave);
      });
    },

    excludeFromLegend: true,
    draw: function() {
      // Override default draw call
      // (only want to draw on hover)
    },
    _draw: function(labels) {
      d3.chart('Chart').prototype.draw.call(this, labels);
    },

    onLabelsEnter: function(points) {
      this._draw(points);
    },
    onLabelsMove: function(points) {
      this._draw(points);
    },
    onLabelsLeave: function() {
      this._draw([]);
    },

    extractLabels: function(data) {
      // Pass through labels data
      return data;
    }
  });

  /**
    Element helper

    @param {SVG Element} element
  */
  function Element(element) {
    if (!_.isFunction(element.getBBox))
      throw new Error('Only SVG elements with getBBox() are supported by Element helper');

    this.element = element;
    this.selection = d3.select(element);
    this.refreshBounds();
    this.removed = false;

    return this;
  }
  _.extend(Element.prototype, {
    x: property('x', {
      set: function(value) {
        this.selection.attr('x', value);
      }
    }),
    y: property('y', {
      set: function(value) {
        this.selection.attr('y', value);
      }
    }),
    width: property('width', {
      set: function(value) {
        this.selection.attr('width', value);
      }
    }),
    height: property('height', {
      set: function(value) {
        this.selection.attr('height', value);
      }
    }),
    bounds: property('bounds', {
      get: function() {
        return {
          x: this.x(),
          y: this.y(),
          width: this.width(),
          height: this.height()
        };
      },
      set: function(value) {
        this.x(value.x);
        this.y(value.y);
        this.width(value.width);
        this.height(value.height);
      }
    }),

    xCenter: property('xCenter', {
      get: function() {
        return this.x() + (this.width() / 2);
      },
      set: function(value) {
        this.x(value - (this.width() / 2));
      }
    }),

    getBBox: function() {
      return this.element.getBBox();
    },
    refreshBounds: function() {
      this.bounds(this.getBBox());
      return this;
    },
    checkForOverlap: function(element, options) {
      if (!element || !element.bounds) return false;

      var a = getEdges(this.bounds());
      var b = getEdges(element.bounds());
      var containedLR = (b.left < a.left && b.right > a.right);
      var containerTB = (b.bottom < a.bottom && b.top > a.top);
      var overlapLR = (b.left >= a.left && b.left < a.right) || (b.right > a.left && b.right <= a.right) || containedLR;
      var overlapTB = (b.top >= a.top && b.top < a.bottom) || (b.bottom > a.top && b.bottom <= a.bottom) || containerTB;

      if (options && options.compare == 'LR')
        return overlapLR;
      else if (options && options.compare == 'TB')
        return overlapTB;
      else
        return overlapLR && overlapTB;

      function getEdges(bounds) {
        return {
          left: bounds.x,
          right: bounds.x + bounds.width,
          top: bounds.y,
          bottom: bounds.y + bounds.height
        };
      }
    }
  });

  /**
    Group helper

    @param {SVG Group} group
  */
  function Group(group) {
    Element.call(this, group);
    return this;
  }
  _.extend(Group.prototype, Element.prototype, {
    getBBox: function() {
      // getBBox does not account for translate(...), needed for groups
      var bbox = this.element.getBBox();
      var transform = this.selection.attr('transform');

      if (transform && _.indexOf(transform, 'translate')) {
        var parts = transform.split(')');
        var translate = {x: 0, y: 0};
        _.each(parts, function(part) {
          if (_.indexOf(part, 'translate')) {
            xy = part.replace('translate', '').replace('(', '').split(',');
            if (xy.length >= 2) {
              translate.x = +xy[0].trim();
              translate.y = +xy[1].trim();  
            }
          }
        }, this);

        bbox.x += translate.x;
        bbox.y += translate.y;
      }

      return bbox;
    },

    x: property('x', {
      set: function(value) {
        this.selection.attr('transform', helpers.transform.translate(value, this.y()));
      }
    }),
    y: property('y', {
      set: function(value) {
        this.selection.attr('transform', helpers.transform.translate(this.x(), value));
      }
    })
  });

  /**
    Label helper

    @param {SVG Element} element
  */
  function Label(element, data, options) {
    Group.call(this, element);
    this.data = data;

    this.text = new Element(this.selection.select('text').node());
    this.rect = new Element(this.selection.select('rect').node());

    this.options = _.defaults({}, options, {
      labelX: function(d, i) { return d.x; },
      labelY: function(d, i) { return d.y; },
      labelText: function(d, i) { return d.value; },
      padding: 0,
      anchor: 'middle'
    });
  }
  _.extend(Label.prototype, Group.prototype, {
    draw: function() {
      this.text
        .x(this.options.labelX)
        .y(this.options.labelY)
        .selection
          .attr('text-anchor', 'start')
          .text(this.options.labelText);

      var textBounds = this.text.refreshBounds().bounds();
      var offsets = {x: -1, y: 0, width: 3, height: 0};
      var padding = this.data.padding || this.options.padding;
      var anchor = this.data.anchor || this.options.anchor;

      // TODO Handle centering vertically and horizontally
      var bounds = {
        x: textBounds.x - (textBounds.width / 2) + offsets.x - padding,
        y: textBounds.y + offsets.y - 2*padding,
        width: textBounds.width + offsets.width + 2*padding,
        height: textBounds.height + offsets.height + 2*padding
      };

      if (anchor == 'start')
        bounds.x += bounds.width / 2;
      else if (anchor == 'end')
        bounds.x -= bounds.width / 2;

      this
        .x(bounds.x)
        .y(bounds.y);

      this.rect
        .bounds({
          x: 0,
          y: 0,
          width: bounds.width,
          height: bounds.height
        });

      this.text
        .x(this.data.padding || 0)
        .y(textBounds.height/* + (d.padding || 0) */);

      // Make sure group uses up-to-date rect and text size
      this.refreshBounds();

      return this;
    },
    remove: function() {
      this.removed = true;
      this.selection.remove();
      return this;
    }
  });

})(d3, _, d3.chart.helpers, d3.chart.extensions);
