// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap() {
    
  /** // Busca si ya existen las categorías para evitar duplicados
    const existingCategories = await strapi.db.query('api::categoria.categoria').count();
  
    // Si ya hay categorías, no hacer nada
    if (existingCategories > 0) {
      return;
    }

    // Categorías que quieres agregar
    const categories = [
      { id_categoria: '9', nombre: 'Almuerzos' },
      { id_categoria: '11', nombre: 'Aperitivos' },
      { id_categoria: '12', nombre: 'Bebidas' },
      { id_categoria: '8', nombre: 'Cenas' },
      { id_categoria: '3', nombre: 'Desayuno' },
      { id_categoria: '13', nombre: 'Dulces' },
      { id_categoria: '14', nombre: 'Ensaladas' },
      { id_categoria: '10', nombre: 'Platos principales' },
      { id_categoria: '6', nombre: 'Postres' },
      { id_categoria: '7', nombre: 'Saludables' },
      { id_categoria: '5', nombre: 'Sin gluten' },
      { id_categoria: '4', nombre: 'Sin TACC' },
      { id_categoria: '15', nombre: 'Sopas y cremas' },
      { id_categoria: '2', nombre: 'Vegano' },
      { id_categoria: '1', nombre: 'Vegetariano' }
    ];

    // Inserta las categorías en la base de datos
    await strapi.db.query('api::categoria.categoria').createMany({
      data: categories
    });

    console.log('Se han agregado las categorías de forma automática.');
    */
  },
};
