import { JsonMix } from '../';
import { of } from 'rxjs';

class Department {
  location: string = 'Colombo';
  tags: string[] = ['a', 'b', 'c', 'd'];

  getTime() {
    return 'Time at ' + this.location + ' is ' + new Date().toUTCString();
  }
}

class Employee {
  firstName: string = '';
  lastName: string = '';

  getName() {
    return this.firstName + ' ' + this.lastName;
  }
}

class Pet {
  name: string = '';
  like: string = '';

  getLike() {
    return this.name + ' likes ' + this.like;
  }
}

const sampleData = {
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

const sampleData2 = {
  name: 'Most important ever',
  location: 'Center of the World',
  pet: {
    name: 'Tom',
    like: 'milk',
  },
  tags: ['test', 'department'],
};

describe('General', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData2));
  });

  it("it's type is department", async function() {
    const result = await new JsonMix(data).withObject(Department).build();
    expect(result).toEqual(jasmine.any(Department));
  });

  it('it should replace arrays', async function() {
    const result = await new JsonMix(data).withObject(Department).build();
    expect(result.tags).toEqual(['test', 'department']);
  });
});

describe('Non collection objects', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData2));
  });

  it('Mix single data object with prototype', async function() {
    const result = await new JsonMix(data).withObject(Department).build();
    expect(result.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.type)', async function() {
    const result = await new JsonMix(data).withObject({ type: Department }).build();
    expect(result.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.factory => value)', async function() {
    const value = new Department();
    const result = await new JsonMix(data).withObject({ factory: () => value }).build();
    expect(result.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.factory => promise)', async function() {
    const promise = Promise.resolve(new Department());
    const result = await new JsonMix(data).withObject({ factory: () => promise }).build();
    expect(result.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.factory => observable)', async function() {
    const observable = of(new Department());
    const result = await new JsonMix(data).withObject({ factory: () => observable }).build();
    expect(result.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype inside another object', async function() {
    const result = await new JsonMix(data).withObject(Pet, 'pet').build();
    expect(result.pet.getLike()).toContain('Tom likes milk');
  });

  it('Mix multiple objects', async function() {
    const result = await new JsonMix(data)
      .withObject(Department)
      .withObject(Pet, 'pet')
      .build();
    expect(result.getTime()).toContain('Time at Center of the World is');
    expect(result.pet.getLike()).toContain('Tom likes milk');
  });

  it('Mix multiple objects in inverse order', async function() {
    const result = await new JsonMix(data)
      .withObject(Pet, 'pet')
      .withObject(Department)
      .build();
    expect(result.getTime()).toContain('Time at Center of the World is');
    expect(result.pet.getLike()).toContain('Tom likes milk');
  });

  it('Input is a JSON string', async function() {
    const result = await new JsonMix('{"department":{"location":"here"}}').withObject(Department, 'department').build();
    expect(result.department.getTime()).toContain('Time at here is');
  });
});

describe('JsonMix - collections', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData));
  });

  it('Mix every object in root object, using * in the path', async function() {
    const result = await new JsonMix(data).withObject(Department, '*').build();
    expect(result.employees.getTime()).toContain('Time at Colombo is');
    expect(result.department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix array objects', async function() {
    const result = await new JsonMix(data).withObject(Employee, 'employees').build();
    expect(result.employees[0].getName()).toContain('John Doe');
  });

  it('Mix non toplevel objects (inside arrays)', async function() {
    const result = await new JsonMix(data).withObject(Pet, 'employees.pet').build();
    expect(result.employees[0].pet.getLike()).toContain('Buggs Bunny likes carrot');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix non toplevel objects (inside arrays), using * in the path', async function() {
    const result = await new JsonMix(data).withObject(Pet, 'employees.*.pet').build();
    expect(result.employees[0].pet.getLike()).toContain('Buggs Bunny likes carrot');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Heavy use of * in the path', async function() {
    const result = await new JsonMix(data).withObject(Pet, '*.*.*').build();
    expect(result.employees[0].pet.getLike()).toContain('Buggs Bunny likes carrot');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels ', async function() {
    const result = await new JsonMix(data)
      .withObject(Employee, 'employees')
      .withObject(Pet, 'employees.pet')
      .build();
    expect(result.employees[0].getName()).toContain('John Doe');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels in inverse order', async function() {
    const result = await new JsonMix(data)
      .withObject(Pet, 'employees.pet')
      .withObject(Employee, 'employees')
      .build();
    expect(result.employees[0].getName()).toContain('John Doe');
    expect(result.employees[1].pet.getLike()).toContain('Jerry likes cheese');
  });
});

