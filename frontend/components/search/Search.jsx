import React, { useState, useEffect } from 'react';
import SearchGrid from './SearchGrid';
const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('titulo');
    const [results, setResults] = useState([]);
    const [searchSubmitted, setSearchSubmitted] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();


        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token, redirecting to /login');
            router.push('/login');
            return;
        }

        try {
            let response;
            if (filter === "usuario") {
                response = await fetch(`http://localhost:1337/api/users?filters[username][$contains]=${searchTerm}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
            } else {
                response = await fetch(`http://localhost:1337/api/recetas?filters[${filter}][$contains]=${searchTerm}&populate=foto_receta`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

            }
            let data = await response.json();
            if (filter === "usuario") {
                data = { data };
            }

            if (response.ok) {
                setSearchSubmitted(true);
                setResults(data);
                console.log("data", data);
                console.log("results", results);
            } else {
                console.error('Error en la búsqueda:', data);
                setResults([]);
            }

        } catch (error) {
            console.error('Error al realizar la búsqueda:', error);
            setResults([]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Buscar Recetas o Usuarios</h1>
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex flex-col space-y-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Escribe aquí para buscar"
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="titulo">Por Título</option>
                            <option value="ingredientes">Por Ingredientes</option>
                            <option value="dificultad">Por Dificultad</option>
                            <option value="usuario">Buscar Usuario</option>
                        </select>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Buscar
                        </button>
                    </div>
                </form>
            </div>
            {useEffect(() => {
                if (results.data) {
                    console.log("Results: ", results.data);
                }
            }, [results])}


            <div>
                {searchSubmitted && results.data && results.data.length > 0 ? (
                    <SearchGrid results={results}></SearchGrid>
                ) : searchSubmitted && results.data && results.data.length === 0 ? (
                    <p className="text-gray-500 text-center">No se encontraron resultados</p>
                ) : null}
            </div>

        </div>
    );
};

export default Search;
