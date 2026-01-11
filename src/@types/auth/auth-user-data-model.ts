export type AuthUserDataModel = {
  id: string;
  name: string;
  description?: string;
  email: string;
  userIdentifier: string;
  appearancePrimaryColor?: string | null;
  appearanceTextPrimaryDark?: string;
  appearanceTextPrimaryLight?: string;
  avatarUser: string;
  token: string;
  providers: string[]
}