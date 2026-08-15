export function compressTimeSeries(rawSamples, options = {}) {
  const { threshold = 0 } = options;

  if (!Array.isArray(rawSamples) || rawSamples.length === 0) {
    return [];
  }

  const segments = [];
  let currentSegment = {
    startTime: rawSamples[0].timestamp,
    endTime: null,
    value: rawSamples[0].value
  };

  for (let index = 1; index < rawSamples.length; index += 1) {
    const previousPoint = rawSamples[index - 1];
    const currentPoint = rawSamples[index];
    const diff = Math.abs(Number(currentPoint.value) - Number(previousPoint.value));

    if (diff > threshold) {
      currentSegment.endTime = currentPoint.timestamp;
      segments.push(currentSegment);
      currentSegment = {
        startTime: currentPoint.timestamp,
        endTime: null,
        value: currentPoint.value
      };
    }
  }

  segments.push(currentSegment);
  return segments;
}
