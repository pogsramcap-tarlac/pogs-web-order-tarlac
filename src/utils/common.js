export const cBool = (val) => {
  return String(val).toLowerCase() === "true";
};

export const groupArrayOfObjects = (list, key) => {
  return list.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
