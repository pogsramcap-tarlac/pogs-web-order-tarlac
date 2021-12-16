export const LOAD_ITEMS = "cart/LOAD_ITEMS";
export const ADD_ITEM = "cart/ADD_ITEM";
export const REMOVE_ITEM = "cart/REMOVE_ITEM";
export const CLEAR_ITEMS = "cart/CLEAR_ITEMS";
export const UPDATE_ITEM = "cart/UPDATE_ITEM";

export const loadItems = () => ({
  type: LOAD_ITEMS,
});

export const addItem = () => ({
  type: ADD_ITEM,
});

export const removeItem = () => ({
  type: REMOVE_ITEM,
});

export const clearItems = () => ({
  type: CLEAR_ITEMS,
});

export const updateItem = () => ({
  type: UPDATE_ITEM,
});
