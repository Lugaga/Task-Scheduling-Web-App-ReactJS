import React, { Component } from "react";
import logo from "./logo.svg";
import taskApp from "./components/taskApp.js.js";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import "./App.css";

class App extends Component {
    render() {
        return ( <
            div >
            <
            MuiThemeProvider >
            <
            taskApp / >
            <
            /MuiThemeProvider>{" "} <
            /div>
        );
    }
}

export default App;