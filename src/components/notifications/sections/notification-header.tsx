import { memo } from "react";

interface NotificationHeaderProps {
  activeTab: 'unread' | 'read';
  onTabChange: (tab: 'unread' | 'read') => void;
  unreadCount?: number;
}

export const NotificationHeader = memo(({
  activeTab,
  onTabChange,
  unreadCount = 0
}: NotificationHeaderProps) => {
  return (
    <>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Notificações</div>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => onTabChange('unread')}
            className={`text-xs rounded-md transition-colors ${
              activeTab === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            Não lidas
          </button>
          <button
            onClick={() => onTabChange('read')}
            className={`text-xs rounded-md transition-colors ${
              activeTab === 'read'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            Lidas
          </button>
        </div>
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        className="bg-border -mx-1 h-px"
      ></div>
    </>
  );
});

NotificationHeader.displayName = "NotificationHeader";