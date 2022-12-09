import { writable } from 'svelte/store';
import { browser } from "$app/environment";

export const typeStore = <T>(key = '', initialValue: T) => {
	let previousValue: T;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<T>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, JSON.stringify(v)));
	return s;
};

export const cache = typeStore<Record<string, string>>('cache', {})