var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var docs_path = process.env.docs_path || path.resolve('../_docs/');

// Make sure path from env is in correct format
docs_path = docs_path.replace(/\\/g, '/').replace(/\"/g, '');
if (!docs_path.charAt(docs_path.length - 1) != '/')
  docs_path += '/';

var paths = {
  data: docs_path + 'data.json',
  dist: docs_path + 'additional/dist/',
  css: docs_path + 'additional/dist/d3.compose.css',
  changelog: docs_path + 'additional/CHANGELOG.md',
  'package': docs_path + 'additional/package.json'
};

var output = {
  docs: '../_data/docs.json',
  details: '../_data/details.json',
  dist: '../',
  css: '../d3.compose.css',
  changelog: '../_includes/changelog.md',
  'package': '../_data/package.json'
};
var dist = {
  all: {
    dev: 'd3.compose-all.js',
    prod: 'd3.compose-all.min.js',
    map: 'd3.compose-all.min.js.map'
  },
  mixins: {
    dev: 'd3.compose-mixins.js',
    prod: 'd3.compose-mixins.min.js',
    map: 'd3.compose-mixins.min.js.map',
  },
  src: {
    dev: 'd3.compose.js',
    prod: 'd3.compose.min.js',
    map: 'd3.compose.min.js.map',
  }
};

// 1. Create _data/docs.json
if (!fs.existsSync(paths.data))
  throw new Error('Docs data not found. Run "yuidoc" on the master branch to generate docs data.');

var data = JSON.parse(fs.readFileSync(paths.data));
var docs = generateDocs(data);

fs.writeFileSync(output.docs, JSON.stringify(docs));

// 2. Create _data/details.json
var details = generateDetails(paths.dist, output.dist, dist);

fs.writeFileSync(output.details, JSON.stringify(details));

// 3. Copy d3.compose files
copy(paths.css, output.css);

_.each(dist, function(files) {
  _.each(files, function(file) {
    copy(paths.dist + file, output.dist + file);
  });
});

// 4. Copy changelog to includes and package to data
copy(paths.changelog, output.changelog);
copy(paths['package'], output['package']);

function generateDocs(data) {
  var formatted = {classes: {}};

  _.each(data.classes, function(cls, class_name) {
    var formatted_class = getClass(data, cls);
    formatted.classes[formatted_class.id] = formatted_class;
  });

  return formatted;
}

function getClass(data, cls, options) {
  options = _.defaults(options || {}, {exclude_extensions: false});

  // For namespaced classes, convert dot to dash for jekyll compatibility
  var id = cls.name.replace(/\./g, '-');
  var parts = cls.name.split('.');
  var short_name = parts[parts.length - 1];

  var formatted_class = _.extend({}, cls, {
    shortname: short_name,
    id: id,
    classitems: getItems(data, cls, id)
  });

  if (!options.exclude_extensions)
    formatted_class.extensions = getExtensions(data, formatted_class);

  return formatted_class;
}

function getItems(data, cls, class_id) {
  var items = _.filter(data.classitems, function(item) {
    return item.name && item['class'] == cls.name;
  });
  var formatted_items = items.map(function(classitem) {
    var item = _.extend({
      id: class_id + '-' + classitem.name
    }, classitem);

    // Generate item "code" if it has params or is a property
    if (item.params) {
      // For params, use name(a, [b = 2], [c]) style
      var param_codes = _.map(item.params, function(param) {
        var code = param.name.trim();

        if (param['optdefault'])
          code += ' = ' + param['optdefault'].trim();

        if (param.optional)
          code = '[' + code + ']';

        return code;
      });

      item.code = item.name + '(' + param_codes.join(', ') + ')';
    }
    else if (item.itemtype == 'property') {
      // For property, use {type} [default] style
      var code = '{' + item.type + '}';

      if (item['default'])
        code += ' [' + item['default'] + ']';

      item.code = code;
    }

    return item;
  });

  return formatted_items;
}

function getExtensions(data, formatted_class) {
  if (!formatted_class.extends)
    return;

  var extension_names = formatted_class.extends.split(',').map(function(ext) { return ext.trim(); });
  if (!extension_names.length)
    return;

  var extensions = extension_names.map(function(ext) {
    var extension = data.classes[ext] || data.classes['mixins.' + ext];

    if (!extension) {
      console.warn('No extension found matching ' + ext);
      return;
    }

    extension = getClass(data, extension, {exclude_extensions: true});

    return extension;
  });

  return extensions;
}

function generateDetails(input_folder, output_folder, dist) {
  var gzipSize = require('gzip-size');
  var details = {};

  _.each(dist, function(files, key) {
    // Load filename and path for files
    details[key] = {
      css: {
        filename: 'd3.compose.css',
        path: '/d3.compose/d3.compose.css'
      }
    };
    _.each(files, function(file, file_key) {
      details[key][file_key] = {
        filename: file,
        path: '/d3.compose/' + file
      };
    });

    details[key].dev.size = Math.round(fs.statSync(input_folder + files.dev).size / 1000);

    var prod_file = fs.readFileSync(input_folder + files.prod);
    details[key].prod.size = Math.round(gzipSize.sync(prod_file) / 100) / 10;
  });

  return details;
}

function copy(from, to) {
  fs.writeFileSync(to, fs.readFileSync(from));
}