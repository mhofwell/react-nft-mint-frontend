import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNFT from "./utils/MyEpicNFT.json";

// Constants
const CONTRACT_ADDRESS = "0xB2a23b63E784d56cB2c1947F0cE9c2C84eF4105d";
const TWITTER_HANDLE = "hofweller_";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = `https://testnets.opensea.io/collection/brewdaonft-p7uyu8oknw`;
const TOTAL_MINT_COUNT = 50;

const App = () => {
  // Render Methods

  const [currentAccount, setCurrentAccount] = useState("");
  const [nftId, setNftId] = useState("");
  const [minting, setMinting] = useState(false);

  const walletCheck = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Please connect your MetaMask wallet!");
    } else {
      console.log("Ethereum Object:", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Ethereum account:", account);

      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
    } else {
      console.log("No authorized account found.");
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  };


  const inventoryCheck = async () => {
    let tokenId;
    let inventoryRemaining;

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        tokenId = await connectedContract.getCurrentTokenId();
        tokenId = tokenId.toNumber();
        inventoryRemaining = 50 - (tokenId + 1);
        setNftId(inventoryRemaining);

      }
    } catch (error) {
      console.log(error);
    }
  };


  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Please connect your MetaMask wallet!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * This should print out the public address once we auth MetaMask
       */

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NFTMintEvent", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          inventoryCheck();
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintNFT = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
          );
          
        setMinting(true);

        console.log("Paying gas");
        let nftTXN = await connectedContract.makeAnEpicNFT();
        console.log("Mining...");
        await nftTXN.wait();
        setMinting(false);
        
        console.log(
          `Mined, see txn: https://rinkeby.etherscan.io/tx/${nftTXN.hash}`
        );
      } else {
        console.log("Eth object does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    walletCheck();
    inventoryCheck();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today. {nftId}/50
            left!
          </p>
      
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button
              onClick={mintNFT}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          )}
          
            {minting &&
              <div className="sub-text">We're minting your NFT!</div>}

        </div>
        <a href={OPENSEA_LINK}>
          <button className="cta-button connect-wallet-button">View Collection</button>
        </a>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
