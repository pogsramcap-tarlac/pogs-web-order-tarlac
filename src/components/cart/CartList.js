import React from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";

const Items = ({ cart, handleRemove }) => {
  let items = [];

  cart.items &&
    cart.items.map((crt, key) => {
      items.push(
        <Row
          key={key}
          noGutters={true}
          sm="12"
          className="border-bottom align-items-center mb-3"
        >
          <Col sm="3" className="text-center">
            <div className="cart-image-wrapper">
              <img
                alt="product"
                className="w-cart-image"
                src={crt.productImage}
              />
            </div>
          </Col>
          <Col sm="9" className="p-0">
            <Row className="align-items-center">
              <Col sm="12" className="text-right">
                <span
                  onClick={(e) => handleRemove(crt, key, e)}
                  className="close deletecarttip text-uppercase"
                  id="deletecarttip"
                >
                  <i className="fas fa-trash-alt"></i> Remove Item
                </span>
                <Link
                  className="close deletecarttip text-uppercase"
                  to={`/merchant/${crt.merchantCode}/products`}
                >
                  <i className="fas fa-chevron-circle-left"></i> {crt.merchant}
                </Link>
              </Col>
              <Col sm="12">
                <span>Quantity: </span>
                <b className="product-qty">{crt.quantity}</b>
              </Col>
              <Col sm="12 mb-3">
                <span>Price: </span>
                <span>
                  {crt.totalPrice.toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                  })}
                </span>
              </Col>
              {crt.hasDiscount && crt.discountPrice > 0 ? (
                <Col sm="12 mb-3">
                  <span>Total Discounted Price: </span>
                  <span>
                    {crt.discountedTotalPrice.toLocaleString("en-US", {
                      style: "currency",
                      currency: "PHP",
                    })}
                  </span>
                </Col>
              ) : null}
              <Col sm="12 mb-3">
                <div className="text-muted">
                  <strong>{crt.productName}</strong>
                </div>
                <small>
                  <i>{crt.merchant}</i>
                </small>
              </Col>
              {crt.productAddOn && (
                <Col className="text-muted">
                  <ul className="p-0">
                    {crt.productAddOn.map((x, i) => {
                      return (
                        <React.Fragment key={i}>
                          <li className="addon-list">
                            {/* <span></span> */} {x.productAddOn}{" "}
                            {`x${x.addOnQty}`}
                          </li>
                        </React.Fragment>
                      );
                    })}
                  </ul>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      );
    });

  return items;
};

export default Items;
