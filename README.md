# d3.compose

Compose rich, data-bound charts from charts (like Lines and Bars) and components (like Axis, Title, and Legend) with d3 and d3.chart.

- Advanced layout engine automatically positions and sizes charts and components
- Standard library of charts and components for quickly creating beautiful charts
- `Chart` and `Component` bases for creating composable and reusable charts and components
- Includes helpers and mixins that cover a range of standard functionality
- Class-based styling is extensible and easy to customize to match your site

## Getting Started

1. Download the [latest release](https://github.com/CSNW/d3.compose/releases)
    
    - Use `d3.compose-all` to use the standard charts/components to create your charts
    - Use `d3.compose-mixins` if you're creating your own charts/components and want to use d3.compose's mixins to help
    - Use `d3.compose` if you're using your own charts/components

2. Download the dependencies:
    
    - [D3.js (>= 3.0.0)](http://d3js.org/)
    - [d3.chart (>= 0.2.0)](http://misoproject.com/d3-chart/)
    - [Underscore.js (>= 1.5.0)](http://underscorejs.org/)

3. Add d3.compose and dependencies to your html:

    ```html
    <!doctype html>
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="css/d3.compose.css">
      </head>
      <body>
        <svg id="chart"></svg>

        <script src="js/d3.js"></script>
        <script src="js/d3.chart.js"></script>
        <script src="js/underscore.js"></script>
        <script src="js/d3.compose-all.min.js"></script>

        <script type="text/javascript">
          // Your code
        </script>
      </body>
    </html>
    ```

4. Create your first chart

    ```js
    var chart = d3.select('#chart')
      .chart('Compose', function(data) {
        var scales = {
          x: {type: 'ordinal', data: data, key: 'x'},
          y: {data: data, key: 'y'}
        };

        return {
          charts: {
            lines: {
              type: 'Lines', 
              data: data,
              xScale: scales.x,
              yScale: scales.y
            }
          },
          components: {
            y_axis: {
              type: 'Axis',
              position: 'right',
              scale: scales.y
            }
          }
        };
      })
      .width(600)
      .height(400);

    chart.draw([{x: 0, y: 10}, {x: 10, y: 50}, {x: 20, y: 30}]);
    ```

## Examples and Docs

See [http://CSNW.github.io/d3.compose](http://CSNW.github.io/d3.compose) for live examples and docs.

## Development

Install bower (if necessary) `npm install -g bower`

1. Install components `npm install` and `bower install`
2. Develop with `grunt debug` or `npm run debug` (automatically builds, tests, and runs example server)
2. Build with `grunt build` or `npm run build`
3. Open example with `grunt server` and `localhost:4001`
4. Test with `grunt test` or `npm test` or automatically with `grunt watch:test`

### Release

(With all changes merged to master and on master branch)

1. Build release with `grunt release:(patch|minor|major|[version])`
2. Commit files `git commit -am "v#.#.#"`
3. Tag commit with version `git tag v#.#.#`
4. Push changes to remote `git push` and `git push --tags`
