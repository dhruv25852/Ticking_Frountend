const FIELD_SELECTOR = 'input:not([type="hidden"]), textarea, select';
const INVALID_FIELD_SELECTOR =
  '[aria-invalid="true"], input[class*="border-rose-"], input[class*="border-red-"], input[class*="border-amber-"], textarea[class*="border-rose-"], textarea[class*="border-red-"], textarea[class*="border-amber-"], select[class*="border-rose-"], select[class*="border-red-"], select[class*="border-amber-"]';
const ERROR_MESSAGE_SELECTOR =
  '[class*="text-rose-"], [class*="text-red-"], [class*="text-amber-"]';

const isVisible = (element) => element.getClientRects().length > 0;

const focusField = (field) => {
  if (!field || field.disabled || !isVisible(field)) return false;

  field.focus({ preventScroll: true });
  field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  return true;
};

export const focusFirstInvalidField = (form) => {
  if (!(form instanceof HTMLFormElement)) return false;

  const invalidField = Array.from(form.querySelectorAll(INVALID_FIELD_SELECTOR)).find(
    isVisible,
  );
  if (focusField(invalidField)) return true;

  const errorMessage = Array.from(form.querySelectorAll(ERROR_MESSAGE_SELECTOR)).find(
    (element) => element.textContent.trim() && isVisible(element),
  );
  if (!errorMessage) return false;

  let container = errorMessage.parentElement;
  while (container && container !== form) {
    const fields = Array.from(container.querySelectorAll(FIELD_SELECTOR)).filter(
      isVisible,
    );
    if (fields.length === 1 && focusField(fields[0])) return true;
    container = container.parentElement;
  }

  return false;
};
