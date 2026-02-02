let authDialog: Office.Dialog | null = null;

export function setAuthDialog(dialog: Office.Dialog) {
  authDialog = dialog;
}

export function getAuthDialog() {
  return authDialog;
}

export function clearAuthDialog() {
  authDialog = null;
}
