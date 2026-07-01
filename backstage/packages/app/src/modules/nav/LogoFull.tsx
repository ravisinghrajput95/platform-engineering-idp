import { makeStyles } from '@material-ui/core';
import CloudCartLogo from '../../assets/cloudcart-logo.png';

const useStyles = makeStyles({
  logo: {
    height: 40,
    width: 'auto',
    objectFit: 'contain',
  },
});

export const LogoFull = () => {
  const classes = useStyles();

  return (
    <img
      src={CloudCartLogo}
      alt="CloudCart Platform"
      className={classes.logo}
    />
  );
};
