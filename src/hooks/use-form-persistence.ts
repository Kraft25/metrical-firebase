"use client";

import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

export function useFormPersistence({ control, name, setValue }: { control: any, name: string, setValue: Function }) {
    const isInitialLoad = useRef(true);

    const watchedForm = useWatch({ control });

    const debouncedSave = debounce((data) => {
        try {
            if (!isInitialLoad.current) {
                window.localStorage.setItem(name, JSON.stringify(data));
            }
        } catch (error) {
            console.error(`Failed to save form data for "${name}" to localStorage`, error);
        }
    }, 500);

    useEffect(() => {
        try {
            const savedData = window.localStorage.getItem(name);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                for (const key in parsedData) {
                    setValue(key, parsedData[key], { shouldValidate: true });
                }
            }
        } catch (error) {
            console.error(`Failed to load form data for "${name}" from localStorage`, error);
        } finally {
            isInitialLoad.current = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, setValue]);

    useEffect(() => {
        const subscription = control.register('subscription', () => {});
        debouncedSave(watchedForm);
        return () => subscription.unsubscribe();
    }, [watchedForm, debouncedSave, control]);
}