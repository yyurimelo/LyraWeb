import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { NotificationTypeEnum } from "@/@types/notification";

interface NotificationSidebarProps {
  selectedType: string
  onTypeChange: (type: string) => void
}

export function NotificationSidebar({
  selectedType,
  onTypeChange,
}: NotificationSidebarProps) {
  const { t } = useTranslation()

  const types = [
    { id: 'all', label: 'Todas', icon: '🔔' },
    { id: NotificationTypeEnum.INVITE_FRIEND, label: 'Solicitações de Amizade', icon: '👥' },
    { id: NotificationTypeEnum.ACCEPT_FRIEND_REQUEST, label: 'Amizades Aceitas', icon: '✅' },
    { id: NotificationTypeEnum.NEW_MESSAGE, label: 'Mensagens', icon: '💬' },
    { id: NotificationTypeEnum.SYSTEM, label: 'Sistema', icon: '⚙️' },
    { id: NotificationTypeEnum.WARNING, label: 'Avisos', icon: '⚠️' },
  ]

  return (
    <aside className="w-64 border-r bg-muted/30 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          Tipos de Notificação
        </h2>
        <nav className="space-y-1">
          {types.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => onTypeChange(type.id)}
            >
              <span className="text-lg">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
