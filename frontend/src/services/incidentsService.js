export async function getIncidents() {
  const response = await fetch('http://localhost:3000/api/incidencias');

  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }

  return response.json();
}

export async function createIncident(incidentData) {
  const response = await fetch('http://localhost:3000/api/incidencias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(incidentData)
  });

  if (!response.ok) {
    throw new Error('Failed to create incident');
  }

  return response.json();
}

export async function updateIncident(id, incidentData) {
  const response = await fetch(`http://localhost:3000/api/incidencias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(incidentData)
  });

  if (!response.ok) {
    throw new Error('Failed to update incident');
  }

  return response.json();
}

export async function deleteIncident(id) {
  const response = await fetch(`http://localhost:3000/api/incidencias/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    throw new Error('Failed to delete incident');
  }

  return response.json();
}