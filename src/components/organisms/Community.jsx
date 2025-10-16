// src/components/organisms/Community.jsx
export default function Community() {
  return (
    <section id="comunidad" className="section section-alt">
      <h2 className="section-title">Comunidad & Guías</h2>

      <div className="grid-3">
        <article className="card-post">
          <h3>Noticias Gamer</h3>
          <p className="post-date">Publicado: 7 Sept 2025</p>
          <p>
            Actualizaciones semanales con lanzamientos, parches y torneos internacionales.
          </p>
          <a
            className="link"
            href="https://www.3djuegos.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leer más
          </a>
        </article>

        <article className="card-post">
          <h3>Guías</h3>
          <p className="post-date">Publicado: 5 Sept 2025</p>
          <p>
            Consejos para optimizar tu setup, mejorar el rendimiento y la accesibilidad.
          </p>
          <a
            className="link"
            href="https://www.ign.com/wikis"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leer más
          </a>
        </article>

        <article className="card-post">
          <h3>Impacto Comunitario</h3>
          <p className="post-date">Publicado: 3 Sept 2025</p>
          <p>
            Descubre cómo tus compras apoyan eventos locales y comunidades gamer.
          </p>
          <a
            className="link"
            href="https://esports.as.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leer más
          </a>
        </article>
      </div>
    </section>
  );
}
