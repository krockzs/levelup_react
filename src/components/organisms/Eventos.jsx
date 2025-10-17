import Mapa from '../molecules/Mapa';

export default function Eventos() {
  const eventos = [
    {
      id: 'lv-001',
      name: 'Punto LevelUp',
      date: '',
      coords: [-33.69412350823645, -71.21368970381143],
      address: '',
      url: '',
    },
  ];

  return (
    <section id="eventos" className="section">
      <h2 className="section-title">Eventos con puntos LevelUp</h2>
      <p className="section-subtitle">Mapa nacional de eventos gamer.</p>

      {/* Mapa */}
      <div className="map">
        <Mapa
          events={eventos}
          center={[-33.69412350823645, -71.21368970381143]}
          zoom={14}
          height={420}
        />
      </div>

      {/* Lista de eventos */}
      <div className="event-list" id="eventList" style={{ marginTop: 16 }}>
        <ul className="events">
          {eventos.map(e => (
            <li key={e.id} className="event-item">
              <strong>{e.name}</strong>
              {e.date ? ` — ${e.date}` : ''}
              {e.address ? ` · ${e.address}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
