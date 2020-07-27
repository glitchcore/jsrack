import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/snippets/javascript";

function Module(props) {
    const [code, set_code] = useState("");
    useEffect(() => {set_code(props.code)}, [props.code]);

    return <div className="module">
        <AceEditor
            mode="javascript"
            maxLines={Infinity}
            onChange={value => set_code(value)}
            value={code}
        />
    </div>
}


function io(args) {
    return {
        output: (t, dt, opts) => [],
        execute: (t, dt, opts) => {
            // call this to make sound
            let [left, right] = [0.,0.];

            if(args?.input) {
                [left, right] = args.input(t, dt, opts);
            }

            console.log("io left:", left, "right:", right);

            return [left, right];
        }
    };
}

function executor(io_execute) {
    const INTERVAL = 1000;
    let last_time = NaN;

    let proc = setInterval(() => {
        let time = Date.now();

        if(last_time !== NaN) {
            let [left, right] = io_execute(time, time - last_time, {});

            // do something with audio sample
        }

        last_time = time;
    }, INTERVAL);

    return proc;
}

function App() {

    const [modules, set_modules] = useState([
        {code: `function Test({}) {
    return {
        output: (t, dt, opts) => [0.42,-0.1337]
    };
}

let test = Test({});
let execute = env.io({input: test.output}).execute;

return {execute}`}
    ]);

    const [play_state, set_play_state] = useState(null);

    function play_stop(state) {
        let io_execute = modules
        .map(item => item.code)
        .reduce((ctx, item) => ({...new Function("env", item)(ctx), ...ctx}), {io})
        .execute;

        if(state) {
            set_play_state(executor(io_execute));
        } else {
            clearInterval(play_state);
            set_play_state(null);
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                js rack
            </header>

            <div className="controls">
                <button
                    onClick={() => play_stop(!play_state)}
                >
                    {play_state !== null ? "остановить" : "запустить"}
                </button>
            </div>

            <div className="modules">
                {modules.map((item, id) => <Module key={id} code={item.code} />)}
            </div>

            <div className="adder">
                <button
                    onClick={() => set_modules([...modules, {code: ""}])}
                >
                    Добавить модуль
                </button>
            </div>
        </div>
    );
}

export default App;
