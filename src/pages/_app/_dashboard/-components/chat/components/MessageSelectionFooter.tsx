import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { Trash2, X } from 'lucide-react'

interface MessageSelectionFooterProps {
  selectedCount: number
  isDeleting: boolean
  onCancel: () => void
  onDelete: () => void
}

export function MessageSelectionFooter({
  selectedCount,
  isDeleting,
  onCancel,
  onDelete,
}: MessageSelectionFooterProps) {
  const { t } = useTranslation()

  return (
    <div className="p-4 border-t bg-background flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {t('chat.selection.count', { count: selectedCount })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isDeleting}
          aria-label={t('chat.selection.cancel')}
        >
          <X className="size-4 mr-1" />
          {t('chat.selection.cancel')}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting || selectedCount === 0}
          aria-label={t('chat.selection.delete')}
        >
          {isDeleting ? (
            <Spinner className="mr-1" />
          ) : (
            <Trash2 className="size-4 mr-1" />
          )}
          {t('chat.selection.delete')}
        </Button>
      </div>
    </div>
  )
}
