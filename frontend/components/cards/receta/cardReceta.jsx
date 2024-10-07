import Link from 'next/link';

const CardReceta = ({ item }) => {
    
    let fotoUrl= null;
    if(item.foto_receta){
        fotoUrl = item.foto_receta.url;
    }
    
    return (
    <Link href={`/recipe/${item.documentId}`} className="text-lg font-medium">
      <div className="relative h-48">
      {fotoUrl ? (
          <img src={`http://localhost:1337/${fotoUrl}`} alt={`Imagen de ${item.titulo}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex">
            <span>{item.titulo}</span>
          </div>
        )}
        </div>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">{item.titulo}</h2>
        <p >Descripción: {item.descripcion}</p>
        <p >Dificultad: {item.dificultad}</p>
      </div>
    </Link>
  );
};

export default CardReceta;