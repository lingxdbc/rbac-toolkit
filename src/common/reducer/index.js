// reducer/index.js
const userStorage = localStorage.getItem('user');
const user = JSON.parse(userStorage);
const initialState = user ? {
  isLogin: true,
  username: user.username,
  domain: user.domain,
  token: user.token
} : {
  isLogin: false,
  username: "",
  domain: "",
  token: ""
}

const reducer = (state = initialState, action)=> {
  switch (action.type) {
    case 'LOGIN':
      const user = {
        username: action.payload.username,
        domain: action.payload.domain,
        token: action.payload.token
      };
      localStorage.setItem('user', JSON.stringify(user));
      return {
        ...state,
        isLogin: true,
        ...user
      }
    case 'LOGOUT':
      localStorage.clear();
      return {
        ...state,
        isLogin: false,
        username: "",
        domain: "",
        token: ""
      }
    default:
      return state
  }
}

export default reducer;
