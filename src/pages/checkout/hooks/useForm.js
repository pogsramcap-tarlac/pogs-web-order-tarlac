import { useState, useEffect } from "react";
import { useStateValue } from "../../../context";
import { CLEAR_ITEMS } from "../../../context/cart/actions";
import useCart from "../../../context/cart/hooks/useCart";
import axios from "axios";
import { fireUrl } from "utils/url";

const useForm = (validate, callback) => {
  const [{ auth }] = useStateValue();
  const [cart, setCart] = useCart();
  const [values, setValues] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    facebook: "",
    address: "",
    // address: {
    //   street: "",
    //   barangay: "",
    //   city: "",
    //   state: "",
    //   country: "",
    // },
    formattedAddress: "",
    paymentMethod: "",
    deliveryCharge: "",
    captcha: "",
    terms: "",
    shippingMethod: "",
    barangay: "",
    barangayIndex: "",
    order: {},
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderAPI = fireUrl("order");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const setOrderData = (order) => {
    setValues({
      ...values,
      order: order,
    });
  };

  const setValueData = (data) => {
    setValues({
      ...values,
      ...data,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSubmitting) {
      setErrors(validate(values));
      setIsSubmitting(true);
    }
  };

  useEffect(() => {
    // reset loader if error
    if (Object.keys(errors).length > 0 && isSubmitting) {
      setIsSubmitting(false);
    }

    if (Object.keys(errors).length === 0 && isSubmitting) {
      if (cart.items.length > 0) {
        // prepare order payload
        let customerData = {
          address: values.address,
          fullName: values.firstname + " " + values.lastname,
          phone: values.phone,
          email: values.email,
          userCode: auth.phone,
          facebook: values.facebook ?? "",
        };

        let itemDiscountAmount =
          +cart.totalPrice > +cart.totalDiscountedPrice
            ? +cart.totalDiscountPrice
            : 0;
        let deliveryCharge = cart.fsItems > 0 ? 0 : values.deliveryCharge;
        let totalPrice = cart.totalPrice;
        let orderDiscount = 0;
        let promo = "";

        if ("voucher" in values.order) {
          orderDiscount =
            values.order.voucher.discount > 0
              ? totalPrice * values.order.voucher.discount
              : 0;
          promo = values.order.voucher.code;
        }

        let totalDiscount = orderDiscount + itemDiscountAmount;

        let orderPayload = {
          subTotal: totalPrice,
          discount: +totalPrice > +cart.totalDiscountedPrice,
          tax: null,
          shippingAmount: deliveryCharge,
          totalAmount: totalPrice + deliveryCharge,
          promo: promo,
          itemDiscount: itemDiscountAmount,
          orderDiscount: orderDiscount,
          totalDiscount: totalDiscount,
          grandTotal: totalPrice + deliveryCharge - totalDiscount,
          notes: "",
          paymentMethod: values.paymentMethod,
          customer: customerData,
          order: values.order,
        };

        axios
          .post(orderAPI, orderPayload)
          .then((res) => {
            if (res.status === 201) {
              let cartClear = { action: CLEAR_ITEMS };
              setCart(cartClear);
              callback(true, res.data);
            }
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
    }
  }, [isSubmitting]);

  // console.log(values);

  return {
    handleChange,
    values,
    handleSubmit,
    setOrderData,
    setValueData,
    errors,
    isSubmitting,
  };
};

export default useForm;
