export type UserUpdateModel = {
  id?: string;
  name?: string;
  description?: string;
  appearancePrimaryColor?: string | null;
  appearanceTextPrimaryLight?: string;
  appearanceTextPrimaryDark?: string;
  avatar?: File;
  removeAvatar?: boolean;
};
