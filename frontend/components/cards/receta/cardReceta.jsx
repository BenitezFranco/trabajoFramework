import Link from 'next/link';

const CardReceta = ({ item }) => {
    
    let fotoUrl= null;
    if(item.foto_receta){
        fotoUrl = item.foto_receta.url;
    }
    
    return (
    <Link href={`/recipe/${item.documentId}`} className="text-lg font-medium text-blue-600 hover:underline">
      <div className="relative h-48">
      {fotoUrl ? (
          <img src={`http://localhost:1337/${fotoUrl}`} alt={`Imagen de ${item.titulo}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">{item.titulo}</span>
          </div>
        )}
        </div>
      <div className="p-4 bg-white">
        <h2 className="text-lg font-medium text-blue-600 hover:underline">Receta: {item.titulo}</h2>
        <p className="text-sm text-gray-600">Descripción: {item.descripcion}</p>
        <p className="text-sm text-gray-500">Dificultad: {item.dificultad}</p>
      </div>
    </Link>
  );
};

export default CardReceta;