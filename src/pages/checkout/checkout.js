import React, { useState, useEffect } from "react";
import { useStateValue } from "../../context";
import useForm from "./hooks/useForm";
import validateForm from "./hooks/validateForm";
import "./checkout.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { withRouter } from "react-router";
import ReCAPTCHA from "react-google-recaptcha";
import ReactLoading from "react-loading";
import {
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalBody,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import { fireUrl } from "utils/url";
import { useToasts } from "react-toast-notifications";
import useGeolocation from "./hooks/useGeolocation";
import useShipping from "./hooks/useShipping";
import { ContactsOutlined } from "@material-ui/icons";

const Checkout = ({ history }) => {
  const [{ cart, auth }] = useStateValue();
  const [promoCode, setPromoCode] = useState("");
  const [voucherData, setVoucherData] = useState();
  const [toggleChange, setToggleChange] = useState(false);
  const [modal, setModal] = useState(false);
  const [onFail, setOnFail] = useState("");
  const [zoneList, setZoneList] = useState([]);
  const [rates, setRates] = useState({});
  const [shippingMethod, setShippingMethod] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [submitAvailable, setSubmitAvailable] = useState(true);

  const redeemAPI = fireUrl("voucher/");

  const { addToast } = useToasts();

  const onPlace = (success, response) => {
    window.location.href = `${process.env.REACT_APP_ORDER_SUCCESS_REDIRECT_URI}?transaction=${response.data.transactionId}`;
  };

  const {
    handleChange,
    values,
    handleSubmit,
    setOrderData,
    setValueData,
    errors,
    isSubmitting,
  } = useForm(validateForm, onPlace);
  const {
    coords,
    currentAddress,
    getLocation,
    coordsToLatLng,
    permission,
    locating,
  } = useGeolocation();
  const { matrix, deliveryCharge, calculateShipping, calculating } =
    useShipping();

  function onChange(value) {
    handleChange({
      target: {
        name: "captcha",
        value: value,
      },
    });
  }

  const onSave = (e) => {
    setModal(true);
    calculateShipping(
      cart.items[0].merchantAddress,
      values.address,
      setModal,
      setOnFail
    );
    setToggleChange(!toggleChange);
  };

  const redeemCode = () => {
    axios
      .post(`${redeemAPI}${promoCode}/apply`)
      .then((res) => {
        if (res.status === 200) {
          setVoucherData(res.data.data);

          setOrderData({
            ...cart,
            deliveryCharge: res.data.data.freeDelivery ? 0 : deliveryCharge,
            voucher: res.data.data,
          });
        }
      })
      .catch((err) => {
        if (err.response.status === 400) {
          addToast(err.response.data.message, {
            autoDismiss: true,
            appearance: "error",
            placement: "top-right",
          });
          setVoucherData(null);

          setOrderData({
            ...cart,
            deliveryCharge: deliveryCharge,
          });
        }
      });
  };

  const handlePromoChange = (e) => {
    setPromoCode(e.target.value);
  };

  const handleBarangayChange = async(e) => {
    let val = e.target.value;

    if (rates) {
      setValueData({
        "barangayIndex": val,
        "barangay": zoneList[val],
        "deliveryCharge": parseInt(rates[zoneList[val]["zoneId"]].value)
      })
    }
  };

  const computeTotal = (cart) => {
    let price = +cart.totalPrice;
    if (+cart.totalPrice > +cart.totalDiscountedPrice) {
      price = +cart.totalDiscountedPrice;
    }

    if (voucherData && voucherData.discount > 0) {
      price = price - price * voucherData.discount;
    }

    return price + (cart.fsItems > 0 ? 0 : +deliveryCharge);
  };

  const computeDiscount = (cart) => {
    let price = +cart.totalPrice;
    if (+cart.totalPrice > +cart.totalDiscountedPrice) {
      price = +cart.totalDiscountedPrice;
    }

    return price * voucherData.discount;
  };

  function onExpired() {
    handleChange({
      target: {
        name: "captcha",
        value: "",
      },
    });
  }

  const fetchZoneList = async() => {
    const resourceAPI = fireUrl("zone");
    let query = {
      sortBy: "createdAt",
      descending: true,
    };

    return axios
      .get(resourceAPI, { params: query })
      .then(res => {
        setZoneList(res.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  const fetchActiveMerchant = async() => {
    const merchantAPI = fireUrl("merchant/" + cart.activeMerchant);

    axios
      .get(merchantAPI)
      .then(res => {
        if (res.status === 200) {
          if ("zoneRates" in res.data.data) {
            setSubmitAvailable(true);
            setRates(res.data.data.zoneRates);
          } else {
            setSubmitAvailable(false);
            addToast("No zone rates available on this merchant. Please try again later.", {
              autoDismiss: true,
              appearance: "error",
              placement: "top-right",
            });
          }
        }
      })
      .catch((err) => {
        addToast(err.response.data.message, {
          autoDismiss: true,
          appearance: "error",
          placement: "top-right",
        });
      });
  }

  const fetchActiveShipping = async() => {
    const shippingAPI = fireUrl("shipping/active");
    let deliveryFee = '';

    return await axios
      .get(shippingAPI)
      .then(async (res) => {
        if (res.status === 200) {
          setShippingMethod(res.data.data.method);

          if (res.data.data.method === 'flat_rate') {
            deliveryFee = res.data.data.rate.totalRate;
          }

          if (res.data.data.method === 'shipping_by_zone') {
            await fetchZoneList();
            await fetchActiveMerchant();
          }

          if (res.data.data.method === 'shipping_by_distance') {
            handleChange({
              target: {
                name: "address",
                value: currentAddress.address,
              },
            });

            if (cart.items.length > 0) {
              calculateShipping(
                cart.items[0].merchantAddress,
                currentAddress.address,
                setModal,
                setOnFail
              );

              deliveryFee = deliveryCharge;
            }
          }

          values.deliveryCharge = deliveryFee;
          values.phone = auth.logged ? auth.phone : "";
          setValueData({ shippingMethod: res.data.data.method, order: {
            ...cart,
            deliveryCharge: deliveryFee,
          } });

          return true;
        }

        return false;
      })
      .catch((err) => {
        addToast(err.response.data.message, {
          autoDismiss: true,
          appearance: "error",
          placement: "top-right",
        });
        return false;
      });
  }

  const fetchData = () => {
    setisLoading(true);

    axios.all([
      fetchActiveShipping()
    ])
    .then(() => {
      setisLoading(false);
    });
  };

  useEffect(() => {
    if (cart.activeMerchant !== "") {
      fetchData();
    }
  }, [cart]);


  return isLoading ? (
    <Row className="loader-row-wrapper align-items-center">
      <Col className="text-center">
        <ReactLoading
          className="mx-auto"
          type={"bars"}
          color={"#000"}
          height={100}
          width={100}
        />
        <p>Loading...</p>
      </Col>
    </Row>
  ) : (
    <div className="maincontainer">
      <div className="container">
        <div className="row checkout-row">
          <div className="col-md-5 order-md-2 mb-4">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">Your Order</span>
              <span className="badge badge-secondary badge-pill">3</span>
            </h4>
            <ul className="list-group mb-3">
              {cart.items.map((cart, index) => {
                return (
                  <li
                    key={index}
                    className="list-group-item d-flex flex-column lh-condensed"
                  >
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="my-0">
                          {cart.productName} x {cart.quantity}
                        </h6>
                        <small className="text-muted">{cart.merchant}</small>
                      </div>
                      <div>
                        {cart.price.toLocaleString("en-US", {
                          style: "currency",
                          currency: "PHP",
                        })}
                      </div>
                    </div>
                    <div className="mt-2">
                      {cart.productAddOns.length > 0 && (
                        <div>
                          <span>Add-ons:</span>
                          <ul>
                            {cart.productAddOns.map((x, i) => {
                              return (
                                <li
                                  key={i}
                                  className="text-muted d-flex justify-content-between"
                                >
                                  <span>{x.addOnName}</span>
                                  <span>
                                    {x.addOnTotalPrice.toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "PHP",
                                    })}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="" style={{ textAlign: "right" }}>
                      <hr
                        className="w-50 mb-0"
                        style={{ marginLeft: "auto" }}
                      />
                      <span className="text-muted">
                        {cart.hasDiscount && cart.discountPrice > 0 ? (
                          <strike>
                            {cart.totalPrice.toLocaleString("en-US", {
                              style: "currency",
                              currency: "PHP",
                            })}
                          </strike>
                        ) : (
                          <span>
                            {cart.totalPrice.toLocaleString("en-US", {
                              style: "currency",
                              currency: "PHP",
                            })}
                          </span>
                        )}
                      </span>
                      <br />
                      {cart.hasDiscount && cart.discountPrice > 0 ? (
                        <span className="text-muted">
                          {cart.discountedTotalPrice.toLocaleString("en-US", {
                            style: "currency",
                            currency: "PHP",
                          })}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
              {/* <li className="list-group-item d-flex flex-column">
                <span>Transaction #:</span>
              </li> */}
              <li className="list-group-item d-flex justify-content-between">
                <span>Delivery Fee : </span>
                {cart.fsItems > 0 ||
                (voucherData && voucherData.freeDelivery) ? (
                  <>
                    <strike>
                      {values.deliveryCharge.toLocaleString("en-US", {
                        style: "currency",
                        currency: "PHP",
                      })}
                    </strike>
                    <strong>
                      {parseInt(0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "PHP",
                      })}
                    </strong>
                  </>
                ) : (
                  <strong>
                    {values.deliveryCharge.toLocaleString("en-US", {
                      style: "currency",
                      currency: "PHP",
                    })}
                  </strong>
                )}
              </li>
              {voucherData && voucherData.discount > 0 ? (
                <li className="list-group-item d-flex justify-content-between">
                  <span>
                    {voucherData.code} ({voucherData.discount * 100}% discount
                    applied)
                  </span>
                  <strong>
                    -
                    {computeDiscount(cart).toLocaleString("en-US", {
                      style: "currency",
                      currency: "PHP",
                    })}
                  </strong>
                </li>
              ) : null}
              <li className="list-group-item d-flex justify-content-between">
                <span>TOTAL (Incl. VAT)</span>
                <strong>
                  {computeTotal(cart).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                  })}
                </strong>
              </li>
            </ul>

            <form className="card p-2">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={handlePromoChange}
                />
                <div className="input-group-Checkoutend">
                  <button
                    type="button"
                    className="btn promo-button"
                    onClick={redeemCode}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="col-md-7 order-md-1">
            <h4 className="mb-3">Billing Information</h4>
            <form
              onSubmit={handleSubmit}
              className="needs-validation"
              noValidate
            >
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="firstName">First name</label>
                  <input
                    value={values.firstname}
                    onChange={handleChange}
                    name="firstname"
                    type="text"
                    className="form-control"
                    id="firstName"
                    placeholder="First Name"
                    required
                  />
                  {errors.firstname && (
                    <div className="text-danger">{errors.firstname}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    value={values.lastname}
                    onChange={handleChange}
                    name="lastname"
                    type="text"
                    className="form-control"
                    id="lastName"
                    placeholder="Last Name "
                    required
                  />
                  {errors.lastname && (
                    <div className="text-danger">{errors.lastname}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="lastName">Phone Number </label>
                  <input
                    value={values.phone}
                    onChange={handleChange}
                    name="phone"
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    placeholder="09XXXXXXXXX"
                    required
                  />
                  {errors.phone && (
                    <div className="text-danger">{errors.phone}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email">Email</label>
                  <input
                    value={values.email}
                    onChange={handleChange}
                    name="email"
                    type="text"
                    className="form-control"
                    id="email"
                    placeholder="Email"
                  />
                  {errors.email && (
                    <div className="text-danger">{errors.email}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="facebook">Facebook or messenger</label>
                  <input
                    value={values.facebook}
                    onChange={handleChange}
                    name="facebook"
                    type="text"
                    className="form-control"
                    id="facebook"
                    placeholder="Your Facebok or Messenger Name"
                  />
                  {errors.facebook && (
                    <div className="text-danger">{errors.facebook}</div>
                  )}
                </div>

                {shippingMethod === 'shipping_by_zone' ? (
                  <div className="col-md-6 mb-3">
                    <label htmlFor="barangay">Enter barangay</label>
                    <select name="barangay" value={values.barangayIndex} onChange={handleBarangayChange} className="form-control">
                      <option value="">Please select barangay</option>
                      {zoneList.map((item, index) => (
                        <option key={`barangay${index}`} value={index}>{item.barangay}</option>
                      ))}
                    </select>
                    {errors.barangay && (
                      <div className="text-danger">{errors.barangay}</div>
                    )}
                  </div>
                ) :  null}
              </div>

              {shippingMethod === 'flat_rate' ? (
                <div className="mb-3">
                  <label htmlFor="address">Deliver to</label>
                  <input
                    value={values.address}
                    onChange={handleChange}
                    name="address"
                    type="text"
                    className="form-control"
                    id="address"
                    placeholder="1234 Main St"
                    required
                    disabled={!toggleChange}
                  />
                  {errors.address && (
                    <div className="text-danger">{errors.address}</div>
                  )}

                  {toggleChange ? (
                    <Button
                      onClick={(e) => onSave(e)}
                      className="w-25 mt-2"
                      size="sm"
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => setToggleChange(!toggleChange)}
                      className="w-25 mt-2"
                      size="sm"
                    >
                      Change
                    </Button>
                  )}
                </div>
              ) : null}

              {shippingMethod === 'shipping_by_distance' ? (
                <div className="mb-3">
                  <div className="d-flex flex-column">
                    <label htmlFor="address">Deliver to</label>
                    <Button
                      className="w-50"
                      onClick={(e) => {
                        setModal(true);
                        getLocation(setModal, setOnFail);
                      }}
                    >
                      Enter My location
                    </Button>
                  </div>
                </div>
              ) :  null}

              {shippingMethod === 'shipping_by_zone' ? (
                <div className="mb-3">
                  <label htmlFor="address">Deliver to</label>
                  <input
                    value={values.address}
                    onChange={handleChange}
                    name="address"
                    type="text"
                    className="form-control"
                    id="address"
                    placeholder="Enter address"
                    required
                  />
                  {errors.address && (
                    <div className="text-danger">{errors.address}</div>
                  )}
                </div>
              ) :  null}

              {/* <div className="mb-3">
                <label htmlFor="address2">
                  Address 2 <span className="text-muted">(Optional)</span>
                </label>
                <input
                  value={values.address2}
                  onChange={handleChange}
                  name="address2"
                  type="text"
                  className="form-control"
                  id="address2"
                  placeholder="Apartment or suite"
                />
              </div> */}

              <h4>Payment</h4>

              <div className="d-block mb-3">
                <div className="custom-control custom-radio mb-3">
                  {errors.paymentMethod && (
                    <div className="text-danger">{errors.paymentMethod}</div>
                  )}
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="paymentMethod"
                        onChange={(e) => {
                          handleChange({
                            target: {
                              name: "paymentMethod",
                              value: e.target.value,
                            },
                          });
                        }}
                        value="cod"
                        required
                      />{" "}
                      Cash On Delivery
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="paymentMethod"
                        onChange={(e) => {
                          handleChange({
                            target: {
                              name: "paymentMethod",
                              value: e.target.value,
                            },
                          });
                        }}
                        value="gcash"
                        required
                      />{" "}
                      G-Cash (0969-049-2511)
                    </Label>
                  </FormGroup>
                </div>
                <h6 className="mb-3">
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
              </div>

              <input
                type="checkbox"
                checked={values.terms}
                onChange={(e) => {
                  handleChange({
                    target: { name: "terms", value: e.target.checked },
                  });
                }}
                name="terms"
                id="terms"
                required
              />
              <label>
                <a
                  href="http://pogs.ph/terms-checkout/"
                  target="_blank"
                  className="terms-checkout"
                >
                  I agree with the terms and conditions of Pogs.ph and
                  RamCap Delivery Services OPC
                </a>
              </label>
              {errors.address && (
                <div className="text-danger">{errors.terms}</div>
              )}

              <hr className="mb-4" />
              <div className="mb-4">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={onChange}
                  onExpired={onExpired}
                />
                {errors.captcha && (
                  <div className="text-danger">{errors.captcha}</div>
                )}
              </div>
              {submitAvailable ? <button
                className="btn btn-primary btn-lg btn-block btn-continue-checkout"
                type="submit"
              >
                {isSubmitting ? "Submitting..." : "Place Order"}
              </button> : null}
            </form>
          </div>
        </div>
        <Modal className="checkout-notif" isOpen={modal}>
          <ModalBody>
            <Row className="justify-content-center align-items-center">
              <Col className="text-center">
                {onFail === "" ? (
                  <i className="fas fa-question-circle text-info fs-1 mb-3"></i>
                ) : (
                  <i className="fas fa-exclamation-circle text-danger fs-1 mb-3"></i>
                )}
                {locating ? (
                  onFail === "" ? (
                    <h3>Getting Location....</h3>
                  ) : (
                    <h6>{onFail}</h6>
                  )
                ) : calculating ? (
                  onFail === "" ? (
                    <h3>Updating Delivery Fee....</h3>
                  ) : (
                    <h6>{onFail}</h6>
                  )
                ) : (
                  <h6>{onFail}</h6>
                )}
                {onFail !== "" && (
                  <Button
                    className="w-25 mx-auto mt-3 bg-danger border-0 shadow"
                    onClick={(e) => setModal(!modal)}
                    color="danger"
                  >
                    Close
                  </Button>
                )}
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default withRouter(Checkout);
