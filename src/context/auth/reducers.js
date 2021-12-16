import { GUEST, LOGIN, LOGOUT } from './actions';

export const INITIAL_STATE = {
  logged: false,
  phone: '',
};

export const authReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case LOGIN:
        return {
          logged: true,
          phone: action.phone
        };
      case GUEST:
        return { logged: false, phone: action.phone };
      case LOGOUT:
        return { logged: false, phone: '' };
      default:
        return state;
    }
}