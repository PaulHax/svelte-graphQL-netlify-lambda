
<div class="chat">

	<UserUtility bind:this={userUtil}/>

<!-- <h1>Hello {$myName}!</h1> -->

	{#await preloading}
		<p>Preloading Messages....</p>
	{:then preloaded}
		<MessageList {...preloaded} />
	{:catch error}
		<p>Error preloading messages: {error}</p>
	{/await}

	<form action="" id="sendMessageForm">
		<div class="expandingArea active" id='editMsgGroup'>
			<pre><span bind:this={hiddenTextSpan}></span><br></pre>
			<textarea bind:this={messageTextInput} on:keypress={onKeyPress} placeholder={PLACE_HOLDER} />
		</div>
		<button id="sendButton" form="sendMessageForm" on:click|preventDefault={sendMessage}>
			<svg viewBox="0 0 24 24">
				<path fill="#424242" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
			</svg>
		</button>
	</form>

</div>

<script>
	import { onMount, tick, beforeUpdate, afterUpdate } from 'svelte';
	import { fade } from 'svelte/transition';
	import MessageList, { preload } from './MessageList.svelte';
	import UserUtility from './UserUtility.svelte';
	import { mutate } from 'svelte-apollo';
	import { client, MESSAGES, CREATE_MESSAGE } from './data';
	import { myName, setMyName, authenticate } from './user';
	
	// Approximate sapper preload
	const preloading = preload();

	let userUtil;
	let messageTextInput;
	let hiddenTextSpan;
	
	const PLACE_HOLDER = 'Type here';

	async function sendMessage() {
		let messageText = messageTextInput.value.trim(); //save it

		//get ready for more typing!
		messageTextInput.value = '';
		messageTextInput.focus(); //Enable typing right away when send button clicked
		hiddenTextSpan.textContent = messageTextInput.value;
		
		if (messageText !== '') {
			if (messageText.slice(0, 5) == '/nick') {
				let newName = messageText.slice(6);
				userUtil.setNewName(newName);
			}
			else {
				try {
					await mutate(client, {
						mutation: CREATE_MESSAGE,
						variables: { author: $myName, text: messageText },
						optimisticResponse: {
							createMessage: {
								_id: Math.round(Math.random() * -1000000),
								__typename: "Message",
								author: $myName,
								text: messageText
							}
						},
						//on return of mutation, update local cache of message list
						update:  (dataProxy, { data: { createMessage } }) => {
							try {
								const data = dataProxy.readQuery({ query: MESSAGES });
								if(data) {
									if (!data.messages.data.find(msgCache => msgCache._id === createMessage._id)) {
										//data.messages.data.push(createMessage);
										dataProxy.writeQuery({ query: MESSAGES, data: {
											...data,  //no other attributes at the moment
											messages: { ...data.messages, data: [...data.messages.data, createMessage] }//push ToDo does this thrash memory?
										}});
									}
								}
							} catch (e) {
									// We should always catch here as the cache may be empty or the query may fail
									console.log(e);
							}
						}
					})//.then(data => console.log(data, client));
				} catch(error) {
					console.log(error); //todo make user visible
				}
			}
		}
	}


	//http://alistapart.com/article/expanding-text-areas-made-elegant/
	function makeExpandingArea(container) {
		let area = container.querySelector('textarea');
		let span = container.querySelector('span');
		area.addEventListener('input', function() {
			span.textContent = area.value;
		}, false);
		span.textContent = area.value;
	}

	function onKeyPress(event) {
    if(event.which === 13 && !event.shiftKey) {
				sendMessage();
        event.preventDefault(); // Prevents the addition of a new line in the text field
		} //Todo If new line and textarea height grows, we loose end of message list.
	}

	onMount(() => {
		makeExpandingArea(document.getElementById('editMsgGroup'));
		messageTextInput.focus();
		authenticate();
	});
	
</script>


<style>
/* https://codepen.io/Varo/pen/YPmwpQ?editors=1100 */

	.chat {
		display: flex;
		flex-direction: column;
		max-height: 100%;
	}

	#sendMessageForm {
		display: flex;
    flex-direction: row;
	}

	textarea, 
	pre {
		margin: 0;
		padding: 0;
		outline: 0;
		border: 0;
	}

	.expandingArea {
		position: relative;
		border: 1px solid #888;
		background: #fff;
		border-radius: .5em;

		flex-grow: 1;
	}

	.expandingArea > textarea,
	.expandingArea > pre {
		padding: .25em .5em;
		background: transparent;
		/* font: 400 13px/16px helvetica, arial, sans-serif; */
		font-family: Ubuntu, Helvetica Neue, sans-serif;
		font-size: 18px;
		/* Make the text soft-wrap */
		white-space: pre-wrap;
		word-wrap: break-word;
		word-break: break-all;

		/* min-height:200px; */
	}

	.expandingArea > textarea {
		/* The border-box box model is used to allow
		* padding whilst still keeping the total width at containing element.
		*/
		box-sizing: border-box;
		width: 100%;
		/* This height is used when JS is disabled */
		height: 100px;
	}

	.expandingArea.active > textarea {		
		/* overflow: hidden; *//* Hide any scrollbars */
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		resize: none;
	}

	.expandingArea > pre {
		display: none;
	}
	.expandingArea.active > pre {
		display: block;
		/* Hide the text; just using it for sizing */
		visibility: hidden;
		max-height: 144px;
	}

	#sendButton { 
		background: none;
    border: none;
		padding: 0 2px;
    margin: auto;
	}
  #sendButton svg {
    width: 30px;
    height: 30px;
    text-align: center;
  }
  #sendButton:hover {
    cursor: pointer;
	}
	#sendButton svg path {
    fill: #33F;
	}
  #sendButton:hover svg path {
    fill: #66F;
	}

</style>