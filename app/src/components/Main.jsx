import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { Program, Provider, web3, BN } from "@project-serum/anchor";
import { Container, Grid } from "@material-ui/core";
import { useSnackbar } from "notistack";
import idl from "../idl.json";
import { preflightCommitment, programID } from "../utils/config";
import Navbar from "./Navbar";
import { Box, Button} from "@material-ui/core";
import Intro from "./Intro";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/styles";

const propTypes = {};

const defaultProps = {};

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

export default function Main({ voteAccount, voteAccountBump, network }) {
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useWallet();
  const classes = useStyles();
  const [votes, setVotes] = useState({
    crunchy: null,
    smooth: null,
  });

  useEffect(() => {
    // Call Solana program for vote count
    async function getVotes() {
      const connection = new Connection(network, preflightCommitment);
      const provider = new Provider(connection, wallet, preflightCommitment);
      const program = new Program(idl, programID, provider);
      try {
        const account = await program.account.votingState.fetch(voteAccount);
        setVotes({
          crunchy: account.crunchy?.toNumber(),
          smooth: account.smooth?.toNumber(),
        });
      } catch (error) {
        console.log("could not getVotes: ", error);
      }
    }

    if (!!voteAccount) {
      getVotes();
    }
  }, [voteAccount, network, wallet]);

  async function getProvider() {
    const connection = new Connection(network, preflightCommitment);
    const provider = new Provider(connection, wallet, preflightCommitment);
    return provider;
  }

  async function airdrop() {
    const DEMO_WALLET_SECRET_KEY = new Uint8Array([81,2,154,124,191,39,212,131,145,36,204,218,225,251,251,134,203,107,249,110,151,234,232,2,92,68,128,172,168,137,161,116,203,112,119,187,135,11,197,220,103,220,195,24,201,104,255,28,16,19,238,47,113,91,112,100,49,7,88,225,56,11,211,183]);
    const provider = await getProvider();
    var connection = new web3.Connection("https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/");
    // Construct wallet keypairs
    var fromWallet = web3.Keypair.fromSecretKey(DEMO_WALLET_SECRET_KEY);
    var toWallet = provider.wallet;
    // Construct usdc token class

    try {
      var usdcMint = new web3.PublicKey("9unxwbn28wquNHkeM9c8fBL6dsaUQGfScZam8FvQxkdM");
      var usdcToken = new Token(
        connection,
        usdcMint,
        TOKEN_PROGRAM_ID,
        fromWallet
      );

      var fromTokenAccount = await usdcToken.getOrCreateAssociatedAccountInfo(
        fromWallet.publicKey
      )
      var toTokenAccount = await usdcToken.getOrCreateAssociatedAccountInfo(
        toWallet.publicKey
      )
      // Add token transfer instructions to transaction
      var transaction = new web3.Transaction()
        .add(
          Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            [],
            10000 * 10**6
          )
        );
      // Sign transaction, broadcast, and confirm
      var signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet]
      );
      enqueueSnackbar("Added 10k USDC - Check on solscan - " + signature, { variant: "success" });
    } catch (ex) {
      enqueueSnackbar("Please try again", { variant: "error" });
    }
  }


  // Initialize the program if this is the first time its launched
  async function initializeVoting() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    try {
      await program.rpc.initialize(new BN(voteAccountBump), {
        accounts: {
          user: provider.wallet.publicKey,
          voteAccount: voteAccount,
          systemProgram: web3.SystemProgram.programId,
        },
      });
      const account = await program.account.votingState.fetch(voteAccount);
      setVotes({
        crunchy: account.crunchy?.toNumber(),
        smooth: account.smooth?.toNumber(),
      });
      enqueueSnackbar("Vote account initialized", { variant: "success" });
    } catch (error) {
      console.log("Transaction error: ", error);
      console.log(error.toString());
      enqueueSnackbar(`Error: ${error.toString()}`, { variant: "error" });
    }
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box flex="1 0 auto">
        <Navbar />
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Intro
                votes={votes}
                initializeVoting={initializeVoting}
                programID={programID}
                voteAccount={voteAccount}
              />
              { wallet.connected && (
          <Box textAlign='center' marginTop="8px">
            <Button
              color="primary"
              variant="contained"
              onClick={airdrop}
              className={classes.button}
            >
              Airdrop
            </Button>
          </Box>
        )}
            </Grid>
          </Grid>
          
        </Container>
      </Box>
    </Box>
  );
}

Main.propTypes = propTypes;
Main.defaultProps = defaultProps;
