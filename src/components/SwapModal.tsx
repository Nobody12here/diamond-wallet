import { LiFiWidget, WidgetConfig } from '@lifi/widget';

type Props = {
  open: boolean;
  onClose: () => void;
  allowedChainId: number;
  widgetConfig: WidgetConfig;
};

export function SwapModal({ open, onClose, allowedChainId, widgetConfig }: Props) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box large">
        <div className="modal-header">
          <h3>Swap Assets</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close Swap">×</button>
        </div>
        <LiFiWidget key={`lifi-${allowedChainId}`} integrator="Diamond Wallet" config={widgetConfig} />
      </div>
    </div>
  );
}
