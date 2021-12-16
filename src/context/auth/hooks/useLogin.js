import { useState } from 'react';
import { useStateValue } from '../../index';
import { login } from '../actions';

const useLogin = () => {
  const [{ auth }, dispatch] = useStateValue();
  const [isLoading, setIsLoading] = useState(false);

  const fireData = async ({ values, actions }) => {
    setIsLoading(true);

    setIsLoading(false);
    if (values.authenticated) {
      dispatch({...login(), phone: values.phone});
    }
  };

  return [auth, fireData, isLoading];
};

export default useLogin;
