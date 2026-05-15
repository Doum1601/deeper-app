import React from "react";
import { View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface SparklineProps {
  values: number[];
  width: number;
  height: number;
  stroke: string;
  fillId?: string;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ values, width, height, stroke, fillId, strokeWidth = 2 }) => {
  if (!values || values.length < 2) return <View style={{ width, height }} />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const step = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  // Smooth bezier path
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` Q ${cx.toFixed(2)} ${p0.y.toFixed(2)} ${cx.toFixed(2)} ${((p0.y + p1.y) / 2).toFixed(2)}`;
    d += ` T ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }

  const areaD = `${d} L ${width.toFixed(2)} ${height.toFixed(2)} L 0 ${height.toFixed(2)} Z`;
  const gradId = fillId || `grad-${stroke.replace("#", "")}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={stroke} stopOpacity={0.35} />
          <Stop offset="1" stopColor={stroke} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaD} fill={`url(#${gradId})`} />
      <Path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};
