"use client"

import "./App.css"
import diora from "./assets/diora.png";
import { useEffect, useState } from "react"
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react"
import { useAccount } from "wagmi"
import { SendTransaction } from "./components/sendTransaction"
import { Balance } from "./components/getBalance"
import { SwitchChain } from "./components/switchNetwork"
import { useWalletUI, useWeb3AuthUser } from "@web3auth/modal/react"
import { Copy, Shield } from "lucide-react"
import { EmbeddedWallet } from "@apillon/wallet-react";

function App() {
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect()
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect()
  const { showWalletUI, loading, error } = useWalletUI()
  const { address } = useAccount()
  const { userInfo } = useWeb3AuthUser()
  const [autoLoginTriggered, setAutoLoginTriggered] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (!isConnected && !connectLoading && !connectError && !autoLoginTriggered) {
  //       connect()
  //       setAutoLoginTriggered(true)
  //     }
  //   }, 1000)

  //   return () => clearTimeout(timer)
  // }, [isConnected, connectLoading, connectError, connect, autoLoginTriggered])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}....${addr.slice(-6)}`
  }

  const loggedInView = (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src={diora} alt="Diora" />
          </div>
          <div className="header-actions">

            <button onClick={() => disconnect()} className="header-btn primary">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              <img src={userInfo?.profileImage} alt="Profile" />
            </div>
            <h3 className="profile-name">{userInfo?.name}</h3>
            <p className="profile-email">{userInfo?.email}</p>


            <div className="wallet-address">
              <span className="address-text">{formatAddress(address || "")}</span>
              <button onClick={() => copyToClipboard(address || "")} className="copy-btn">
                <Copy size={16} />
              </button>
            </div>
          </div>


        </aside>

        {/* Content Area */}
        <main className="content">
          <div className="services-grid">
            {/* Wallet Services */}
            <div className="service-card">
              <div className="service-header">
                <div className="service-icon wallet-icon">
                  <div className="wallet-graphic"></div>
                </div>
                <div>
                  <h3>Wallet Services</h3>
                  <p>Production-ready wallet UI</p>
                </div>
              </div>
              <div className="service-actions">
                <button onClick={() => showWalletUI()} className="service-btn">
                  Show Wallet
                </button>
                {/* <button className="service-btn">Use Fiat Onramp</button>
                <button className="service-btn">Connect to Applications</button>
                <button className="service-btn">Swap</button>
                <button className="service-btn">Sign Personal Message</button> */}
              </div>
            </div>


          </div>

          {/* Hidden components for functionality */}
          <div style={{ display: "block" }}>
            <SendTransaction />
            <Balance />
            <SwitchChain />
          </div>
        </main>
      </div>
    </div>
  )

  const unloggedInView = (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <img src={diora} alt="Diora" />
        </div>

        <EmbeddedWallet
          clientId={import.meta.env.VITE_APOLIOS_KEY}
          defaultNetworkId={1287}
          networks={[
            {
              name: "Moonbase Testnet",
              id: 1287,
              rpcUrl: "https://rpc.testnet.moonbeam.network",
              explorerUrl: "https://moonbase.moonscan.io",
            },
            /* ... */
          ]}
        />

      </div>
    </div>
  )

  return <div className="app">{isConnected ? loggedInView : unloggedInView}</div>
}

export default App
