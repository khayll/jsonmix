import { JsonMix } from '../';

class Department {
  location: string;

  getTime() {
    return 'Time at ' + this.location + ' is ' + new Date().toUTCString();
  }
}

class Employee {
  firstName: string;
  lastName: string;

  getName() {
    return this.firstName + ' ' + this.lastName;
  }
}

class Pet {
  name: string;
  like: string;

  getLike() {
    return this.name + ' likes ' + this.like;
  }
}

var sampleData = {
  employees: [
    {
      firstName: 'John',
      lastName: 'Doe',
      salary: 100000,
      age: 33,
      pet: {
        name: 'Buggs Bunny',
        like: 'carrot',
      },
    },
    {
      firstName: 'Romeo',
      lastName: 'Alfa',
      salary: 150000,
      age: 34,
      pet: {
        name: 'Jerry',
        like: 'cheese',
      },
    },
  ],
  department: {
    name: 'Most important ever',
    location: 'Center of the World',
    pet: {
      name: 'Tom',
      like: 'milk',
    },
  },
};

var sampleData2 = {
  name: 'Most important ever',
  location: 'Center of the World',
  pet: {
    name: 'Tom',
    like: 'milk',
  },
};

describe('General', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData2));
  });

  it("it's type is department", function() {
    var result = new JsonMix(data).withObject(Department).build();
    expect(result).toEqual(jasmine.any(Department));
  });
});

describe('Non collection objects', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData2));
  });

  it('Mix single data object with prototype', function() {
    var result = new JsonMix(data).withObject(Department).build();
    expect(result.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype inside another object', function() {
    var result = new JsonMix(data).withObject(Pet, 'pet').build();
    expect(result.pet.getLike()).toContain('Tom likes milk');
  });

  it('Mix multiple objects', function() {
    var result = new JsonMix(data)
      .withObject(Department)
      .withObject(Pet, 'pet')
      .build();
    expect(result.getTime()).toContain('Time at Center of the World is');
    expect(result.pet.getLike()).toContain('Tom likes milk');
  });

  it('Mix multiple objects in inverse order', function() {
    var result = new JsonMix(data)
      .withObject(Pet, 'pet')
      .withObject(Department)
      .build();
    expect(result.getTime()).toContain('Time at Center of the World is');
    expect(result.pet.getLike()).toContain('Tom likes milk');
  });

  it('Input is a JSON string', function() {
    var result = new JsonMix('{"department":{"location":"here"}}').withObject(Department, 'department').build();
    expect(result.department.getTime()).toContain('Time at here is');
  });
});

describe('JsonMix - collections', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData));
  });

  it('Mix every object in root object, using * in the path', function() {
    var result = new JsonMix(data).withObject(Department, '*').build();
    expect(result.employees.getTime()).toContain('Time at undefined is');
    expect(result.department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix array objects', function() {
    var result = new JsonMix(data).withObject(Employee, 'employees').build();
    expect(result.employees[0].getName()).toContain('John Doe');
  });

  it('Mix non toplevel objects (inside arrays)', function() {
    var result = new JsonMix(data).withObject(Pet, 'employees.pet').build();
    expect(result.employees[0].pet.getLike()).toContain('Buggs Bunny likes carrot');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix non toplevel objects (inside arrays), using * in the path', function() {
    var result = new JsonMix(data).withObject(Pet, 'employees.*.pet').build();
    expect(result.employees[0].pet.getLike()).toContain('Buggs Bunny likes carrot');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Heavy use of * in the path', function() {
    var result = new JsonMix(data).withObject(Pet, '*.*.*').build();
    expect(result.employees[0].pet.getLike()).toContain('Buggs Bunny likes carrot');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels ', function() {
    var result = new JsonMix(data)
      .withObject(Employee, 'employees')
      .withObject(Pet, 'employees.pet')
      .build();
    expect(result.employees[0].getName()).toContain('John Doe');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels in inverse order', function() {
    var result = new JsonMix(data)
      .withObject(Pet, 'employees.pet')
      .withObject(Employee, 'employees')
      .build();
    expect(result.employees[0].getName()).toContain('John Doe');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });
});
