import {Line, CartesianGrid, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import '@reactflow/node-resizer/dist/style.css';
import {NodeProps} from "reactflow";
import "./styles.css";

export interface ChartData {
  data?: { x: number, y: number }[]
}

export type ChartNodeProps = Pick<NodeProps<ChartData>, 'data'>

function calculateTicks(values: number[], approximateCount: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const step = Math.pow(10, Math.floor(Math.log10(range / approximateCount)));
  const count = Math.ceil(range / step);
  const ticks = [];
  for (let i = 1; i < count-1; i++) {
    ticks.push(min + i * step);
  }
  return ticks;
}

export function ChartNode({data: {data}}: ChartNodeProps) {
  data = data || [];
  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  const xTicks = calculateTicks(xValues, 5);
  const yTicks = calculateTicks(yValues, 5);

  return <>
    <div className={'chart-node'}>
      <LineChart width={300} height={200} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey="y" dot={data.length < 20} stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" verticalPoints={xTicks} horizontalPoints={yTicks} />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </div>
  </>
}