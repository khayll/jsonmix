# JsonMix

JsonMix provides a kind of deserialisation from JSON into JavaScript Objects complete with functions.

## How to use

```ts
import { JsonMix } from '@creately/jsonmix';
```

Use your existing model objects, without any modification. For example:

```ts
class Employee {
  public firstName: string;
  public lastName: string;

  constructor(public id: string) {
	//...
  }

  public getName() {
    return this.firstName + ' ' + this.lastName;
  }
}
```

And use your REST services, that go with your model:

```json
{
	"id": "001",
	"firstName": "John",
	"lastName": "Doe"
}
```

Finally use JsonMix to deserialize the JSON into model objects like this:

```ts
const mixer = new JsonMix(json);
const employee = await mixer.withObject(Employee).build();
```

With this simple tool you now have your JSON data deserialized into an object constructed from you model.

```ts
console.log(employee.getName());
```

## Using factories to create models

A factory can also be used to create models.

```ts
const mixer = new JsonMix(json);
const employee = await mixer.withObject(data => new Employee(data.id)).build();
```

The factory can also return a prosmise which resolves to the model.

## Multiple objects in a JSON

It's not uncommon to have multiple objects in a single JSON file, for example if you have an array of Employees in a JSON:

```json
{
	"employees": [
		{
			"id": "001",
			"firstName": "John",
			"lastName": "Doe"
		},
		{
			"id": "002",
			"firstName": "John",
			"lastName": "Malkowich"
		},
	]
}
```

To apply Epmloyee to the entire array available on given path:

```ts
const mixer = new JsonMix(json);
const employees = await mixer.withObject(Employee, 'employees').build();
});
```

## Further examples

A slightly more complex example would look like:

```ts
const mixer = new JsonMix(json);
const result = await mixer
	.withObject(Employee, 'employees')
	.withObject(Pet, 'employees.pet')
	.build();

// now you can use the nested model functions
console.log(result.employees[1].pet.getName());
```

The "path" can be any chain of nested objects separated with a dot. For example in this case "epmloyees.pet".
JsonMix will find out if an object is an array, and will recursively apply the remaining part of the path to every item in it.
You can also use "*" in the path, and this will apply the remaining path to every item in the object (even if it's not an array).

```ts
// this recursively applies the same prototype 3 levels deep
const mixer = new JsonMix(json);
const result = await mixer.withObject(Comparable, '*.*.*').build();
```
