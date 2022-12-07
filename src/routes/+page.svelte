<script lang="ts">
	import wiki from 'wikipedia';

	import { Button, ComboBox } from 'carbon-components-svelte';
	import Pause from 'carbon-icons-svelte/lib/Pause.svelte';
	import Play from 'carbon-icons-svelte/lib/Play.svelte';

	/*
        words loading
        pause
        {prev
        next}
            on:keydown set interval do
            on:keyup clear interval
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

	const pause = () => clearInterval(word_interval_id);

	const play = () => {
		word_interval_id = setInterval(() => {
			let next = words[current_index];
			if (next) display = next;
			++current_index;
		}, word_interval);
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

<Button icon={paused ? Play : Pause} on:click={toggle} />
