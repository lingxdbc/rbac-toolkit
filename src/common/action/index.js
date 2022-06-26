// actions/index.js
export const loginAction = (domain, token, username) => {
    return {
        type: 'LOGIN',
        payload: {
            domain, 
            token,
            username
        }
    }
}

export const logoutAction = () => {
    return {
        type: 'LOGOUT'
    }
}