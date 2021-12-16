import axios from "axios";
import React, { useEffect, useState } from "react";
import { useStateValue } from "context";
import useCart from "../../context/cart/hooks/useCart";
import { REMOVE_ITEM, UPDATE_ITEM } from "../../context/cart/actions";
import { fireUrl } from "utils/url";
import { useToasts } from 'react-toast-notifications';
import {
  Card,
  Col,
  Container,
  Input,
  Row,
  UncontrolledTooltip,
  Button,
  CardBody,
} from "reactstrap";

import CartList from "components/cart/CartList";
import CartSummary from "components/cart/CartSummary";

import "../../assets/css/cart.css";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { addToast } = useToasts();
  const [cart, setCart] = useCart();
  const [{ auth }] = useStateValue();
  const [isProcessing, setIsProcessing] = useState(false);
  // const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleRemove = (item, index) => {
    if (isProcessing) return;

    setIsProcessing(true);
    axios
      .delete(fireUrl(`cart/${auth.phone.replace("+", "")}/${item.cartItemId}`))
      .then((res) => {
        if (res.status === 200) {
          let cart = {
            items: { item: item, id: item.cartItemId },
            action: REMOVE_ITEM,
          };
          setCart(cart);

          addToast(res.data.message, { autoDismiss: true, appearance: 'success' });
        }
      })
      .catch((error) => {
        addToast(error.response.data.message, { autoDismiss: true, appearance: 'error' });
      })
      .finally(() => setIsProcessing(false));
  };

  /* const handleDeliveryCharge = (e) => {
    e.preventDefault();
    setDeliveryCharge(parseInt(e.target.value));
  }; */

  let content = cart.items ? (
    <Container fluid={true} className="my-5">
      <Row className="cart-wrapper-row align-items-center justify-content-center">
        <Card>
          <Row>
            {/* cart */}
            <Col sm="12" md="8" className="cart">
              <div className="title border-bottom">
                <Row>
                  <Col>
                    <h4>
                      <b>My Cart</b>
                    </h4>
                  </Col>
                  <Col className="align-self-center text-right text-muter">
                    {cart.qty && `${cart.qty} items`}{" "}
                  </Col>
                </Row>
              </div>
              {cart.qty > 0 ? (
                <CartList cart={cart} handleRemove={handleRemove} />
              ) : (
                <Card className="shadow-none">
                  <CardBody>
                    <div className="p-5 text-center">
                      <p className="text-dark">Your Shopping cart is empty..</p>
                      <Link
                        className="btn btn-outline-primary order-now text-uppercase"
                        to="/merchants"
                      >
                        Order Now
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              )}
            </Col>
            <Col sm="12" md="4" className="summary">
              <CartSummary cart={cart} />
            </Col>
          </Row>
        </Card>
      </Row>
      <div className="container areas-section">
        <h1>
          <Row className="areas-row">
            <Col className="serviceable-col">
              <h5 className="text-center serviceable mt-1000px">
                Serviceable Area
              </h5>
              <Col className="pl-0 text-left">
                <ul className="list-none left-areas">
                  <li>Sta cruz</li>
                  <li>Alvindia</li>
                  <li>Aguso</li>
                  <li>Tabane</li>
                  <li>Salapungan</li>
                  <li>Tariji</li>
                  <li>Balibago1</li>
                  <li>Balibago 2</li>
                  <li>Baculong</li>
                  <li>Maliwalo</li>
                  <li>Calincuan</li>
                  <li>Maligaya</li>
                  <li>Matatalaib</li>
                  <li>San nicolas</li>
                  <li>Poblacion</li>
                  <li>San roque</li>
                </ul>
              </Col>
              <Col className="right-areas">
                <ul className="list-none">
                <li>Cut-Cut</li>
                  <li>San Vicente</li>
                  <li>San Rafael</li>
                  <li>San Jose de Urquico</li>
                  <li>Paraiso</li>
                  <li>San Miguel</li>
                  <li>San Pablo</li>
                  <li>Tibag</li>
                  <li>Carangian</li>
                  <li>Molave</li>
                  <li>San isidro</li>
                  <li>Ligtasan</li>
                  <li>Sto Cristo</li>
                  <li>San Sebastian</li>
                  <li>Suizo</li>
                  <li>Panampuna</li>
                </ul>
              </Col>
            </Col>

            <Col className="soon-available-col">
              <Row className="areas-row">
                <h5 className="text-center soon-available">
                  Soon To Be Available In The Following Area
                </h5>
                <ul className="list-none">

                </ul>
              </Row>
            </Col>
          </Row>
        </h1>
      </div>
    </Container>
  ) : (
    <span className="Loading-cart">Loading wells...</span>
  );

  return <div>{content}</div>;
};

export default CartPage;
