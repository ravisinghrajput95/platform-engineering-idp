import { makeStyles } from '@material-ui/core';
import CloudCartLogo from '../../assets/cloudcart-logo.png';

const useStyles = makeStyles({
  logo: {
    height: 32,
    width: 32,
    objectFit: 'contain',
  },
});

export const LogoIcon = () => {
  const classes = useStyles();

  return (
    <img
      src={CloudCartLogo}
      alt="CloudCart"
      className={classes.logo}
    />
  );
};
