<<<<<<< HEAD
const API_URL = "https://back-aimed.vercel.app";
=======
const API_URL = "http://localhost:4000/api/auth";
>>>>>>> 130405c07cc8494bc1068e15be7997869418c4ea

export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  if (!res.ok) {
    throw new Error("Erro ao registrar usuário");
  }

  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Erro ao fazer login");
  }

  return res.json();
}
