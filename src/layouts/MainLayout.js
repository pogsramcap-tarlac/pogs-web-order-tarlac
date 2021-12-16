import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, withRouter } from "react-router-dom";
import StateContextProvider from "../context";
import reducers from "../context/reducers";

import TheContent from "./components/content";
import TheHeader from "./components/header";

import { INITIAL_STATE as AUTH_INITIAL_STATE } from "../context/auth/reducers";
import { INITIAL_STATE as CART_INITIAL_STATE } from "../context/cart/reducers";

const TheLayout = () => {
  const initialState = {
    auth: AUTH_INITIAL_STATE,
    cart: CART_INITIAL_STATE,
  };

  return (
    <StateContextProvider initialState={initialState} reducer={reducers}>
      <Router>
        <>
          <TheHeader />
          <TheContent />
        </>
      </Router>
    </StateContextProvider>
  );
};

export default withRouter(TheLayout);
