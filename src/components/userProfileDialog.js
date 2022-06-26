import * as React from 'react';
import { Fragment, Component } from 'react'
import { Redirect } from "react-router";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import { withStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import axios from 'axios'
import Grid from '@material-ui/core/Grid';

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


class UserProfileDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ProfileConfigIsOpen: false,
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
            preHistoryRoles: [],
            selectedUser: {},
            redirect:false
        }
    }

    componentDidMount(){
        this.props.onRef(this)
    }


    render() {


        return (
            <Fragment>
                {this.state.redirect && <Redirect to="/login" /> }
                <Dialog maxWidth='sm' fullWidth={true} onClose={this.closeProfile.bind(this)} aria-labelledby="customized-dialog-title" open={this.state.ProfileConfigIsOpen} >
                    <DialogTitle id="customized-dialog-title" onClose={this.closeProfile.bind(this)}>
                    User Profile
                </DialogTitle>
                    <DialogContent dividers>
                        <div>
                            <Grid
                                container
                                direction="column"
                                justifyContent="center"
                                alignItems="flex-start"
                            >
                                <Grid item>
                                    <TextField
                                        id="user-firstName"
                                        label="First Name"
                                        style={{ width: 400, margin: 10}}

                                        defaultValue={this.state.selectedUser.first_name}
                                        variant="outlined"
                                        onChange={(event) =>
                                            this.setFieldValue("first_name", event.target.value)}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="user-lastName"
                                        label="Last Name"
                                        style={{ width: 400, margin: 10 }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        defaultValue={this.state.selectedUser.last_name}
                                        variant="outlined"
                                        onChange={(event) =>
                                            this.setLastNameValue(event.target.value)}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="user-languageKey"
                                        label="LanguageLocale Key"
                                        style={{ width: 400, margin: 10 }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        defaultValue={this.state.selectedUser.language_locale_key}
                                        variant="outlined"
                                        onChange={(event) =>
                                            this.setLastLanguageKey(event.target.value)}
                                    />

                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="user-externalId"
                                        label="External Id(repUID)"
                                        style={{ width: 400, margin: 10 }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        defaultValue={this.state.selectedUser.external_id}
                                        variant="outlined"
                                        onChange={(event) =>
                                            this.setExternalId(event.target.value)}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        disabled
                                        id="user-email"
                                        label="Email"
                                        style={{ width: 400, margin: 10 }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        defaultValue={this.state.selectedUser.email}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item >
                                    <TextField
                                        disabled
                                        id="user-username"
                                        label="User Name"
                                        style={{ width: 400, margin: 10}}
                                        defaultValue={this.state.selectedUser.username}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </div>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.submitProfile.bind(this)} color="primary">
                            Save changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        )
    }

    async openProfile(index) {
        const self = this;
        if (self.props.filterUsers.length === 0) {
            return;
        }

        const filterUser = this.props.filterUsers[index];


        this.setState({
            ProfileConfigIsOpen: true,
            selectedUser: filterUser,
        })


    }

    closeProfile() {
        this.setState({
            ProfileConfigIsOpen: false,
            selectedUser: {}
        })
    }


    setFieldValue(key, value) {
        const selectedUser = this.state.selectedUser
        selectedUser[key] = value
        this.setState({
            selectedUser: selectedUser
        })
    }


    async submitProfile() {
        const self = this;
        let data = self.state.selectedUser;
        console.log("debug", data)

        await axios.put(`https://${self.props.domain}.aktana.com:443/rbac-api/v1/users/${data.id}`,
            {...data,
                first_name: self.state.selectedUser.first_name,
                last_name: self.state.selectedUser.last_name,
                language_locale_key: self.state.selectedUser.language_locale_key,
                external_id: self.state.selectedUser.external_id
            },
            {
                headers: {
                    'Authorization': `Bearer ${self.props.token}`
                }
            }
        )
            .then(function (response) {

            })
            .catch(function (error) {
                console.log(error);
                self.setState({redirect: true});
            })

        self.setState({
            dataRealmUsers: [],
            ProfileConfigIsOpen: false,
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

export default UserProfileDialog;
