import "./App.css";
import { Vega } from "react-vega";
import { scheme } from "vega-scale";
import mapLayer from "./us-10m.json";
import stateLayer from "./states-10m.json";
import { useMemo } from "react";

function scale(start, stop, min, max, value) {
  if (start < stop) {
    return start + ((value - min) / (max - min)) * (stop - start);
  }
  return start - ((value - min) / (max - min)) * (start - stop);
}
function customScheme(f) {
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

// Register the interpolator. Now the scheme "mygrey" can be used in Vega specs
scheme("customScheme", customScheme);

const getSpec = (data, date, width, height) => {
  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description:
      "A choropleth map depicting U.S. unemployment rates by county in 2009.",
    width: width,
    height: height,
    autosize: "fit",

    data: [
      {
        name: "covid",
        values: data,
      },
      {
        name: "counties",
        values: mapLayer,
        format: { type: "topojson", feature: "counties" },
        transform: [
          {
            type: "lookup",
            from: "covid",
            key: "id",
            fields: ["id"],
            values: ["rate", "county", "state", "population"],
          },
          { type: "filter", expr: "datum.rate != null" },
        ],
      },
      {
        name: "states",
        values: stateLayer,
        format: { type: "topojson", feature: "states" },
      },
    ],

    projections: [
      {
        name: "projection",
        type: "albersUsa",
        scale: (800 * width) / 960,
      },
    ],

    scales: [
      {
        name: "color",
        type: "quantize",
        domain: [0, 2000],
        range: { scheme: "customScheme", count: 100 },
      },
    ],

    legends: [
      {
        fill: "color",
        orient: "bottom-right",
        title: "Cases Per Million",
      },
    ],

    marks: [
      {
        type: "shape",
        from: { data: "counties" },
        encode: {
          enter: {
            tooltip: {
              signal:
                "{ 'title': '" +
                date +
                "','County': datum.county+', '+datum.state, 'Cases Per Million': format(datum.rate,'0.1f'),'Population':datum.population}",
            },
          },
          update: { fill: { scale: "color", field: "rate" } },
          hover: { fill: { value: "red" } },
        },
        transform: [{ type: "geoshape", projection: "projection" }],
      },
      {
        type: "shape",
        from: { data: "states" },
        encode: {
          enter: {
            stroke: { value: "#3c3c3c" },
          },
          update: {
            path: { field: "path" },
          },
        },
        transform: [{ type: "geoshape", projection: "projection" }],
      },
    ],
  };
};

function getArray(pythonObject) {
  const arr = [];
  for (const key of Object.keys(pythonObject)) {
    arr[Number(key)] = pythonObject[key];
  }
  return arr;
}

const Map = ({ width, height, cases, datestr }) => {
  const data = useMemo(() => {
    let fips = [];
    let pop = [];
    let states = [];
    let counties = [];
    let cases_per_million = [];
    if (Object.keys(cases).length > 0) {
      fips = getArray(cases.FIPS);
      pop = getArray(cases.population);
      states = getArray(cases.statename);
      counties = getArray(cases.county);
      cases_per_million = getArray(cases[datestr]);
    } else {
      return [];
    }
    const data = fips.map((value, index) => ({
      id: value,
      rate: (1000000 * cases_per_million[index]) / pop[index],
      state: states[index],
      county: counties[index],
      population: pop[index],
    }));
    return data;
  }, [cases, datestr]);

  return <Vega spec={getSpec(data, datestr, width, height)} />;
};

export default Map;
