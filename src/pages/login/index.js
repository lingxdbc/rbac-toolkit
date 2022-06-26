import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loginAction } from '../../common/action'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import axios from 'axios'
import './login.css'

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            environment: "qa",
            username: "",
            password: "",
            alert: "",
            open: false
        };
    }
    
    render() {
        return (
            <div className="P-login" >
                {this.state.alert && <Collapse in={this.state.open} ><Alert severity="error" onClose={() => this.setState({open: false})} >{this.state.alert}</Alert></Collapse> }
                <h1>RBAC Toolkit</h1>
                <form className="login-form" noValidate autoComplete="off" style={{ margin: 30 }}>
                    <Grid
                        container
                        spacing={2}
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Grid item >
                            <Select
                                labelId="login-environment"
                                id="login-environment"
                                value={this.state.environment}
                                onChange={(event) => this.setState({environment: event.target.value})}
                                label="Environment"
                                style={{ width: 400 }}
                            >
                                <MenuItem value="qa">Environment: QA</MenuItem>
                                <MenuItem value="dev">Environment: Dev</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item >
                            <TextField id="login-username" label="Username" variant="outlined" style={{ width: 400 }} 
                            onChange={(event) =>
                                this.setState({username: event.target.value})
                            } value={this.state.username} />
                        </Grid>
                        <Grid item >
                            <TextField id="login-password" type="password" label="Password" variant="outlined" style={{ width: 400 }} 
                            onChange={(event) =>
                                this.setState({password: event.target.value})
                            } value={this.state.password} />
                        </Grid>
                        <Grid item >
                            <Button variant="contained" color="primary" id="login-button" style={{ margin: 10 }} onClick={() => this.login()}>Login</Button>
                        </Grid>
                    </Grid>
                </form>
            </div>
        )
    }
    async login() {
        let domain, token;
        if (this.state.environment === "qa") {
            domain = "aimqa-api";
          }
        else if (this.state.environment === "dev") {
            domain = "aimdev-api";
        }
        await axios.post(`https://${domain}.aktana.com:443/rbac-api/v1/authentication`, {
            "client_id": "rbac-service",
            "grant_type": "password",
            "username": this.state.username,
            "password": this.state.password
        })
        .then(function (response) {
            token = response.data.access_token;
        })
        .catch(function (error) {
            console.log(error);
        })
        if (token !== undefined && token !== null) {
            this.props.sendLogin(domain, token, this.state.username);
            this.props.history.push('/home');
        }
        else {
            this.setState({
                username: "",
                password: "",
                alert: "Your username or password is incorrect, please try again !",
                open: true
            })
        }
    }
}

const mapDispatchToProps = dispatch => {
    return {
      // dispatch one loginAction
      sendLogin: (domain, token, username)=> {
        dispatch(loginAction(domain, token, username))
      }
    }
}
  
export default connect(null, mapDispatchToProps)(Login);