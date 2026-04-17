const BASE_URL = 'http://localhost:3000/api';

export async function getEmployees(search = '') {
  const url = search
    ? `${BASE_URL}/employees?search=${encodeURIComponent(search)}`
    : `${BASE_URL}/employees`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch employees');
  }

  return response.json();
}

export async function getEmployeeById(id) {
  const response = await fetch(`${BASE_URL}/employees/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch employee details');
  }

  return response.json();
}

export async function getEmployeeHistory(id) {
  const response = await fetch(`${BASE_URL}/employees/${id}/historial`);

  if (!response.ok) {
    throw new Error('Failed to fetch employee history');
  }

  return response.json();
}

export async function getCurrentManagers() {
  const response = await fetch(`${BASE_URL}/departments/managers/current`);

  if (!response.ok) {
    throw new Error('Failed to fetch current managers');
  }

  return response.json();
}

export async function createEmployee(employeeData) {
  const response = await fetch(`${BASE_URL}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(employeeData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || 'Failed to create employee'
    );
  }

  return response.json();
}
