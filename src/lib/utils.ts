import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export async function instaFetch(url: string): Promise<any> {
	return (await fetch(url)).json();
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function itemIdToName(itemId: string): string {
	return itemId.replaceAll('_', ' ').split(' ').map(capitalize).join(' ');
}

export function sum(arr: number[]) {
	return arr.reduce(function (a, b) {
		return a + b;
	}, 0);
}

export function betterMax<T>(arr: T[], callback: (item: T) => number | null): T | undefined {
	let highestNumber = Number.MIN_VALUE;
	let highestItem: T | undefined = undefined;

	for (const item of arr) {
		const num = callback(item);
		if (num === null) continue;

		if (highestNumber < num) {
			highestItem = item;
		}
	}
	return highestItem;
}
