<script context="module">
	import { client, MESSAGES } from './data';

  export async function preload() {
    return {
      cache: await client.query({ query: MESSAGES })
    };
	}
</script>
<script>
	import { onMount, beforeUpdate, afterUpdate, tick } from 'svelte';
	import { restore, query } from 'svelte-apollo';
	import { myName } from './data';
	
	const STICKY_SCROLL_SLOP_PIXELS = 20;
	
	let activeMessageView;
	
	function checkAutoScroll() {
		autoscroll = activeMessageView && 
			(activeMessageView.offsetHeight + activeMessageView.scrollTop) 
			> (activeMessageView.scrollHeight - STICKY_SCROLL_SLOP_PIXELS);
	}

	function maybeScrollToBottom() {
		if (autoscroll) activeMessageView.scrollTo(0, activeMessageView.scrollHeight);
	}
  
	let autoscroll;
	beforeUpdate(() => {
		checkAutoScroll();
	});

	afterUpdate(async () => {
		await tick(); //seems we must wait for size of scrollHeight to fill in with all messages
		maybeScrollToBottom();
	});

	function onResize(event) {		
		maybeScrollToBottom();
	}

	function onMsgListScroll(event) {
		checkAutoScroll();
	}

	onMount(() => {
		//scroll to bottom
		activeMessageView.scrollTo(0, activeMessageView.scrollHeight);
	});

	export let cache;
	restore(client, MESSAGES, cache.data);
	const messages = query(client, { query: MESSAGES });
	//$: console.log($messages);
</script>

<svelte:window on:resize={onResize}/>

<ol class="messages" bind:this={activeMessageView} on:scroll={onMsgListScroll}>
	{#await $messages}
		<li>Loading...</li>
	{:then result}
		{#each result.data.messages.data as message (message._id)}
			<li class={message.author === $myName ? 'me': ''}>
				<span>{message.author} : {message.text}</span>
			</li>
		{:else}
			<li>No messages yet.</li>
		{/each}
	{:catch error}
		<li>Error loading messages: {error}</li>
	{/await}
</ol>

<style>
	.messages {
		/* flex-grow: 1; */

		overflow-y: scroll;
		/* flex-direction: column-reverse; */

		padding: 0;
		margin: 2px 0;
		/* list-style-type: none; */

		/* max-height: 300px; */
	}

	.messages li {
		margin: 0.5em auto;
		display: flex;
  }

	.messages li.me {
		justify-content: flex-end;
  }

	.messages li span {
		display: inline-block;
		padding: .5em .5em .5em .5em;
		border-radius: 1em 1em 1em 0;
		background: hsl(0, 0%, 98%);
    color: #000;
		word-break: break-all;
		white-space: pre-wrap;
	}

	.messages li.me span {
    background: #33F;
		color: #FEFEFE;
		border-radius: 1em 1em 0 1em;
  }
</style>