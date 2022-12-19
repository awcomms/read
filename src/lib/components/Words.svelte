<script lang="ts">
	export let content: string = '';
	import type { Item } from '$lib/types';
	import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox.svelte';

	import wiki from 'wikipedia';

	import {
		Button,
		ComboBox,
		InlineLoading,
		NumberInput,
		Slider,
		Toggle
	} from 'carbon-components-svelte';
	import Pause from 'carbon-icons-svelte/lib/Pause.svelte';
	import Play from 'carbon-icons-svelte/lib/Play.svelte';
	import Reset from 'carbon-icons-svelte/lib/Reset.svelte';
	import ChevronLeft from 'carbon-icons-svelte/lib/ChevronLeft.svelte';
	import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
	import { cache, indices } from '$lib/store';
	import { createEventDispatcher /*onDestroy*/ } from 'svelte';

	const dispatch = createEventDispatcher();
	const calc_speed = (v: number) => 60000 / v;

	$: content_change(content);
	$: set_reading_time(words, word_interval);
	$: shift(current_index);
	$: update_speed(word_interval);
	$: if (search_loading) items = [{ id: 0, text: 'Loading items' }];

	let value: string,
		items: Item[],
		reading_time: string,
		title: string,
		words: string[],
		search_loading: boolean,
		show_content: boolean,
		loading: boolean,
		display: string,
		paused: boolean = true,
		word_interval: number = 200.0415430267062,
		wpm: number = calc_speed(word_interval),
		word_interval_id: NodeJS.Timer,
		current_index: number = 0;

	// const keydown = (e: KeyboardEvent) => {
	// 	if (e.key === 'Enter') {
	//         console.log('i')
	// 		toggle();
	// 	}
	// };

	// const highlight = () => {
	// 	if (!show_content) return;
	// 	let word = words[current_index];
	// 	let before =
	// 		words.slice(0, current_index).reduce((total, c) => total + c.length, 0) +
	// 		Array.from(content.matchAll(/\s/g)).length;
	// 	console.log(before);
	// 	content_display =
	// 		content.substring(0, before + 1) +
	// 		`<span class="highlight">${word}</span>` +
	// 		content.substring(before + word.length + 1);
	// };

	const set_reading_time = (..._: any[]) => {
		if (!words) return;
		let seconds = (word_interval / 1000) * words.length;
		reading_time = `${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds`;
	};

	const update_speed = (..._: number[]) => {
		pause();
		play();
	};

	const resolve_title_index = (title: string) => {
		let index = $indices[title];
		if (typeof index === 'number') {
			return index;
		} else {
			return 0;
		}
	};

	const content_change = async (_content: string) => {
		pause();
		words = content.split(/\s+/g);
		current_index = resolve_title_index(title);
		loading = false;
		play();
	};

	const prev = () => {
		if (current_index > 0) --current_index;
	};

	const next = () => {
		if (current_index < words.length - 1) ++current_index;
	};

	const shift = (..._: any[]) => {
		// if (!title) return;
		// console.log(cache, indices, title, current_index)
		// $indices[title] = current_index
		if (!words || words.length < 1 ) return;
		let to = words[current_index];
		if (to) display = to;
		// if (document) document.getElementById(String(current_index))?.scrollIntoView(true);
        // console.log(current_index, words.length)
		if (current_index === words.length - 1) dispatch('end');
		// highlight();
	};

	const toggle = () => {
		paused ? play() : pause();
	};

	const reset = () => {
		current_index = 0;
	};

	const pause = () => {
		clearInterval(word_interval_id);
		paused = true;
	};

	const play = (..._: any[]) => {
		if (!words) return;
		word_interval_id = setInterval(() => {
			let next = words[current_index];
			if (next) display = next;
			++current_index;
		}, word_interval);
		paused = false;
	};

	let increase_speed_interval: NodeJS.Timeout;
	const increase_speed = () => {
		delay(() => --word_interval, 1300, increase_speed_interval);
	};

	let decrease_speed_interval: NodeJS.Timeout;
	const decrease_speed = () => {
		delay(() => ++word_interval, 1300, decrease_speed_interval);
	};

	const delay = (f: Function, timeout: number = 1300, interval: NodeJS.Timeout) => {
		// clearInterval(interval)
		f();
		// setTimeout(() => {
		// 	setInterval(f);
		// }, timeout);
	};

	const search = async () => {
		search_loading = true;
		await wiki
			.search(value, { limit: 7 })
			.catch(() => [])
			.then((r) => {
				let res = r.results;
				if (res)
					items = res.map((r, i) => {
						return {
							id: i,
							text: r.title,
							pageid: r.pageid
						};
					});
			})
			.finally(() => (search_loading = false));
	};

	search();
</script>

<!-- <svelte:window on:keydown={keydown} /> -->

<div class="div">
	{#if loading}
		<InlineLoading />
	{/if}

	{#if display}
		<div class="controls">
			<p>{display}</p>

			{#if words && words.length > 0}
				<Slider hideTextInput light bind:value={current_index} max={words.length - 1} />
				<Button size="small" iconDescription="Previous" on:click={prev} icon={ChevronLeft} />
				<Button size="small" iconDescription="Next" on:click={next} icon={ChevronRight} />
			{/if}
			<Button size="small" iconDescription="Reset" on:click={reset} icon={Reset} />
			<Button
				size="small"
				iconDescription={paused ? 'Play' : 'Pause'}
				icon={paused ? Play : Pause}
				on:click={toggle}
			/>
		</div>
	{/if}

	<NumberInput
		on:input={({ detail }) => (word_interval = calc_speed(wpm))}
		bind:value={wpm}
		size="sm"
		label="Words per minute"
		min={1}
	/>
	<NumberInput
		on:input={({ detail }) => (wpm = calc_speed(word_interval))}
		bind:value={word_interval}
		size="sm"
		label="Word interval"
		min={1}
		helperText="Words change every {word_interval} millisecond{word_interval > 1 ? 's' : ''}"
	/>

	{#if words}
		<p>Estimated reading time: {reading_time}</p>
	{/if}

	{#if content}
		<Toggle size="sm" bind:toggled={show_content} labelText="Show content" />
		<br />
	{/if}
</div>

{#if content}
	{#if show_content}
		<div class="content">
			{#each words as word, i}
				<span id={String(i)} class:highlight={i === current_index}>{`${word} `}</span>
			{/each}
		</div>
	{/if}
{/if}

<style lang="sass">
	@use '@carbon/colors'
	.content
		height: 210px
		overflow: scroll
	.div
		display: flex
		flex-direction: column
		row-gap: 1rem
	.highlight
		background-color: colors.$blue-20
</style>
