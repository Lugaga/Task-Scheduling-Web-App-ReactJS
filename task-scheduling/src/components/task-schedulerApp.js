import React, { Component } from "react";
import AppBar from "material-ui/AppBar";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import moment from "moment";
import DatePicker from "material-ui/DatePicker";
import Dialog from "material-ui/Dialog";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import TextField from "material-ui/TextField";
import SnackBar from "material-ui/Snackbar";
import Card from "material-ui/Card";
import { Step, Stepper, StepLabel, StepContent } from "material-ui/Stepper";
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";
import axios from "axios";

const API_BASE = "https://cstonboarding.azurewebsites.net";

class taskApp extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            task_id: 23116,
            customer_first_name: "Grace",
            personnel_first_name: "John",
            personnel_other_name: "Otieno",
            customer_last_name: null,
            customer_phone: "+254729302372",
            agentId: 1983,
            assigned: "2019-06-27T07:42:02.000Z",
            in_progress: "2019-06-27T08:01:20.000Z",
            completed: "2019-06-27T08:01:57.000Z",
            deferred: null,
            status: "Completed",
            location: "chaka",
            gender: "Male",
            age: 40,
            access_code: 1,
            splash_page: 1,
            mpesa: 1,
            autoplay: 1,
            comments: "",
            registration: "Self"
        };
    }
    componentWillMount() {
        axios.get(API_BASE + `api/retrieveTasks`).then(response => {
            console.log("response via db: ", response.data);
            this.handleDBReponse(response.data);
        });
    }
    handleSettaskAssigned(assigned) {
        this.setState({ taskAssigned: assigned, confirmationTextVisible: true });
    }

    handleSettaskIn_progress(in_progress) {
        this.setState({ taskIn_progress: in_progress });
    }
    handleSettaskCompleted(completed) {
        this.setState({ taskCompleted: completed });
    }
    handleSubmit() {
        this.setState({ confirmationModalOpen: false });
        const newtask = {
            name: this.state.firstName + " " + this.state.lastName,
            email: this.state.email,
            phone: this.state.phone,
            slot_date: moment(this.state.taskDate).format("YYYY-DD-MM"),
            slot_time: this.state.taskSlot
        };
        axios
            .post(API_BASE + "api/taskCreate", newtask)
            .then(response =>
                this.setState({
                    confirmationSnackbarMessage: "task succesfully added!",
                    confirmationSnackbarOpen: true,
                    processed: true
                })
            )
            .catch(err => {
                console.log(err);
                return this.setState({
                    confirmationSnackbarMessage: "task failed to save.",
                    confirmationSnackbarOpen: true
                });
            });
    }

    handleNext = () => {
        const { stepIndex } = this.state;
        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 2
        });
    };

    handlePrev = () => {
        const { stepIndex } = this.state;
        if (stepIndex > 0) {
            this.setState({ stepIndex: stepIndex - 1 });
        }
    };
    validateEmail(email) {
        const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return regex.test(email) ?
            this.setState({ email: email, validEmail: true }) :
            this.setState({ validEmail: false });
    }
    validatePhone(phoneNumber) {
        const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return regex.test(phoneNumber) ?
            this.setState({ phone: phoneNumber, validPhone: true }) :
            this.setState({ validPhone: false });
    }
    checkDisableDate(day) {
        const dateString = moment(day).format("YYYY-DD-MM");
        return (
            this.state.schedule[dateString] === true ||
            moment(day)
            .startOf("day")
            .diff(moment().startOf("day")) < 0
        );
    }

    handleDBReponse(response) {
        const tasks = response;
        const today = moment().startOf("day"); //start of today 12 am
        const initialSchedule = {};
        initialSchedule[today.format("YYYY-DD-MM")] = true;
        const schedule = !tasks.length ?
            initialSchedule :
            tasks.reduce((currentSchedule, task) => {
                const { slot_date, slot_time } = task;
                const dateString = moment(slot_date, "YYYY-DD-MM").format(
                    "YYYY-DD-MM"
                );
                !currentSchedule[slot_date] ?
                    (currentSchedule[dateString] = Array(8).fill(false)) :
                    null;
                Array.isArray(currentSchedule[dateString]) ?
                    (currentSchedule[dateString][slot_time] = true) :
                    null;
                return currentSchedule;
            }, initialSchedule);

        for (let day in schedule) {
            let slots = schedule[day];
            slots.length ?
                slots.every(slot => slot === true) ?
                (schedule[day] = true) :
                null :
                null;
        }

        this.setState({
            schedule: schedule
        });
    }
    rendertaskConfirmation() {
        const spanStyle = { color: "#40E0D0" };
        return ( <
            section >
            <
            p >
            Name: { " " } <
            span style = { spanStyle } > { " " } { this.state.firstName } { this.state.lastName } { " " } <
            /span>{" "} <
            /p>{" "} <
            p >
            Number: < span style = { spanStyle } > { this.state.phone } < /span>{" "} <
            /p>{" "} <
            p >
            Email: < span style = { spanStyle } > { this.state.email } < /span>{" "} <
            /p>{" "} <
            p >
            task: { " " } <
            span style = { spanStyle } > { " " } { moment(this.state.taskDate).format("dddd[,] MMMM Do[,] YYYY") } { " " } <
            /span>{" "}
            at { " " } <
            span style = { spanStyle } > { " " } {
                moment()
                    .hour(9)
                    .minute(0)
                    .add(this.state.taskSlot, "hours")
                    .format("h:mm a")
            } { " " } <
            /span>{" "} <
            /p>{" "} <
            /section>
        );
    }
    rendertaskTimes() {
        if (!this.state.isLoading) {
            const slots = [...Array(8).keys()];
            return slots.map(slot => {
                const taskDateString = moment(this.state.taskDate).format("YYYY-DD-MM");
                const time1 = moment()
                    .hour(9)
                    .minute(0)
                    .add(slot, "hours");
                const time2 = moment()
                    .hour(9)
                    .minute(0)
                    .add(slot + 1, "hours");
                const scheduleDisabled = this.state.schedule[taskDateString] ?
                    this.state.schedule[
                        moment(this.state.taskDate).format("YYYY-DD-MM")
                    ][slot] :
                    false;
                const meridiemDisabled = this.state.taskMeridiem ?
                    time1.format("a") === "am" :
                    time1.format("a") === "pm";
                return ( <
                    RadioButton label = { time1.format("h:mm a") + " - " + time2.format("h:mm a") }
                    key = { slot }
                    value = { slot }
                    style = {
                        {
                            marginBottom: 15,
                            display: meridiemDisabled ? "none" : "inherit"
                        }
                    }
                    disabled = { scheduleDisabled || meridiemDisabled }
                    />
                );
            });
        } else {
            return null;
        }
    }

    renderStepActions(step) {
        const { stepIndex } = this.state;

        return ( <
            div style = {
                { margin: "12px 0" } } >
            <
            RaisedButton label = { stepIndex === 2 ? "Finish" : "Next" }
            disableTouchRipple = { true }
            disableFocusRipple = { true }
            primary = { true }
            onClick = { this.handleNext }
            backgroundColor = "#40E0D0 !important"
            style = {
                { marginRight: 12, backgroundColor: "#40E0D0" } }
            />{" "} {
                step > 0 && ( <
                    FlatButton label = "Back"
                    disabled = { stepIndex === 0 }
                    disableTouchRipple = { true }
                    disableFocusRipple = { true }
                    onClick = { this.handlePrev }
                    />
                )
            } { " " } <
            /div>
        );
    }

    render() {
        const {
            finished,
            isLoading,
            smallScreen,
            stepIndex,
            confirmationModalOpen,
            confirmationSnackbarOpen,
            ...data
        } = this.state;
        const contactFormFilled =
            data.firstName &&
            data.lastName &&
            data.phone &&
            data.email &&
            data.validPhone &&
            data.validEmail;
        const DatePickerExampleSimple = () => ( <
            div >
            <
            DatePicker hintText = "Select Date"
            mode = { smallScreen ? "portrait" : "landscape" }
            onChange = {
                (n, date) => this.handleSettaskDate(date) }
            shouldDisableDate = { day => this.checkDisableDate(day) }
            />{" "} <
            /div>
        );
        const modalActions = [ <
            FlatButton
            label = "Cancel"
            primary = { false }
            onClick = {
                () => this.setState({ confirmationModalOpen: false }) }
            />, <
            FlatButton
            label = "Confirm"
            style = {
                { backgroundColor: "#40E0D0 !important" } }
            primary = { true }
            onClick = {
                () => this.handleSubmit() }
            />
        ];
        return ( <
            div >
            <
            AppBar title = "task Scheduler"
            iconClassNameRight = "muidocs-icon-navigation-expand-more" /
            >
            <
            section style = {
                {
                    maxWidth: !smallScreen ? "80%" : "100%",
                    margin: "auto",
                    marginTop: !smallScreen ? 20 : 0
                }
            } >
            <
            Card style = {
                {
                    padding: "12px 12px 25px 12px",
                    height: smallScreen ? "100vh" : null
                }
            } >
            <
            Stepper activeStep = { stepIndex }
            orientation = "vertical"
            linear = { false } >
            <
            Step >
            <
            StepLabel > Choose an available day
            for your task < /StepLabel>{" "} <
            StepContent > { " " } { DatePickerExampleSimple() } { this.renderStepActions(0) } { " " } <
            /StepContent>{" "} <
            /Step>{" "} <
            Step disabled = {!data.taskDate } >
            <
            StepLabel > Choose an available time
            for your task < /StepLabel>{" "} <
            StepContent >
            <
            SelectField floatingLabelText = "AM/PM"
            value = { data.taskMeridiem }
            onChange = {
                (evt, key, payload) =>
                this.handleSettaskMeridiem(payload)
            }
            selectionRenderer = { value => (value ? "PM" : "AM") } >
            <
            MenuItem value = { 0 }
            primaryText = "AM" / >
            <
            MenuItem value = { 1 }
            primaryText = "PM" / >
            <
            /SelectField>{" "} <
            RadioButtonGroup style = {
                {
                    marginTop: 15,
                    marginLeft: 15
                }
            }
            name = "taskTimes"
            defaultSelected = { data.taskSlot }
            onChange = {
                (evt, val) => this.handleSettaskSlot(val) } >
            { " " } { this.rendertaskTimes() } { " " } <
            /RadioButtonGroup>{" "} { this.renderStepActions(1) } { " " } <
            /StepContent>{" "} <
            /Step>{" "} <
            Step >
            <
            StepLabel >
            Share your contact information with us and we 'll send you a
            reminder { " " } <
            /StepLabel>{" "} <
            StepContent >
            <
            p >
            <
            section >
            <
            TextField style = {
                { display: "block" } }
            name = "first_name"
            hintText = "First Name"
            floatingLabelText = "First Name"
            onChange = {
                (evt, newValue) =>
                this.setState({ firstName: newValue })
            }
            />{" "} <
            TextField style = {
                { display: "block" } }
            name = "last_name"
            hintText = "Last Name"
            floatingLabelText = "Last Name"
            onChange = {
                (evt, newValue) =>
                this.setState({ lastName: newValue })
            }
            />{" "} <
            TextField style = {
                { display: "block" } }
            name = "email"
            hintText = "youraddress@mail.com"
            floatingLabelText = "Email"
            errorText = {
                data.validEmail ? null : "Enter a valid email address"
            }
            onChange = {
                (evt, newValue) =>
                this.validateEmail(newValue)
            }
            />{" "} <
            TextField style = {
                { display: "block" } }
            name = "phone"
            hintText = "+2348995989"
            floatingLabelText = "Phone"
            errorText = {
                data.validPhone ? null : "Enter a valid phone number"
            }
            onChange = {
                (evt, newValue) =>
                this.validatePhone(newValue)
            }
            />{" "} <
            RaisedButton style = {
                { display: "block", backgroundColor: "#40E0D0" } }
            label = {
                contactFormFilled ?
                "Schedule" :
                    "Fill out your information to schedule"
            }
            labelPosition = "before"
            primary = { true }
            fullWidth = { true }
            onClick = {
                () =>
                this.setState({
                    confirmationModalOpen: !this.state
                        .confirmationModalOpen
                })
            }
            disabled = {!contactFormFilled || data.processed }
            style = {
                { marginTop: 20, maxWidth: 100 } }
            />{" "} <
            /section>{" "} <
            /p>{" "} { this.renderStepActions(2) } { " " } <
            /StepContent>{" "} <
            /Step>{" "} <
            /Stepper>{" "} <
            /Card>{" "} <
            Dialog modal = { true }
            open = { confirmationModalOpen }
            actions = { modalActions }
            title = "Confirm your task" >
            { " " } { this.rendertaskConfirmation() } { " " } <
            /Dialog>{" "} <
            SnackBar open = { confirmationSnackbarOpen || isLoading }
            message = {
                isLoading ? "Loading... " : data.confirmationSnackbarMessage || ""
            }
            autoHideDuration = { 10000 }
            onRequestClose = {
                () =>
                this.setState({ confirmationSnackbarOpen: false })
            }
            />{" "} <
            /section>{" "} <
            /div>
        );
    }
}
export default taskApp;