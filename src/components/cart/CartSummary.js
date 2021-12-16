import React from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";

const Summary = ({ cart }) => {
  return (
    <>
      <div>
        <h5>
          <b>MY ORDER</b>
        </h5>
      </div>
      <hr />
      <Row className="pl-0 ">
        <Col className="pl-0 col-md-8">
          {cart.items && `${cart.qty} ITEMS (SUB TOTAL)`}
        </Col>
        <Col className="text-right ">
          {cart.totalPrice > cart.totalDiscountedPrice ? (
            <>
              <strike>
                {(+cart.totalPrice).toLocaleString("en-US", {
                  style: "currency",
                  currency: "PHP",
                })}
              </strike>
              &nbsp;&nbsp;
              <span>
                {(+cart.totalDiscountedPrice).toLocaleString("en-US", {
                  style: "currency",
                  currency: "PHP",
                })}
              </span>
            </>
          ) : (
            <>
              {(+cart.totalPrice).toLocaleString("en-US", {
                style: "currency",
                currency: "PHP",
              })}
            </>
          )}
        </Col>
      </Row>
      <form>
        <hr />
        <h6 className="mb-3 mt-3">
          {" "}
          We are only accepting COD for Orders{" "}
          <strong>
            <u>Less than 1500 Php</u>
          </strong>{" "}
          and G-CASH Payment for all orders using (mobile #:
          <span>
            <a href="#" className="text-dark">
                0969-049-2511
            </a>
          </span>
          ). Kindly send the screenshot payment via email to{" "}
          <span>
            <a href="mailto:orders@pogs.ph" className="text-dark">
              orders@pogs.ph
            </a>{" "}
            otherwise your order will not be proccessed
          </span>
        </h6>
      </form>
      <div
        className="row "
        style={{
          border: "2px solid rgba(0,0,0,.1)",
          padding: "2vh 0",
          marginBottom: "10px",
        }}
      >
        <div className="col col-md-8 ">TOTAL (Incl. VAT)</div>
        <div className="col-md-4 text-right">
          {" "}
          {
            // fastfoodCharge * cart.totalPrice +
            (
              (+cart.totalPrice > +cart.totalDiscountedPrice
                ? +cart.totalDiscountedPrice
                : +cart.totalPrice) + (cart.fsItems > 0 && 0)
            ).toLocaleString("en-US", {
              style: "currency",
              currency: "PHP",
            })
          }
        </div>
      </div>{" "}
      <Link className="checkout-btn" to="/checkout">
        <button className="btn" type="button">
          CHECKOUT
        </button>
      </Link>
      <div>
        <p className="text-center text-dark delivery-time">
          Delivery will be from{" "}
          <span className="text-danger font-weight-bold"> 9am </span> to{" "}
          <span className="text-danger font-weight-bold"> 8pm </span>
        </p>
      </div>
      {cart.qty > 0 && (
        <Link
          className="btn btn-outline-primary order-more w-100 text-uppercase"
          to="/merchants"
        >
          Order More
        </Link>
      )}
    </>
  );
};

export default Summary;
