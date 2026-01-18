/**
 * Helper functions para lidar com notificações
 */

/**
 * Verifica se uma notificação está não lida
 *
 * O status pode vir em diferentes formatos do backend:
 * - 'Unread' (do backend inicial, com letra maiúscula)
 * - 'unread' (depois do SignalR update, normalizado)
 * - false (quando enviado como boolean)
 *
 * @param status - O status da notificação
 * @returns true se a notificação está não lida
 */
export function isNotificationUnread(status: string | boolean | undefined | null): boolean {
  if (status === false) return true
  if (status === true || status === null || status === undefined) return false

  const normalized = String(status).toLowerCase()
  return normalized === 'unread' || normalized === 'false'
}

/**
 * Verifica se uma notificação está lida
 *
 * @param status - O status da notificação
 * @returns true se a notificação está lida
 */
export function isNotificationRead(status: string | boolean | undefined | null): boolean {
  return !isNotificationUnread(status)
}

/**
 * Normaliza o status da notificação para um formato padrão
 *
 * @param status - O status da notificação
 * @returns 'read' | 'unread'
 */
export function normalizeNotificationStatus(status: string | boolean | undefined | null): 'read' | 'unread' {
  return isNotificationUnread(status) ? 'unread' : 'read'
}
