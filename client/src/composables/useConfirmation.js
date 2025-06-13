import { ref } from "vue";

export function useConfirmation() {
  const isOpen = ref(false);
  const config = ref({
    title: "Bevestiging",
    message: "",
    type: "warning",
    confirmText: "Bevestigen",
    cancelText: "Annuleren",
  });

  let resolvePromise = null;
  let rejectPromise = null;

  const show = (options = {}) => {
    config.value = {
      title: options.title || "Bevestiging",
      message:
        options.message || "Weet je zeker dat je deze actie wilt uitvoeren?",
      type: options.type || "warning",
      confirmText: options.confirmText || "Bevestigen",
      cancelText: options.cancelText || "Annuleren",
    };

    isOpen.value = true;

    return new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
  };

  const confirm = () => {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
      rejectPromise = null;
    }
  };

  const cancel = () => {
    isOpen.value = false;
    if (rejectPromise) {
      rejectPromise(false);
      resolvePromise = null;
      rejectPromise = null;
    }
  };

  const close = () => {
    cancel(); // Treat close as cancel
  };

  // Pre-configured confirmation dialogs
  const confirmDelete = (itemName = "dit item") => {
    return show({
      title: "Verwijderen bevestigen",
      message: `Weet je zeker dat je ${itemName} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`,
      type: "danger",
      confirmText: "Verwijderen",
      cancelText: "Annuleren",
    });
  };

  const confirmAction = (actionName = "deze actie") => {
    return show({
      title: "Actie bevestigen",
      message: `Weet je zeker dat je ${actionName} wilt uitvoeren?`,
      type: "warning",
      confirmText: "Doorgaan",
      cancelText: "Annuleren",
    });
  };

  const confirmSave = () => {
    return show({
      title: "Wijzigingen opslaan",
      message: "Weet je zeker dat je deze wijzigingen wilt opslaan?",
      type: "info",
      confirmText: "Opslaan",
      cancelText: "Annuleren",
    });
  };

  return {
    isOpen,
    config,
    show,
    confirm,
    cancel,
    close,
    confirmDelete,
    confirmAction,
    confirmSave,
  };
}
