// Client-side authentication utilities

export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
}

export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }

  return data;
}

export async function getCurrentUser() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/my-data`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  // console.log(data)
  return data.user;
}