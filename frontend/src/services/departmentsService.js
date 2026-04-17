const BASE_URL = 'http://localhost:3000/api';

export async function getDepartments() {
  const response = await fetch(`${BASE_URL}/departments`);

  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }

  return response.json();
}

export async function getDepartmentEmployees(deptNo, options = {}) {
  const params = new URLSearchParams();
  const {
    page = 1,
    limit = 25,
    employeeId = '',
    name = '',
    title = 'all',
    salaryRange = 'all',
    hireDateRange = 'all'
  } = options;

  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('employeeId', employeeId);
  params.set('name', name);
  params.set('title', title);
  params.set('salaryRange', salaryRange);
  params.set('hireDateRange', hireDateRange);

  const response = await fetch(`${BASE_URL}/departments/${deptNo}/employees?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch department employees');
  }

  return response.json();
}

export async function getCurrentDepartmentManagers() {
  const response = await fetch(`${BASE_URL}/departments/managers/current`);

  if (!response.ok) {
    throw new Error('Failed to fetch current department managers');
  }

  return response.json();
}
