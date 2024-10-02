import { useState } from 'react';
import { useRouter } from 'next/router';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:1337/api/auth/local/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.jwt); // Almacena el token JWT
        router.push('/profile'); // Redirige al perfil del usuario o a cualquier otra página
      } else {
        setError(result.message[0].messages[0].message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error al registrar', error);
      setError('Error al registrar');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Registrarse</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="border border-gray-300 p-2 w-full rounded-md text-gray-900 focus:ring focus:ring-blue-200"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="border border-gray-300 p-2 w-full rounded-md text-gray-900 focus:ring focus:ring-blue-200"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="border border-gray-300 p-2 w-full rounded-md text-gray-900 focus:ring focus:ring-blue-200"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
