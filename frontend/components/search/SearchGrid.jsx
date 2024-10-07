import { useState } from 'react';
import CardReceta from '../cards/receta/cardReceta'; // Asegúrate de que la ruta sea correcta.

const SearchGrid = ({ results }) => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Cuántos elementos por página

  // Calcular los índices de inicio y fin
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.data.slice(indexOfFirstItem, indexOfLastItem);

  // Total de páginas
  const totalPages = Math.ceil(results.data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center pt-11">
        {currentItems.length === 0 ? (
          <div className="col-span-4 text-center">No hay resultados para mostrar.</div>
        ) : (
          currentItems.map((item) => (
            <div key={item.documentId} className="">
              {item.username ? (
                <div>
                  <span>
                    Usuario: {item.username} (ID: {item.documentId})
                  </span>
                </div>
              ) : (
                <CardReceta item={item} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      <div className="w3-center w3-padding-32">
        <div className="w3-bar">
          <a
            href="#"
            className="w3-bar-item w3-button w3-hover-black"
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ visibility: currentPage === 1 ? 'hidden' : 'visible' }}
          >
            «
          </a>
          {[...Array(totalPages)].map((_, index) => (
            <a
              key={index + 1}
              href="#"
              className={`w3-bar-item w3-button ${currentPage === index + 1 ? 'w3-black' : 'w3-hover-black'}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </a>
          ))}
          <a
            href="#"
            className="w3-bar-item w3-button w3-hover-black"
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ visibility: currentPage === totalPages ? 'hidden' : 'visible' }}
          >
            »
          </a>
        </div>
      </div>
    </div>
  );
};

export default SearchGrid;
