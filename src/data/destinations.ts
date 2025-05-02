// src/data/destinations.ts
/*
Static list of destinations for filtering and detail pages
*/

export interface Destination {
  id: string;
  name: string;
  description: string;
  address: string;
  categories: string[];
  email: string;
  openingTime: string;
  phone: string;
  tagline: string;
  website: string;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const destinations: Destination[] = [
  {
    id: "pradomar",
    name: "Pradomar Beach",
    description: "Arena blanca y aguas cristalinas en Puerto Colombia.",
    address: "Carrera 1 #80-87, Puerto Colombia",
    categories: ["Playas", "EcoTurismo"],
    email: "info@pradomar.com",
    openingTime: "08:00 AM - 06:00 PM",
    phone: "+57 123 4567890",
    tagline: "Un paraíso caribeño",
    website: "https://www.pradomar.com",
    image: "destinations/pradomar.jpg",
    coordinates: {
      lat: 10.956,
      lng: -74.828
    }
  },
  {
    id: "quintasanpedro",
    name: "Quinta de San Pedro Alejandrino",
    description: "Hogar histórico de Simón Bolívar y hermosos jardines.",
    address: "Km 3 Vía Santa Marta, Santa Marta, Magdalena",
    categories: ["Historia", "Cultura"],
    email: "contacto@quinta.org",
    openingTime: "09:00 AM - 05:00 PM",
    phone: "+57 987 6543210",
    tagline: "Historia viva de Colombia",
    website: "https://www.quintasanpedro.org",
    image: "destinations/quinta.jpg",
    coordinates: {
      lat: 11.241,
      lng: -74.199
    }
  },
  // ...más destinos con su campo `coordinates`
];

export default destinations;
