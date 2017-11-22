#JsonMix

JsonMix provides a kind of deserialisation from JSON into JavaScript Objects complete with functions.

## How to use

```ts
import { JsonMix } from '@creately/jsonmix';
```

Use your existing model objects, without any modification, for example:

```ts
class Employee {
  public firstName: string;
  public lastName: string;

  public getName() {
    return this.firstName + ' ' + this.lastName;
  }
}
```

And use your REST services, that go with your model:

```ts
let json = {
	"firstName": "John",
	"lastName": "Doe",
	"salary": 100000,
	"age": 33
}
```

Finally use JsonMix to deserialize the JSON into model objects like this:

```ts
let employee = new JsonMix(json) // json contains the pure data
	.withObject(Employee) // Employee is your object constructor
	.build(); // this may seems unecessary until you have more than one objects in the JSON, see later
```

With this simple tool you now have your JSON data deserialized into an object constructed from you model.

```ts
console.log(employee.getName());
```

## Multiple objects in a JSON
It's not uncommon to have multiple objects in a single JSON file, for example if you have an array of Employees in a JSON:

```ts
let json = {
	employees: [
		{
			"firstName": "John",
			"lastName": "Doe",
			"salary": 100000,
			"age": 33
		},
		{
			"firstName": "John",
			"lastName": "Malkowich",
			"salary": 50000,
			"age": 52
		},
	]
}
```

To apply Epmloyee to the entire array:

```ts
let mixed = new JsonMix(json)
	.withObject(Employee, "employees")
	.build();
});
```

## Using factories to create models

A factory can also be used to create models.

```ts
var result = new JsonMix(data) // start with the data
	.withObject(data => new Employee(), "employees") // use a factory
	.withObject(data => Promise.resolve(new Pet()), "employees.pet") // factory returns a promise
	.build(); // and get the result

//now you can use the model functions
console.log(result.epmloyees[1].getName());
```

## Further examples

A slightly more complex example would look like:

```ts
var result = new JsonMix(data) // start with the data
	.withObject(Employee, "employees") // mix Employee on a path
	.withObject(Pet, "employees.pet") // mix Pet on a different path
	.build(); // and get the result

//now you can use the model functions
console.log(result.epmloyees[1].getName());
```

So the parameter to the JsonMix(data) call, data, could be a JSON string, or an object.
The build() just returns the object with all classes mixed.
The withObject(prototype, path) call is the one to define class mappings.
Here "path" can be any chain of nested objects separated with a dot. For example in this case "epmloyees.pet".
JsonMix will find out if an object is an array, and will recursively apply the remaining part of the path to every item in it.
You can also use "*" in the path, and this will apply the remaining path to every item in the object (even if it's not an array).

```ts
//this recursively applies the same prototype 3 levels deep
new JsonMix(data).withObject(Comparable, "*.*.*").build();
```
