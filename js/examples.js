(function($, Backbone, d3, hljs, global) {

  /**
    @class Application
  */
  function Application() {
    this.dependencies = {};
  }

  _.extend(Application.prototype, Backbone.Events, {
    start: function start(options) {
      this.setupRegistry();

      this.trigger('start', this);

      if (!Backbone.history.started)
        Backbone.history.start();
    },

    get: function get(name) {
      if (!this.registry)
        throw new Error('get() can only be called after Application startup()');

      return this.registry[name];
    },
    set: function set(name, value) {
      if (!this.registry)
        throw new Error('set() can only be called after Application startup()');

      this.registry[name] = value;
    },

    register: function register(name, value, options) {
      options = options || {};

      this.dependencies[name] = {
        value: value,
        options: {
          instantiate: 'instantiate' in options ? options.instantiate : true,
          initialize: 'initialize' in options ? options.initialize : false
        }
      };
    },
    setupRegistry: function setupRegistry() {
      this.registry = {};

      _.each(this.dependencies, function(dependency, name) {
        if (dependency.options.instantiate)
          this.set(name, new dependency.value());
        else if (dependency.options.initialize)
          this.set(name, dependency.value(this));
        else
          this.set(name, dependency.value);
      }, this);
    },

    error: function() {
      console.error.apply(console, arguments);
    }
  });

  // app.js
  var app = global.app = new Application();

  // Router.js
  var Router = Backbone.Router.extend({
    routes: {
      '': 'example',
      ':example': 'example'
    },

    example: function example(id, query) {
      var example = examples[id || 'line'];

      if (example) {
        if (!this.editor) {
          this.editor = new Editor();

          // Add dynamic wide attribute for editor
          var constrained = true;
          var constrained_width = 1200;
          var editor = this.editor.$el;

          this.constrain = function constrain() {
            var width = window.innerWidth;

            if (constrained && width > constrained_width) {
              editor.removeClass('is-constrained').addClass('is-wide');
              constrained = false;
            }
            else if (!constrained && width <= constrained_width) {
              editor.addClass('is-constrained').removeClass('is-wide');
              constrained = true;
            }
          }

          $(window).on('resize', this.constrain);
          this.constrain();
        }

        this.editor.data = example.data;
        this.editor.options = example.options;

        $('.js-editor')[0].appendChild(this.editor.el);
        this.editor.render();
      }
      else {
        app.error('Example not found for ' + id);
      }
    }
  });

  // main.js
  app.on('start', function() {
    app.set('router', new Router());
  });

  $(document).ready(function() {
    app.start();
  });

})(Backbone.$, Backbone, d3, hljs, this);
