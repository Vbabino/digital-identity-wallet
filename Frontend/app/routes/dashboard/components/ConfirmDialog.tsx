import { Button } from "~/components/ui/button"
import type { DeleteConfirmState } from "../types"

interface ConfirmDialogProps {
  deleteConfirm: DeleteConfirmState | null
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ deleteConfirm, onCancel, onConfirm }: ConfirmDialogProps) {
  if (!deleteConfirm) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="font-heading text-lg font-bold text-white">Delete Record</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="danger"
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl py-2.5 text-xs font-semibold"
          >
            Delete
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
