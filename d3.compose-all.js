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

import Text, { text } from './src/components/Text';
import Title, { title } from './src/components/Title';
import Axis, { axis } from './src/components/Axis';
import AxisTitle, { axisTitle } from './src/components/AxisTitle';
import Legend, { legend } from './src/components/Legend';
import InsetLegend, { insetLegend } from './src/components/InsetLegend';
import Gridlines, { gridlines } from './src/components/Gridlines';

// Export charts/components to d3.chart
utils.extend(d3.chart(), {
  Base: Base,
  Chart: Chart,
  Component: Component,
  Overlay: Overlay,
  Compose: Compose,
  Lines: Lines,
  Bars: Bars,
  StackedBars: StackedBars,
  HorizontalBars: HorizontalBars,
  HorizontalStackedBars: HorizontalStackedBars,
  Labels: Labels,
  HoverLabels: HoverLabels,
  Text: Text,
  Title: Title,
  Axis: Axis,
  AxisTitle: AxisTitle,
  Legend: Legend,
  InsetLegend: InsetLegend,
  Gridlines: Gridlines
});

var d3c = d3.compose = {
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
  horizontalStackedBars: horizontalStackedBars,
  Labels: Labels,
  labels: labels,
  HoverLabels: HoverLabels,
  hoverLabels: hoverLabels,

  Text: Text,
  text: text,
  Title: Title,
  title: title,
  Axis: Axis,
  axis: axis,
  AxisTitle: AxisTitle,
  axisTitle: axisTitle,
  Legend: Legend,
  legend: legend,
  InsetLegend: InsetLegend,
  insetLegend: insetLegend,
  Gridlines: Gridlines,
  gridlines: gridlines
};

export default d3c;
