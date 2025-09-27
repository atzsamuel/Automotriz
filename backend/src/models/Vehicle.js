// Modelo base de vehículo para inventario
class Vehicle {
  constructor({ id, marca, modelo, anio, precio, deleted }) {
    this.id = id;
    this.marca = marca;
    this.modelo = modelo;
    this.anio = anio;
    this.precio = precio;
    this.deleted = deleted || false;
  }
}

module.exports = Vehicle;
