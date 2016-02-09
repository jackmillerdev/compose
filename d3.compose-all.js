import d3 from 'd3';
import utils from './src/utils';
import helpers from './src/helpers';
import chart, {Chart} from './src/chart';
import component, {Component} from './src/component';
import Compose from './src/compose';

import bars, {Bars} from './src/charts/bars';
import lines, {Lines} from './src/charts/lines';
import labels, {Labels} from './src/charts/labels';

import text, {Text} from './src/components/text';
import title, {Title} from './src/components/title';
import axisTitle, {AxisTitle} from './src/components/axis-title';
import axis, {Axis} from './src/components/axis';
import gridlines, {Gridlines} from './src/components/gridlines';
import legend, {Legend} from './src/components/legend';

import layered from './src/layouts/layered';

const d3c = d3.compose = {
  VERSION: '{version}',
  utils,
  helpers,
  chart,
  Chart,
  component,
  Component,
  Compose,

  bars,
  Bars,
  lines,
  Lines,
  labels,
  Labels,

  text,
  Text,
  title,
  Title,
  axisTitle,
  AxisTitle,
  axis,
  Axis,
  gridlines,
  Gridlines,
  legend,
  Legend,

  layered
};

export default d3c;
