import React, { useState } from "react";
import { formatAddress } from "utils/maps";
import { Geocode } from "config/mapConfig";

const useGeolocation = () => {
  const [coords, setCoords] = useState({
    lat: "",
    lng: "",
  });
  const [currentAddress, setCurrentAddress] = useState({
    address: "",
    compAddress: {},
  });
  const [locating, setLocating] = useState(false);
  const [permission, setPermission] = useState(true);

  const getLocation = (alert, setOnFail) => {
    if (coords.lat !== "" && coords.lng !== "") return;
    if (!navigator.geolocation) {
      return false;
    } else {
      setLocating(true);
      setPermission(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords({ ...coords, ...coordinates });
          getCurrentAddress(
            position.coords.latitude,
            position.coords.longitude,
            alert
          );
        },
        () => {
          alert(false);
          setPermission(false);
          setLocating(false);
          setOnFail("Unable to retrieve your location automatically");
          // console.log("Unable to retrieve your location");
        },
        { enableHighAccuracy: true, timeout: 100000, maximumAge: 100000 }
      );
    }
  };

  const getCurrentAddress = async (lat, lng, alert) => {
    try {
      await Geocode.fromLatLng(lat, lng).then(
        async (response) => {
          if (response.status === "OK" && response.results.length > 0) {
            let result = formatAddress(response.results[0]);
            setCurrentAddress({
              ...result,
            });
            setTimeout(() => {
              setLocating(false);
              alert(false);
            }, 1000);
          }
        },
        (error) => {
          console.error(error);
        }
      );
    } catch (error) {
      setLocating(false);
    }
  };

  const coordsToLatLng = (address, onFinish) => {
    var result = [];
    Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        result.push(lat);
        result.push(lng);
        return result.join("-");
      },
      (error) => {
        console.error(error);
      }
    );
    return result;
  };

  return {
    coords,
    currentAddress,
    getLocation,
    getCurrentAddress,
    coordsToLatLng,
    permission,
    locating,
  };
};

export default useGeolocation;
