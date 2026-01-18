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

interface RemoveFriendConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  friendName: string
  onConfirm: () => void
  isRemoving: boolean
}

export function RemoveFriendConfirmationDialog({
  open,
  onOpenChange,
  friendName,
  onConfirm,
  isRemoving,
}: RemoveFriendConfirmationDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('chat.removeFriend.title')}</DialogTitle>
          <DialogDescription>
            {t('chat.removeFriend.description', { name: friendName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            {t('chat.removeFriend.cancel')}
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? <Spinner /> : t('chat.removeFriend.confirm')}
            
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
