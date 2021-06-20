import "./App.css";
import { useState } from "react";
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  milliseconds: "numeric",
};

const raceInitialData = {
  start: "",
  competitors: [],
  totalFastest: function () {
    const maxLap = Math.max(...this.competitors.map((item) => item.lapCount()));
    const fastest = this.competitors.length
      ? this.competitors
          ?.filter((item) => item.lapCount() === maxLap)
          ?.reduce((acc, item) =>
            acc.totalTime() < item.totalTime() ? acc : item
          )
      : "";
    return fastest;
  },
  lapFastest: function () {
    const fastestLap = this.competitors.length
      ? this.competitors.reduce((acc, item) =>
          acc.fastestLapTime() < item.fastestLapTime() ? acc : item
        )
      : "";
    return fastestLap;
  },
};
const competitorInitialData = {
  name: "",
  laps: [],
  lapCount: function () {
    return this?.laps?.length || 0;
  },
  totalTime: function () {
    return this?.laps?.reduce((acc, item) => acc + item?.lapTime, 0) || 0;
  },
  averageTime: function () {
    return this?.totalTime() / this?.lapCount() || 0;
  },
  lastLapTime: function () {
    return this?.laps[this?.lapCount() - 1]?.lapTime || 0;
  },
  fastestLapTime: function () {
    return this?.laps.length
      ? Math.min(...this?.laps?.map((item) => item.lapTime))
      : 0;
  },
};

function App() {
  const [race, setRace] = useState({ ...raceInitialData });
  const [inputData, setInputData] = useState("");
  const [isEndRace, setIsEndRace] = useState(false);

  const formatTime = (time) => {
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    const milliseconds = Math.floor(time % 1000);
    return `${minutes ?? 0}:${seconds ?? 0}.${milliseconds ?? 0}`;
  };

  const addCompetitor = () => {
    const competitor = { ...competitorInitialData, name: inputData };
    const tempRace = { ...race };
    tempRace.competitors.push(competitor);
    setRace(tempRace);
    setInputData("");
  };
  const addLap = (index) => {
    const tempRace = { ...race };
    const length = tempRace.competitors[index].laps.length;
    tempRace.competitors[index].laps = [
      ...tempRace.competitors[index].laps,
      {
        lapNo: length + 1,
        lapTime: length
          ? new Date().getTime() -
            tempRace.start -
            tempRace.competitors[index].totalTime()
          : new Date().getTime() - tempRace.start,
      },
    ];
    setRace(tempRace);
  };

  const handleChange = (e) => setInputData(e.target.value);

  const startRace = () => {
    if (!race.competitors.length) {
      alert("No runner has been added yet!");
      return;
    }
    const tempRace = { ...race };
    tempRace.start = new Date().getTime();
    setRace(tempRace);
  };

  const endRace = () => {
    if (!race.start) {
      alert("Race has not started yet!");
      return;
    }
    setIsEndRace(true);
    race?.lapFastest();
    race?.totalFastest();
  };
  const statistics = () => {
    const totalFastest = race?.totalFastest();
    const lapFastest = race?.lapFastest();
    if (!isEndRace || !totalFastest || !lapFastest) return "";
    return (
      <div className="table">
        <strong>{totalFastest?.name}</strong> has the highest lap count and
        lowest overall time.
        <br />
        <strong>Name :</strong> {totalFastest?.name} <br />
        <strong>The Total Lap :</strong> {totalFastest?.lapCount()} <br />
        <strong>The Total Laps Time :</strong>{" "}
        {formatTime(totalFastest?.totalTime())}
        <br />
        <br />
        <strong>{lapFastest?.name} </strong>has the fastest (completed) lap
        time.
        <br />
        <strong>Name :</strong> {lapFastest?.name} <br />
        <strong>The Fastest Lap Time :</strong>{" "}
        {formatTime(lapFastest?.fastestLapTime())}
        <br />
      </div>
    );
  };
  return (
    <div className="App">
      <h1 className="title">Multi Runner Lap Time Tracker</h1>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Lap Count</th>
            <th scope="col">Total Time</th>
            <th scope="col">Average Time</th>
            <th scope="col">Last Lap Time</th>
          </tr>
        </thead>
        <tbody>
          {race?.competitors?.map((competitor, index) => {
            return (
              <tr key={index}>
                <th scope="row">
                  <button
                    disabled={isEndRace || !race.start}
                    onClick={() => addLap(index)}
                    type="button"
                    className="btn btn-lap"
                  >
                    {competitor?.name}
                  </button>
                </th>
                <td>{competitor?.lapCount()}</td>
                <td>{formatTime(competitor?.totalTime())}</td>
                <td>{formatTime(competitor?.averageTime())}</td>
                <td>{formatTime(competitor?.lastLapTime())}</td>
              </tr>
            );
          }) ?? <tr></tr>}
        </tbody>
        <tfoot>
          <tr className="footer">
            <td colSpan="5">
              <span className="item">1Km Timer</span>

              <input
                className="form-control form-control-sm inputName item"
                type="text"
                placeholder="Enter a competitor name"
                aria-label="Name"
                value={inputData}
                onChange={handleChange}
                disabled={isEndRace || race.start}
              />
              <button
                disabled={isEndRace || !inputData || race.start}
                onClick={addCompetitor}
                type="button"
                className="btn btn-primary addName"
              >
                Add Name
              </button>
              <button
                disabled={isEndRace || race.start}
                onClick={startRace}
                type="button"
                className="btn btn-success item"
              >
                Start Race
              </button>
              <button
                disabled={isEndRace}
                onClick={endRace}
                type="button"
                className="btn btn-danger item"
              >
                End Race
              </button>
              <span>
                {race.start
                  ? `${new Date(race.start).toLocaleDateString(
                      "en-UK",
                      options
                    )}`
                  : ""}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
      {statistics()}
    </div>
  );
}

export default App;
