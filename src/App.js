import "./App.css";
import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { Slider, Button } from "antd";
import Map from "./Map.jsx";
import "antd/dist/antd.css";
import { PlayCircleTwoTone, PauseCircleTwoTone } from "@ant-design/icons";
let oldVal;

function getDate(dateval) {
  const date = new Date(new Date(2020, 3, 16).getTime() + dateval * 86400000);
  const datestr = new Intl.DateTimeFormat("en-US")
    .format(date)
    .replace("2020", "20");
  return datestr;
}

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

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
  const date = useMemo(() => getDate(dateval), [dateval]);

  const [cases, setCases] = useState({});
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    async function loadData() {
      const data = await import(`./cases.json`);
      const date = Object.keys(data).slice(-2)[0];
      setMaxDay(
        Math.floor(
          (new Date(date) - new Date(2020, 3, 16).getTime()) / 86400000
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
        setDateval(dateval + 1);
      }, 500);

      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer.current);
    } else {
      clearTimeout(timer);
      timer.current = null;
    }
  }, [playing, dateval]);

  const size = useWindowSize();
  return (
    <div className="App">
      <div>
        <span style={{ fontSize: 30, fontWeight: "bold" }}>{date}</span>
        <div style={{ display: "flex", paddingRight: 50, paddingLeft: 50 }}>
          <div style={{ flex: 1 }}>
            <Button
              size="large"
              onClick={() => setPlaying(!playing)}
              icon={playing ? <PauseCircleTwoTone /> : <PlayCircleTwoTone />}
            />
          </div>
          <div style={{ flex: 30, paddingLeft: 10 }}>
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
        datestr={date}
        width={size[0]}
        height={size[1] - 100}
      />
    </div>
  );
}

export default App;
