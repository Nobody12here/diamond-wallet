import diora from "../assets/diora.png";

export function WalletHeader() {
  return (
    <div className="actions-header">
      <div className="logo">
        <img src={diora} alt="Diora" />
      </div>
      <h2 className="actions-title">DIORA Wallet</h2>
    </div>
  );
}
