import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageCount: number
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  messageCount,
  onConfirm,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('chat.deleteMessages.title')}</DialogTitle>
          <DialogDescription>
            {t('chat.deleteMessages.description', { count: messageCount })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('chat.deleteMessages.cancel')}
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner /> : t('chat.deleteMessages.confirm')}
           
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
