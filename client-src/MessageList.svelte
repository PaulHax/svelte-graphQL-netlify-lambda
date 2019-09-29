<script context="module">
	import { client, MESSAGES } from './data';
	const MSGS_PAGE_SIZE = 20

  export async function preload() {
    return {
      cache: await client.query({ query: MESSAGES, variables: { size: MSGS_PAGE_SIZE, cursor: null} })
    };
	}
</script>
<script>
	import { onMount, beforeUpdate, afterUpdate, tick } from 'svelte';
	import { restore, query } from 'svelte-apollo';
	import { myName } from './user';
	
	const AUTOSCROLL_SLOP_PIXELS = 20;
	
	let activeMessageView;
	let shouldAutoscroll;

	let isLoadingMoreMsgs = false;
	function loadMoreMsgs() {
		if(!!nextMsgCursor && !isLoadingMoreMsgs) {
			isLoadingMoreMsgs = true;
			messages.fetchMore({
				variables: { cursor: nextMsgCursor, size: MSGS_PAGE_SIZE },
				updateQuery: (prev, { fetchMoreResult }) => {
					isLoadingMoreMsgs = false;
					if (!fetchMoreResult) return prev;
					
					nextMsgCursor = fetchMoreResult.messages.after;
					let retVal = {
						...fetchMoreResult,
						messages: {
							...fetchMoreResult.messages,
							data: [
								...prev.messages.data,
								...fetchMoreResult.messages.data,
							],
						}
					};
					return retVal;
				}
			});
		}
	}

	function checkAutoScroll() {
		shouldAutoscroll = isCloseToBottom();
	}

	function isCloseToBottom(closeThreshold=AUTOSCROLL_SLOP_PIXELS) {
		return activeMessageView && 
			(activeMessageView.offsetHeight + activeMessageView.scrollTop) 
			> (activeMessageView.scrollHeight - closeThreshold);
	}

	function maybeScrollToBottom() {
		if (shouldAutoscroll) activeMessageView.scrollTo(0, activeMessageView.scrollHeight);
		if(isCloseToBottom(80)) {
			loadMoreMsgs();
		}
	}
	
	beforeUpdate(() => {
		checkAutoScroll();
	});

	afterUpdate(async () => {
		await tick(); //seems we must wait for scrollHeight to fill in with messages
		maybeScrollToBottom();
		checkAutoScroll();
	});

	function onResize(event) { //ToDo optomize?
		maybeScrollToBottom();
	}

	function onMsgListScroll(event) { //ToDo optomize?
		checkAutoScroll();
		if(isCloseToBottom(80)) {
			loadMoreMsgs();
		}
	}

	onMount(() => {
		activeMessageView.scrollTo(0, activeMessageView.scrollHeight); //scroll to bottom
	});

	export let cache;
	restore(client, MESSAGES, cache.data);
	let nextMsgCursor = cache.data.messages.after;
	const messages = query(client, { query: MESSAGES, size: MSGS_PAGE_SIZE, 
		cursor: nextMsgCursor, pollInterval: 0 } ); //30000 ToDo use subscriptions or messaging service. Avoid polling.
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
		overflow-y: scroll;
		padding: 0;
		margin: 2px 0;
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