describe('Part of the object is given', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData2));
  });

  it('Mix single data object with prototype', async function() {
    const department: Department = new Department();
    const result = await new JsonMix(data, department).withObject(Department).build();
    expect(result).toBe(department);
    expect(department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.type)', async function() {
    const department: Department = new Department();
    const result = await new JsonMix(data, department).withObject({ type: Department }).build();
    expect(result).toBe(department);
    expect(department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.factory => value)', async function() {
    const department: Department = new Department();
    const value = new Department();
    const result = await new JsonMix(data, department).withObject({ factory: () => value }).build();
    expect(result).toBe(department);
    expect(department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.factory => promise)', async function() {
    const department: Department = new Department();
    const promise = Promise.resolve(new Department());
    const result = await new JsonMix(data, department).withObject({ factory: () => promise }).build();
    expect(result).toBe(department);
    expect(department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype (options.factory => observable)', async function() {
    const department: Department = new Department();
    const observable = of(new Department());
    const result = await new JsonMix(data, department).withObject({ factory: () => observable }).build();
    expect(result).toBe(department);
    expect(department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix single data object with prototype inside another object', async function() {
    const department: Department = new Department();
    await new JsonMix(data, department).withObject(Pet, 'pet').build();
    expect((department as any).pet.getLike()).toContain('Tom likes milk');
  });

  it('Mix multiple objects', async function() {
    const department: Department = new Department();
    const result = await new JsonMix(data, department)
      .withObject(Department)
      .withObject(Pet, 'pet')
      .build();
    expect(result).toBe(department);
    expect(department.getTime()).toContain('Time at Center of the World is');
    expect((department as any).pet.getLike()).toContain('Tom likes milk');
  });

  it('Mix multiple objects in inverse order', async function() {
    const department: Department = new Department();
    const result = await new JsonMix(data, department)
      .withObject(Pet, 'pet')
      .withObject(Department)
      .build();
    expect(result).toBe(department);
    expect(department.getTime()).toContain('Time at Center of the World is');
    expect((department as any).pet.getLike()).toContain('Tom likes milk');
  });

  it('Mix multiple objects ', async function() {
    const department: Department = new Department();
    const pet: Pet = new Pet();
    (department as any).pet = pet;
    const result = await new JsonMix(data, department)
      .withObject(Pet, 'pet')
      .withObject(Department)
      .build();
    expect(result).toBe(department);
    expect((department as any).pet).toBe(pet);
    expect(department.getTime()).toContain('Time at Center of the World is');
    expect((department as any).pet.getLike()).toContain('Tom likes milk');
  });
});

describe('JsonMix - collections- part of the object is given', function() {
  let data: any;

  beforeEach(function() {
    data = JSON.parse(JSON.stringify(sampleData));
  });

  it('Mix every object in root object, using * in the path', async function() {
    const department: Department = new Department();
    const result = await new JsonMix(data, { department: department }).withObject(Department, '*').build();
    expect(result.employees.getTime()).toContain('Time at Colombo is');
    expect(department.getTime()).toContain('Time at Center of the World is');
  });

  it('Mix array objects', async function() {
    const employee: Employee = new Employee();
    const result = await new JsonMix(data, { employees: [employee] }).withObject(Employee, 'employees').build();
    expect(result.employees[0].getName()).toContain('John Doe');
    expect(employee.getName()).toContain('John Doe');
  });

  it('Mix non toplevel objects (inside arrays)', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet(),
      pet2: Pet = new Pet();
    (employee1 as any).pet = pet1;
    (employee2 as any).pet = pet2;
    await new JsonMix(data, { employees: [employee1, employee2] }).withObject(Pet, 'employees.pet').build();
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect(pet2.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix non toplevel objects (inside arrays), using * in the path', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet(),
      pet2: Pet = new Pet();
    (employee1 as any).pet = pet1;
    (employee2 as any).pet = pet2;
    await new JsonMix(data, { employees: [employee1, employee2] }).withObject(Pet, 'employees.*.pet').build();
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect(pet2.getLike()).toContain('Jerry likes cheese');
  });

  it('Heavy use of * in the path', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet(),
      pet2: Pet = new Pet();
    (employee1 as any).pet = pet1;
    (employee2 as any).pet = pet2;
    await new JsonMix(data, { employees: [employee1, employee2] }).withObject(Pet, '*.*.*').build();
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect(pet2.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels ', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet(),
      pet2: Pet = new Pet();
    (employee1 as any).pet = pet1;
    (employee2 as any).pet = pet2;
    await new JsonMix(data, { employees: [employee1, employee2] })
      .withObject(Employee, 'employees')
      .withObject(Pet, 'employees.pet')
      .build();
    expect(employee1.getName()).toContain('John Doe');
    expect(pet2.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels in inverse order', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet(),
      pet2: Pet = new Pet();
    (employee1 as any).pet = pet1;
    (employee2 as any).pet = pet2;
    await new JsonMix(data, { employees: [employee1, employee2] })
      .withObject(Pet, 'employees.pet')
      .withObject(Employee, 'employees')
      .build();
    expect(employee1.getName()).toContain('John Doe');
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect(pet2.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels with part of objects', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet();
    (employee1 as any).pet = pet1;
    await new JsonMix(data, { employees: [employee1, employee2] })
      .withObject(Employee, 'employees')
      .withObject(Pet, 'employees.pet')
      .build();
    expect(employee1.getName()).toContain('John Doe');
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect((employee2 as any).pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels with out inner object', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet();
    (employee1 as any).pet = pet1;
    await new JsonMix(data, { employees: [employee1, employee2] })
      .withObject(Employee, 'employees')
      .withObject(Pet, 'employees.pet')
      .build();
    expect(employee1.getName()).toContain('John Doe');
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect((employee2 as any).pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels with part of objects in inverse order', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet();
    (employee1 as any).pet = pet1;
    await new JsonMix(data, { employees: [employee1, employee2] })
      .withObject(Pet, 'employees.pet')
      .withObject(Employee, 'employees')
      .build();
    expect(employee1.getName()).toContain('John Doe');
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect((employee2 as any).pet.getLike()).toContain('Jerry likes cheese');
  });

  it('Mix multiple levels with out inner object in inverse order', async function() {
    const employee1 = new Employee(),
      employee2 = new Employee();
    const pet1: Pet = new Pet();
    (employee1 as any).pet = pet1;
    await new JsonMix(data, { employees: [employee1, employee2] })
      .withObject(Pet, 'employees.pet')
      .withObject(Employee, 'employees')
      .build();
    expect(employee1.getName()).toContain('John Doe');
    expect(pet1.getLike()).toContain('Buggs Bunny likes carrot');
    expect((employee2 as any).pet.getLike()).toContain('Jerry likes cheese');
  });
});
