import React, { useState } from "react";
import { Link } from "react-router-dom";
const Item = ({ productDetails }) => {
  const placeholderImage = process.env.REACT_APP_PRODUCT_PLACEHOLDER;

  return (
    <div className="item mb-3">
      <div className={`box ${productDetails.productUnavailable ? "disabled-card" : ""}`}>
        { productDetails.merchant.hasDiscount || productDetails.hasDiscount ?
            ( productDetails.merchant.freeDelivery || productDetails.freeDelivery ?
              <div class="ribbon"><span>Free Delivery</span></div> :
              <div class="ribbon"><span>{ productDetails.merchant.discount ?? productDetails.discountInPercent }% off</span></div>
            ) : null
        }
        <img
          alt="details"
          className="rounded img-fluid"
          src={
            productDetails.productImage
              ? productDetails.productImage
              : "https://firebasestorage.googleapis.com/v0/b/dev-pogsph-v100.appspot.com/o/images%2FPogs-Temporary-img.jpg?alt=media"
          }
          onError={(e) => e.target.src = placeholderImage }
        />
        <h3 className="name">
          {productDetails.productName}{" "}
          {productDetails.withoutDrinks ? (
            <small className="text-danger">(Without Drinks*)</small>
          ) : (
            ""
          )}
        </h3>
        <p className="description">{productDetails.description}</p>
        { !productDetails.productUnavailable ?
            <div className="d-flex justify-content-between align-items-center">
              <button
                className="btn-cart btn btn-viewDetails"
                type="button"
              >
                {/* <Link to={`/details/${productDetails.productCode}`}> View Details</Link> */}
                <Link
                  to={{
                    pathname: `/product/${productDetails.productId}`,
                    state: { product: productDetails },
                  }}
                >
                  Order Now !
                </Link>
              </button>
              <span className="badge bg-danger price">
                &#8369;{productDetails.price}
              </span>
            </div> : <a className="btn merchant-viewmore btn-secondary">Product Unavailable</a>
        }
      </div>
    </div>
  );
};

export default Item;