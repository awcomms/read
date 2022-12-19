<script lang="ts">
	import Words from '$lib/components/Words.svelte';
	import { Select } from '$lib/components';

	// import type {Item} from "$lib/types"

	import { books, chapters, verses, mapped } from '$lib/bible/kjv';
	import type { Book } from '$lib/types';

	$: if (book && chapter && verse) content = mapped[book][chapter][verse];

	let content: string, book: Book, chapter: number, verse: number;

	const shift = () => {
        console.log('shift')
		let _verses = verses[book][chapter];
		if (_verses[_verses.length - 1].text === verse) {
			let _chapters = chapters[book];
			if (_chapters[_chapters.length - 1].text === chapter) {
				if (!(books[books.length - 1].text === book))
					book = books[books.findIndex((b) => b.text === book) + 1].text;
			} else {
				chapter = chapters[book][chapters[book].findIndex((c) => c.text === chapter) + 1].text
			}
		} else {
			verse = verses[book][chapter][verses[book][chapter].findIndex((v) => v.text === verse) + 1].text
		}
	};
</script>

<Select titleText="Book" on:select={({ detail }) => (book = detail.text)} items={books} />
{#if book}
	<Select
		titleText="Chapter"
		on:select={({ detail }) => (chapter = detail.text)}
		items={chapters[book]}
	/>
	{#if chapter}
		<Select
			titleText="Verse"
			on:select={({ detail }) => (verse = detail.text)}
			items={verses[book][chapter]}
		/>
	{/if}
{/if}

<Words on:end={shift} bind:content />
