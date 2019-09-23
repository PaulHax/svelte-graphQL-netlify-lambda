<script>
  import { myName, setMyName } from './user';

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
  }

let greeting = 'Hello ';
$: if ($myName) {
	greeting = 'Hello ' + $myName;
}
</script>

<h1>{greeting}</h1>
