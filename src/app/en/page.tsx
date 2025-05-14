// src/app/en/page.tsx

export default function EnHomePage() {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">
          Explore the Coastal Paradise of Atlántico, Colombia
        </h1>
        <p className="text-lg mb-6">
          Discover beautiful beaches, vibrant culture, and delicious cuisine along Colombia’s Atlantic coast. Whether you’re looking for adventure, relaxation, or local flavors, Atlántico has something for everyone.
        </p>
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Beaches & Water Sports</h2>
            <p>
              From the golden sands of Puerto Colombia to windsurfing in Ciénaga de Mallorquín, enjoy sun, sea, and surf all day long.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Culture & Heritage</h2>
            <p>
              Immerse yourself in Barranquilla’s lively Carnival, explore colonial architecture, and taste authentic local dishes.
            </p>
          </div>
        </section>
      </main>
    );
  }
  