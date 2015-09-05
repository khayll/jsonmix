
var sampleData = {
	"employees": [
		{
			"firstName": "John",
			"lastName": "Doe",
			"salary": 100000,
			"age": 33,
			"pet": {
				name: "Buggs Bunny",
				like: "carrot"
			}
		},
		{
			"firstName": "Romeo",
			"lastName": "Alfa",
			"salary": 150000,
			"age": 34,
			"pet": {
				name: "Jerry",
				like: "cheese"
			}
		}
	],
	"department": {
		"name": "Most important ever",
		"location": "Center of the World"
	}
}


describe("JSMix", function() {
  it("mix single data object with prototype", function() {
	  var result = JSMix(sampleData).withObject(Department.prototype, "department").build();
    expect(result.department.getTime()).toContain("Time at Center of the World is");
  });

  it("can also handle a JSON string", function() {
	  var result = JSMix('{"department":{"location":"here"}}').withObject(Department.prototype, "department").build();
    expect(result.department.getTime()).toContain("Time at here is");
  });

  it("Mix array objects", function() {
	  var result = JSMix(sampleData).withObject(Employee.prototype, "employees").build();
    expect(result.employees[0].getName()).toContain("John Doe");
  });

  it("Mix every object in root object ", function() {
	  var result = JSMix(sampleData).withObject(Department.prototype, "*").build();
    expect(result.employees.getTime()).toContain("Time at undefined is");
  });

  it("Mix non toplevel data", function() {
	  var result = JSMix(sampleData).withObject(Pet.prototype, "employees.*.pet").build();
    expect(result.employees[1].pet.getLike()).toContain("Jerry likes cheese");
  });

});
