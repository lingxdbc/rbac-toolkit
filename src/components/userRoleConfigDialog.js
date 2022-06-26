import { Fragment, Component } from 'react'
import FormControl from '@material-ui/core/FormControl';
import { Redirect } from "react-router";
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ListSubheader from '@material-ui/core/ListSubheader';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import { withStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import axios from 'axios'
import {union, getIntersect, getDifference} from '../common/utils/operators'

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
});

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
            <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
            </IconButton>
        ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

class UserRoleConfigDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataRealmConfigIsOpen: false,
            filterCompanyId: "",
            preFilterCompanyId: "",
            companies: [],
            dataRealmsDisabled: true,
            filterDataRealms: [],
            preFilterDataRealms: [],
            dataRealms: [],
            applicationsDisabled: true,
            filterApplicationId: "",
            filterApplicationType: "",
            filterApplicationName: "",
            applications: [],
            applicationIdToNameMap: {},
            roles: [],
            historyRoleObj: {},
            historyRoles: [],
            preHistoryRoles: []
        }
    }

    componentDidMount(){
        this.props.onRef(this)
    }

    render() {
        return (
            <Fragment>
                {this.state.redirect && <Redirect to="/login" /> }
                <Dialog maxWidth='lg' fullWidth={true} onClose={() => this.closeConfig()} aria-labelledby="customized-dialog-title" open={this.state.dataRealmConfigIsOpen} >
                    <DialogTitle id="customized-dialog-title" onClose={() => this.closeConfig()}>
                    DataRealm & Application
                    </DialogTitle>
                    <DialogContent dividers>
                        <FormControl variant="outlined" className="companies" style={{ width: '50%'}} >
                            <InputLabel>Company</InputLabel>
                            <Select
                                native
                                value={this.state.filterCompanyId}
                                onChange={(event) => {
                                    this.setCompany(event.target.value, false)
                                }}
                                label="Company List"
                            >
                                <option aria-label="None" value="" key={-1} />
                                { 
                                    this.state.companies.map((item, index) => {
                                        return (
                                            <option value={item.id} key={index} >{item.name}</option>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                        <Autocomplete
                            multiple
                            id="dataRealms"
                            options={this.state.dataRealms}
                            getOptionSelected={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option.full_path_name}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Realms"
                                    placeholder="Realms..."
                                />
                            )}
                            onChange={(event, value) => this.setDataRealms(value)}
                            value={this.state.filterDataRealms}
                            style={{ width: '50%', marginTop: 10 }}
                            disabled={this.state.dataRealmsDisabled}
                        />
                        <FormControl variant="outlined" className="applications" style={{ width: '50%', marginTop: 10, float: 'left', marginRight: 10 }} >
                            <InputLabel>Application</InputLabel>
                            <Select
                                native
                                value={this.state.filterApplicationId}
                                onChange={(event) => {
                                    this.setApplication(event)
                                }}
                                label="Application List"
                                disabled={this.state.applicationsDisabled}
                            >
                                <option aria-label="None" value="" key={-1} />
                                { 
                                    this.state.applications.map((item, index) => {
                                        return (
                                            <option value={item.id} at={item.application_type} key={index} >{item.name}</option>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                        <List subheader={<ListSubheader style={{  backgroundColor: '#d3d3d36b', padding: '3px 3px 3px 16px' }} >Role</ListSubheader>} component="div" disablePadding style={{ width: '49%', marginTop: 10, float: 'left', border: '1px solid #ccc', minHeight: 54, borderRadius: '4px' }}>
                            { this.state.roles.map((item, index) => {
                                return (
                                    <ListItem button key={item.index} style={{ borderBottom: '1px dotted #ccc' }} >
                                        <ListItemText primary={item.name} style={{ textAlign: 'left' }} />
                                        <ListItemSecondaryAction>
                                            <Checkbox
                                                color="primary"
                                                checked={this.state.roles[index].checked}
                                                onChange={(event) => this.setRole(index, event.target.checked)}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                )
                            }) }
                        </List>
                        <List id="historyRoles" component="div" disablePadding style={{ width: '100%', marginTop: 10, border: '1px solid #ccc', borderRadius: '4px', float: 'left' }}>
                            <ListItem key={-1} style={{  backgroundColor: '#d3d3d36b', borderBottom: '1px solid #ccc', color: 'rgba(0, 0, 0, 0.54)' }} >
                                <ListItemText primary="Application" style={{ textAlign: 'left' }} />
                                <ListItemSecondaryAction style={{ width: '48%' }} >
                                    <ListItemText primary="Role" style={{ textAlign: 'left', color: 'rgba(0, 0, 0, 0.54)' }} />
                                </ListItemSecondaryAction>
                            </ListItem>
                            { this.state.historyRoles.map((item, index) => {
                                let [, , applicationName, roleName] = item.split(" , ");
                                return (
                                    <ListItem button key={index} style={{ borderBottom: '1px dotted #ccc' }} >
                                        <ListItemText primary={applicationName} style={{ textAlign: 'left' }} />
                                        <ListItemSecondaryAction style={{ width: '48%' }} >
                                            <ListItemText primary={roleName} style={{ textAlign: 'left', float: 'left', padding: '8px 8px 8px 0px' }} />
                                            <IconButton aria-label="delete" style={{ float: 'right' }} onClick={() => this.deleteHistoryRole(item)} >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                )
                            }) }
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.submitConfig()} color="primary">
                            Save changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        )
    }

    async openConfig(index) {
        const self = this;
        if (self.props.filterUsers.length === 0) {
            return;
        }

        this.setState({
            filterCompanyId: "",
            preFilterCompanyId: "",
            filterDataRealms: [],
            preFilterDataRealms: [],
            filterApplicationId: "",
            filterApplicationType: "",
            filterApplicationName: "",
            roles: [],
            historyRoleObj: {},
            historyRoles: [],
            preHistoryRoles: [],
            dataRealmsDisabled: true,
            applicationsDisabled: true ,
            applications: []           
        })

        this.props.changeLoadingStatus(true);

        this.getCompanies();

        let dataRealmUsers = []
        if (index !== null) {
            const filterUser = this.props.filterUsers[index];
            dataRealmUsers.push(filterUser);

            //load user info
            // load user company
            await axios.get(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${filterUser.id}`, {
                params: {},
                headers: {'Authorization': `Bearer ${self.props.token}`}
            })
            .then(function (response) {
                const companyId = response.data.company_id;
                self.setState({
                    filterCompanyId: companyId,
                    preFilterCompanyId: companyId
                });
                self.setCompany(companyId, true, async () => {
                    // load user data realm
                    await axios.get(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${filterUser.id}/dataRealms`, {
                        params: {},
                        headers: {'Authorization': `Bearer ${self.props.token}`}
                    })
                    .then(function (response) {
                        self.setState({
                            dataRealmsDisabled: false,
                            filterDataRealms: response.data,
                            preFilterDataRealms: response.data,
                            applicationsDisabled: response.data.length === 0? true: false
                        }, () => {
                            // load user applications
                            self.getApplications(self.state.preFilterDataRealms, async () => {
                                // load user roles
                                await axios.get(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/userRoles/user/${filterUser.id}`, {
                                    params: {},
                                    headers: {'Authorization': `Bearer ${self.props.token}`}
                                })
                                .then(function (response) {
                                    const responseList = response.data;
                                    let roles = [];
                                    let historyRoleObj = {};
                                    let applicationId, applicationName, roleId, roleName, key;
                                    responseList.map((item, index) => {
                                        applicationId = item.application_id;
                                        if (self.state.applicationIdToNameMap.hasOwnProperty(applicationId)) {
                                            applicationName = self.state.applicationIdToNameMap[applicationId];
                                        }
                                        else {
                                            applicationName = "Unknown";
                                        }
                                        item.role.checked = true;
                                        item.role.index = index;
                                        item.role.application_id = applicationId;
                                        item.role.application_name = applicationName;
                                        roles.push(item.role);
                                        roleId = item.role_id;
                                        roleName = item.role.name;
                                        key = applicationId.concat(" , ").concat(roleId).concat(" , ").concat(applicationName).concat(" , ").concat(roleName);
                                        historyRoleObj[key] = [index, true];
                                        return historyRoleObj;
                                    });
                                    self.setState({
                                        roles: roles,
                                        historyRoleObj: historyRoleObj,
                                        historyRoles: Object.keys(historyRoleObj),
                                        preHistoryRoles: Object.keys(historyRoleObj),
                                    });
                                })
                                .catch(function (error) {
                                    self.setState({redirect: true});
                                })
                            });
                        });
                    })
                    .catch(function (error) {
                        self.setState({redirect: true});
                    })
                });
            })
            .catch(function (error) {
                self.setState({redirect: true});
            })
        }
        else {
            dataRealmUsers = [...this.props.filterUsers]
        }
        
        this.setState({
            dataRealmConfigIsOpen: true,
            dataRealmUsers: dataRealmUsers,
        })

        this.props.changeLoadingStatus(false);
    }

    closeConfig() {
        this.setState({
            dataRealmConfigIsOpen: false,
            dataRealmUsers: []
        })
    }

    async getCompanies() {
        const self = this;
        await axios.get(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/companies/list`, {
            params: {},
            headers: {'Authorization': `Bearer ${self.props.token}`}
        })
        .then(function (response) {
            self.setState({companies: response.data});
        })
        .catch(function (error) {
            self.setState({redirect: true});
        })
    }

    setCompany(companyId, isAuto, callback) {
        this.getDataRealms(companyId, isAuto, callback);
    }

    async getDataRealms(companyId, isAuto, callback) {
        const self = this;
        let url = `https://${self.props.domain}.aktana.com:443/rbac-api/v1/dataRealms?size=10000`;
        if (companyId !== "1d6fd740-f124-11e8-af7b-0202a94d0dec") {
            url = `https://${self.props.domain}.aktana.com:443/rbac-api/v1/dataRealms?companyId=${companyId}&size=10000`;
        }
        await axios.get(url, {
            params: {},
            headers: {'Authorization': `Bearer ${self.props.token}`}
        })
        .then(function (response) {
            let fdrObj = {};
            if (isAuto === false) {
                fdrObj["filterDataRealms"] = [];
            }
            self.setState({
                filterCompanyId: companyId,
                dataRealms: response.data.content,
                dataRealmsDisabled: false,
                ...fdrObj
            }, () => {
                if (callback) {
                    callback();
                }
            })
        })
        .catch(function (error) {
            self.setState({redirect: true});
        })        
    }

    setDataRealms(value) {
        let applicationsDisabled = true;
        if (value.length !== 0) {
            applicationsDisabled = false;
        }
        this.setState({
            filterDataRealms: value,
            applicationsDisabled: applicationsDisabled,
            applications: []
        })
        this.getApplications(value);
    }

    async getApplications(dataRealms, callback) {
        const self = this;
        let dataRealm;
        for (var i=0; i<dataRealms.length; i++) {
            dataRealm = dataRealms[i];
            await axios.get(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/dataRealms/${dataRealm.id}/applications`, {
                params: {},
                headers: {'Authorization': `Bearer ${self.props.token}`}
            })
            .then(function (response) {
                const applications = response.data
                const applicationIdToNameMap = {};
                applications.map((item, index) => {
                    applicationIdToNameMap[item.id] = item.name;
                    return applicationIdToNameMap;
                });
                const mergedApplicationIdToNameMap = {
                    ...self.state.applicationIdToNameMap,
                    ...applicationIdToNameMap
                };
                self.setState({
                    applications: union(self.state.applications, applications),
                    applicationIdToNameMap: mergedApplicationIdToNameMap
                }, () => {
                    if (callback) {
                        callback();
                    }
                })
            })
            .catch(function (error) {
                self.setState({redirect: true});
            })
        }
    }

    setApplication(event) {
        const self = this;
        self.setState({
            filterApplicationId: event.target.value,
            filterApplicationType: self.state.applications[event.target.options.selectedIndex - 1].application_type,
            filterApplicationName: self.state.applications[event.target.options.selectedIndex - 1].name
        }, () =>  {
            self.getRoles(self.state.filterApplicationType);
        })
    }

    async getRoles(applicationType) {
        const self = this;
        let roles = [];
        await axios.get(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/roles?applicationType=${applicationType}`, {
            params: {},
            headers: {'Authorization': `Bearer ${self.props.token}`}
        })
        .then(function (response) {
            roles = response.data.content;
            let key;
            for(var i=0; i<roles.length; i++) {
                key = self.state.filterApplicationId.concat(" , ").concat(roles[i].id).concat(" , ").concat(self.state.filterApplicationName).concat(" , ").concat(roles[i].name);
                if (self.state.historyRoleObj.hasOwnProperty(key)) {
                    roles[i].checked = self.state.historyRoleObj[key][1];
                }
                else {
                    roles[i].checked = false;
                }
                roles[i].index = i;
                roles[i].application_id = self.state.filterApplicationId;
                if (self.state.applicationIdToNameMap.hasOwnProperty(self.state.filterApplicationId)) {
                    roles[i].application_name = self.state.applicationIdToNameMap[self.state.filterApplicationId];
                }
                else {
                    roles[i].application_name = "Unknown";
                }
            }
            self.setState({
                roles: roles
            })
        })
        .catch(function (error) {
            self.setState({redirect: true});
        })
    }

    setRole(index, checked) {
        const roles = this.state.roles;
        roles[index].checked = checked;
        const filterApplicationId = roles[index].application_id;
        const filterApplicationName = roles[index].application_name;
        const key = filterApplicationId.concat(" , ").concat(this.state.roles[index].id).concat(" , ").concat(filterApplicationName).concat(" , ").concat(this.state.roles[index].name);
        let obj = {};
        if (checked === true && !this.state.historyRoleObj.hasOwnProperty(key)) {
            obj = this.state.historyRoleObj;
            obj[key] = [index, true];
        }
        else if (checked === false && this.state.historyRoleObj.hasOwnProperty(key)) {
            obj = this.state.historyRoleObj;
            delete obj[key];
        }
        
        this.setState({
            historyRoleObj: obj,
            roles: roles,
            historyRoles: Object.keys(obj)
        })
    }

    deleteHistoryRole(key) {
        const obj = this.state.historyRoleObj;
        const index = obj[key][0];
        delete obj[key];
        const roles = this.state.roles;
        roles[index].checked = false;
        this.setState({
            historyRoleObj: obj,
            roles: roles,
            historyRoles: Object.keys(obj)
        })
    }

    async submitConfig() {
        const self = this;
        
        const companyId = self.state.filterCompanyId;
        if (companyId !== self.state.preFilterCompanyId) {
            // assign company to users
            for (var i=0; i<self.props.filterUsers.length; i++) {
                let data = self.props.filterUsers[i];
                await axios.put(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${data.id}`, 
                    {
                        ...data,
                        company_id: companyId
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${self.props.token}`
                        }
                    }
                )
                .then(function (response) {
                    data.company_id = companyId;
                })
                .catch(function (error) {
                    console.log(error);
                })
            }
        }
        
        const intersectDataRealms = getIntersect(self.state.filterDataRealms, self.state.preFilterDataRealms);
        const deleteDataRealms = getDifference(self.state.preFilterDataRealms, intersectDataRealms);
        const putDataRealms = getDifference(self.state.filterDataRealms, intersectDataRealms);
        // assign data realm to users
        for (var j2=0; j2<self.props.filterUsers.length; j2++) {
            let data = self.props.filterUsers[j2];
            for (var i2=0; i2<putDataRealms.length; i2++) {
                let dataRealm = putDataRealms[i2];
                await axios.put(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${data.id}/dataRealms/${dataRealm.id}`, 
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${self.props.token}`
                        }
                    }
                )
                .catch(function (error) {
                    console.log(error);
                })
            }
            for (var i3=0; i3<deleteDataRealms.length; i3++) {
                let dataRealm = deleteDataRealms[i3];
                await axios.delete(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${data.id}/dataRealms/${dataRealm.id}`, 
                {
                    data: {},
                    headers: {
                        'Authorization': `Bearer ${self.props.token}`
                    }
                }
                )
                .catch(function (error) {
                    console.log(error);
                })
            }
        }

        const intersectHistoryRoles = getIntersect(self.state.historyRoles, self.state.preHistoryRoles);
        const deleteHistoryRoles = getDifference(self.state.preHistoryRoles, intersectHistoryRoles);
        const putHistoryRoles = getDifference(self.state.historyRoles, intersectHistoryRoles);
        // assign applications and roles to users
        for (var j3=0; j3<self.props.filterUsers.length; j3++) {
            let data = self.props.filterUsers[j3];
            for (var i4=0; i4<putHistoryRoles.length; i4++) {
                let historyRole = putHistoryRoles[i4];
                let [applicationId, roleId, , ] = historyRole.split(" , ");
                await axios.put(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${data.id}/applications/${applicationId}/roles/${roleId}`, 
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${self.props.token}`
                        }
                    }
                )
                .catch(function (error) {
                    console.log(error);
                })
            }
            for (var i5=0; i5<deleteHistoryRoles.length; i5++) {
                let historyRole = deleteHistoryRoles[i5];
                let [applicationId, roleId, , ] = historyRole.split(" , ");
                await axios.delete(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${data.id}/applications/${applicationId}/roles/${roleId}`, 
                {
                    data: {},
                    headers: {
                        'Authorization': `Bearer ${self.props.token}`
                    }
                }
                )
                .catch(function (error) {
                    console.log(error);
                })
            }
        }

        self.setState({
            dataRealmUsers: [],
            dataRealmConfigIsOpen: false,
            filterCompanyId: "",
            preFilterCompanyId: "",
            dataRealmsDisabled: true,
            filterDataRealms: [],
            preFilterDataRealms: [],
            dataRealms: [],
            applicationsDisabled: true,
            filterApplicationId: "",
            filterApplicationType: "",
            filterApplicationName: "",
            applications: [],
            roles: [],
            historyRoleObj: {},
            historyRoles: [],
            preHistoryRoles: []
        })
    }
}

export default UserRoleConfigDialog;
