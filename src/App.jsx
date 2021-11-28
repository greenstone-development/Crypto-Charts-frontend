import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import "./styles/App.css";
import cryptoChartsArtifact from "./utils/CryptoCharts.json";
import Gallery from "./Gallery.jsx";

// Constants
const TWITTER_HANDLE = "CryptoChartsPLACEHOLDER";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// ENS name resolves to 0x6aA98e3eFaDE04b250296F4a7cd7c87FfFF81121
export const CONTRACT_ADDRESS = "cryptocharts.test";
const OPENSEA_URL = "https://testnets.opensea.io/assets/cryptocharts-v2";

// TODO: Reuse providers/contract when MetaMask is available?
let provider;
let connectedContract;

const App = () => {
  useEffect(() => {
    checkIfWalletIsConnected();
    getQuantities(); // TODO: Incorrect use of useEffect?
  }, []);

  const [currentAccount, setCurrentAccount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);

  const isConnectedToRinkeby = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    if (chainId !== "0x4") {
      alert("You are not connected to the Rinkeby Test Network!");
      return false;
    }
    return true;
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length === 0) {
      console.log("No authorized accounts found.");
    } else {
      const account = accounts[0];
      console.log("Found an authorized account:", account);

      setCurrentAccount(account);
      setupEventListener();
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const getQuantities = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      cryptoChartsArtifact.abi,
      provider
    );
    const totalSupply = connectedContract.totalSupply();
    const totalMinted = connectedContract.totalMinted();
    const stats = await Promise.all([totalSupply, totalMinted]);

    setTotalSupply(ethers.BigNumber.from(stats[0]).toNumber());
    setTotalMinted(ethers.BigNumber.from(stats[1]).toNumber());
  };

  const askContractToMintNft = async () => {
    setIsProcessing(true);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const connected = await isConnectedToRinkeby();
        if (!connected) {
          return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          cryptoChartsArtifact.abi,
          signer
        );

        console.log("Prompting for gas payment...");
        const nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
    setIsProcessing(false);
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          cryptoChartsArtifact.abi,
          signer
        );

        connectedContract.on("ChartMinted", (buyer, tokenId) => {
          console.log(buyer, tokenId.toNumber());
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

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderMintButton = () => {
    if (!isProcessing) {
      return (
        <button
          onClick={askContractToMintNft}
          className="cta-button connect-wallet-button"
        >
          Mint NFT
        </button>
      );
    }
    return (
      <button disabled className="cta-button connect-wallet-button">
        Processing...
      </button>
    );
  };

  const renderViewCollectionButton = () => {
    return (
      <button
        onClick={() => {
          window.open(OPENSEA_URL, "_blank");
        }}
        className="cta-button view-collection-button"
      >
        🌊 View Collection on OpenSea
      </button>
    );
  };

  const renderQuantities = () => {
    const plural = totalMinted === 1 ? "chart has" : "charts have";
    return (
      <p className="sub-text">
        {`${totalMinted} ${plural} been claimed. Only ${
          totalSupply - totalMinted
        } remain.`}
      </p>
    );
  };
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">CryptoCharts</p>
          <p className="sub-text">Add witty description here</p>
          {renderQuantities()}
          <div>
            {currentAccount === ""
              ? renderNotConnectedContainer()
              : renderMintButton()}
          </div>
          <div>{renderViewCollectionButton()}</div>
        </div>
        <div className="gallery-container">
          <Gallery />
        </div>
        <div className="footer-container">
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
