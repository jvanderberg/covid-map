function scale(start, stop, min, max, value) {
  if (start < stop) {
    return start + ((value - min) / (max - min)) * (stop - start);
  }
  return start - ((value - min) / (max - min)) * (start - stop);
}

export function customScheme(f) {
  var r, g, b;
  if (f < 0.1) {
    r = scale(76, 255, 0, 0.1, f);
    g = scale(168, 253, 0, 0.1, f);
    b = scale(0, 148, 0, 0.1, f);
  } else if (f >= 0.1 && f < 0.5) {
    r = scale(256, 256, 0.1, 0.5, f);
    g = scale(253, 0, 0.1, 0.5, f);
    b = scale(148, 0, 0.1, 0.5, f);
  } else if (f >= 0.5 && f <= 1) {
    r = scale(256, 147, 0.5, 1, f);
    g = scale(0, 85, 0.5, 1, f);
    b = scale(0, 256, 0.5, 1, f);
  }
  return "rgb(" + r + ", " + g + ", " + b + ")";
}
