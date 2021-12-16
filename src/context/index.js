import React, { createContext, useReducer, useContext } from 'react';
// import { authReducer } from './reducers/AuthReducer';

export const StateContext = createContext();
export const useStateValue = () => useContext(StateContext);

const StateContextProvider = ({ reducer, initialState, children }) => {
    return (
        <StateContext.Provider value={useReducer(reducer, initialState)}>
            {children}
        </StateContext.Provider>
    );
}

export default StateContextProvider;
