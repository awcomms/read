<script lang="ts">
	export let titleText: string, items: Item[] = [], placeholder: string | undefined = undefined;

	import { ComboBox } from 'carbon-components-svelte';
	import type { Item } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	$: dispatch_select(selectedId);

	const dispatch = createEventDispatcher();

	let value: string = '',
		
		selectedId: any;

	const dispatch_select = (_: any) => {
		let item = get_selected();
		if (item) dispatch('select', item);
	};

	const get_selected = () => items.find((i) => i.id === selectedId);

	const search = (_: string) => {
		items.sort((a, b) => {
			return 0;
		});
	};
</script>

<ComboBox bind:selectedId bind:value {titleText} {placeholder} bind:items />