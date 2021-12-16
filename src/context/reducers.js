import { authReducer } from "./auth/reducers";
import { cartReducer } from "./cart/reducers";

// eslint-disable-next-line
export default ({ auth, cart, map }, action) => ({
  auth: authReducer(auth, action),
  cart: cartReducer(cart, action),
});
