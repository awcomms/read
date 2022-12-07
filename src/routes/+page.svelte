<script lang='ts'>
    import wiki from 'wikipedia'

    import { ComboBox } from 'carbon-components-svelte'

    let value: string, results = any[], search_on_input_interval_id: number

    const search_on_input = () => {
        clearInterval(search_on_input_interval_id)
        search_on_input_interval_id = setInterval(()=>{
            search()
        }, 1777)
    }

    const search = async() => {
        ({results} = await wiki.search(value, {limit: 7}).catch(() => []))
        console.log(results)
    }
</script>

<ComboBox bind:value items={results}