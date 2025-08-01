import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

const clientId = "BKU3VnOyBH3hIgKhlsYVQHQF6_5K6Ay9RmM73A_hgDmQmmPh33BA4Vy7b9WRkzH9ozXAQwE5QywK01u25ug0yC8"; // get from https://dashboard.web3auth.io

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    
  }
};

export default web3AuthContextConfig;
