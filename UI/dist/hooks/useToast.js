import { useCallback } from 'react';
export const useToast = () => {
    const showToast = useCallback((message, duration = 3000) => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => {
                toast.className = 'toast';
            }, duration);
        }
    }, []);
    return { showToast };
};
export default useToast;
