import Modal from "./Modal";

export default function ConfirmModal({
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  loading = false,
  tone = "danger",
  extra,
}) {
  return (
    <Modal title={title} onClose={onClose} tone={tone}>
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>
        {extra}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-white disabled:opacity-50 ${
            tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#4648d4] hover:bg-[#3d3fc4]"
          }`}
        >
          {loading ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}