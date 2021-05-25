export const clearSearchParams = (): void => {
    if (typeof window !== 'undefined') {
        window.history.replaceState('', '', `${window.location.pathname}`)
    }
}