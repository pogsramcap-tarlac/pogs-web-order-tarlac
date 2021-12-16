import React, { useContext, useEffect, useState } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { StateContext } from '../../context';

import Merchants from "../merchant";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [{ auth }] = useContext(StateContext);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
      !loading ?
        auth.logged ?
          <Merchants/> :
          <Redirect to="/login" />
        :
        <div>Loading</div>
  )
}

export default withRouter(Home);