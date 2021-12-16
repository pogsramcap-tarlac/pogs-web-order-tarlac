import { useState } from "react";
import { useStateValue } from "../../index";
import {
  addItem,
  removeItem,
  updateItem,
  ADD_ITEM,
  REMOVE_ITEM,
  UPDATE_ITEM,
  CLEAR_ITEMS,
  clearItems,
  OVERWRITE_ITEMS,
  overwriteItems,
} from "../actions";

const useCart = () => {
  const [{ cart }, dispatch] = useStateValue();
  const [isLoading, setIsLoading] = useState(false);

  const cartData = async ({ items, action }) => {
    setIsLoading(true);

    setIsLoading(false);
    if (action === ADD_ITEM) {
      dispatch({ ...addItem(), item: items });
    }

    if (action === REMOVE_ITEM) {
      dispatch({ ...removeItem(), id: items.id, item: items.item });
    }

    if (action === CLEAR_ITEMS) {
      dispatch({ ...clearItems() });
    }

    if (action === UPDATE_ITEM) {
      dispatch({
        ...updateItem(),
        index: items.index,
        oldItem: items.oldItem,
        newItem: items.newItem,
      });
    }
  };

  return [cart, cartData, isLoading];
};

export default useCart;
