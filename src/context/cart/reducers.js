import {
  LOAD_ITEMS,
  ADD_ITEM,
  REMOVE_ITEM,
  UPDATE_ITEM,
  CLEAR_ITEMS,
  OVERWRITE_ITEMS,
} from "./actions";

export const INITIAL_STATE = {
  items: [],
  qty: 0,
  totalPrice: 0,
  fsItems: 0,
  totalDiscountedPrice: 0,
  discountPrice: 0,
  productCharge: 0,
  orderCount: 0,
  shippingData: [],
  activeMerchant: ""
};

export const cartReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOAD_ITEMS:
      let cartData = action.items;
      let totalPrice = "items" in action.items ? cartData.totalPrice : 0;
      let totalDiscountedPrice =
        "items" in action.items ? cartData.totalDiscountedPrice : 0;
      let totalDiscountPrice =
        "items" in action.items ? cartData.totalDiscountPrice : 0;
      let itemData = "items" in action.items ? action.items.items : [];
      let fsItems = "items" in action.items ? cartData.fsItems : 0;
      let qty = itemData ? itemData.length : 0;

      return {
        items: itemData,
        qty: qty,
        totalPrice: totalPrice,
        totalDiscountedPrice: totalDiscountedPrice,
        totalDiscountPrice: totalDiscountPrice,
        fsItems: fsItems,
        cartId: cartData.cartId,
        orderCount: cartData.orderCount ? cartData.activeMerchant : 0,
        activeMerchant: cartData.activeMerchant ? cartData.activeMerchant : "",
      };
    case ADD_ITEM:
      let items = [...state.items, action.item];
      let hasDiscount = action.item.hasDiscount;

      return {
        items: items,
        qty: items.length,
        cartId: action.item.cartId,
        fsItems: state.fsItems + (action.item.freeDelivery ? 1 : 0),
        totalDiscountPrice:
          state.totalDiscountPrice +
          ("discountPrice" in action.item ? action.item.discountPrice : 0),
        totalDiscountedPrice:
          state.totalDiscountedPrice +
          (hasDiscount
            ? +action.item.discountedTotalPrice
            : +action.item.totalPrice),
        totalPrice: state.totalPrice + +action.item.totalPrice,
        orderCount: state.orderCount + 1,
        ...(state.activeMerchant === "" && {activeMerchant: action.item.merchantCode})
      };
    case REMOVE_ITEM:
      let newItems = state.items.filter(
        (item) => item.cartItemId !== action.id
      );
      let hasDiscount2 = action.item.hasDiscount;

      return {
        items: newItems,
        // qty: state.qty - +action.item.productQty,
        qty: newItems.length,
        fsItems: state.fsItems - (action.item.freeDelivery ? 1 : 0),
        totalDiscountPrice:
          state.totalDiscountPrice - action.item.discountPrice,
        totalPrice: state.totalPrice - action.item.totalPrice,
        orderCount: state.orderCount - 1,
        activeMerchant: state.orderCount - 1 === 0 ? "" : state.activeMerchant,
        totalDiscountedPrice:
          state.totalDiscountedPrice -
          (hasDiscount2
            ? action.item.discountedTotalPrice
            : action.item.totalPrice),
      };
    case CLEAR_ITEMS:
      return INITIAL_STATE;
    case UPDATE_ITEM:
      let oldQty = action.oldItem.productQty;
      let newQty = action.newItem.productQty;
      let oldPrice = +action.oldItem.price * +action.oldItem.productQty;
      let newPrice = +action.oldItem.price * +action.newItem.productQty;
      let computedQty = 0;
      let computedPrice = 0;
      let updatedItems = state.items;
      updatedItems[action.index] = {
        ...updatedItems[action.index],
        productQty: newQty,
      };

      if (oldQty > newQty) {
        computedQty = oldQty - (oldQty - newQty);
        computedPrice = +oldPrice - (+oldPrice - +newPrice);
      }

      if (oldQty < newQty) {
        computedQty = newQty;
        computedPrice = +newPrice;
      }

      // return {
      //   items: state.items,
      //   qty: state.qty,
      //   totalPrice: state.totalPrice,
      // };
      // console.log({
      //   items: state.items,
      //   qty: (state.qty - +oldQty) + computedQty,
      //   totalPrice: (state.totalPrice - +oldPrice) + computedPrice,
      // });

      return {
        items: updatedItems,
        qty: state.qty - +oldQty + computedQty,
        totalPrice: state.totalPrice - +oldPrice + computedPrice,
      };

    default:
      return state;
  }
};
