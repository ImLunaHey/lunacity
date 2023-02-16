export const refreshSession = () => {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
};