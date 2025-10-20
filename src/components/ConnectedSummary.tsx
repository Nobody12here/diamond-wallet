type Props = { balance?: string | null; address?: string | null };

export function ConnectedSummary({ balance, address }: Props) {
  const shortAddr = (addr?: string | null) => (addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "");
  return (
    <div className="connected-summary">
      {address ? (
        <>
          <div className="pill">Balance: {balance ?? "—"}</div>
          <div className="pill">{shortAddr(address)}</div>
        </>
      ) : (
        <div className="pill">Wallet not connected</div>
      )}
    </div>
  );
}
