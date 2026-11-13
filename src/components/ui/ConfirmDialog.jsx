import { useState } from "react";
import Modal from "./Modal.jsx";
import Icon from "./Icon.jsx";

/**
 * Confirmation dialog for destructive or irreversible actions
 * (delete a job, reject an application, take an ad down).
 */
export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onClose,
  children,
}) {
  const [internalBusy, setInternalBusy] = useState(false);
  const working = busy || internalBusy;

  const handleConfirm = async () => {
    setInternalBusy(true);
    try {
      await onConfirm?.();
    } finally {
      setInternalBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={working ? () => {} : onClose}
      title={title}
      description={message}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={working}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={handleConfirm}
            disabled={working}
          >
            {working ? <Icon name="loader" size={15} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

export default ConfirmDialog;
