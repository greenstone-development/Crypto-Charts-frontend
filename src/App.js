import logo from './logo.svg';
import './App.css';
import * as React from 'react';
import { BigNumber } from "bignumber.js";


import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { NonceManager } from "@ethersproject/experimental";
import { ethers } from "ethers";
let cryptoChartsABI= require("./utils/CryptoCharts.json");
require('dotenv').config()
const provider = new ethers.providers.JsonRpcProvider(
  process.env.REACT_APP_ALCHEMY_RINKEBY_URL
);
console.log(cryptoChartsABI);
console.log(process.env.REACT_APP_ALCHEMY_RINKEBY_URL);
const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
console.log(wallet)
//const managedWallet = new NonceManager(wallet); // Allow multiple transactions to be made simulataneously

const nftContract = new ethers.Contract(
  process.env.REACT_APP_NFT_CONTRACT_RINKEBY,
  cryptoChartsABI.abi,
  wallet
);


//TODO Call contract pick all data and 

//number of charts




const NFTList = [ 
  {
    "description": "stock chart 3",
    "image": "QmYGkcsnfTD8XVZM7eykwVyhCjRSCiUetCNrt9LEYurnQd?filename=stock3.jpeg",
    "minted": false
  },
  {
    "description": "stock chart 2",
    "image": "QmUKjQk6QuFWifospMU27uKgAop4P1oVBNadRB24VueuER?filename=stock2.jpeg",
    "name": "shares2",
    "startTimestamp": 84949959,
    "endTimestamp": 485884853,
    "movingAverage": 16,
    "high": 20,
    "low": 12,
    "minted": "no"
  },{
    "description": "stock chart 3",
    "image": "QmYGkcsnfTD8XVZM7eykwVyhCjRSCiUetCNrt9LEYurnQd?filename=stock3.jpeg",
    "name": "shares3",
    "startTimestamp": 8477,
    "endTimestamp": 4355,
    "movingAverage": 45,
    "high": 50,
    "low": 32,
    "minted": "no"
  }
  
]
const getData = async () => {
  const availableChartsCount = new BigNumber( await nftContract.getMintedCount());
  console.log(availableChartsCount);
  console.log(availableChartsCount.integerValue());
  //const ipfLinks = await nftContract.ipfsLinks
  // for(let i=0; i < availableChartsCount;i++){
      
  // }

}

function App() {
  getData()
  return (
    <React.Fragment>
    <CssBaseline />
    <Container fixed>
      <Box sx={{ bgcolor: '#cfe8fc', height: '100vh' }}>
        <div class="row">
          {NFTList.map((item)=>{
          return (
            <div className="col-sm-4 col-md-4 ">
                <MediaCard imageLink={item.image}/>
                <br></br>
            </div>
          );
        })}
      </div>
      
      </Box>
    </Container>
  </React.Fragment>
   
  );
}




export const  MediaCard =({imageLink}) => {
  
  console.log(imageLink)
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        height="140"
        image={`https://gateway.pinata.cloud/ipfs/${imageLink}`}
        alt="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Lizard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lizards are a widespread group of squamate reptiles, with over 6,000
          species, ranging across all continents except Antarctica
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}

export default App;
