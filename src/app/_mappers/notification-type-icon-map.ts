import { Users, CheckCircle, MessageCircle, AlertTriangle, Bell } from "lucide-react";

export const notificationTypeIconMap = {
  0: Users,        // Friend request
  1: CheckCircle,  // Accept friend request
  2: MessageCircle, // New message
  3: Bell,         // System
  4: AlertTriangle, // Warning
};