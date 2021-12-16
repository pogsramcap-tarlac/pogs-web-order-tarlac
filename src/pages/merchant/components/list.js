import { Link } from 'react-router-dom';
import React from 'react';

export const Products = ({ merchantDetails }) => {
    const placeholderImage = process.env.REACT_APP_MERCHANT_PLACEHOLDER;
    return (
        <div className="item">
            <div className={`box ${merchantDetails.storeClosed ? "disabled-card" : ""}`}>
                { merchantDetails.hasDiscount ?
                    ( merchantDetails.freeDelivery ?
                        <div class="ribbon"><span>Free Delivery</span></div>:
                        <div class="ribbon"><span>{ merchantDetails.discountInPercent }% off</span></div>
                    ) : null
                }
                <img alt="item" className="rounded img-fluid" src={merchantDetails.storeImage ?? placeholderImage}
                    onError={(e) => e.target.src = placeholderImage }
                />
                <h3 className="name">{merchantDetails.storeName}</h3>
                <h3 className="merchant-sched">{""}</h3>
                { !merchantDetails.storeClosed ?
                    <div className="d-flex justify-content-between align-items-center">
                        <Link className="btn merchant-viewmore" to={{ pathname: `/merchant/${merchantDetails.merchantCode}/products`, state: { merchant: merchantDetails } }} > View More </Link>
                        {/*  <button className = "btn btn-success" type="button"
                            onClick={(e) => {
                                <Redirect to="/merchant/products"/>
                            }}
                        > View More </button> */}

                    </div> : <a className="btn merchant-viewmore btn-secondary">Store closed</a>
                }
            </div>
        </div>

    )
}

export default Products;