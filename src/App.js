import "./App.css";
import { useState, useEffect, useRef } from "react";
import { Slider, Button, Radio, Checkbox } from "antd";
import Map from "./Map.jsx";
import "antd/dist/antd.css";
import { PlayCircleTwoTone, PauseCircleTwoTone } from "@ant-design/icons";
let oldVal;

const settings = [
  { type: "deaths", perMillion: true, title: "Deaths Per Million", max: 40 },
  { type: "deaths", perMillion: false, title: "Deaths", max: 40 },
  { type: "cases", perMillion: true, title: "Cases Per Million", max: 2000 },
  { type: "cases", perMillion: false, title: "Cases", max: 1000 },
];

function getDate(dateval) {
  const date = new Date(new Date(2020, 3, 16).getTime() + dateval * 86400000);
  const datestr = new Intl.DateTimeFormat("en-US")
    .format(date)
    .replace("2020", "20");
  return datestr;
}

// function useWindowSize() {
//   const [size, setSize] = useState([0, 0]);
//   useLayoutEffect(() => {
//     function updateSize() {
//       setSize([window.innerWidth, window.innerHeight]);
//     }
//     window.addEventListener("resize", updateSize);
//     updateSize();
//     return () => window.removeEventListener("resize", updateSize);
//   }, []);
//   return size;
// }

function App() {
  const [dateval, setDateval] = useState(0);
  const [maxDay, setMaxDay] = useState(
    Math.floor((Date.now() - new Date(2020, 3, 16).getTime()) / 86400000)
  );
  const setDate = (val) => {
    if (oldVal !== val) {
      oldVal = val;
      setDateval(val);
    }
  };
  const date = getDate(dateval);
  const [increment, setIncrement] = useState(1)
  const [cases, setCases] = useState({});
  const [playing, setPlaying] = useState(true);
  const [deathsOrCases, setDeathsOrCases] = useState("cases");
  const [perMillion, setPerMillion] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await import(`./county_combined.json`);
      const date = Object.keys(data).slice(-2)[0].replace("deaths", "");
      setMaxDay(
        Math.floor(
          1 + (new Date(date) - new Date(2020, 3, 16).getTime()) / 86400000
        )
      );
      setCases(data);
    }

    loadData();
  }, []);

  const timer = useRef(null);

  useEffect(() => {
    if (playing) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        console.timeEnd("timer");
        console.time("timer");
        setDateval(Math.min(dateval + increment, maxDay));

        if (dateval + 1 === maxDay) {
          //setPlaying(false);
          setIncrement(-1);
          setDateval(Math.min(dateval - 1, maxDay));
        }
      }, 500);

      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer.current);
    } else {
      clearTimeout(timer);
      timer.current = null;
    }
  }, [playing, dateval]);

  //  const size = useWindowSize();
  const setting = settings.find(
    (val) => val.perMillion === perMillion && val.type === deathsOrCases
  );
  return (
    <div className="App">
      <div>
        <div>
          <Checkbox
            style={{ margin: 5 }}
            checked={perMillion}
            onChange={(event) => setPerMillion(event.target.checked)}
          >
            Per Million
          </Checkbox>
          <Radio.Group
            style={{ margin: 5 }}
            buttonStyle="solid"
            size="large"
            value={deathsOrCases}
            defaultValue="cases"
            onChange={(event) => setDeathsOrCases(event.target.value)}
          >
            <Radio.Button value="cases">Cases</Radio.Button>
            <Radio.Button value="deaths">Deaths</Radio.Button>
          </Radio.Group>
          <div
            style={{
              color: "#6c6c6c",
              display: "inline-block",
              fontSize: 35,
              width: 160,
              fontWeight: "bold",
            }}
          >
            {date}
          </div>
        </div>
        <div style={{ display: "flex", paddingRight: 50, paddingLeft: 50 }}>
          <div style={{ width: 50 }}>
            <Button
              style={{ margin: 5 }}
              size="large"
              onClick={() => setPlaying(!playing)}
              icon={playing ? <PauseCircleTwoTone /> : <PlayCircleTwoTone />}
            />
          </div>
          <div style={{ flex: 20, paddingLeft: 10, paddingTop: 8 }}>
            <Slider
              size="large"
              disabled={false}
              step={1}
              max={maxDay}
              defaultValue={0}
              value={dateval}
              tipFormatter={getDate}
              onChange={(value) => {
                setDate(value);
              }}
            />
          </div>
        </div>
      </div>
      <Map
        cases={cases}
        deathsOrCases={deathsOrCases}
        perMillion={perMillion}
        title={setting.title}
        max={setting.max}
        datestr={date}
        width={960}
        height={500}
      />
    </div>
  );
}

export default App;
