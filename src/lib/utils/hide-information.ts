export function hideEmail(email: string) {
    if (!email || email.trim().length === 0) {
        return null;
    }

    const [localPart, domain] = email.split("@");
    const hiddenLocalPart = localPart[0] + "*".repeat(localPart.length - 1);
    return `${hiddenLocalPart}@${domain}`;
}
