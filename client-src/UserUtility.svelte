<script>
  import { myName, setMyName, isSignedIn, signOut } from './user';

  let userInputBox;
  export async function setNewName(newName) {
    try {
      const isSuccess = await setMyName(newName);
    } catch(e) {
      if(e.message.includes('GraphQL error: Instance is not unique')) {
        greeting = newName + ' is taken'
      }
      else {
        throw e;
      }
    }
    enteredUserName = '';
  }

  let greeting = 'Hello ';
  $: if ($myName) {
    greeting = 'Hello ' + $myName;
  }

  let enteredUserName = '';
  function onSignIn() {
    setNewName(enteredUserName);
  }
  function onSignOut() {
    //setNewName(enteredUserName);
    signOut();
  }
</script>

{#if $isSignedIn}
  <button on:click|preventDefault={onSignOut}>Sign Out</button>	
{:else}
  <form action="" on:submit|preventDefault={onSignIn}>
    <input bind:value={enteredUserName} type="text" placeholder="User Name"/>
    <input disabled={!enteredUserName} type="submit" value="Sign In">
  </form>
{/if}

<h1>{greeting}</h1>