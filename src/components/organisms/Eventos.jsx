// src/components/organisms/Eventos.jsx
export default function Eventos() {
  return (
    <section id="eventos" className="section">
      <h2 className="section-title">Eventos con puntos LevelUp</h2>
      <p className="section-subtitle">Mapa nacional de eventos gamer.</p>

      {/* Mapa */}
      <div id="map" className="map">
        <p style={{ color: '#d3d3d3', textAlign: 'center', padding: '40px 0' }}>
          [Aquí irá el mapa de eventos gamer próximamente 🗺️]
        </p>
      </div>

      {/* Lista de eventos */}
      <div className="event-list" id="eventList">
        <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>
          No hay eventos cargados todavía.
        </p>
      </div>
    </section>
  );
}
