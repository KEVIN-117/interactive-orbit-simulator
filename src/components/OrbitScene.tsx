import SpaceCanvas, { SpaceCanvasProps } from "./SpaceCanvas";
export default function OrbitScene(props: Omit<SpaceCanvasProps, "mode">) {
  return <SpaceCanvas {...props} mode="orbit" />;
}
