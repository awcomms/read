<script lang='ts'>
    import {Words} from "$lib/components"
    import { TextArea } from "carbon-components-svelte";

    let content: string
</script>

<TextArea bind:value={content} />
<Words {content} />

