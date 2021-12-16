import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactLoading from "react-loading";
import { useStateValue } from "../../context";
import { Col, Row } from "reactstrap";
import { fireUrl } from "../../utils/url";
import { Route, withRouter } from "react-router-dom";

import { ToastProvider } from "react-toast-notifications";
import Home from "../../pages/home";
import Login from "../../pages/login";
import Merchants from "../../pages/merchant";
import Products from "../../pages/products";
import CartList from "../../pages/cart";
import checkout from "../../pages/checkout/checkout";
import ProductDetails from "../../pages/products/components/details";
import thankyou from "pages/thankyou/thankyou";

import { guest, login } from "../../context/auth/actions";
import { fbase } from "../../config/firebaseConfig";
import { loadItems } from "../../context/cart/actions";

const TheContent = () => {
  const [loading, setLoading] = useState(false);
  const [{ auth }, dispatch] = useStateValue();
  const cartListAPI = fireUrl("cart/");

  useEffect(() => {
    const fetchCartList = (phone) => {
      axios
        .get(cartListAPI + phone)
        .then((res) => {
          if (res.data.data) {
            dispatch({ ...loadItems(), items: res.data.data });
          } else {
            dispatch({ ...loadItems(), items: { cartId: phone } });
          }
        })
        .catch((error) => console.log(error));
    };

    fbase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        if (!auth.logged) {
          if (!loading) {
            setLoading(true);
            dispatch({ ...login(), phone: user.phoneNumber });
            fetchCartList(user.phoneNumber);
          }
        }
      } else {
        if (!loading) {
          setLoading(true);
          let guestId = sessionStorage.getItem("guest_id");
          if (!guestId) {
            guestId = "_" + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem("guest_id", guestId);
          }

          dispatch({ ...guest(), phone: guestId });
          fetchCartList(guestId);
        }
      }
    });
  }, [auth, loading, cartListAPI, dispatch]);

  return (
    <ToastProvider placement="top-right">
      <section className="features-boxed">
        <div className="menus-space container">
          {loading ? (
            <>
              <Route path="/checkout" exact component={checkout} />
              <Route path="/merchants" exact component={Merchants} />
              <Route path="/login" exact component={Login} />
              <Route path="/allproducts" exact component={Products} />
              <Route
                path="/merchant/:code/products"
                exact
                component={Products}
              />
              <Route path="/cart" exact component={CartList} />
              <Route path="/product/:sku" component={ProductDetails} />
              <Route path="/" exact component={Home} />
            </>
          ) : (
            <Row className="loader-row-wrapper align-items-center">
              <Col className="text-center">
                <ReactLoading
                  className="mx-auto"
                  type={"bars"}
                  color={"#000"}
                  height={100}
                  width={100}
                />
                <p>Getting things ready, Please wait...</p>
              </Col>
            </Row>
          )}
        </div>
      </section>
      <Route path="/thankyou" exact component={thankyou} />
    </ToastProvider>
  );
};

export default withRouter(TheContent);
