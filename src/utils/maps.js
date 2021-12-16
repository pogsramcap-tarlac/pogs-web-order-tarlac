export const formatAddress = (coordinates) => {
  console.log(coordinates);
  let items = {
    address: coordinates.formatted_address,
    components: {
      street: "",
      city: "",
      state: "",
      country: "",
    },
  };
  for (let i = 0; i < coordinates.address_components.length; i++) {
    for (let j = 0; j < coordinates.address_components[i].types.length; j++) {
      switch (coordinates.address_components[i].types[j]) {
        case "route":
          items.components.street = coordinates.address_components[i].long_name;
          break;
        case "locality":
          items.components.city = coordinates.address_components[i].long_name;
          break;
        case "administrative_area_level_1":
          items.components.state = coordinates.address_components[i].long_name;
          break;
        case "country":
          items.components.country =
            coordinates.address_components[i].long_name;
          break;
      }
    }
  }
  return items;
};
