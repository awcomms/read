import { writable } from 'svelte/store';
import { browser } from "$app/environment";

export const type_store = <T>(key = '', initialValue: T) => {
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

export const number_store = (key = '', initialValue: number) => {
	let previousValue: number;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = Number(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<number>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, String(v)));
	return s;
};

export const cache = type_store<Record<string, string>>('cache', {})
export const indices = type_store<Record<string, number>>('indices', {})