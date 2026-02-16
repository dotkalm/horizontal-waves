export type Point = { x: number; y: number };

export type SVGPoint = { x: number; y: number; intensity: number };

export type EdgePath = { points: SVGPoint[]; intensity: number; intensities: number[] };

export type Intersection = { pathIndex: number; x: number };

export type TZigZagPath = (points: Point[], ridges: number, size: number) => string;

export type TZigZagSegment = (p0: Point, p1: Point, ridges: number, size: number) => string;