import {
  assign,
  isUndefined
} from '../utils';
import {
  types,
  createPrepare,
  connect,
  getDimensions,
  prepareTransition
} from '../helpers';
import {
  series,
  xyValues
} from '../mixins';
import chart from '../chart';

const {
  getX,
  getY,
  getWidth
} = xyValues;

/**
  Bars
*/
export const Bars = series.createSeriesDraw({
  prepare: createPrepare(xyValues.prepare),

  select({seriesValues, key}) {
    return this.selectAll('rect')
      .data(seriesValues, key);
  },

  enter({yValue, yScale, offset, onMouseEnterBar, onMouseLeaveBar}) {
    this.append('rect')
      .attr('y', (d, i) => bar0(yValue, yScale, offset, d, i))
      .attr('height', 0)
      .on('mouseenter', onMouseEnterBar)
      .on('mouseleave', onMouseLeaveBar);
  },

  merge({xValue, yValue, xScale, yScale, offset, className, style, transition}) {
    this
      .attr('x', (d, i, j) => barX(xValue, xScale, d, i, j))
      .attr('width', barWidth(xScale))
      .attr('class', className)
      .style(style)

    this.transition().call(prepareTransition(transition))
      .attr('y', (d, i) => barY(yValue, yScale, offset, d, i))
      .attr('height', (d, i) => barHeight(yValue, yScale, offset, d, i));
  },

  exit({yValue, yScale, offset, transition}) {
    this.transition().call(prepareTransition(transition))
      .attr('y', (d, i) => bar0(yValue, yScale, offset, d, i))
      .attr('height', 0)
      .remove();
  }
});

Bars.properties = assign({},
  series.properties,
  xyValues.properties,
  {
    offset: {
      type: types.number,
      getDefault: () => 0
    },
    onMouseEnterBar: {
      type: types.fn,
      getDefault: () => () => {}
    },
    onMouseLeaveBar: {
      type: types.fn,
      getDefault: () => () => {}
    }
  }
);

// Connection
// ----------

export const mapState = (state) => {
  // TODO Get offset axis / offset from state
};
export const connection = connect(mapState);

/**
  bars
*/
const bars = chart(connection(Bars));
export default bars;

// Helpers
// -------

export function bar0(yValue, yScale, offset, d, i) {
  const y0 = yScale(0);
  const y = getY(yValue, yScale, d, i);

  return y <= y0 ? y0 - offset : y0 + offset;
}

export function barX(xValue, xScale, d, i, j) {
  const x = getX(xValue, xScale, d, i, j);

  if (!xScale._ordinalSeries) {
    return x;
  }

  // For ordinal-series scale, x is centered, get value at edge
  const width = getWidth(xScale);
  return x - (width / 2);
}

export function barY(yValue, yScale, offset, d, i) {
  const y0 = yScale(0);
  const y = getY(yValue, yScale, d, i);

  return y < y0 ? y : y0 + offset;
}

export function barWidth(xScale) {
  return getWidth(xScale);
}

export function barHeight(yValue, yScale, offset, d, i) {
  const y0 = yScale(0);
  const y = getY(yValue, yScale, d, i);

  const height = Math.abs(y0 - y - offset);
  return height > 0 ? height : 0;
}
