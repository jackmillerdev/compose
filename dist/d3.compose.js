/*!
 * d3.compose - Compose complex, data-driven visualizations from reusable charts and components with d3
 * v0.15.10 - https://github.com/CSNW/d3.compose - license: MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3')) :
  typeof define === 'function' && define.amd ? define(['d3'], factory) :
  global.d3c = factory(global.d3);
}(this, function (d3) { 'use strict';

  d3 = 'default' in d3 ? d3['default'] : d3;

  // Many utils inlined from Underscore.js
  // (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors

  var slice = Array.prototype.slice;
  var toString = Object.prototype.toString;

  function _extend(target, extensions, undefined_only) {
    for (var i = 0, length = extensions.length; i < length; i++) {
      for (var key in extensions[i]) {
        if (!undefined_only || target[key] === void 0)
          target[key] = extensions[i][key];
      }
    }

    return target;
  }

  function contains(arr, item) {
    return arr.indexOf(item) >= 0;
  }

  function compact(arr) {
    return arr.filter(function(item) {
      return item;
    });
  }

  function difference(a, b) {
    return a.filter(function(value) {
      return b.indexOf(value) < 0;
    });
  }

  function defaults(target) {
    return _extend(target, slice.call(arguments, 1), true);
  }

  function extend(target) {
    return _extend(target, slice.call(arguments, 1));
  }

  function flatten(arr) {
    // Assumes all items in arr are arrays and only flattens one level
    return arr.reduce(function(memo, item) {
      return memo.concat(item);
    }, []);
  }

  function find(arr, fn, context) {
    if (!arr) return;
    for (var i = 0, length = arr.length; i < length; i++) {
      if (fn.call(context, arr[i], i, arr))
        return arr[i];
    }
  }

  function first(arr, n) {
    if (arr == null) return void 0;
    if (n == null) return arr[0];
    return Array.prototype.slice.call(arr, 0, n);
  }

  function isBoolean(obj) {
    return obj === true || obj === false;
  }
  function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  }
  function isNumber(obj) {
    return toString.call(obj) === '[object Number]';
  }
  function isString(obj) {
    return toString.call(obj) === '[object String]';
  }
  function isUndefined(obj) {
    return obj === void 0;
  }

  var isFunction = function(obj) {
    return toString.call(obj) === '[object Function]';
  };
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  function objectEach(obj, fn, context) {
    if (!obj) return;
    var keys = Object.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      fn.call(context, obj[keys[i]], keys[i], obj);
    }
  }

  function objectFind(obj, fn, context) {
    if (!obj) return;
    var keys = Object.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      if (fn.call(context, obj[keys[i]], keys[i], obj))
        return obj[keys[i]];
    }
  }

  function pluck(objs, key) {
    if (!objs) return [];
    return objs.map(function(obj) {
      return obj[key];
    });
  }

  function uniq(arr) {
    var result = [];
    for (var i = 0, length = arr.length; i < length; i++) {
      if (result.indexOf(arr[i]) < 0)
        result.push(arr[i]);
    }
    return result;
  }

  function inherits(Child, Parent) {
    Child.prototype = Object.create(Parent.prototype, {
      constructor: {
        value: Child,
        enumerable: false,
        writeable: true,
        configurable: true
      }
    });

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(Child, Parent);
    }
    else {
      Child.__proto__ = Parent; //eslint-disable-line no-proto

      // __proto__ isn't supported in IE,
      // use one-time copy of static properties to approximate
      defaults(Child, Parent);
    }
  }

  // If value isn't `undefined`, return `value`, otherwise use `default_value`
  //
  // @method valueOrDefault
  // @param {Any} [value]
  // @param {Any} default_value
  // @return {Any}
  function valueOrDefault(value, default_value) {
    return !isUndefined(value) ? value : default_value;
  }

  var utils = {
    slice: slice,
    toString: toString,
    contains: contains,
    compact: compact,
    difference: difference,
    defaults: defaults,
    extend: extend,
    flatten: flatten,
    find: find,
    first: first,
    isBoolean: isBoolean,
    isFunction: isFunction,
    isObject: isObject,
    isNumber: isNumber,
    isString: isString,
    isUndefined: isUndefined,
    objectEach: objectEach,
    objectFind: objectFind,
    pluck: pluck,
    uniq: uniq,
    inherits: inherits,
    valueOrDefault: valueOrDefault
  };

  var unique_index = 0;

  /**
    Helper for creating properties for charts/components

    @example
    ```javascript
    var Custom = d3.chart('Chart').extend('Custom', {
      // Create property that's stored internally as 'simple'
      simple: property()
    });
    var custom; // = new Custom(...);

    // set
    custom.simple('Howdy');

    // get
    console.log(custom.simple()); // -> 'Howdy'

    // Advanced
    // --------
    // Default values:
    Custom.prototype.message = property({
      default_value: 'Howdy!'
    });

    console.log(custom.message()); // -> 'Howdy!'
    custom.message('Goodbye');
    console.log(custom.message()); // -> 'Goodbye'

    // Set to undefined to reset to default value
    custom.message(undefined);
    console.log(custom.message()); // -> 'Howdy!'

    // Computed default value:
    Custom.property.computed = property({
      default_value: function() {
        // "this" = Custom instance
        return this.message();
      }
    });

    // Function default value:
    // For function default_values, wrap in function to differentiate from computed
    Custom.property.fn = property({
      default_value: function() {
        return function defaultFn() {};
      }
      // The following would be incorrectly evaluated
      // default_value: function defaultFn() {}
    })

    // Custom getter:
    Custom.prototype.exclaimed = property({
      get: function(value) {
        // Value is the underlying set value
        return value + '!';
      }
    });

    custom.exclaimed('Howdy');
    console.log(custom.exclaimed()); // -> 'Howdy!'

    // Custom setter:
    Custom.prototype.feeling = property({
      set: function(value, previous) {
        if (value == 'Hate') {
          // To override value, return Object with override specified
          return {
            override: 'Love',

            // To do something after override, use after callback
            after: function() {
              console.log('After: ' + this.feeling()); // -> 'After: Love'
            }
          };
        }
      }

      custom.feeling('Hate'); // -> 'After: Love'
      console.log(custom.feeling()); // -> 'Love'
    });
    ```
    @method property
    @for helpers
    @param {Object} [options]
    @param {Any} [options.default_value] default value for property (when set value is `undefined`). If default value is a function, wrap in another function as default_value is evaluated by default.
    @param {Function} [options.get] `function(value) {return ...}` getter, where `value` is the stored value and return desired value
    @param {Function} [options.set] `function(value, previous) {return {override, after}}`. Return `override` to override stored value and `after()` to run after set
    @param {Object} [options.context=this] context to evaluate get/set/after functions
    @return {Function} `()`: get, `(value)`: set
  */
  function property(options) {
    // DEPRECATED: name as first argument
    if (arguments.length == 2) {
      if (typeof console != 'undefined' && console.warn)
        console.warn('DEPRECATED - name argument for property is no longer supported will be removed in the next version of d3.compose');
      options = arguments[1];
    }

    options = options || {};
    var id = 'property_' + unique_index++;

    var property = function(value) {//eslint-disable-line no-shadow
      var properties = this.__properties = this.__properties || {};
      var context = valueOrDefault(property.context, this);

      if (arguments.length)
        return set.call(this);
      else
        return get.call(this);

      function get() {
        value = properties[id];

        if (isUndefined(value)) {
          // Use default value and unwrap if it's a function
          value = property.default_value;
          if (isFunction(value))
            value = value.call(context);
        }

        return isFunction(options.get) ? options.get.call(context, value) : value;
      }

      function set() {
        // Validate
        if (isFunction(options.validate) && !isUndefined(value) && !options.validate.call(context, value))
          throw new Error('Invalid value for property: ' + JSON.stringify(value));

        var previous = properties[id];
        properties[id] = value;

        if (isFunction(options.set) && !isUndefined(value)) {
          var response = options.set.call(context, value, previous);

          if (response && 'override' in response)
            properties[id] = response.override;
          if (response && isFunction(response.after))
            response.after.call(context, properties[id]);
        }

        return this;
      }
    };

    // For checking if function is a property
    property.is_property = true;
    property.id = id;
    property.set_from_options = valueOrDefault(options.set_from_options, true);
    property.default_value = options.default_value;
    property.context = options.context;
    property.options = options;

    return property;
  }

  /**
    Combine mixins with Parent super class for extension

    @example
    ```js
    var a = {transform: function() {}, a: 1};
    var b = {initialize: function() {}, b: 2};
    var c = {c: 3};

    var Custom = mixin(Chart, a, b, c).extend({
      initialize: function(options) {
        this._super.initialize.call(this, options);
        // d
      },
      transform: function(data) {
        data = this._super.transform.call(this, data);
        // d
      }
    });

    // initialize: Chart, b, d
    // transform: Chart, a, d
    ```
    @method mixin
    @for helpers
    @param {Function} Parent
    @param {...Object} ...mixins
    @return {Function}
  */
  function mixin(Parent/*, ...mixins*/) {
    var mixins = slice.call(arguments, 1);
    var initializes = [];
    var transforms = [];
    var mixed = {};

    mixins.forEach(function(mix) {
      objectEach(mix, function(value, key) {
        if (key == 'initialize')
          initializes.push(value);
        else if (key == 'transform')
          transforms.push(value);
        else
          mixed[key] = value;
      });
    });

    if (initializes.length) {
      mixed.initialize = function initialize() {
        var args = slice.call(arguments);
        Parent.prototype.initialize.apply(this, args);
        initializes.forEach(function(init) {
          init.apply(this, args);
        }, this);
      };
    }

    if (transforms.length) {
      mixed.transform = function transform(data) {
        data = Parent.prototype.transform.call(this, data);
        return transforms.reduce(function(memo, trans) {
          return trans.call(this, memo);
        }.bind(this), data);
      };
    }

    return Parent.extend(mixed);
  }

  /**
    Stack given array of elements vertically or horizontally

    @example
    ```js
    // Stack all text elements vertically, from the top, with 0px padding
    d3.selectAll('text').call(helpers.stack())

    // Stack all text elements horizontally, from the right, with 5px padding
    d3.selectAll('text').call(helpers.stack({
      direction: 'horizontal',
      origin: 'right',
      padding: 5
    }));
    ```
    @method stack
    @for helpers
    @param {Object} [options]
    @param {String} [options.direction=vertical] `"vertical"` or `"horizontal"`
    @param {String} [options.origin] `"top"`, `"right"`, `"bottom"`, or `"left"` (by default, `"top"` for `"vertical"` and `"left"` for `"horizontal"`)
    @param {Number} [options.padding=0] padding (in px) between elements
    @param {Number} [options.min_height=0] minimum spacing height (for vertical stacking)
    @param {Number} [options.min_width=0]  minimum spacing width (for horizontal stacking)
    @return {Function}
  */
  function stack(options) {
    options = extend({
      direction: 'vertical',
      origin: 'top',
      padding: 0,
      min_height: 0,
      min_width: 0
    }, options);

    // Ensure valid origin based on direction
    if (options.direction == 'horizontal' && !(options.origin == 'left' || options.origin == 'right'))
      options.origin = 'left';
    else if (options.direction == 'vertical' && !(options.origin == 'top' || options.origin == 'bottom'))
      options.origin = 'top';

    function padding(i) {
      return i > 0 && options.padding ? options.padding : 0;
    }

    return function(elements) {
      if (elements && elements.attr) {
        var previous = 0;

        elements.attr('transform', function(d, i) {
          var element_dimensions = this.getBBox();
          var spacing_width = d3.max([element_dimensions.width, options.min_width]);
          var spacing_height = d3.max([element_dimensions.height, options.min_height]);
          var x = 0;
          var y = 0;
          var next_position;

          if (options.direction == 'horizontal') {
            next_position = previous + spacing_width + padding(i);

            if (options.origin == 'left')
              x = previous + padding(i);
            else
              x = next_position;

            previous = next_position;
          }
          else {
            next_position = previous + spacing_height + padding(i);

            if (options.origin == 'top')
              y = previous + padding(i);
            else
              y = next_position;

            previous = next_position;
          }

          return translate(x, y);
        });
      }
    };
  }

  /**
    Create scale from options

    @example
    ```javascript
    // Simple type, range, and domain
    var scale = createScale({
      type: 'linear',
      domain: [0, 100],
      range: [0, 500]
    });

    // Calculate domain for data
    var scale = createScale({
      type: 'log',
      data: [{y: 1}, {y: 100}, {y: 2000}, {y: 5000}],
      key: 'y'
    });

    // Scale is passed through
    var original = d3.scale.linear();
    var scale = createScale(original);
    scale === original;

    // Set other properties by passing in "arguments" array
    var scale = createScale({
      type: 'ordinal',
      domain: ['a', 'b', 'c', 'd', 'e'],
      rangeRoundBands: [[0, 100], 0.1, 0.05] // -> rangeRoundBands([0, 100], 0.1, 0.05)
    });

    // Use ordinal + adjacent for bar charts
    var scale = createScale({
      type: 'ordinal',
      adjacent: true,
      domain: ['a', 'b', 'c'],
      series: 2 // Series count is required for adjacent if data isn't given
    })
    ```
    @method createScale
    @for helpers
    @param {Object|Function} options (passing in `Function` returns original function with no changes)
    @param {String} [options.type='linear'] Any available `d3.scale` (`"linear"`, `"ordinal"`, `"log"`, etc.) or `"time"`
    @param {Array} [options.domain] Domain for scale
    @param {Array} [options.range] Range for scale
    @param {Any} [options.data] Used to dynamically set domain (with given value or key)
    @param {Function} [options.value] "di"-function for getting value for data
    @param {String} [options.key] Data key to extract value
    @param {Boolean} [options.centered] For "ordinal" scales, use centered x-values
    @param {Boolean} [options.adjacent] For "ordinal" + centered, set x-values for different series next to each other

    - Requires series-index as second argument to scale, otherwise centered x-value is used
    - Requires "data" or "series" options to determine number of series
    @param {Number} [options.series] Used with "adjacent" if no "data" is given to set series count
    @param {Number} [options.padding=0.1] For "ordinal" scales, set padding between different x-values
    @param {Array...} [options....] Set any other scale properties with array of arguments to pass to property
    @return {d3.Scale}
  */
  function createScale(options) {
    options = options || {};

    // If function, scale was passed in as options
    if (isFunction(options))
      return options;

    // Create scale (using d3.time.scale() if type is 'time')
    var scale;
    if (options.type == 'time')
      scale = d3.time.scale();
    else if (d3.scale[options.type])
      scale = d3.scale[options.type]();
    else
      scale = d3.scale.linear();

    objectEach(options, function(value, key) {
      if (scale[key]) {
        // If option is standard property (domain or range), pass in directly
        // otherwise, pass in as arguments
        // (don't pass through internal options)
        if (key == 'range' || key == 'domain')
          scale[key](value);
        else if (!contains(['type', 'data', 'value', 'key', 'centered', 'adjacent', 'series', 'padding'], key))
          scale[key].apply(scale, value);
      }
    });

    if (!options.domain && options.data && (options.key || options.value))
      scale = setDomain(scale, options);

    // Add centered and adjacent extensions to ordinal
    // (centered by default for ordinal)
    var centered = options.centered || (options.type == 'ordinal' && options.centered == null);
    if (options.type == 'ordinal' && (centered || options.adjacent))
      scale = addCentered(scale, options);

    // Add padding extension to ordinal
    if (options.type == 'ordinal' && (options.padding != null || centered || options.adjacent))
      scale = addPadding(scale, options);

    return scale;
  }

  function setDomain(scale, options) {
    // Use value "di" or create for key
    var getValue = options.value || function(d) {
      return d[options.key];
    };

    // Enforce series data
    var data = options.data;
    if (!isSeriesData(data))
      data = [{values: data}];

    var domain;
    if (options.type == 'ordinal') {
      // Domain for ordinal is array of unique values
      domain = uniq(flatten(data.map(function(series) {
        if (series && series.values)
          return series.values.map(getValue);
      })));
    }
    else {
      var min_value = min(data, getValue);

      domain = [
        min_value < 0 ? min_value : 0,
        max(data, getValue)
      ];
    }

    scale.domain(domain);
    return scale;
  }

  function addCentered(original, options) {
    // Get series count for adjacent
    var series_count = options.series || (!isSeriesData(options.data) ? 1 : options.data.length);

    // TODO Look into removing closure
    var scale = (function(original, options, series_count) {//eslint-disable-line no-shadow
      var context = function(value, series_index) {
        var width = context.width();

        if (!options.adjacent)
          series_index = 0;

        return original(value) + (0.5 * width) + (width * (series_index || 0));
      };
      extend(context, original, {
        width: function() {
          var range_band = context.rangeBand && context.rangeBand();
          var width = isFinite(range_band) ? range_band : 0;

          if (options.adjacent)
            width = width / series_count;

          return width;
        }
      });

      // TODO test copy() behavior

      return context;
    })(original, options, series_count);

    return scale;
  }

  function addPadding(scale, options) {
    var padding = options.padding != null ? options.padding : 0.1;

    var original_range = scale.range;
    scale.range = function(range) {
      if (!arguments.length) return original_range();

      scale.rangeBands(
        range,
        padding,
        padding / 2
      );
    };

    if (options.range)
      scale.range(options.range);

    // TODO test copy() behavior
    return scale;
  }

  /**
    Helper for robustly determining width/height of given selector.
    Checks dimensions from css, attributes, and bounding box.

    @method dimensions
    @for helpers
    @param {d3.Selection} selection
    @return {Object} `{width, height}`
  */
  function dimensions(selection) {
    // 1. Get width/height set via css (only valid for svg and some other elements)
    var client = clientDimensions(selection);

    if (client.width && client.height)
      return client;

    // 2. Get width/height set via attribute
    var attr = attrDimensions(selection);

    if (isSVG(selection)) {
      return {
        width: client.width != null ? client.width : attr.width || 0,
        height: client.height != null ? client.height : attr.height || 0
      };
    }
    else {
      var bbox = bboxDimensions(selection);

      // Size set by css -> client (only valid for svg and some other elements)
      // Size set by svg -> attr override or bounding_box
      // -> Take maximum
      return {
        width: d3.max([client.width, attr.width || bbox.width]) || 0,
        height: d3.max([client.height, attr.height || bbox.height]) || 0
      };
    }
  }

  function clientDimensions(selection) {
    var element = selection.node();

    var client_dimensions = {
      width: element && element.clientWidth,
      height: element && element.clientHeight
    };

    // Issue: Firefox does not correctly calculate clientWidth/clientHeight for svg
    //        calculate from css
    //        http://stackoverflow.com/questions/13122790/how-to-get-svg-element-dimensions-in-firefox
    //        Note: This makes assumptions about the box model in use and that width/height are not percent values
    if (isSVG(selection) && (!element.clientWidth || !element.clientHeight) && typeof window !== 'undefined' && window.getComputedStyle) {
      var styles = window.getComputedStyle(element);
      client_dimensions.height = parseFloat(styles.height) - parseFloat(styles.borderTopWidth) - parseFloat(styles.borderBottomWidth);
      client_dimensions.width = parseFloat(styles.width) - parseFloat(styles.borderLeftWidth) - parseFloat(styles.borderRightWidth);
    }

    return client_dimensions;
  }

  function attrDimensions(selection) {
    return {
      width: selection && selection.attr && parseFloat(selection.attr('width')),
      height: selection && selection.attr && parseFloat(selection.attr('height'))
    };
  }

  function bboxDimensions(selection) {
    var element = selection.node();
    var bbox;
    try {
      bbox = element && typeof element.getBBox == 'function' && element.getBBox();
    }
    catch(ex) {
      // Firefox throws error when calling getBBox when svg hasn't been displayed
      // Ignore error and set to empty
      bbox = {width: 0, height: 0};
    }

    return bbox;
  }

  function isSVG(selection) {
    return selection.node().nodeName == 'svg';
  }

  /**
    Translate by (x, y) distance

    @example
    ```javascript
    translate(10, 15) == 'translate(10, 15)'
    translate({x: 10, y: 15}) == 'translate(10, 15)'
    ```
    @method translate
    @param {Number|Object} [x] value or `{x, y}`
    @param {Number} [y]
    @return {String}
  */
  function translate(x, y) {
    if (isObject(x)) {
      y = x.y;
      x = x.x;
    }

    return 'translate(' + (x || 0) + ', ' + (y || 0) + ')';
  }

  /**
    Rotate by degrees, with optional center

    @method rotate
    @param {Number} degrees
    @param {Object} [center = {x: 0, y: 0}]
    @return {String}
  */
  function rotate(degrees, center) {
    var rotation = 'rotate(' + (degrees || 0);
    if (center)
      rotation += ' ' + (center.x || 0) + ',' + (center.y || 0);
    rotation += ')';

    return rotation;
  }

  /**
    Find vertical offset to vertically align text
    (needed due to lack of `alignment-baseline` support in Firefox)

    @example
    ```js
    var label = d3.select('text');

    // Place label vertically so that origin is top-left
    var offset = alignText(label);
    label.attr('transform', translate(0, offset));

    // Center label for line-height of 20px
    var offset = alignText(label, 20);
    label.attr('transform', translate(0, offset));
    ```
    @method alignText
    @param {element} element
    @param {Number} [line_height]
    @return {Number} offset
  */
  function alignText(element, line_height) {
    var offset = 0;
    try {
      var height = element.getBBox().height;

      var element_style = window.getComputedStyle(element);
      var css_font_size = parseFloat(element_style['font-size']);
      var css_line_height = parseFloat(element_style['line-height']);

      // If line-height: normal, use estimate 1.14em
      // (actual line-height depends on browser and font)
      if (isNaN(css_line_height))
        css_line_height = 1.15 * css_font_size;

      var css_adjustment = -(css_line_height - css_font_size) / 2;

      // Add additional line-height, if specified
      var height_adjustment = 0;
      if (line_height && line_height > 0)
        height_adjustment = (line_height - height) / 2;

      offset = height + (css_adjustment || 0) + (height_adjustment || 0);
    }
    catch (ex) {
      // Errors can occur from getBBox and getComputedStyle
      // No useful information for offset, do nothing
    }

    return offset;
  }

  /**
    Determine if given data is likely series data

    @method isSeriesData
    @param {Array} data
    @return {Boolean}
  */
  function isSeriesData(data) {
    var first_item = first(data);
    return first_item && isObject(first_item) && Array.isArray(first_item.values);
  }

  /**
    Get max for array/series by value di

    @example
    ```js
    var data = [
      {values: [{y: 1}, {y: 2}, {y: 3}]},
      {values: [{y: 4}, {y: 2}, {y: 0}]}
    ];
    max(data, function(d, i) { return d.y; }); // -> 4
    ```
    @method max
    @param {Array} data
    @param {Function} getValue di function that returns value for given (d, i)
    @return {Number}
  */
  function max(data, getValue) {
    var getMax = function(series_data) {
      return series_data && d3.extent(series_data, getValue)[1];
    };

    if (isSeriesData(data)) {
      return data.reduce(function(memo, series) {
        if (series && Array.isArray(series.values)) {
          var series_max = getMax(series.values);
          return series_max > memo ? series_max : memo;
        }
        else {
          return memo;
        }
      }, -Infinity);
    }
    else {
      return getMax(data);
    }
  }

  /**
    Get min for array/series by value di

    @example
    ```js
    var data = [
      {values: [{x: 1}, {x: 2}, {x: 3}]},
      {values: [{x: 4}, {x: 2}, {x: 0}]}
    ];
    min(data, function(d, i) { return d.x; }); // -> 0
    ```
    @method min
    @param {Array} data
    @param {Function} getValue di function that returns value for given (d, i)
    @return {Number}
  */
  function min(data, getValue) {
    var getMin = function(series_data) {
      return series_data && d3.extent(series_data, getValue)[0];
    };

    if (isSeriesData(data)) {
      return data.reduce(function(memo, series) {
        if (series && Array.isArray(series.values)) {
          var series_min = getMin(series.values);
          return series_min < memo ? series_min : memo;
        }
        else {
          return memo;
        }
      }, Infinity);
    }
    else {
      return getMin(data);
    }
  }

  // TODO Look into converting to d3's internal style handling
  // Convert key,values to style string
  //
  // @example
  // ```js
  // style({color: 'red', display: 'block'}) -> color: red; display: block;
  // ```
  // @method style
  // @param {Object} styles
  // @return {String}
  function style(styles) {
    if (!styles)
      return '';

    var keyValues = [];
    objectEach(styles, function(value, key) {
      keyValues.push(key + ': ' + value);
    });
    styles = keyValues.join('; ');

    return styles ? styles + ';' : '';
  }

  /**
    Get formatted margins for varying input

    @method getMargins
    @example
    ```js
    getMargins(4);
    // -> {top: 4, right: 4, bottom: 4, left: 4}

    getMargins({top: 20}, {top: 8, bottom: 8});
    // -> {top: 20, right: 0, bottom: 8, left: 0}
    ```
    @param {Number|Object} margins
    @param {Object} default_margins
    @return {Object}
  */
  function getMargins(margins, default_margins) {
    if (isNumber(margins))
      return {top: margins, right: margins, bottom: margins, left: margins};
    else
      return defaults({}, margins, default_margins, {top: 0, right: 0, bottom: 0, left: 0});
  }

  /**
    Create wrapped `(d, i)` function that adds chart instance as first argument.
    Wrapped function uses standard d3 arguments and context.

    Note: in order to pass proper context to di-functions called within di-function
    use `.call(this, d, i)` (where "this" is d3 context)

    @example
    ```javascript
    d3.chart('Base').extend('Custom', {
      initialize: function() {
        this.base.select('point')
          .attr('cx', this.x);
        // -> (d, i) and "this" used from d3, "chart" injected automatically
      },

      x: di(function(chart, d, i) {
        // "this" is standard d3 context: node
        return chart.xScale()(chart.xValue.call(this, d, i));
      })

      // xScale, xValue...
    });
    ```
    @method di
    @param {Function} callback with `(chart, d, i)` arguments
    @return {Function}
  */
  function di(callback) {
    // Create intermediate wrapping in case it's called without binding
    var wrapped = function wrapped(d, i, j) {
      return callback.call(this, undefined, d, i, j);
    };
    wrapped._is_di = true;
    wrapped.original = callback;

    return wrapped;
  }

  function bindDi(diFn, chart) {
    return function wrapped(d, i, j) {
      return (diFn.original || diFn).call(this, chart, d, i, j);
    };
  }

  // Bind all di-functions found in chart
  function bindAllDi(chart) {
    for (var key in chart) {
      if (chart[key] && chart[key]._is_di)
        chart[key] = bindDi(chart[key], chart);
    }
  }


  /**
    Get parent data for element (used to get parent series for data point)

    @example
    ```js
    var data = [{
      name: 'Input',
      values: [1, 2, 3]
    }];

    d3.selectAll('g')
      .data(data)
      .enter().append('g')
        .selectAll('text')
          .data(function(d) { return d.values; })
          .enter().append('text')
            .text(function(d) {
              var series_data = getParentData(this);
              return series_data.name + ': ' + d;
            });

    // Input: 1, Input: 2, Input: 3
    ```
    @method getParentData
    @param {Element} element
    @return {Any}
  */
  function getParentData(element) {
    // @internal Shortcut if element + parentData needs to be mocked
    if (element._parent_data)
      return element._parent_data;

    var parent = element && element.parentNode;
    if (parent) {
      var data = d3.select(parent).data();
      return data && data[0];
    }
  }

  function createHelper(type) {
    return function(id, options) {
      if (!options) {
        options = id;
        id = undefined;
      }

      return extend({id: id, type: type}, options);
    };
  }

  var helpers = {
    property: property,
    dimensions: dimensions,
    translate: translate,
    rotate: rotate,
    alignText: alignText,
    isSeriesData: isSeriesData,
    max: max,
    min: min,
    createScale: createScale,
    style: style,
    getMargins: getMargins,
    stack: stack,
    di: di,
    bindDi: bindDi,
    bindAllDi: bindAllDi,
    getParentData: getParentData,
    mixin: mixin,
    createHelper: createHelper
  };

  var Chart = d3.chart();

  // TEMP Clear namespace from mixins
  /**
    @namespace
  */

  /**
    Shared functionality between all charts and components.

    - Set properties automatically from `options`,
    - Store fully transformed data
    - Adds `"before:draw"` and `"draw"` events
    - Standard `width` and `height` calculations

    @class Base
  */
  function Base(selection, options) {
    // d3.chart() constructor without transform and initialize cascade
    this.base = selection;
    this._layers = {};
    this._attached = {};
    this._events = {};

    // Bind all di-functions to this chart
    bindAllDi(this);

    // Set options (and properties with set_from_options)
    if (options)
      this.options(options);

    // Initialize Chart (relies on explicitly calling super in initialize)
    this.initialize(options);
  }

  inherits(Base, Chart);

  extend(Base.prototype, {
    initialize: function() {},
    transform: function(data) {
      return data;
    },
    demux: function(name, data) { return data; },

    // Add events to draw: "before:draw" and "draw"
    draw: function(data) {
      // Transform data (relies on explicitly calling super in transform)
      data = this.transform(data);

      // Store fully-transformed data for reference
      this.data(data);

      this.trigger('before:draw', data);

      objectEach(this._layers, function(layer) {
        layer.draw(data);
      });
      objectEach(this._attached, function(attachment, name) {
        attachment.draw(this.demux(name, data));
      }, this);

      this.trigger('draw', data);
    },

    // Explicitly load d3.chart prototype
    layer: Chart.prototype.layer,
    unlayer: Chart.prototype.unlayer,
    attach: Chart.prototype.attach,
    on: Chart.prototype.on,
    once: Chart.prototype.once,
    off: Chart.prototype.off,
    trigger: Chart.prototype.trigger,

    /**
      Store fully-transformed data for direct access from the chart

      @property data
      @type Any
    */
    data: property(),

    /**
      Overall options for chart/component, automatically setting any matching properties.

      @example
      ```js
      var property = d3.compose.helpers.property;

      d3.chart('Base').extend('HasProperties', {
        a: property(),
        b: property({
          set: function(value) {
            return {
              override: value + '!'
            };
          }
        })
      });

      var instance = d3.select('#chart')
        .chart('HasProperties', {
          a: 123,
          b: 'Howdy',
          c: true
        });

      // Equivalent to:
      // d3.select(...)
      //   .chart('HasProperties')
      //   .options({...});

      console.log(instance.a()); // -> 123
      console.log(instance.b()); // -> Howdy!
      console.log(instance.options().c); // -> true
      ```
      @property options
      @type Object
    */
    options: property({
      default_value: {},
      set: function(options, previous) {
        // Clear all unset options, except for data and options
        if (previous) {
          var unset = difference(Object.keys(previous), Object.keys(options));
          unset.forEach(function(key) {
            if (key != 'data' && key != 'options' && isProperty(this, key))
              this[key](undefined);
          }, this);
        }

        objectEach(options, function setFromOptions(value, key) {
          if (isProperty(this, key))
            this[key](value);
        }, this);

        function isProperty(chart, key) {
          return chart[key] && chart[key].is_property && chart[key].set_from_options;
        }
      }
    }),

    /**
      Get width of `this.base`.
      (Does not include `set` for setting width of `this.base`)

      @method width
      @return {Number}
    */
    width: function width() {
      return dimensions(this.base).width;
    },

    /**
      Get height of `this.base`.
      (Does not include `set` for setting height of `this.base`)

      @method height
      @return {Number}
    */
    height: function height() {
      return dimensions(this.base).height;
    }
  });

  Base.extend = function(proto_props, static_props) {
    // name may be first parameter for d3.chart usage
    var name;
    if (isString(proto_props)) {
      name = proto_props;
      proto_props = static_props;
      static_props = arguments[2];
    }

    var Parent = this;
    var Child;

    if (proto_props && proto_props.hasOwnProperty('constructor')) {
      Child = proto_props.constructor;

      // inherits sets constructor, remove from proto_props
      proto_props = extend({}, proto_props);
      delete proto_props.constructor;
    }
    else {
      Child = function() { return Parent.apply(this, arguments); };
    }

    inherits(Child, Parent);
    if (static_props)
      extend(Child, static_props);
    if (proto_props)
      extend(Child.prototype, proto_props);

    // If name is given, register with d3.chart
    if (name)
      Chart[name] = Child;

    return Child;
  };

  /*
    Extract layout from the given options

    @param {Array} options
    @return {Object} {data, items, layout}
  */
  function extractLayout(options) {
    if (!options)
      return;

    var data = {
      _charts: {},
      _components: {}
    };
    var items = {};
    var layout = [];
    var charts = [];
    var components = [];

    // TEMP Idenfify charts from layered,
    // eventually no distinction between charts and components
    var found = {
      row: false,
      charts: false
    };

    // Components are added from inside-out
    // so for position: top, position: left, use unshift
    options.forEach(function(row, row_index) {
      var row_components = [];

      if (!Array.isArray(row))
        row = [row];
      if (row.length > 1)
        found.row = true;

      var row_layout = row.map(function(item, col_index) {
        if (!item)
          return;

        if (item._layered) {
          // Charts
          found.charts = found.row = true;
          var chart_ids = [];

          item.items.forEach(function(chart, chart_index) {
            if (!chart)
              return;

            chart = defaults({}, chart, {id: getId(row_index, col_index, chart_index)});

            chart_ids.push(chart.id);
            charts.push(chart);
            items[chart.id] = chart;
          });

          return chart_ids;
        }

        var component = prepareComponent(item, row_index, col_index);
        items[component.id] = component;

        if (row.length > 1) {
          if (!found.charts) {
            // Left
            setPosition(component, 'left');
            row_components.unshift(component);
          }
          else {
            // Right
            setPosition(component, 'right');
            row_components.push(component);
          }
        }
        else {
          if (!found.row) {
            // Top
            setPosition(component, 'top');
            components.unshift(component);
          }
          else {
            // Bottom
            setPosition(component, 'bottom');
            components.push(component);
          }
        }

        return component.id;
      });

      if (row_components.length)
        components = components.concat(row_components);

      layout.push(row_layout);
    });

    charts.forEach(extractData('_charts'));
    components.forEach(extractData('_components'));

    return {
      data: data,
      items: items,
      layout: layout,

      charts: charts,
      components: components
    };

    function prepareComponent(component, row_index, col_index) {
      return defaults({}, component, {id: getId(row_index, col_index)});
    }
    function setPosition(component, position) {
      if (component && isFunction(component.position))
        component.position(position);
      else
        component.position = position;
    }
    function getId(row_index, col_index, layered_index) {
      var id = 'item-' + (row_index + 1) + '-' + (col_index + 1);
      if (layered_index != null)
        id += '-' + (layered_index + 1);

      return id;
    }

    function extractData(type) {
      return function(item) {
        if (item.data && !isFunction(item.data)) {
          data[type][item.id] = item.data;
          data[item.id] = item.data;
          delete item.data;
        }
      };
    }
  }

  /*
    Calculate component and chart coordinates for given layout
  */
  function calculateLayout(components, data, demux) {
    var overall_layout = {top: [], right: [], bottom: [], left: []};
    components.forEach(function(component) {
      if (component.skip_layout || !component.getLayout)
        return;

      var layout = component.getLayout(demux(component.id, data));
      var position = layout && layout.position;

      if (!contains(['top', 'right', 'bottom', 'left'], position))
        return;

      overall_layout[position].push({
        offset: position == 'top' || position == 'bottom' ? layout.height : layout.width,
        component: component
      });
    });

    return overall_layout;
  }

  /*
    Apply calculated layout to charts and components
  */
  function applyLayout(layout, chart_position, width, height) {
    layout.top.reduce(function(previous, part) {
      var y = previous - part.offset;
      setLayout(part.component, chart_position.left, y, {width: chart_position.width});

      return y;
    }, chart_position.top);

    layout.right.reduce(function(previous, part, index, parts) {
      var previousPart = parts[index - 1] || {offset: 0};
      var x = previous + previousPart.offset;
      setLayout(part.component, x, chart_position.top, {height: chart_position.height});

      return x;
    }, width - chart_position.right);

    layout.bottom.reduce(function(previous, part, index, parts) {
      var previousPart = parts[index - 1] || {offset: 0};
      var y = previous + previousPart.offset;
      setLayout(part.component, chart_position.left, y, {width: chart_position.width});

      return y;
    }, height - chart_position.bottom);

    layout.left.reduce(function(previous, part) {
      var x = previous - part.offset;
      setLayout(part.component, x, chart_position.top, {height: chart_position.height});

      return x;
    }, chart_position.left);

    function setLayout(component, x, y, options) {
      if (component && isFunction(component.setLayout))
        component.setLayout(x, y, options);
    }
  }

  /**
    Common base for creating components that includes helpers for positioning and layout.

    ### Extending

    `d3.chart('Component')` contains intelligent defaults and there are no required overrides.
    Create a component just like a chart, by creating layers in the `initialize` method in `extend`.

    - To adjust layout calculation, use `prepareLayout`, `getLayout`, and `setLayout`.
    - To layout a component within the chart, use `skip_layout: true` and the static `layer_type: 'chart'`

    @example
    ```js
    d3.chart('Component').extend('Key', {
      initialize: function() {
        this.layer('Key', this.base, {
          dataBind: function(data) {
            return this.selectAll('text')
              .data(data);
          },
          insert: function() {
            return this.append('text');
          },
          events: {
            merge: function() {
              this.text(this.chart().keyText)
            }
          }
        })
      },

      keyText: helpers.di(function(chart, d, i) {
        return d.abbr + ' = ' + d.value;
      })
    });
    ```
    @class Component
    @extends Base
  */
  var Component = Base.extend({
    /**
      Component's position relative to chart
      (top, right, bottom, left)

      @property position
      @type String
      @default 'top'
    */
    position: property({
      default_value: 'top',
      validate: function(value) {
        return contains(['top', 'right', 'bottom', 'left'], value);
      }
    }),

    /**
      Get/set the width of the component (in pixels)
      (used in layout calculations)

      @property width
      @type Number
      @default (actual width)
    */
    width: property({
      default_value: function() {
        return dimensions(this.base).width;
      }
    }),

    /**
      Get/set the height of the component (in pixels)
      (used in layout calculations)

      @property height
      @type Number
      @default (actual height)
    */
    height: property({
      default_value: function() {
        return dimensions(this.base).height;
      }
    }),

    /**
      Margins (in pixels) around component

      @property margins
      @type Object
      @default {top: 0, right: 0, bottom: 0, left: 0}
    */
    margins: property({
      set: function(values) {
        return {
          override: getMargins(values)
        };
      },
      default_value: getMargins()
    }),

    /**
      Center the component vertically/horizontally (depending on position)

      @property centered
      @type Boolean
      @default false
    */
    centered: property({
      default_value: false
    }),

    /**
      Skip component during layout calculations and positioning
      (override in prototype of extension)

      @example
      ```js
      d3.chart('Component').extend('NotLaidOut', {
        skip_layout: true
      });
      ```
      @attribute skip_layout
      @type Boolean
      @default false
    */
    skip_layout: false,

    /**
      Perform any layout preparation required before getLayout (default is draw)
      (override in prototype of extension)

      Note: By default, components are double-drawn;
      for every draw, they are drawn once to determine the layout size of the component and a second time for display with the calculated layout.
      This can cause issues if the component uses transitions. See Axis for an example of a Component with transitions.

      @example
      ```js
      d3.chart('Component').extend('Custom', {
        prepareLayout: function(data) {
          // default: this.draw(data);
          // so that getLayout has real dimensions

          // -> custom preparation (if necessary)
        }
      })
      ```
      @method prepareLayout
      @param {Any} data
    */
    prepareLayout: function(data) {
      this.draw(data);
    },

    /**
      Get layout details for use when laying out component
      (override in prototype of extension)

      @example
      ```js
      d3.chart('Component').extend('Custom', {
        getLayout: function(data) {
          var calculated_width, calculated_height;

          // Perform custom calculations...

          // Must return position, width, and height
          return {
            position: this.position(),
            width: calculated_width,
            height: calculated_height
          };
        }
      });
      ```
      @method getLayout
      @param {Any} data
      @return {Object} position, width, and height for layout
    */
    getLayout: function(data) {
      this.prepareLayout(data);

      var margins = this.margins();
      return {
        position: this.position(),
        width: this.width() + margins.left + margins.right,
        height: this.height() + margins.top + margins.bottom
      };
    },

    /**
      Set layout of underlying base
      (override in prototype of extension)

      @example
      ```js
      d3.chart('Component').extend('Custom', {
        setLayout: function(x, y, options) {
          // Set layout of this.base...
          // (the following is the default implementation)
          var margins = this.margins();

          // (handle this.centered())

          this.base
            .attr('transform', helpers.translate(x + margins.left, y + margins.top));
          this.height(options && options.height);
          this.width(options && options.width);
        }
      });
      ```
      @method setLayout
      @param {Number} x position of base top-left
      @param {Number} y position of base top-left
      @param {Object} options
        @param {Object} [options.height] height of component in layout
        @param {Object} [options.width] width of component in layout
    */
    setLayout: function(x, y, options) {
      var margins = this.margins();

      if (this.centered()) {
        var actual_dimensions = dimensions(this.base);
        if ('height' in options)
          y += (options.height - actual_dimensions.height) / 2;
        else
          y += margins.top;

        if ('width' in options)
          x += (options.width - actual_dimensions.width) / 2;
        else
          x += margins.left;
      }
      else {
        x += margins.left;
        y += margins.top;
      }

      this.base.attr('transform', translate(x, y));
      this.height(options && options.height);
      this.width(options && options.width);
    }
  }, {
    /**
      Default z-index for component
      (Charts are 100 by default, so Component = 50 is below chart by default)

      @example
      ```js
      d3.chart('Component').extend('AboveChartLayers', {
        // ...
      }, {
        z_index: 150
      });
      ```
      @attribute z_index
      @static
      @type Number
      @default 50
    */
    z_index: 50,

    /**
      Set to `'chart'` to use chart layer for component.
      (e.g. Axis uses chart layer to position with charts, but includes layout for ticks)

      @example
      ```js
      d3.chart('Component').extend('ChartComponent', {
        // ...
      }, {
        layer_type: 'chart'
      });
      ```
      @attribute layer_type
      @static
      @type String
      @default 'component'
    */
    layer_type: 'component'
  });

  /**
    Common base for creating overlays that includes helpers for positioning and show/hide.

    ### Extending

    Create an overlay just like a chart, by creating layers in the `initialize` method in `extend`.

    - To adjust positioning, override `position`
    - To adjust show/hide behavior, override `show`/`hide`

    @example
    ```js
    d3.chart('Overlay').extend('ClosestPoints', {
      // TODO
    });
    ```
    @class Overlay
    @extends Component
  */
  var Overlay = Component.extend({
    initialize: function(options) {
      Component.prototype.initialize.call(this, options);
      this.base.attr('style', this.style());
    },
    skip_layout: true,

    /**
      Overlay's top-left x-position in px from left

      @property x
      @type Number
      @default 0
    */
    x: property({
      default_value: 0
    }),

    /**
      Overlay's top-left y-position in px from top

      @property y
      @type Number
      @default 0
    */
    y: property({
      default_value: 0
    }),

    /**
      Whether overlay is currently hidden

      @property hidden
      @type Boolean
      @default true
    */
    hidden: property({
      default_value: true
    }),

    /**
      Overlays base styling
      (default includes position and hidden)

      @property style
      @type String
      @default set from x, y, and hidden
    */
    style: property({
      default_value: function() {
        var transform = translate(this.x() + 'px', this.y() + 'px');
        var styles = {
          position: 'absolute',
          top: 0,
          left: 0,
          '-webkit-transform': transform,
          '-ms-transform': transform,
          transform: transform
        };

        if (this.hidden())
          styles.display = 'none';

        return style(styles);
      }
    }),

    /**
      Position overlay layer at given x,y coordinates

      @example
      ```js
      // Absolute, x: 100, y: 50
      overlay.position(100, 50);
      overlay.position({x: 100, y: 50});

      // Relative-to-chart, x: 50, y: 40
      overlay.position({chart: {x: 50, y: 40}});

      // Relative-to-container, x: 75, y: 50
      overlay.position({container: {x: 75, y: 50}});
      ```
      @method position
      @param {Object|Number} position {x,y}, {container: {x,y}}, {chart: {x,y}} or x in px from left
      @param {Number} [y] in px from top
    */
    // TODO This conflicts with component.position(), might need a rename
    position: function(position, y) {
      if (arguments.length > 1) {
        position = {
          x: position,
          y: y
        };
      }
      else {
        if ('container' in position) {
          position = this.getAbsolutePosition(position.container);
        }
        else if ('chart' in position) {
          if (this.container) {
            var chart = this.container.chartPosition();
            position = this.getAbsolutePosition({
              x: position.chart.x + chart.left,
              y: position.chart.y + chart.top
            });
          }
          else {
            position = this.getAbsolutePosition(position.chart);
          }
        }
      }

      this.x(position.x).y(position.y);
      this.base.attr('style', this.style());
    },

    /**
      Show overlay (with `display: block`)

      @method show
    */
    show: function() {
      this.hidden(false);
      this.base.attr('style', this.style());
    },

    /**
      Hide overlay (with `display: none`)

      @method hide
    */
    hide: function() {
      this.hidden(true);
      this.base.attr('style', this.style());
    },

    /**
      Get absolute position from container position
      (needed since container position uses viewBox and needs to be scaled to absolute position)

      @method getAbsolutePosition
      @param {Object} container_position ({x, y})
      @return {Object} absolute {x, y} relative to container div
    */
    getAbsolutePosition: function(container_position) {
      var container = this.container && this.container.container;

      if (container && this.container.responsive()) {
        var container_dimensions = dimensions(container);
        var chart_width = this.container.width();
        var chart_height = this.container.height();
        var width_ratio = container_dimensions.width / chart_width;
        var height_ratio = container_dimensions.height / chart_height;

        return {
          x: width_ratio * container_position.x,
          y: height_ratio * container_position.y
        };
      }
      else {
        // Not attached so can't get actual dimensions
        // fallback to container position
        return container_position;
      }
    }
  }, {
    layer_type: 'overlay'
  });

  var default_compose_margins = {top: 10, right: 10, bottom: 10, left: 10};

  /**
    Compose rich, data-bound charts from charts (like Lines and Bars) and components (like Axis, Title, and Legend) with d3 and d3.chart.
    Using the `options` property, charts and components can be bound to data and customized to create dynamic charts.

    @example
    ```html
    <div id="#chart"></div>
    ```
    ```js
    var chart = d3.select('#chart').chart('Compose', function(data) {
      // Process data...

      // Create shared scales
      var scales = {
        x: {data: data.input, key: 'x', adjacent: true},
        y: {data: data.input, key: 'y'},
        y2: {data: data.output, key: 'y'}
      };

      // Setup charts and components
      var charts = [
        d3c.bars('input', {data: data.input, xScale: scales.x, yScale: scales.y}),
        d3c.lines('output', {data: data.output, xScale: scales.x, yScale: scales.y2})
      ];

      var title = d3c.title('d3.compose');
      var xAxis = d3c.axis('xAxis', {scale: scales.x});
      var yAxis = d3c.axis('yAxis', {scale: scales.y});
      var y2Axis = d3c.axis('y2Axis', {scale: scales.y2});

      // Layout charts and components
      return [
        title,
        [yAxis, d3c.layered(charts), y2Axis],
        xAxis
      ];;
    });

    chart.draw({input: [...], output: [...]});
    ```
    @class Compose
    @extends Base
  */
  var Compose = Base.extend({
    initialize: function(options) {
      Base.prototype.initialize.call(this, options);

      // Responsive svg based on the following approach (embedded + padding hack)
      // http://tympanus.net/codrops/2014/08/19/making-svgs-responsive-with-css/
      // (not enabled if selection is svg)
      if (this.base.node().tagName != 'svg') {
        this.container = this.base.append('div')
          .attr('class', 'chart-compose-container');

        this.base = this.container.append('svg')
          .attr('xlmns', 'http://www.w3.org/2000/svg')
          .attr('version', '1.1')
          .attr('class', 'chart-compose');
      }
      else {
        this.base.classed('chart-compose', true);
      }

      this.attachHoverListeners();
    },

    transform: function(data) {
      // Save raw data for redraw
      this.rawData(data);
      return Base.prototype.transform.call(this, data);
    },

    /**
      Get/set the options `object/function` for the chart that takes `data` and
      returns `[...layout]` for composing child charts and components.

      @example
      ```js
      // get
      chart.options();

      // set (static)
      chart.options([
        // ...
      ]);

      // set (dynamic, takes data and returns options)
      chart.options(function(data) {
        // process data...

        return [
          // ...
        ];
      });

      // Set directly from d3.chart creation
      d3.select('#chart')
        .chart('Compose', function(data) {
          // ...
        });
      ```
      @property options
      @type Function|Object
    */
    options: property({
      default_value: function() { return function() {}; },
      set: function(options) {
        // If options is plain object,
        // return from generic options function
        if (!isFunction(options)) {
          return {
            override: function() {
              return options;
            }
          };
        }
      }
    }),

    // Store raw data for container before it has been transformed
    rawData: property(),

    /**
      Margins between edge of container and components/chart

      @example
      ```js
      chart.margins({top: 10, right: 20, bottom: 10, left: 20});
      ```
      @property margins
      @type Object {top, right, bottom, left}
      @default {top: 10, right: 10, bottom: 10, left: 10}
    */
    margins: property({
      default_value: default_compose_margins,
      set: function(values) {
        return {
          override: getMargins(values, default_compose_margins)
        };
      }
    }),

    // Chart position
    chartPosition: property({
      default_value: {top: 0, right: 0, bottom: 0, left: 0},
      set: function(values) {
        return {
          override: defaults({}, values, {top: 0, right: 0, bottom: 0, left: 0})
        };
      },
      get: function(values) {
        values.width = this._width() - values.right - values.left;
        values.height = this._height() - values.bottom - values.top;

        return values;
      }
    }),

    /**
      Get/set overall width of chart

      @property width
      @type Number
    */
    width: property({
      default_value: null
    }),

    /**
      Get/set overall height of chart

      @property height
      @type Number
    */
    height: property({
      default_value: null
    }),

    _width: function() {
      var width = this.width();
      return width != null ? width : Base.prototype.width.call(this);
    },
    _height: function() {
      var height = this.height();
      return height != null ? height : Base.prototype.height.call(this);
    },

    /**
      Enable responsive container + viewBox so that chart scales to fill width
      (only works if selection is not an svg)

      @property responsive
      @type Boolean
      @default true
    */
    responsive: property({
      default_value: true
    }),

    // Set svg viewBox attribute
    viewBox: property({
      default_value: function() {
        if (this.responsive() && this.width() && this.height())
          return '0 0 ' + this.width() + ' ' + this.height();
        else
          return null;
      }
    }),

    // Set svg preserveAspectRatio attribute
    preserveAspectRatio: property({
      default_value: function() {
        if (this.responsive())
          return 'xMidYMid meet';
        else
          return null;
      }
    }),

    // Set container style
    containerStyle: property({
      default_value: function() {
        if (this.responsive()) {
          var aspect_ratio = 1;
          if (this.width() && this.height())
            aspect_ratio = this.height() / this.width();

          return style({
            width: '100%',
            height: 0,
            'padding-top': (aspect_ratio * 100) + '%',
            position: 'relative'
          });
        }
        else {
          return style({position: 'relative'});
        }
      }
    }),

    // Set base style
    baseStyle: property({
      default_value: function() {
        if (this.responsive() && this.container) {
          return style({
            position: 'absolute',
            top: 0,
            left: 0
          });
        }
        else {
          return null;
        }
      }
    }),

    /**
      Set charts from options or get chart instances.
      Each chart should use a unique key so that updates are passed to the existing chart
      (otherwise they are recreated on update).
      The `type` option must be a registered `d3.chart` and all other options are passed to the chart.

      @example
      ```js
      chart.charts([
        {id: 'input', type: 'Bars'}, // options to pass to Bars chart
        {id: 'output', type: 'Lines'} // options to pass to Lines chart
      ]);
      ```
      @property charts
      @type Array
    */
    charts: property({
      set: function(chart_options, charts) {
        // Store actual charts rather than options
        return {
          override: this._attachItems(chart_options, charts, this)
        };
      },
      default_value: []
    }),

    /**
      Set components from options or get components instances.
      Each component should use a unique key so that updates are passed to the existing chart
      (otherwise they are recreated on update).
      The `type` option must be a registered `d3.chart` and all other options are passed to the component.

      @example
      ```js
      chart.components([
        {id: 'axis.y', type: 'Axis'}, // options to pass to Axis component
        {id: 'title', type: 'Title'} // options to pass to Title component
      ])
      ```
      @property components
      @type Array
    */
    components: property({
      set: function(component_options, components) {
        // Store actual components rather than options
        return {
          override: this._attachItems(component_options, components, this)
        };
      },
      default_value: []
    }),

    /**
      Delay start of transition by specified milliseconds.
      (applied to all charts and components as default)

      @property delay
      @type Number|Function
      @default d3 default: 0
    */
    delay: property(),

    /**
      Transition duration in milliseconds.
      (applied to all charts and components as default)

      @property duration
      @type Number|Function
      @default d3 default: 250ms
    */
    duration: property(),

    /**
      Transition ease function.
      (applied to all charts and components as default)

      - See: [Transitions#ease](https://github.com/mbostock/d3/wiki/Transitions#ease)
      - Note: arguments to pass to `d3.ease` are not supported

      @property ease
      @type String|Function
      @default d3 default: 'cubic-in-out'
    */
    ease: property(),

    /**
      Draw chart with given data

      @example
      ```js
      var chart = d3.select('#chart')
        .chart('Compose', function(data) {
          // ...
        });

      chart.draw([1, 2, 3]);

      chart.draw({values: [1, 2, 3]});

      chart.draw([
        {values: [1, 2, 3]},
        {values: [4, 5, 6]}
      ]);
      ```
      @method draw
      @param {Any} data
    */
    draw: function(data) {
      var config = this._prepareConfig(this.options(), data);
      if (!config)
        config = {data: {_charts: {}, _components: {}}, layout: [], charts: [], components: []};

      // Set charts and components from config
      this.charts(config.charts);
      this.components(config.components);

      // Add config data
      data = {
        original: data,
        config: config.data
      };
      this.data(data);

      this._setDimensions();

      // Layout components
      this.layout(config.layout, data);

      // Full draw now that everything has been laid out
      d3.chart().prototype.draw.call(this, data);
    },

    /**
      Redraw chart with current data

      @method redraw
    */
    redraw: function() {
      if (this.rawData())
        this.draw(this.rawData().original);
    },

    demux: function(name, data) {
      if (!data || !data.config || !data.original)
        return data;

      if (findById(this.charts(), name) && data.config._charts[name])
        return data.config._charts[name];
      else if (findById(this.components(), name) && data.config._components[name])
        return data.config._components[name];
      else
        return data.original;
    },

    // Create chart layer (for laying out charts)
    createChartLayer: function(options) {
      return this.base.append('g')
        .attr('class', 'chart-layer')
        .attr('data-zIndex', options && options.z_index);
    },

    // Create component layer
    createComponentLayer: function(options) {
      return this.base.append('g')
        .attr('class', 'chart-component-layer')
        .attr('data-zIndex', options && options.z_index);
    },

    // Create overlay layer
    createOverlayLayer: function() {
      if (!this.container)
        throw new Error('Cannot create overlay layer if original selection "d3.select(...).chart(\'Compose\')" is an svg. Use a div instead for responsive and overlay support.');

      return this.container.append('div')
        .attr('class', 'chart-overlay-layer');
    },

    // Layout components and charts for given data
    layout: function(layout, data) {
      // 1. Place chart layers
      this._positionChartLayers();

      // 2. Extract layout from components
      layout = this._extractLayout(data);

      // 3. Set chart position from layout
      var chart_position = extend({}, this.margins());
      objectEach(layout, function(parts, key) {
        parts.forEach(function(part) {
          chart_position[key] += part.offset || 0;
        });
      });
      this.chartPosition(chart_position);

      // 4. Position layers with layout
      this.positionLayers(layout);
    },

    attachHoverListeners: function() {
      // For responsive, listen on container div and calculate enter/exit for base from bounding rectangle
      // For non-responsive, bounding rectangle is container so calculations still apply

      var trigger = this.trigger.bind(this);
      var chartPosition = this.chartPosition.bind(this);
      var container = this.container || this.base;
      var base = this.base.node();
      var chart_position, bounds, was_inside;

      container.on('mouseenter', function() {
        // Calculate chart position and bounds on enter and cache during move
        chart_position = chartPosition();
        bounds = getBounds();

        was_inside = inside(bounds);
        if (was_inside)
          enter();
      });
      container.on('mousemove', function() {
        // Mousemove may fire before mouseenter in IE
        if (!chart_position || !bounds) {
          chart_position = chartPosition();
          bounds = getBounds();
        }

        var is_inside = inside(bounds);
        if (was_inside && is_inside)
          move();
        else if (was_inside)
          leave();
        else if (is_inside)
          enter();

        was_inside = is_inside;
      });
      container.on('mouseleave', function() {
        if (was_inside) {
          was_inside = false;
          leave();
        }
      });

      function inside() {
        var mouse = d3.mouse(document.documentElement);
        return mouse[0] >= bounds.left && mouse[0] <= bounds.right && mouse[1] >= bounds.top && mouse[1] <= bounds.bottom;
      }
      function enter() {
        trigger('mouseenter', translateToXY(d3.mouse(base)));
      }
      function move() {
        trigger('mousemove', translateToXY(d3.mouse(base)));
      }
      function leave() {
        trigger('mouseleave');
      }

      function translateToXY(coordinates) {
        var x = coordinates[0];
        var y = coordinates[1];
        var chart_x = x - chart_position.left;
        var chart_y = y - chart_position.top;

        // Set at chart bounds if outside of chart
        if (x > (chart_position.left + chart_position.width))
          chart_x = chart_position.width;
        else if (x < chart_position.left)
          chart_x = 0;

        if (y > (chart_position.top + chart_position.height))
          chart_y = chart_position.height;
        else if (y < chart_position.top)
          chart_y = 0;

        return {
          container: {x: x, y: y},
          chart: {x: chart_x, y: chart_y}
        };
      }

      function getBounds() {
        var scroll_y = 'scrollY' in window ? window.scrollY : document.documentElement.scrollTop;

        bounds = extend({}, base.getBoundingClientRect());
        bounds.top += scroll_y;
        bounds.bottom += scroll_y;

        return bounds;
      }
    },

    // Attach chart/component child item with id
    attach: function(id, item) {
      item.id = id;
      item.base.attr('data-id', id);
      item.container = this;

      Base.prototype.attach.call(this, id, item);

      if (item && isFunction(item.trigger))
        item.trigger('attach');
    },

    // Detach chart/component child item by id
    detach: function(id, item) {
      item.base.remove();

      delete this._attached[id];

      if (item && isFunction(item.trigger))
        item.trigger('detach');
    },

    // Position chart and component layers
    positionLayers: function(layout) {
      this._positionChartLayers();
      this._positionComponents(layout);
      this._positionByZIndex();
    },

    //
    // Internal
    //

    _setDimensions: function() {
      // Set container and svg dimensions
      // (if original selection is svg, no container and skip responsiveness)
      if (this.container) {
        this.container
          .attr('style', this.containerStyle());
      }

      this.base
        .attr('viewBox', this.viewBox())
        .attr('preserveAspectRatio', this.preserveAspectRatio())
        .attr('style', this.baseStyle())
        .attr('width', this.responsive() ? null : this.width())
        .attr('height', this.responsive() ? null : this.height());
    },

    _attachItems: function(items, container, context) {
      items = items || [];
      container = container || [];

      // Remove charts that are no longer needed
      var remove_ids = difference(pluck(container, 'id'), pluck(items, 'id'));
      remove_ids.forEach(function(remove_id) {
        context.detach(remove_id, findById(container, remove_id));
      });

      // Create or update charts
      return items.map(function(options) {
        // TODO May not have id, might need to auto-generate
        // (might be during another step)
        var id = options.id;
        var item = findById(container, id);

        if (options instanceof d3.chart()) {
          // If chart instance, replace with instance
          if (item)
            context.detach(id, item);

          context.attach(id, options);
          return options;
        }
        else {
          // TEMP Changing position has nasty side effects, disable for now
          var changed_position = item && !(item instanceof Overlay) && item.position && options.position && item.position() != options.position;

          if (item && (item.type != options.type || changed_position)) {
            // If chart type has changed, detach and re-create
            context.detach(id, item);
            item = undefined;
          }

          if (!item) {
            var Item = d3.chart(options.type);

            if (!Item)
              throw new Error('No registered d3.chart found for ' + options.type);

            var layer_options = {z_index: Item.z_index || 0};
            var createLayer = {
              'chart': 'createChartLayer',
              'component': 'createComponentLayer',
              'overlay': 'createOverlayLayer'
            }[Item.layer_type];

            if (!createLayer)
              throw new Error('Unrecognized layer type "' + Item.layer_type + '" for ' + options.type);

            var base = context[createLayer](layer_options);

            item = new Item(base, options);
            item.type = options.type;

            context.attach(id, item);
          }
          else {
            item.options(options);
          }

          return item;
        }
      });
    },

    _prepareConfig: function(options, data) {
      return extractLayout(options(data));
    },

    _positionChartLayers: function() {
      var position = this.chartPosition();
      this.base.selectAll('.chart-layer')
        .attr('transform', translate(position.left, position.top))
        .attr('width', position.width)
        .attr('height', position.height);
    },

    _positionComponents: function(layout) {
      var chart_position = this.chartPosition();
      var width = this._width();
      var height = this._height();

      applyLayout(layout, chart_position, width, height);
    },

    _positionByZIndex: function() {
      var layers = this.base.selectAll('.chart-layer, .chart-component-layer')[0];

      // Sort by z-index
      function setZIndex(layer) {
        return {
          layer: layer,
          zIndex: parseInt(d3.select(layer).attr('data-zIndex')) || 0
        };
      }
      function sortZIndex(a, b) {
        if (a.zIndex < b.zIndex)
          return -1;
        else if (a.zIndex > b.zIndex)
          return 1;
        else
          return 0;
      }
      function getLayer(wrapped) {
        return wrapped.layer;
      }

      layers = layers.map(setZIndex).sort(sortZIndex).map(getLayer);

      // Move layers to z-index order
      layers.forEach(function(layer) {
        if (layer && layer.parentNode && layer.parentNode.appendChild)
          layer.parentNode.appendChild(layer);
      });
    },

    _extractLayout: function(data) {
      return calculateLayout(this.components(), data, this.demux.bind(this));
    }
  });

  // TODO Find better place for this
  function layered(items) {
    if (!Array.isArray(items))
      items = Array.prototype.slice.call(arguments);

    return {_layered: true, items: items};
  }

  function findById(items, id) {
    return find(items, function(item) {
      return item.id == id;
    });
  }

  /**
    Common base for creating charts.
    Standard `d3.chart` charts can be used with d3.compose, but extending `d3.chart('Chart')` includes helpers for properties and "di" functions.

    ### Extending

    To take advantage of "di"-binding (automatically injects `chart` into "di" methods)
    and automatically setting properties from `options`, use `d3.compose.helpers.di`
    and `d3.compose.helpers.property` when creating your chart.

    @example
    ```js
    var helpers = d3.compose.helpers;

    d3.chart('Chart').extend('Pie', {
      initialize: function() {
        // same as d3.chart
      },
      transform: function(data) {
        // same as d3.chart
      },

      color: helpers.di(function(chart, d, i) {
        // "di" function with parent chart injected ("this" = element)
      }),

      centered: helpers.property({
        default_value: true
        // can be automatically set from options object
      })
    });
    ```
    @class Chart
    @extends Base
  */
  var Chart$1 = Base.extend({}, {
    /**
      Default z-index for chart
      (Components are 50 by default, so Chart = 100 is above component by default)

      @example
      ```js
      d3.chart('Chart').extend('BelowComponentLayers', {
        // ...
      }, {
        z_index: 40
      });
      ```
      @attribute z_index
      @static
      @type Number
      @default 100
    */
    z_index: 100,
    layer_type: 'chart'
  });

  // Export charts/components to d3.chart
  utils.extend(d3.chart(), {
    Base: Base,
    Chart: Chart$1,
    Component: Component,
    Overlay: Overlay,
    Compose: Compose
  });

  var d3c = d3.compose = {
    VERSION: '0.15.10',
    utils: utils,
    helpers: helpers,
    Base: Base,
    Chart: Chart$1,
    Component: Component,
    Overlay: Overlay,
    Compose: Compose,
    layered: layered
  };

  return d3c;

}));