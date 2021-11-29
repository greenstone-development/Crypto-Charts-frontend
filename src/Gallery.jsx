import React, { useEffect, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { ethers } from "ethers";
import axios from "axios";
import cryptoChartsArtifact from "./utils/CryptoCharts.json";

const CONTRACT_ADDRESS = "0x8E100E3Fe73B6bEe5b298E8BAeEE8FDe6d96AC41";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const connectedContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  cryptoChartsArtifact.abi,
  provider
);

export default function Gallery({ connectWallet }) {
  const [charts, setCharts] = useState([]);
  const [status, setStatus] = useState({});
  const [signerAddress, setSignerAddress] = useState({});

  const formatIPFSUrl = (ipfsLink) =>
    ipfsLink.replace("ipfs://", "https://ipfs.io/ipfs/");

  const getChartMetadata = async () => {
    // Get IPFS URLs from contract and format links to http.
    const pendingIpfsLinks = [];
    const totalSupply = await connectedContract.totalSupply();
    for (let i = 0; i < totalSupply; i += 1) {
      pendingIpfsLinks.push(connectedContract.ipfsLinks(i));
    }
    let ipfsLinks = await Promise.all(pendingIpfsLinks);
    ipfsLinks = ipfsLinks.map(formatIPFSUrl);

    // GET request on each IPFS link to get metadata JSON
    const pendingMetadataLinks = [];
    ipfsLinks.forEach((link) => {
      pendingMetadataLinks.push(axios.get(link));
    });
    let allMetadata = await Promise.all(pendingMetadataLinks);
    allMetadata = allMetadata.map((axiosRes) => ({
      ...axiosRes.data,
      image: formatIPFSUrl(axiosRes.data.image),
    }));

    // Set isMinted if owner exists
    //! https://stackoverflow.com/a/46024590
    const promises = allMetadata.map(async (meta) => {
      return connectedContract.ownerOf(meta.attributes[1].value);
    });
    const results = await Promise.all(promises.map((p) => p.catch((e) => e)));
    results.forEach((res, i) => {
      if (!(res instanceof Error)) {
        allMetadata[i].isMinted = true;
        allMetadata[i].owner = res;
      }
    });

    setCharts(allMetadata);
  };

  const mintNFT = async (tokenId) => {
    // setIsProcessing(true);
    const numAccounts = await provider.listAccounts();

    if (numAccounts.length === 0) {
      console.log("Calling connect wallet");
      await connectWallet();
    }
    try {
      const { ethereum } = window;

      if (ethereum) {
        // const connected = await isConnectedToRinkeby();
        // if (!connected) {
        //   return;
        // }

        const connectedContractWithSigner = new ethers.Contract(
          CONTRACT_ADDRESS,
          cryptoChartsArtifact.abi,
          signer
        );

        console.log("Prompting for gas payment...");
        setStatus({
          ...status,
          [tokenId]: "Prompting for gas payment...",
        });
        const nftTxn = await connectedContractWithSigner.mintChart(tokenId);

        console.log("Confirming tx...");
        setStatus({
          ...status,
          [tokenId]: "Confirming tx...",
        });
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setStatus({
          ...status,
          [tokenId]: `Belongs to you`,
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setStatus({
        ...status,
        [tokenId]: "Mint",
      });
    }
    // setIsProcessing(false);
  };

  const renderMintButton = (chart) => {
    const chartId = chart.attributes[1].value;

    if (status[chartId] === "Belongs to you") {
      return <Button variant="outlined">Belongs to you</Button>;
    }
    if (chart.isMinted) {
      if (chart.owner === signerAddress) {
        return <Button variant="outlined">Belongs to you</Button>;
      }
      return <Button variant="outlined">Claimed</Button>;
    }
    return (
      <Button variant="contained" onClick={() => mintNFT(chartId)}>
        {status[chartId] || "Mint"}
      </Button>
    );
  };

  const renderGallery = () => {
    const images = charts.map((chart) => (
      <Box key={chart.image}>
        <ImageListItem>
          <img
            src={`${chart.image}`}
            srcSet={`${chart.image}`}
            alt={`${chart.name} ${chart.description}`}
            loading="lazy"
          />

          {/* TODO: Style correctly. */}
          {/* Error in console: <div> cannot appear as a descendant of <p> */}
          <Typography color="common.white">
            <ImageListItemBar
              title={chart.name}
              subtitle={<span>{`ID: ${chart.attributes[1].value}`}</span>}
              position="below"
            />
          </Typography>
        </ImageListItem>
        {renderMintButton(chart)}
      </Box>
    ));
    return images;
  };

  useEffect(async () => {
    await getChartMetadata();
    // if (signer.provider._address) {
    //   setSignerAddress(await signer.getAddress());
    // }
    // setSignerAddress(await signer.getAddress());
  }, []);

  return (
    <Container maxWidth="lg">
      <ImageList cols={3} gap={8}>
        {renderGallery()}
      </ImageList>
    </Container>
  );
}
