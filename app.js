import { LOCATIONS, getClockReading } from "./clock.js";

export function renderClocks(documentNode, instant) {
  for (const location of LOCATIONS) {
    const panel = documentNode.querySelector(`[data-clock="${location.id}"]`);
    if (!panel) throw new Error(`Missing clock panel: ${location.id}`);
    const reading = getClockReading(instant, location.timeZone);
    panel.querySelector("[data-digits]").textContent = reading.time;
    panel.querySelector("[data-period]").textContent = reading.period;
    panel.querySelector("[data-date]").textContent = reading.date;
    panel.querySelector("[data-zone]").textContent = reading.zone;
    panel.querySelector("[data-time]").setAttribute("datetime", reading.iso);
    for (const hand of ["hour", "minute", "second"]) {
      panel.querySelector(`[data-hand="${hand}"]`).setAttribute("transform", `rotate(${reading[`${hand}Angle`]} 120 120)`);
    }
  }
}

export function startClocks({
  documentNode = document,
  now = () => new Date(),
  schedule = setInterval,
  cancel = clearInterval,
  reportError = (error) => console.error("Unable to update world clocks:", error)
} = {}) {
  const update = () => {
    try {
      renderClocks(documentNode, now());
      documentNode.querySelector("#clock-error").hidden = true;
    } catch (error) {
      documentNode.querySelector("#clock-error").hidden = false;
      reportError(error);
    }
  };
  const onVisibility = () => { if (!documentNode.hidden) update(); };
  update();
  const timer = schedule(update, 1000);
  documentNode.addEventListener("visibilitychange", onVisibility);
  return () => {
    cancel(timer);
    documentNode.removeEventListener("visibilitychange", onVisibility);
  };
}

if (typeof document !== "undefined") startClocks();
