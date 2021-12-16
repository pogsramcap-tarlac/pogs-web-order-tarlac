import React, { useEffect, useState } from "react";
import "firebaseui/dist/firebaseui.css";
import "../../assets/css/phoneAuth.css";

import useLogin from "../../context/auth/hooks/useLogin";
import { Col, Container, Row } from "reactstrap";
import logo from "../../assets/images/logo/logo.png";
import * as firebaseui from "firebaseui";
import { fbase, auth } from "../../config/firebaseConfig";
import { withRouter } from "react-router-dom";
import { useStateValue } from "../../context";
import axios from "axios";
import { loadItems } from "../../context/cart/actions";
import { fireUrl } from "../../utils/url";

const Login = ({ location, history }) => {
  const { from } = location.state || { from: { pathname: "/" } };
  const [{ cart }, dispatch] = useStateValue();
  const [userauth, setLogin] = useLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const cartListAPI = fireUrl("cart/");

  useEffect(() => {
    const fetchCartList = (phone) => {
      axios
        .get(cartListAPI + phone)
        .then((res) => {
          dispatch({ ...loadItems(), items: res.data.data });
        })
        .catch((error) => console.log(error));
    };

    if (!pageLoaded) {
      setPageLoaded(true);
      if (!userauth.logged) {
        let ui = "";
        const uiConfig = {
          signInOptions: [
            {
              provider: fbase.auth.PhoneAuthProvider.PROVIDER_ID,
              recaptchaParameters: {
                type: "image",
                size: "normal",
                badge: "bottomleft",
              },
              defaultCountry: "PH",
            },
          ],
          callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => {
              if (!isLoading) {
                setIsLoading(true);
                let values = {
                  authenticated: true,
                  phone: authResult.user.phoneNumber,
                };
                setLogin({ values });

                console.log(cart);
                // if cart is not empty we need to move it first
                if (cart.items.length > 0) {
                  let cartCheck = new Promise((resolve, reject) => {
                    cart.items.forEach((item, index, array) => {
                      let payload = {
                        productName: item.productName,
                        merchantCode: item.merchantCode,
                        productSKU: item.productSKU,
                        productImage: item.productImage,
                        productCode: item.productCode,
                        price: item.price,
                        merchant: item.merchant,
                        productQty: item.productQty,
                        clientFullname: item.clientFullname,
                        clientAddress: item.clientAddress,
                        clientPhoneNumber: authResult.user.phoneNumber,
                      };

                      axios
                        .delete(
                          "https://us-central1-dev-pogsph-v100.cloudfunctions.net/merchant/deleteCart/" +
                            item.cartId
                        )
                        .then((res) => {
                          axios
                            .post(
                              "https://us-central1-dev-pogsph-v100.cloudfunctions.net/merchant/addCart",
                              payload
                            )
                            .then((res) => {
                              if (index === array.length - 1) resolve();
                            });
                        });
                    });
                  });

                  cartCheck.then(() => {
                    fetchCartList(authResult.user.phoneNumber);
                    setIsLoading(false);
                    history.push(from);
                  });
                } else {
                  history.push(from);
                }
                return false;
              }
            },
          },
        };

        if (firebaseui.auth.AuthUI.getInstance()) {
          ui = firebaseui.auth.AuthUI.getInstance();
          ui.start("#firebaseui-auth-container", uiConfig);
        } else {
          ui = new firebaseui.auth.AuthUI(auth);
          ui.start("#firebaseui-auth-container", uiConfig);
        }
        // return () => {
        //     ui.delete();
        // };
      } else {
        history.push(from);
      }
    }
  }, [history, userauth, cart, setLogin, from]);

  return (
    <Container>
      <Row className="auth-row justify-content-center align-items-center">
        <Col sm="5">
          <img className="img-fluid" src={logo} alt="POGS.PH" srcSet={logo} />
        </Col>
        <Col sm="12">
          <div id="firebaseui-auth-container"></div>
        </Col>
      </Row>
    </Container>
  );
};

export default withRouter(Login);
