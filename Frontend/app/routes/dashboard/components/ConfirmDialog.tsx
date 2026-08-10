import { Button } from "~/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title?: string
  body?: string
  confirmLabel?: string
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title = "Delete Record",
  body = "Are you sure you want to delete this record? This action cannot be undone.",
  confirmLabel = "Delete",
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-zinc-400">{body}</p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="danger"
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl py-2.5 text-xs font-semibold"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="dark-action"
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl py-2.5 text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
