<script lang="ts">
	import wiki from 'wikipedia';

	import { Button, ButtonSet, ComboBox } from 'carbon-components-svelte';
	import Pause from 'carbon-icons-svelte/lib/Pause.svelte';
	import Play from 'carbon-icons-svelte/lib/Play.svelte';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import Subtract from 'carbon-icons-svelte/lib/Subtract.svelte';
	import Reset from 'carbon-icons-svelte/lib/Reset.svelte';

	/*
        words loading
        pause
        {prev
        next}
            on:keydown set interval do
            on:keyup clear interval
        variable speed
    */

	interface Result {
		id: number;
		text: string;
		pageid: number;
	}

	let value: string,
		results: Result[],
		search_delay_id: NodeJS.Timer,
		content: string,
		words: string[],
		display: string,
		paused: boolean = true,
		word_interval: number = 200.0415430267062,
		word_interval_id: NodeJS.Timer,
		current_index: number = 0;

	const search_on_input = () => {
		typeof search_delay_id === 'number' ? clearInterval(search_delay_id) : {};
		search_delay_id = setTimeout(() => {
			search();
		}, 1000);
	};

	const select = async ({ detail }) => {
		content = await wiki.content(detail.selectedItem.text);
		pause();
		words = content.split(/\s+/g);
		current_index = 0;
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

	const play = () => {
        if (!words) return
		word_interval_id = setInterval(() => {
			let next = words[current_index];
			if (next) display = next;
			++current_index;
		}, word_interval);
		paused = false;
	};

    let increase_speed_interval: NodeJS.Timeout
	const increase_speed = () => {
		delay(() => --word_interval, 1300, increase_speed_interval);
	};

    let decrease_speed_interval: NodeJS.Timeout
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
		let { results: res } = await wiki.search(value, { limit: 7 }).catch(() => []);
		console.log('res', res);
		if (res)
			results = res.map((r, i) => {
				return {
					id: i,
					text: r.title,
					pageid: r.pageid
				};
			});
		console.log(results);
	};

	search();
</script>

<ComboBox on:keydown={search_on_input} on:select={select} bind:value items={results} />

<p>{display}</p>

<Button size="small" iconDescription="Reset" on:click={reset} icon={Reset} />
<Button
	size="small"
	iconDescription={paused ? 'Play' : 'Pause'}
	icon={paused ? Play : Pause}
	on:click={toggle}
/>
<Button size="small" iconDescription="Reduce Speed" icon={Subtract} on:click={decrease_speed} />
<Button size="small" iconDescription="Increase Speed" icon={Add} on:click={increase_speed} />

<p>{60 / (word_interval / 1000)} words per minute</p>
