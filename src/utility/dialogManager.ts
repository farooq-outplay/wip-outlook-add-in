let authDialog: Office.Dialog | null = null;

export const setAuthDialog = (dialog: Office.Dialog) => {
  authDialog = dialog;
};

export const getAuthDialog = () => authDialog;

export const clearAuthDialog = () => {
  authDialog = null;
};
