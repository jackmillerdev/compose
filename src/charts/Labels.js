import d3 from 'd3';
import {
  contains,
  extend,
  first,
  isFunction,
  isString,
  isNumber,
  isUndefined,
  objectEach,
  valueOrDefault
} from '../utils';
import {
  property,
  di,
  mixin,
  createHelper,
  isSeriesData,
  translate,
  alignText
} from '../helpers';
import {
  Series,
  XY,
  Hover,
  Transition,
  StandardLayer
} from '../mixins';
import Chart from '../Chart';

/**
  Standalone or "embeddable" labels (uses `mixins.Labels` and `attachLabels` to embed in chart)

  ### Extending

  To extend the `Labels` chart, the following methods are available:

  - `insertLabels`
  - `mergeLabels`
  - `layoutLabels`
  - `transitionLabels`
  - `onDataBind`
  - `onInsert`
  - `onEnter`
  - `onEnterTransition`
  - `onUpdate`
  - `onUpdateTransition`
  - `onMerge`
  - `onMergeTransition`
  - `onExit`
  - `onExitTransition`

  View the `Labels.js` source for the default implementation and more information on these methods.

  @example
  ```js
  var chart = d3.select('#chart').chart('Compose', function(data) {
    return {
      charts: {
        input: {
          type: 'Lines',
          data: data.input,
          // xScale, yScale, other properties...

          // Show labels with default properties
          labels: true
        },
        output: {
          type: 'Bars',
          data: data.output,
          // xScale, yScale, other properties...

          // Pass options to labels
          labels: {
            offset: 2,
            position: 'top',
            style: {
              'font-size': '14px'
            },
            format: d3.format(',0d')
          }
        },
        labels: {
          type: 'Labels',
          data: data.labels,

          // xScale, yScale, other properties...
        }
      }
    };
  });

  chart.draw({
    input: [1, 2, 3],
    output: [10, 20, 30],
    labels: [
      {x: 0, y: 0},
      {x: 0, y: 30, label: 'Override (y by default)'},
      {x: 2, y: 0},
      {x: 2, y: 30}
    ]
  });
  ```
  @class Labels
  @extends Chart, Series, XY, Hover, Transition, StandardLayer
*/
var Mixed = mixin(Chart, Series, XY, Hover, Transition, StandardLayer);
var Labels = Mixed.extend({
  initialize: function(options) {
    Mixed.prototype.initialize.call(this, options);

    // Proxy attach to parent for hover
    var parent = this.options().parent;
    if (parent) {
      this.parent = parent;
      parent.on('attach', function() {
        this.container = parent.container;
        this.trigger('attach');
      }.bind(this));
    }

    // Use StandardLayer for extensibility
    this.standardSeriesLayer('Labels', this.base);
  },

  transform: function(data) {
    data = Mixed.prototype.transform.call(this, data);

    if (!isSeriesData(data))
      data = [{key: 'labels', name: 'Labels', values: data}];

    // TODO Use ticks / domain from xScale
    // ticks = scale.ticks ? scale.ticks.apply(scale, [10]) : scale.domain()
    return data;
  },

  /**
    Formatting function or string (string is passed to `d3.format`) for label values

    @property format
    @type String|Function
  */
  format: property({
    set: function(value) {
      if (isString(value)) {
        return {
          override: d3.format(value)
        };
      }
    }
  }),

  /**
    Label position relative to data point
    (top, right, bottom, or left)

    Additionally, `(a)|(b)` can be used to set position to `a` if y-value >= 0 and `b` otherwise,
    where `a` and `b` are `top`, `right`, `bottom`, or `left`

    For more advanced positioning, a "di" function can be specified to set position per label

    @example
    ```js
    labels.position('top'); // top for all values
    labels.position('top|bottom'); // top for y-value >= 0, bottom otherwise
    labels.position(function(d, i) { return d.x >= 0 ? 'right' : 'left'; });
    ```
    @property position
    @type String|Function
    @default top|bottom
  */
  position: property({
    default_value: 'top|bottom',
    get: function(value) {
      if (isString(value) && value.indexOf('|') >= 0) {
        var chart = this;
        var parts = value.split('|');
        return function(d, i, j) {
          var y_value = chart.yValue.call(this, d, i, j);
          return y_value >= 0 ? parts[0] : parts[1];
        };
      }
      else {
        return value;
      }
    }
  }),

  /**
    Offset between data point and label
    (if `Number` is given, offset is set based on position)

    @property offset
    @type Number|Object
    @default 0
  */
  offset: property({
    default_value: 0
  }),

  /**
    Padding between text and label background

    @property padding
    @type Number
    @default 1
  */
  padding: property({default_value: 1}),

  /**
    Define text anchor (start, middle, or end)

    (set by default based on label position)

    @property anchor
    @type String
    @default middle
  */
  anchor: property({
    validate: function(value) {
      return contains(['start', 'middle', 'end'], value);
    }
  }),

  /**
    Define text-alignment (top, middle, or bottom)

    (set by default based on label position)

    @property alignment
    @type String
    @default middle
  */
  alignment: property({
    validate: function(value) {
      return contains(['top', 'middle', 'bottom'], value);
    }
  }),

  /**
    Get label text for data-point (uses "label" property or y-value)

    @method labelText
    @param {Any} d
    @param {Number} i
    @return {String}
  */
  labelText: di(function(chart, d, i) {
    var value = valueOrDefault(d.label, valueOrDefault(d.__original_y, chart.yValue.call(this, d, i)));
    var format = chart.format();

    return format ? format(value, d) : value;
  }),

  /**
    Get class for label group

    @method labelClass
    @param {Any} d
    @param {Number} i
    @return {String}
  */
  labelClass: di(function(chart, d) {
    return 'chart-label' + (d['class'] ? ' ' + d['class'] : '');
  }),

  onDataBind: function onDataBind(selection, data) {
    return selection.selectAll('g')
      .data(data, this.key);
  },
  onInsert: function onInsert(selection) {
    return selection.append('g')
      .call(this.insertLabels);
  },
  onMerge: function onMerge(selection) {
    selection.attr('class', this.labelClass);

    this.mergeLabels(selection);
    this.layoutLabels(selection);
  },
  onMergeTransition: function onMergeTransition(selection) {
    // Transition labels into position
    this.setupTransition(selection);
    this.transitionLabels(selection);
  },

  // (Override for custom labels)
  insertLabels: function(selection) {
    selection.append('rect')
      .attr('class', 'chart-label-bg');
    selection.append('text')
      .attr('class', 'chart-label-text');
  },

  // (Override for custom labels)
  mergeLabels: function(selection) {
    selection.selectAll('text')
      .text(this.labelText);
  },

  // (Override for custom labels)
  layoutLabels: function(selection) {
    // Calculate layout
    var chart = this;
    var labels = [];
    var position = chart.position();
    var values = {
      offset: chart.offset(),
      padding: chart.padding(),
      anchor: chart.anchor(),
      alignment: chart.alignment()
    };

    var options;
    if (isString(position))
      options = getOptions();

    selection.each(function(d, i, j) {
      if (!labels[j])
        labels[j] = [];

      // Store values for label and calculate layout
      var label = chart._prepareLabel(chart, this, d, i, j);
      labels[j].push(label);

      var label_options = options || getOptions.call(chart, this, d, i, j);

      chart._calculateLayout(chart, label_options, label);
    });

    // Collision detection
    this._handleCollisions(chart, labels);

    // Layout labels
    labels.forEach(function(series) {
      series.forEach(function(label) {
        this._setLayout(chart, label);
      }, this);
    }, this);

    function getOptions(element, d, i, j) {
      var label_options = extend({}, values);
      var label_position;

      if (isFunction(position))
        label_position = position.call(element, d, i, j);
      else
        label_position = position;

      if (isNumber(label_options.offset)) {
        var offset = {
          top: {x: 0, y: -label_options.offset},
          right: {x: label_options.offset, y: 0},
          bottom: {x: 0, y: label_options.offset},
          left: {x: -label_options.offset, y: 0}
        }[label_position];

        if (!offset)
          offset = {x: 0, y: 0};

        label_options.offset = offset;
      }
      if (isUndefined(label_options.anchor)) {
        label_options.anchor = {
          top: 'middle',
          right: 'start',
          bottom: 'middle',
          left: 'end'
        }[label_position];
      }
      if (isUndefined(label_options.alignment)) {
        label_options.alignment = {
          top: 'bottom',
          right: 'middle',
          bottom: 'top',
          left: 'middle'
        }[label_position];
      }
      return label_options;
    }
  },

  // (Override for custom labels)
  transitionLabels: function(selection) {
    selection.attr('opacity', 1);
  },

  //
  // Internal
  //

  _prepareLabel: function(chart, element, d, i) {
    var selection = d3.select(element);
    var text = selection.select('text');
    var bg = selection.select('rect');

    return {
      x: chart.x.call(element, d, i),
      y: chart.y.call(element, d, i),
      element: element,
      selection: selection,
      text: {
        element: text.node(),
        selection: text
      },
      bg: {
        element: bg.node(),
        selection: bg
      }
    };
  },

  _calculateLayout: function(chart, options, label) {
    var text_bounds = label.text.element.getBBox();

    // Need to adjust text for line-height
    var text_y_adjustment = alignText(label.text.element);

    // Position background
    var layout = label.bg.layout = {
      x: options.offset.x,
      y: options.offset.y,
      width: text_bounds.width + (2 * options.padding),
      height: text_bounds.height + (2 * options.padding)
    };

    // Set width / height of label
    label.width = layout.width;
    label.height = layout.height;

    if (options.anchor == 'end')
      label.x -= layout.width;
    else if (options.anchor == 'middle')
      label.x -= (layout.width / 2);

    if (options.alignment == 'bottom')
      label.y -= layout.height;
    else if (options.alignment == 'middle')
      label.y -= (layout.height / 2);

    // Center text in background
    label.text.layout = {
      x: layout.x + (layout.width / 2) - (text_bounds.width / 2),
      y: layout.y + (layout.height / 2) - (text_bounds.height / 2) + text_y_adjustment
    };
  },

  _handleCollisions: function(chart, labels) {
    labels.forEach(function(series, seriesIndex) {
      // Check through remaining series for collisions
      labels.slice(seriesIndex + 1).forEach(function(compareSeries) {
        compareSeries.forEach(function(compareLabel) {
          series.forEach(function(label) {
            var overlapping = checkForOverlap(label, compareLabel);
            var not_grouped = notGrouped(label, compareLabel);

            if (overlapping && not_grouped)
              groupLabels(label, compareLabel);
          });
        });
      });
    });

    function checkForOverlap(labelA, labelB) {
      var a = getEdges(labelA);
      var b = getEdges(labelB);

      var contained_LR = (b.left < a.left && b.right > a.right);
      var contained_TB = (b.bottom < a.bottom && b.top > a.top);
      var overlap_LR = (b.left >= a.left && b.left < a.right) || (b.right > a.left && b.right <= a.right) || contained_LR;
      var overlap_TB = (b.top >= a.top && b.top < a.bottom) || (b.bottom > a.top && b.bottom <= a.bottom) || contained_TB;

      return overlap_LR && overlap_TB;

      function getEdges(label) {
        return {
          left: label.x,
          right: label.x + label.width,
          top: label.y,
          bottom: label.y + label.height
        };
      }
    }

    function notGrouped(labelA, labelB) {
      return !groupIncludes(labelA.group, labelB) && !groupIncludes(labelB.group, labelA);
    }

    function groupIncludes(group, label) {
      return group && group.labels.indexOf(label) > -1;
    }

    function groupLabels(labelA, labelB) {
      if (labelA.group && labelB.group) {
        // Move labelB group labels into labelA group
        objectEach(labelB.group.labels, function(label) {
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
      label.originalY = label.y;

      updateGroupPositions(group);
    }

    function updateGroupPositions(group) {
      function reset(label) {
        // Reset to original y
        label.y = label.originalY;
        return label;
      }
      function sortY(a, b) {
        if (a.y < b.y)
          return -1;
        else if (a.y > b.y)
          return 1;
        else
          return 0;
      }

      var byY = group.labels.map(reset).sort(sortY).reverse();

      byY.forEach(function(label, index) {
        var prev = first(byY, index);
        var overlap;

        for (var i = prev.length - 1; i >= 0; i--) {
          if (checkForOverlap(label, prev[i])) {
            overlap = prev[i];
            break;
          }
        }

        if (overlap) {
          // Design goal is to maintain y-ordering:
          // even if overlap is not top-most element,
          // still need to position above top-most
          label.y = prev[prev.length - 1].y - label.height;
        }
          
      });
    }
  },

  _setLayout: function(chart, label) {
    label.bg.selection
      .attr('transform', translate(label.bg.layout.x, label.bg.layout.y))
      .attr('width', label.bg.layout.width)
      .attr('height', label.bg.layout.height);

    label.text.selection
      .attr('transform', translate(label.text.layout.x, label.text.layout.y));

    // Position label and set opacity to fade-in
    label.selection
      .attr('transform', translate(label.x, label.y))
      .attr('opacity', 0);
  }
}, {
  z_index: 150
});

var labels = createHelper('Labels');

export {
  Labels as default,
  labels
};
