<script>
  import { myName, setMyName, isSignedIn, signOut, authenticate } from './user'; 
  import netlifyIdentity from 'netlify-identity-widget';
  import { onMount } from 'svelte';

  let userInputBox;
  export async function setNewName(newName) {
    try {
      await setMyName(newName);
    } catch(e) {
      if(e.message.includes('GraphQL error: Instance is not unique')) { //todo not needed as name is not unique anymore
        greeting = newName + ' is taken'
      }
      else {
        throw e;
      }
    }
  }

  let greeting = 'Hello ';
  $: greeting = 'Hello ' + $myName;


  async function onSignIn(user) {
    //get name and possibly create user    
    const isDuplicateName = await authenticate();
    if(isDuplicateName) {
      alert(isDuplicateName + ' is taken so you got a random name.  Type /nick [new name] in the message bar');
    }
  }

  function onSignOut() {
    signOut();
  }
  
  netlifyIdentity.init();
  netlifyIdentity.on('login', onSignIn);
  netlifyIdentity.on('logout', onSignOut);

  function onSignInButton() {
    netlifyIdentity.open();
  }
  function onSignOutButton() {
    netlifyIdentity.logout();
  }


  onMount(() => {
    authenticate();
  });

</script>

<div class='userUtil'>

  <h1 class='greeting'>{greeting}</h1>

  <div class='signInForm'>
    {#if $isSignedIn}
      <button on:click|preventDefault={onSignOutButton}>Sign Out</button>	
    {:else}
      <button on:click|preventDefault={onSignInButton}>Sign In</button>	
    {/if}
  </div>

</div>

<style>
/* https://codepen.io/Varo/pen/YPmwpQ?editors=1100 */

	.userUtil {
		display: flex;
	}

  .greeting {
    display: flex;
  }

  .signInForm {
    display: flex; 
    align-self: center;
    margin-left: auto;
  }

  button {
    display: inline-block;
  }

</style>