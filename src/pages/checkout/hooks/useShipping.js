import React, { useState } from "react";
import axios from "axios";
import { fireUrl } from "utils/url";

const useShipping = () => {
  const [matrix, setMatrix] = useState({});
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [calculating, setCalculating] = useState(false);

  const shippingAPI = fireUrl("shipping/active");

  const calculateShipping = (origins, destinations, alert, setOnFail) => {
    if (
      origins === undefined ||
      origins === "" ||
      destinations === undefined ||
      destinations === ""
    )
      return;
    setCalculating(true);
    setOnFail("");
    alert(true);
    let shippingData = {
      origins: origins,
      destinations: destinations,
      key: process.env.REACT_APP_MAP_KEY,
    };
    axios
      .get(shippingAPI, { params: { ...shippingData } })
      .then((res) => {
        let data = res.data.data;
        let totalRate = "totalRate" in data.rate ? data.rate.totalRate : 0;
        console.log(data, totalRate);
        setMatrix({ ...data });
        setDeliveryCharge(totalRate);
        setTimeout(() => {
          setCalculating(false);
          alert(false);
        }, 1000);
      })
      .catch((err) => {
        setOnFail(err.response.data.message);
      });
  };

  return {
    matrix,
    deliveryCharge,
    calculateShipping,
    calculating,
  };
};

export default useShipping;
