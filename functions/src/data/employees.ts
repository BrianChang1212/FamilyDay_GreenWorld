export type EmployeeRecord = {
	employeeId: string;
	name: string;
};

export const EMPLOYEES: EmployeeRecord[] = [
	{ employeeId: "1141041", name: "Brian" },
	{ employeeId: "1141042", name: "Alice" },
	{ employeeId: "1141043", name: "Bob" },
	{ employeeId: "1141044", name: "Charlie" },
	{ employeeId: "1141045", name: "David" },
	{ employeeId: "1141046", name: "Emma" },
	{ employeeId: "1141047", name: "Frank" },
	{ employeeId: "1141048", name: "Grace" },
	{ employeeId: "1141049", name: "Helen" },
	{ employeeId: "1141050", name: "Ivy" },
];

export function findEmployee(employeeId: string, name: string): EmployeeRecord | null {
	const id = employeeId.trim();
	const nm = name.trim();
	return EMPLOYEES.find((v) => v.employeeId === id && v.name === nm) ?? null;
}
