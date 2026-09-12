import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

const createToastStore = () => {
	const { subscribe, update } = writable<ToastItem[]>([]);

	const add = (message: string, type: ToastType = 'info', duration: number = 4000) => {
		const id = Math.random().toString(36).substring(2, 9);
		const newItem: ToastItem = { id, message, type, duration };

		update((items) => [...items, newItem]);

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}
	};

	const remove = (id: string) => {
		update((items) => items.filter((item) => item.id !== id));
	};

	return {
		subscribe,
		success: (msg: string, dur?: number) => add(msg, 'success', dur),
		error: (msg: string, dur?: number) => add(msg, 'error', dur),
		info: (msg: string, dur?: number) => add(msg, 'info', dur),
		warning: (msg: string, dur?: number) => add(msg, 'warning', dur),
		remove
	};
};

export const toasts = createToastStore();
