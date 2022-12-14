<script lang="ts">
	import type { Item } from '$lib/types';
	import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox.svelte';

	import wiki from 'wikipedia';

	import {
		ComboBox,
	} from 'carbon-components-svelte';

	import { cache, indices } from '$lib/store';
	import Words from '$lib/components/Words.svelte';

	$: if (search_loading) items = [{ id: 0, text: 'Loading items' }];

	let value: string,
		items: Item[],
		search_delay_id: NodeJS.Timer,
		content: string,
		title: string,
		search_loading: boolean;

	const search_on_input = () => {
		typeof search_delay_id === 'number' ? clearInterval(search_delay_id) : {};
		search_delay_id = setTimeout(() => {
			search();
		}, 1000);
	};

	const resolve_title_index = (title: string) => {
		let index = $indices[title];
		if (typeof index === 'number') {
			return index;
		} else {
			return 0;
		}
	};

	const select = async (e: CustomEvent<{ selectedId: any; selectedItem: ComboBoxItem }>) => {
		const { detail } = e;
		title = detail.selectedItem.text;
		content = await wiki.content(title);
		$cache[title] = content;
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

<ComboBox on:keydown={search_on_input} on:select={select} bind:value {items} />
<Words bind:content />