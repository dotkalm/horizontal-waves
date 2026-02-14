export type Point = { x: number; y: number };

export type TZigZagPath = (points: Point[], ridges: number, size: number) => string;

export type TZigZagSegment = (p0: Point, p1: Point, ridges: number, size: number) => string;