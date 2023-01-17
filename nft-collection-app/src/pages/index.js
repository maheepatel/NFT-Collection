import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../app/page.module.css";


export default function Home() {
  //walletConneted keep track of wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  //presaleStarted keeps track of if the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  //presaleEnded keeps track of if the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  //loading is set to true when we are waiting for a txn to get mined
  const [loading, setLoading] = useState(false);
  //check if currently connectec metamask wallet is the owner or not
  const [isOwner, setIsOwner] = useState(false);
  //tokenIdsMinted keeps track of num of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  //Create a ref to web3 modal (used to connect to metamask)
  //Which remains connected till page is open
  const web3ModalRef = useRef();

  /**
   * presaleMint: Mint an NFT during presale
   */
  const presaleMint = async () => {
    try {
      //we need a signer bcz this is 'write' txn
      const signer = await getProviderOrSigner(true);
      //create a new instance of the Contract with a signer, which allows
      // update METHODS
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      //call the prasaleMint from the contract, only whitelisted addr can mint nfts
      const tx = await nftContract.presaleMint({
        //value- cost of one crypto dev = 0.01eth.
        //we are parsing `0.01` string to ether using the utils lib from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      //wait for txn to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully mintes a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * publicMint: Mint an NFT after presale
   */
  const publicMint = async () => {
    try {
      //we need a signer bcz it `write`txn
      const signer = await getProviderOrSigner(true);
      //create new instance of contract with signer which allows
      //update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      //call mint from contract to mint the Crypto Dev
      const tx = await nftContract.mint({
        //value - cost of crypto dev which is "0.01" eth.
        //we'll parse `0.01` string to ether using utils lib
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      //wait for txn to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * connectWallet: connect metamask
   */
  const connectWallet = async () => {
    try {
      // Get the provider from web3modal(metamask)
      //when used for first time, prompt user to connect metamask
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * startPresale: starts the presale for the nft colln
   */
  const startPresale = async () => {
    try {
      // we need a signer bcz its 'write' txn
      const signer = await getProviderOrSigner(true);
      //creatate new instance of contract with a signer ,
      //which allows update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      //call startPresale
      const tx = await nftContract.startPresale();
      setLoading(true);
      //wait for tx to mined
      await tx.wait();
      setLoading(false);
      // set the presale started to true
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfPresaleStarted: checks if the presale has started
   * by quering the 'presaleStarted' var in contract
   */

  const checkIfPresaleStarted = async () => {
    try {
      // Get the provider from web3modal(metamask)
      // no need for the signer here its just reading from Blockhain
      const provider = await getProviderOrSigner();
      //we connect to the contract using a provider,
      //so we'll have only read-only access
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      //call the presaleStarted from the contract
      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  /**
   * checkIfPresaleStarted: checks if the presale has started
   * by quering the 'presaleStarted' var in contract
   */

  const checkIfPresaleEnded = async () => {
    try {
      // Get the provider from web3modal(metamask)
      // no need for the signer here its just reading from Blockhain
      const provider = await getProviderOrSigner();
      //we connect to the contract using a provider,
      //so we'll have only read-only access
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      //call the presaleStarted from the contract
      const _presaleEnded = await nftContract.presaleStarted();
      //_presaleEnded is a big Number, so we'll use the lt(less than function) instead of '<'
      //Date.now()/1000 returns the current time in secs
      //we compare if the _presaleEnded timestamp is less than the current time
      //which means preesale has ended
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /**
   * getOwner: calls the contract to retrieve the owner
   */ const getOwner = async () => {
    try {
      // Get the provider from web3modal (read-only)
      const provider = await getProviderOrSigner();
      // connect to meatamsk using provider for (read-only)
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      //call the owner function from the contract
      const _owner = await nftContract.owner();
      // we will get signer now to extract the addr of currently conneted metamsk account
      const signer = await signer.getAddress();
      if (isAddress.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  /**
   * getTokenIdsMinted: gets the num of tokenIds that minted
   */

  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3modal (read-only)
      const provider = await getProviderOrSigner();
      // connect to meatamsk using provider for (read-only)
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      //call tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      //_tokenIds is Bit Num. we need to convert Bug num to string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    //connect metamask
    //since we store 'web3modal' as a ref, we need to access the current value to get access to
    //underlying obj
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //if user not connected to Goerli network, let them know and throw error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }

      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /**
   * renderButton: return a button based on the state of the dapp
   */

  const renderButton = () => {
    //If wallet is not connected, return a button which allows the connect
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    //If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    //If connected user is the owner, and presale hasn't started yet, allow them to start presale
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    //If connected user not owner but presales hasn't started yet,tell them this
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasn't started!</div>
        </div>
      );
    }

    //If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started !!! if your address is whitelisted, mint a
            crypto Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    //If presale Started and has ended , its time for public minting
    if (presaleStarted && presaleEnded) {
      retunr(
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="whitelist-Dapp" />
        <link rel="icon" href="/favcion.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}> Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for devlopers in crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <fotter className={styles.footer}>Make with &#10084; by Mahee</fotter>
    </div>
  );
}
