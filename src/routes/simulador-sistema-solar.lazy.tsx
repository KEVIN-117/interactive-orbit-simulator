import { createLazyFileRoute } from "@tanstack/react-router";
import SolarSystemScene from "../components/SolarSystemScene";
export const Route = createLazyFileRoute("/simulador-sistema-solar")({
  component: SolarSystemScene,
});
