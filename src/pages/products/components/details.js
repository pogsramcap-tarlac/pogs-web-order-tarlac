import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Col,
  Row,
  Button,
  Container,
  Modal,
  ModalBody,
  Alert,
} from "reactstrap";
import { Link } from "react-router-dom";
import useCart from "../../../context/cart/hooks/useCart";
import { useStateValue } from "../../../context";
import {
  ADD_ITEM,
  CLEAR_ITEMS,
  REMOVE_ITEM,
} from "../../../context/cart/actions";
import { fireUrl } from "../../../utils/url";
import { useToasts } from "react-toast-notifications";
import {
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import ReactLoading from "react-loading";

import "../../../assets/css/details.css";

const ProductDetails = ({ match, location, onCart }) => {
  const { addToast } = useToasts();
  const placeholderImage = process.env.REACT_APP_PRODUCT_PLACEHOLDER;
  const productSku = match.params.sku;
  const [productDetails, setProductDetails] = useState([]);
  const [productAddOns, setProductAddOns] = useState([]);
  const [isCartAdded, setIsCartAdded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [productUnavailable, setProductUnavailable] = React.useState(false);
  const [cart, setCart, cartLoading] = useCart();
  const [{ auth }] = useStateValue();
  const [orderAddOn, setOrderAddOn] = useState({});
  const [productQty, setProductQty] = useState(1);
  const [toggle, setToggle] = useState(false);

  const [totalAddonPrice] = useState(0);

  const addCartAPI = fireUrl(`cart/add-item/`);
  const singleProductAPI = fireUrl(`product/${productSku}`);

  // fetch product detail
    const fetchSingleProduct = async () => {
      await axios
        .get(singleProductAPI)
        .then((res) => {
          let data = res.data.data;
          setProductDetails(data);
          setProductAddOns(
            data.productAddOns.filter((obj) => (obj.addOnQty = 1))
          );
          setisLoading(true);

          setProductUnavailable(data.productUnavailable ? true : false);
          // getMerchantDetails(res.data.merchantCode);
        })
        .catch((err) => console.log(err));
    };

  // add to cart
  const addToCart = () => {
    if (isProcessing) return;

    let activeMerchant = cart.activeMerchant;
    let productStoreRef = productDetails.merchantCode;

    if (activeMerchant !== productStoreRef && activeMerchant !== "") {
      setToggle(!toggle);
      return;
    }

    setIsProcessing(true);
    addCartData(productDetails, isCartAdded, (success) => {
      if (success) {
        setIsCartAdded(true);
      }

      setIsProcessing(false);
    });
  };

  // add cart data
  const addCartData = (productDetails, isCartAdded, onFinish) => {
    let phoneNumber = auth.phone;
    let cartData = {
      userCode: phoneNumber,
      productCode: productDetails.productId,
      product: productDetails,
      productAddOns: orderAddOn,
      totalAddonPrice: orderAddOn.length > 0 ? totalAddonPrice : 0,
      qty: productQty,
    };
    if (!isCartAdded) {
      axios
        .post(addCartAPI, cartData)
        .then((res) => {
          let data = res.data.data;
          console.log(data);

          let cartLoad = {
            items: { ...data },
            action: ADD_ITEM,
          };
          addToast(res.data.message, {
            autoDismiss: true,
            appearance: "success",
            placement: "top-right",
          });
          setCart(cartLoad);
          onFinish(true);
        })
        .catch((error) => {
          addToast(error.response.data.message, {
            autoDismiss: true,
            appearance: "error",
            placement: "top-right",
          });
          onFinish(false);
        });
    }
  };

  const handleAddon = (e, addon) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setOrderAddOn({
        ...orderAddOn,
        [addon.addOnId]: {
          addOnId: addon.addOnId,
          addOnName: addon.addOnName,
          // addOnNetPrice: addon.addOnNetPrice,
          addOnPrice: addon.addOnPrice,
          addOnQty: productQty,
          addOnTotalPrice: parseInt(addon.addOnPrice) * productQty,
        },
      });
    } else {
      handleRemoveAddon(addon.addOnId);
    }
  };

  const handleRemoveAddon = (id) => {
    let updatedAddOn = { ...orderAddOn };
    delete updatedAddOn[id];
    setOrderAddOn(updatedAddOn);
  };

  const incrementQty = (e) => {
    e.preventDefault();
    setProductQty(productQty + 1);

    if (orderAddOn.length > 0) {
      setOrderAddOn((orderAddOn) => {
        orderAddOn.forEach((x, i) => {
          if (x.addOnQty <= productQty) {
            x.addOnQty = x.addOnQty + 1;
          }
          x.addOnTotalPrice = parseInt(x.addOnPrice) * x.addOnQty;
        });

        return [...orderAddOn];
      });
    }
  };

  const decrementQty = (e) => {
    e.preventDefault();
    if (productQty === 1) return false;
    setProductQty(productQty - 1);

    if (orderAddOn.length > 0) {
      setOrderAddOn((orderAddOn) => {
        orderAddOn.forEach((x, i) => {
          if (x.addOnQty >= productQty) {
            if (x.addOnQty !== 1) {
              x.addOnQty = x.addOnQty - 1;
            }
          }
          x.addOnTotalPrice = parseInt(x.addOnPrice) * x.addOnQty;
        });
        return [...orderAddOn];
      });
    }
  };

  useEffect(() => {
    fetchSingleProduct();
  }, []);

  // console.log(values);

  const listProductAddOns = () => {
    const items = [];
    productAddOns.length > 0 &&
      productAddOns.map((value, key) => {
        items.push(
          <React.Fragment key={key}>
            <Col md="6" sm="12" className="container mb-3">
              <form className="form-wrapper d-flex justify-content-between align-items-center addons rounded p-3">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      value={value.addOnId}
                      onChange={(e) => handleAddon(e, value)}
                    />{" "}
                    <strong>{value.addOnName}</strong>
                  </Label>
                </FormGroup>

                <div>
                  <span className="">
                    +{" "}
                    {parseInt(value.addOnPrice).toLocaleString("en-US", {
                      style: "currency",
                      currency: "PHP",
                    })}
                  </span>
                </div>
              </form>
            </Col>
          </React.Fragment>
        );
      });
    return items;
  };

  return !isLoading ? (
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
  ) : (
    <Container className="productdetails-row container-rounded">
      {productUnavailable ? (
        <h1 class="text-center">Product is currently unavailable</h1>
      ) : (
        <>
          <Row>
            {/* <Col className="sm2 left-col-productdetails"> */}
            <Col className="prodcut-details-image">
              <img
                src={productDetails.productImage}
                onError={(e) => (e.target.src = placeholderImage)}
                className="product-img rounded"
                alt="..."
              />
            </Col>
            <Col>
              <h3 className="product-details-name">
                {productDetails.productName}
              </h3>
              <p>{productDetails.description} </p>

              <Row>
                <Col sm="12" className="mt-2 mb-3">
                  <div className="d-flex align-items-center flex-row justify-content-md-start justify-content-center">
                    <div className="price-wrapper">
                      <span className="product-price">
                        <strong>
                          {(productDetails.price * productQty).toLocaleString(
                            "en-US",
                            { style: "currency", currency: "PHP" }
                          )}
                        </strong>
                      </span>
                    </div>
                    <div className="quantity-wrapper">
                      <a
                        className="minus-icon"
                        onClick={(e) => decrementQty(e)}
                      >
                        -
                      </a>
                      <a className="border product-qty text-dark">
                        {productQty}
                      </a>
                      <a className="plus-icon" onClick={(e) => incrementQty(e)}>
                        +
                      </a>
                    </div>
                  </div>
                </Col>
                <Col>
                  <span className="text-danger">
                    <i>* For sizes please check add-ons</i>
                  </span>
                </Col>
                <Col sm="12" className="mt-4">
                  <button
                    className="btn-details"
                    type="button"
                    onClick={(e) => {
                      addToCart();
                    }}
                  >
                    {isCartAdded ? (
                      <Link to="/cart">View Cart</Link>
                    ) : isProcessing ? (
                      "Adding..."
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                  <button className="btn-ordermore">
                    <Link to="/merchants">Order More !</Link>
                  </button>
                </Col>
              </Row>
            </Col>
          </Row>
          {productAddOns.length > 0 ? (
            <Row>
              <div className="mb-2 mt-5">
                <h5 className="addon-label">Add-ons</h5>
              </div>
              <div className="addons-list">
                <Row>{listProductAddOns()}</Row>
              </div>
            </Row>
          ) : (
            <div></div>
          )}
        </>
      )}
      <Modal className="cart-notif" isOpen={toggle}>
        <ModalBody>
          <Row className="justify-content-center align-items-center">
            <Col className="text-center">
              <i className="fas fa-exclamation-circle text-danger fs-1 mb-3"></i>
              <h3>Please choose products from single merchant only!</h3>
              <Button
                className="w-25 mx-auto mt-3 bg-danger border-0 shadow"
                onClick={(e) => setToggle(!toggle)}
                color="danger"
              >
                Close
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default ProductDetails;
