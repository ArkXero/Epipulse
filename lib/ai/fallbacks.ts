import { getPresetForPrompt } from "@/lib/model";
import type {
  ScenarioConfig,
  SimulationDay,
  SimulationMetrics
} from "@/lib/model";
import { formatNumber } from "@/lib/format";

export function fallbackScenario(prompt: string): ScenarioConfig {
  return getPresetForPrompt(prompt);
}

export function fallbackNarration({
  config,
  day,
  previousDay,
  metrics
}: {
  config: ScenarioConfig;
  day: SimulationDay;
  previousDay?: SimulationDay;
  metrics: SimulationMetrics;
}) {
  const delta = previousDay ? day.aggregate.I - previousDay.aggregate.I : 0;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const breach =
    metrics.firstNodeHospitalBreachDay === null
      ? "No node crosses hospital capacity in the current horizon."
      : `The first node capacity breach appears on day ${metrics.firstNodeHospitalBreachDay}.`;

  return `Day ${day.day} in ${config.city.name}: ${formatNumber(
    day.aggregate.I
  )} people are infectious, ${direction} ${formatNumber(
    Math.abs(delta)
  )} from the previous day. The model projects a peak of ${formatNumber(
    metrics.peakInfected
  )} infectious people on day ${metrics.peakInfectedDay}. ${breach}`;
}

export function fallbackAdvice({
  currentDay,
  metrics
}: {
  currentDay: SimulationDay;
  metrics: SimulationMetrics;
}) {
  const hospitalText =
    metrics.firstNodeHospitalBreachDay === null
      ? "hospital load remains below node capacity in this run"
      : `hospital capacity is first exceeded on day ${metrics.firstNodeHospitalBreachDay}`;

  return `Current day ${currentDay.day} shows ${formatNumber(
    currentDay.aggregate.I
  )} infectious people and ${formatNumber(
    currentDay.aggregate.hospitalized
  )} estimated hospitalizations. I would first reduce transmission and raise isolation compliance, then use travel restriction or node closures only where the map shows the steepest growth, because ${hospitalText}.`;
}
