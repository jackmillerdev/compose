import d3 from 'd3';
import utils from './src/utils';
import helpers from './src/helpers';
import Base from './src/Base';
import Chart from './src/Chart';
import Component from './src/Component';
import Overlay from './src/Overlay';
import Compose, { layered } from './src/Compose';

import mixins from './src/mixins';

import Lines, { lines } from './src/charts/Lines';
import Bars, { bars } from './src/charts/Bars';
import StackedBars, { stackedBars } from './src/charts/StackedBars';
import HorizontalBars, { horizontalBars } from './src/charts/HorizontalBars';
import HorizontalStackedBars, { horizontalStackedBars } from './src/charts/HorizontalStackedBars';
import Labels, { labels } from './src/charts/Labels';
import HoverLabels, { hoverLabels } from './src/charts/HoverLabels';

import Axis, { axis } from './src/components/Axis';
import Title, { title } from './src/components/Title';
import Legend, { legend } from './src/components/Legend';
import InsetLegend, { insetLegend } from './src/components/InsetLegend';

import xy from './src/extensions/xy';

export default {
  VERSION: '{version}',
  utils: utils,
  helpers: helpers,
  Base: Base,
  Chart: Chart,
  Component: Component,
  Overlay: Overlay,
  Compose: Compose,
  layered: layered,

  mixins: mixins,

  Lines: Lines,
  lines: lines,
  Bars: Bars,
  bars: bars,
  StackedBars: StackedBars,
  stackedBars: stackedBars,
  HorizontalBars: HorizontalBars,
  horizontalBars: horizontalBars,
  HorizontalStackedBars: HorizontalStackedBars,
  Labels: labels,
  labels: labels,
  HoverLabels: HoverLabels,
  hoverLabels: hoverLabels,

  Axis: Axis,
  axis: axis,
  Title: Title,
  title: title,
  Legend: Legend,
  legend: legend,
  InsetLegend: InsetLegend,
  insetLegend: insetLegend,

  xy: xy
}
