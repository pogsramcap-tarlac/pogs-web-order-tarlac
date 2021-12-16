import { useContext } from "react";
import { Button } from "../Button"
import { fbase } from "../../config/firebaseConfig";
import { withRouter } from 'react-router-dom';
import { StateContext } from '../../context';
import { logout } from "../../context/auth/actions";

const AuthButton = ({ history }) => {
  const [{ auth }, dispatch] = useContext(StateContext);

  const signout = () => {
    fbase.auth().signOut().then(() => {
      dispatch(logout());
      window.location.href = "/";
    }).catch((error) => {
      // An error happened.
    });
  }

  const handleClick = () => {
    history.push('/login');
  }

  if (!auth.logged) {
    return (<Button onClick={handleClick}>SIGN UP</Button>);
  }

  return (
    <Button onClick={signout}>Logout</Button>
  );
}

export default withRouter(AuthButton);