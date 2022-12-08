<script lang="ts">
	import wiki from 'wikipedia';

	import { Button, ComboBox, InlineLoading, NumberInput } from 'carbon-components-svelte';
	import Pause from 'carbon-icons-svelte/lib/Pause.svelte';
	import Play from 'carbon-icons-svelte/lib/Play.svelte';
	import Reset from 'carbon-icons-svelte/lib/Reset.svelte';
	import ChevronLeft from 'carbon-icons-svelte/lib/ChevronLeft.svelte';
	import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';

	interface Item {
		id: number;
		text: string;
		pageid?: number;
	}

	$: shift(current_index);
	$: update_speed(word_interval);
	$: if (search_loading) items = [{ id: 0, text: 'Loading items' }];

	let value: string,
		items: Item[],
		search_delay_id: NodeJS.Timer,
		content: string,
		words: string[],
		search_loading: boolean,
		loading: boolean,
		wpm: number,
		display: string,
		paused: boolean = true,
		word_interval: number = 200.0415430267062,
		word_interval_id: NodeJS.Timer,
		current_index: number = 0;

	const update_speed = (..._: number[]) => {
		pause();
		play();
	};

	const search_on_input = () => {
		typeof search_delay_id === 'number' ? clearInterval(search_delay_id) : {};
		search_delay_id = setTimeout(() => {
			search();
		}, 1000);
	};

	const select = async ({ detail }) => {
		loading = true;
		content = await wiki.content(detail.selectedItem.text);
		pause();
		words = content.split(/\s+/g);
		current_index = 0;
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
		if (!words || words.length < 1) return;
		let to = words[current_index];
		if (to) display = to;
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
		let { results: res } = await wiki.search(value, { limit: 7 }).catch(() => []);
		console.log('res', res);
		if (res)
			items = res.map((r, i) => {
				return {
					id: i,
					text: r.title,
					pageid: r.pageid
				};
			});
		search_loading = true;
	};

	search();
</script>

<ComboBox on:keydown={search_on_input} on:select={select} bind:value {items} />

{#if loading}
	<InlineLoading />
{/if}

{#if display}
	<p>{display}</p>

	{#if words && words.length > 0}
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
{/if}

<NumberInput
	on:input={({ detail }) => (word_interval = 60000 / wpm)}
	bind:value={wpm}
	size="sm"
	label="Words per minute"
	min={1}
/>
<NumberInput
	on:input={({ detail }) => (wpm = 60000 / word_interval)}
	bind:value={word_interval}
	size="sm"
	label="Word interval"
	min={1}
	helperText="Words change every {word_interval} millisecond{word_interval > 1 ? 's' : ''}"
/>
<p>{60 / (word_interval / 1000)} words per minute</p>
