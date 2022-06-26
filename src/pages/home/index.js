import { Fragment, Component } from 'react'
import { Redirect } from "react-router";
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import DehazeIcon from '@material-ui/icons/Dehaze';
import PortraitIcon from '@material-ui/icons/Portrait';
import axios from 'axios'
import './home.css'
import { logoutAction } from '../../common/action'
import UserRoleConfigDialog from '../../components/userRoleConfigDialog'
import UserProfileDialog from '../../components/userProfileDialog'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box>
            <Typography component={'div'}>{children}</Typography>
          </Box>
        )}
      </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: props.isLogin ? false : true,
            loading: true,
            users: [],
            filterUsers: [],
            tab: 0,
            mfa_all_enabled: false
        }
        if (props.token) {
            const self = this;
            axios.get(`https://${props.domain}.aktana.com:443/rbac-api/v1/users?size=1200`, {
                params: {},
                headers: {'Authorization': `Bearer ${props.token}`}
            })
            .then(function (response) {
                self.setState({
                    loading: false,
                    users: response.data.content
                });
            })
            .catch(function (error) {
                self.setState({redirect: true});
            })
        }
    }

    render() {
        return (
            <Fragment>
                {this.state.redirect && <Redirect to="/login" /> }
                <div className="P-home">
                    {this.state.loading && <Collapse in={this.state.loading} ><Alert severity="info" >Hello {this.props.username}. User data is loading...</Alert></Collapse>}
                    <AppBar position="static">
                        <Paper className="tabs">
                            <Tabs value={this.state.tab} onChange={(event, value) => this.setState({tab: value})} indicatorColor="primary" textColor="primary" centered >
                                <Tab label="RBAC" {...a11yProps(0)} />
                                <Tab label="Others" {...a11yProps(1)} disabled={true} />
                            </Tabs>
                            
                        </Paper>
                        <Button color = "default" id = "logout-button" style = {{ width: 100, position: 'absolute', height: 48, right: 10 }}
                                    onClick = {() => this.logout()} > Logout </Button>
                    </AppBar>
                    <TabPanel value={this.state.tab} index={0} style={{width: 1000, margin: '0 auto'}} >
                        <Autocomplete
                            multiple
                            id="users"
                            options={this.state.users}
                            getOptionLabel={(option) => option.username}
                            defaultValue={[this.state.users[0]]}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Choose all users"
                                    placeholder="Users..."
                                />
                            )}
                            onChange={(event, value) => this.setFilterUser(value)}
                            value={this.state.filterUsers}
                            style={{ margin: 10, width: 980 }}
                        />
                        <List id="filterUser" className="mfa" >
                            <ListItem key={0} style={{ borderBottom: '1px solid #ccc', backgroundColor: '#d3d3d36b' }} >
                                <ListItemText primary="Users" style={{ overflow: 'auto', margin: 'auto 10px auto auto', color: 'rgba(0, 0, 0, 0.54)' }} />
                                <ListItemSecondaryAction style={{ height: 41, width: 500 }} >
                                    <ListItemText primary="MFA" style={{ overflow: 'auto', margin: '8px 0px 8px 8px', color: 'rgba(0, 0, 0, 0.54)', float: 'left' }} />
                                    <Switch
                                        edge="end"
                                        onChange={(event) =>
                                            this.setMFA(null, event.target.checked)
                                        }
                                        checked={this.state.mfa_all_enabled}
                                        style={{color:'secondary'}}
                                    />
                                    <ListItemText primary="Batch Assign" style={{ overflow: 'auto', margin: '8px 0px 8px 120px', color: 'rgba(0, 0, 0, 0.54)', float: 'left' }} />
                                    <DehazeIcon onClick={() => this.openConfig(null)} style={{padding: 6, position: 'relative', float: 'left', top: 1, cursor: 'pointer', height: '28px' }} />
                                    <ListItemText primary="Profile" style={{ overflow: 'auto', margin: '8px 0px 8px 8px', color: 'rgba(0, 0, 0, 0.54)', float: 'right' }} />
                                    <AddCircleOutlineIcon style={{float: 'right', margin: '8px 0px 8px 8px',color: 'secondary', cursor: 'pointer' }}/>

                                </ListItemSecondaryAction>
                            </ListItem>
                            { this.state.filterUsers.map((item, index) => {
                                return (
                                    <ListItem key={item.id} style={{ borderBottom: '1px dotted #ccc' }} >
                                        <ListItemText primary={item.username} style={{ overflow: 'auto', margin: 'auto 50px auto auto' }} />
                                        <ListItemSecondaryAction style={{ width: 460 }}>
                                            <Switch
                                                edge="end"
                                                onChange={(event) =>
                                                    this.setMFA(index, event.target.checked)
                                                }
                                                checked={item.mfa_enabled}
                                            />
                                            <DehazeIcon onClick={() => this.openConfig(index)} style={{padding: 6, position: 'relative', float: 'left', marginLeft: 215, top: 1, height: '26px', cursor: 'pointer' }} />
                                            <PortraitIcon onClick={() => this.openProfile(index)} style={{padding: '6px 0px 6px 6px', position: 'relative', float: 'right', marginLeft: 100, top: 1, height: '26px', cursor: 'pointer' }} />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                )
                            }) }
                        </List>
                    </TabPanel>
                    <TabPanel value={this.state.tab} index={1} style={{width: 720, margin: '0 auto'}} >
                        Others Content
                    </TabPanel>
                    <UserRoleConfigDialog onRef={ref => this.userRoleConfigDialog = ref} changeLoadingStatus={(status) => this.setState({loading: status})} domain={this.props.domain} token={this.props.token} filterUsers={this.state.filterUsers} ></UserRoleConfigDialog>
                    <UserProfileDialog onRef={ref => this.userProfileDialog = ref} changeLoadingStatus={(status) => this.setState({loading: status})}  domain={this.props.domain} token={this.props.token} filterUsers={this.state.filterUsers} ></UserProfileDialog>
                </div>
            </Fragment>
        )
    }

    openConfig(index) {
        this.userRoleConfigDialog.openConfig(index);
    }

    logout() {
        this.props.sendLogout();
        this.setState({
            redirect: true
        })
    }

    async setMFA(index, status) {
        const self = this;
        for (var i=0; i<self.state.filterUsers.length; i++) {
            if (index !== null && index !== i) {
                continue;
            }
            let data = self.state.filterUsers[i];
            if (data.mfa_enabled !== status) {
                await axios.put(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${data.id}`, 
                    {
                        ...data,
                        mfa_enabled: status
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${self.props.token}`
                        }
                    }
                )
                .then(function (response) {
                    data.mfa_enabled = status;
                    self.setState({
                        filterUsers: self.state.filterUsers
                    }, () => {
                        self.setState({
                            mfa_all_enabled: self.checkMfaAllEnabled(self)
                        })
                    })
                })
                .catch(function (error) {
                    console.log(error);
                })
            }
        }
    }

    setFilterUser(value) {
        const self = this;
        this.setState({
            filterUsers: value
        }, () => {
            self.setState({
                mfa_all_enabled: self.checkMfaAllEnabled(self)
            })
        })
    }

    checkMfaAllEnabled(self) {
        let count = 0;
        for (var j=0; j<self.state.filterUsers.length; j++) {
            if (self.state.filterUsers[j].mfa_enabled === true) {
                count += 1;
            }
        }
        let enabled = false;
        if (count !== 0 && count === self.state.filterUsers.length) {
            enabled = true;
        }
        return enabled;
    }

    openProfile(index) {
        this.userProfileDialog.openProfile(index);
    }
}

const mapStateToProps = (state) => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        // dispatch one logoutAction
        sendLogout: ()=> {
            dispatch(logoutAction())
        }
    }
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Home);
