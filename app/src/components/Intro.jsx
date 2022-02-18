import React from "react";
import { Box, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/styles";
import { WalletMultiButton } from "@solana/wallet-adapter-material-ui";
import { useWallet } from "@solana/wallet-adapter-react";

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(1),
    "&.hidden": {
      visibility: "hidden",
    },
  },
  connected: {
    color: green[500],
  },
  connectedBubble: {
    backgroundColor: green[500],
    height: 12,
    width: 12,
    borderRadius: "50%",
    marginRight: theme.spacing(0.5),
  },
  title: {
    fontWeight: 700,
  },
}));

export default function Intro({
  votes,
  initializeVoting,
  programID,
  voteAccount,
}) {
  const wallet = useWallet();
  const classes = useStyles();

  return (
    <Box textAlign="center">
      <Typography
        component="h1"
        variant="h3"
        gutterBottom
        className={classes.title}
      >
       Airdrop Devnet USDC
      </Typography>
      <Typography variant="body1">
      Click on Airdrop button it will airdrop 10k USDC to your wallet.
      </Typography>
      <Box marginTop="8px">
        {wallet.connected ? (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Box className={classes.connectedBubble} />
            <Typography variant="body1" className={classes.connected}>
              Connected
            </Typography>
          </Box>
        ) : (
          <Typography variant="body1">
            To get started, connect your wallet below:
          </Typography>
        )}
        <WalletMultiButton
          className={
            wallet.connected
              ? [classes.button, "hidden"].join(" ")
              : classes.button
          }
        />
      </Box>
      
    </Box>
  );
}
