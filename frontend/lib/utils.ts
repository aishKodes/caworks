export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPhoneForTel(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}
