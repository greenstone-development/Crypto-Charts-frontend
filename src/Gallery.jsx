import React, { useEffect, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { ethers } from "ethers";
import axios from "axios";

import { CONTRACT_ADDRESS } from "./App";
import cryptoChartsArtifact from "./utils/CryptoCharts.json";

export default function Gallery() {
  useEffect(() => {
    getChartMetadata();
  }, []);

  const [charts, setCharts] = useState([]);

  const formatIPFSUrl = (ipfsLink) =>
    ipfsLink.replace("ipfs://", "https://ipfs.io/ipfs/");

  const getChartMetadata = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      cryptoChartsArtifact.abi,
      provider
    );

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

    setCharts(allMetadata);
    console.log(allMetadata);
  };

  return (
    <Container maxWidth="lg">
      <ImageList cols={3} gap={8}>
        {charts.map((chart) => (
          <ImageListItem key={chart.image}>
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
        ))}
      </ImageList>
    </Container>
  );
}
