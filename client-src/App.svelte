<script>
	import HeadChat from './HeadChat.svelte';

	export let name;

	fetch("/.netlify/functions/hello-world")
      .then(response => response.json())
      .then(json => console.log(json))
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}!</h1>
<p>mee</p>
<HeadChat />