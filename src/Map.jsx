import "./App.css";
import { Vega } from "react-vega";
import { scheme } from "vega-scale";
import mapLayer from "./us-10m.json";
import stateLayer from "./states-10m.json";
import { useMemo } from "react";
import { customScheme } from "./customScheme";

// Register the interpolator. Now the scheme "mygrey" can be used in Vega specs
scheme("customScheme", customScheme);

const getSpec = (data, title, max, date, width, height) => {
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
      },
    ],

    scales: [
      {
        name: "color",
        type: "quantize",
        domain: [0, max],
        range: { scheme: "customScheme", count: 100 },
      },
    ],

    legends: [
      {
        fill: "color",
        orient: "bottom-right",
        title: title,
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
                "','County': datum.county+', '+datum.state, '" +
                title +
                "': format(datum.rate,'0.1f'),'Population':datum.population}",
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

const Map = ({
  deathsOrCases,
  perMillion,
  title,
  max,
  width,
  height,
  cases,
  datestr,
}) => {
  const kernel = useMemo(() => {
    if (Object.keys(cases).length > 0) {
      return cases.FIPS.map((value, index) => ({
        id: value,
        state: cases.statename[index],
        county: cases.county[index],
        population: cases.population[index],
      }));
    } else {
      return [];
    }
  }, [cases]);
  const data = useMemo(() => {
    let cases_per_million = [];
    if (kernel.length > 0) {
      cases_per_million = cases[datestr + deathsOrCases];
    } else {
      return [];
    }
    const data = kernel.map((value, index) => ({
      ...value,
      rate: perMillion
        ? (1000000 * cases_per_million[index]) / value.population
        : cases_per_million[index],
    }));
    return data;
  }, [kernel, perMillion, datestr, cases, deathsOrCases]);

  console.log("render " + datestr);
  return <Vega spec={getSpec(data, title, max, datestr, width, height)} />;
};

export default Map;
