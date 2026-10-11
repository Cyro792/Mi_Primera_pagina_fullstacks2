import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CLINIC_LAT = -34.165319;
const CLINIC_LNG = -70.738949;

const services = [
  { icon: "🩺", title: "Consulta General", desc: "Exámenes de bienestar y diagnóstico personalizado." },
  { icon: "💉", title: "Vacunación", desc: "Programas completos para proteger a tu mascota." },
  { icon: "🔬", title: "Laboratorio", desc: "Análisis de sangre, orina y cultivos con resultados rápidos." },
  { icon: "🦷", title: "Odontología", desc: "Limpieza dental profesional y cuidado preventivo." },
  { icon: "🩹", title: "Cirugía", desc: "Cirugías realizadas por veterinarios certificados." },
  { icon: "🚨", title: "Urgencias 24h", desc: "Atención de emergencias las 24 horas del día." }
];

const team = [
  { name: "Dra. Lucas Sepúlveda", role: "Directora Médica", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&auto=format", bio: "Más de 15 años de experiencia médica." },
  { name: "Dr. Marcos Ruiz", role: "Cirujano Veterinario", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStAnK3CncjoE_ss9hbUW9vEbCf-64DkbL_GFJiMATNjqGnIJmNVwTFmQJq&s=10", bio: "Especialista en cirugía ortopédica." },
  { name: "Dra. Sofía Mora", role: "Odontología & Dermatología", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&auto=format", bio: "Experta en salud dermatológica." }
];

function MapSection() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [CLINIC_LAT, CLINIC_LNG],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([CLINIC_LAT, CLINIC_LNG]).addTo(map);
    marker.bindPopup(
      `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.4;">
        <strong style="color: #2A6049; font-size: 15px;">Clínica Veterinaria San Marcos</strong><br/>
        Av. Libertador Gral. Bernardo O'Higgins, Rancagua<br/>
        <span style="color: #666;">Lun - Vie: 9:00 - 21:00 | Urgencias 24h</span>
      </div>`
    ).openPopup();

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "450px" }} />;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    mascota: "",
    servicio: "",
    fecha: "",
    mensaje: ""
  });
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="min-h-full">
      {/* HEADER */}
        <header
          className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
          style={{
            backgroundColor: scrolled
              ? 'rgba(248, 246, 241, 0.75)' // Al scrollear: crema translúcido
              : 'rgba(27, 58, 42, 0.35)',    // Arriba del todo: verde bosque muy translúcido
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: scrolled
              ? '1px solid rgba(224, 221, 213, 0.8)'
              : '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none',
          }}
        >
      <nav className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
          <a href="#" className={`flex items-center gap-2 font-display font-bold text-lg ${scrolled ? "text-[#1C1A17]" : "text-white"}`}>
            <span className="w-8 h-8 rounded-full bg-[#2A6049] text-white flex items-center justify-center text-sm">🐾</span>
            San Marcos
          </a>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#servicios" className={`transition-colors ${scrolled ? "text-[#1C1A17]/80 hover:text-[#2A6049]" : "text-white/80 hover:text-white"}`}>Servicios</a>
            <a href="#equipo" className={`transition-colors ${scrolled ? "text-[#1C1A17]/80 hover:text-[#2A6049]" : "text-white/80 hover:text-white"}`}>Equipo</a>
            <a href="#ubicacion" className={`transition-colors ${scrolled ? "text-[#1C1A17]/80 hover:text-[#2A6049]" : "text-white/80 hover:text-white"}`}>Ubicación</a>
            
            {/* Botón Reservar Cita (Desktop Navbar) */}
            <a
              href="#cita"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 22px',
                backgroundColor: 'rgba(42, 96, 73, 0.45)',
                color: '#F8F6F1',
                border: '1px solid rgba(245, 240, 230, 0.25)',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(42, 96, 73, 0.85)'
                e.currentTarget.style.borderColor = 'rgba(168, 200, 180, 0.6)'
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25), 0 0 12px rgba(168, 200, 180, 0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(42, 96, 73, 0.45)'
                e.currentTarget.style.borderColor = 'rgba(245, 240, 230, 0.25)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)'
              }}
            >
              Reservar Cita
            </a>

            {/* Botón Login (Desktop Navbar) */}
            <a
              href="login.html"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 22px',
                backgroundColor: 'rgba(201, 106, 46, 0.45)',
                color: '#F8F6F1',
                border: '1px solid rgba(245, 240, 230, 0.25)',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(201, 106, 46, 0.85)'
                e.currentTarget.style.borderColor = 'rgba(245, 180, 130, 0.6)'
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25), 0 0 12px rgba(201, 106, 46, 0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(201, 106, 46, 0.45)'
                e.currentTarget.style.borderColor = 'rgba(245, 240, 230, 0.25)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)'
              }}
            >
              Login
            </a>
          </div>

          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 rounded-lg text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <span className={`h-0.5 w-6 bg-white rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`h-0.5 w-6 bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-white rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </nav>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-white/10 bg-[#1e3d32]/95 backdrop-blur-md ${
            menuOpen ? "max-h-96 opacity-100 py-5" : "max-h-0 opacity-0 py-0"
          }`}
        >
          <div className="px-6 flex flex-col gap-3.5">
            <a
              href="#servicios"
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-white text-base font-medium py-1 transition-colors"
            >
              Servicios
            </a>
            <a
              href="#equipo"
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-white text-base font-medium py-1 transition-colors"
            >
              Equipo
            </a>
            <a
              href="#ubicacion"
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-white text-base font-medium py-1 transition-colors"
            >
              Ubicación
            </a>

            {/* Botón Reservar Cita (Mobile) */}
            <a
              href="#cita"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 28px',
                backgroundColor: 'rgba(27, 58, 42, 0.45)',
                color: '#F8F6F1',
                border: '1px solid rgba(245, 240, 230, 0.25)',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.03em',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(42, 96, 73, 0.7)'
                e.currentTarget.style.borderColor = 'rgba(168, 200, 180, 0.6)'
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.25), 0 0 15px rgba(168, 200, 180, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(27, 58, 42, 0.45)'
                e.currentTarget.style.borderColor = 'rgba(245, 240, 230, 0.25)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)'
              }}
            >
              Reservar Cita
            </a>

            {/* Botón Login (Mobile) */}
            <a
              href="/login.html"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 28px',
                backgroundColor: 'rgba(201, 106, 46, 0.55)',
                color: '#F8F6F1',
                border: '1px solid rgba(245, 240, 230, 0.25)',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.03em',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(201, 106, 46, 0.85)'
                e.currentTarget.style.borderColor = 'rgba(245, 180, 130, 0.6)'
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.25), 0 0 15px rgba(201, 106, 46, 0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(201, 106, 46, 0.55)'
                e.currentTarget.style.borderColor = 'rgba(245, 240, 230, 0.25)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)'
              }}
            >
              Login
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center pt-16 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&fit=crop')" }}>
        <div className="absolute inset-0 bg-[#0d2218]/70"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 py-20 text-white">
          <h1 className="text-4xl sm:text-6xl font-bold font-display mb-4">El cuidado que tu mascota merece</h1>
          <p className="max-w-md text-white/80 mb-6">Atención veterinaria de alta calidad con equipo especializado en Rancagua.</p>
          
          {/* Botón Reservar Cita (Hero Principal) */}
          <a
            href="#cita"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 34px',
              backgroundColor: 'rgba(27, 58, 42, 0.55)',
              color: '#F8F6F1',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(42, 96, 73, 0.85)'
              e.currentTarget.style.borderColor = 'rgba(168, 200, 180, 0.7)'
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(116, 180, 155, 0.35)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(27, 58, 42, 0.55)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            Reservar Cita
          </a>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-20 max-w-6xl mx-auto px-5">
        <h2 className="text-3xl font-bold font-display mb-8">Nuestros Servicios</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.title} className="bg-white p-6 rounded-2xl border border-[#E0DDD5]">
              <span className="text-3xl">{s.icon}</span>
              <h3 className="text-lg font-bold mt-3 mb-1">{s.title}</h3>
              <p className="text-sm text-[#7A7670]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EQUIPO */}
      <section id="equipo" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-3xl font-bold font-display mb-8">Equipo Médico</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {team.map((m) => (
              <div key={m.name} className="border border-[#E0DDD5] rounded-2xl overflow-hidden">
                <img src={m.img} alt={m.name} className="w-full h-56 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold">{m.name}</h3>
                  <p className="text-sm text-[#2A6049] font-medium mb-1">{m.role}</p>
                  <p className="text-xs text-[#7A7670]">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UBICACIÓN & CONTACTO */}
      <section id="ubicacion" className="py-20 max-w-6xl mx-auto px-5">
        <h2 className="text-3xl font-bold font-display mb-8">Ubicación</h2>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-md">
            <MapSection />
          </div>
          <div id="contacto" className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E0DDD5] space-y-4 text-sm">
            <p><strong>📍 Dirección:</strong> Av. Libertador Bdo. O'Higgins, Rancagua</p>
            <p><strong>🕒 Horario:</strong> Lun - Vie: 9:00 - 21:00 (Urgencias 24h)</p>
            <p><strong>📞 Teléfono:</strong> +56 9 5094 8714</p>
            
            {/* Botón Llamar Ahora */}
            <a
              href="tel:+56950948714"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '12px 24px',
                backgroundColor: 'rgba(42, 96, 73, 0.9)',
                color: '#F8F6F1',
                border: '1px solid rgba(42, 96, 73, 0.4)',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(42, 96, 73, 0.25)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#1f4d3a'
                e.currentTarget.style.borderColor = 'rgba(168, 200, 180, 0.6)'
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 10px 22px rgba(42, 96, 73, 0.35), 0 0 15px rgba(116, 180, 155, 0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(42, 96, 73, 0.9)'
                e.currentTarget.style.borderColor = 'rgba(42, 96, 73, 0.4)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(42, 96, 73, 0.25)'
              }}
            >
              Llamar Ahora
            </a>
          </div>
        </div>
      </section>

      {/* GENERAR CONSULTA / AGENDAR CITA */}
      <section id="cita" className="py-20 bg-[#F1EFE9]">
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-8">
            <p className="text-[#C96A2E] text-sm font-semibold uppercase tracking-wider mb-2">Cita Online</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Genera tu consulta</h2>
          </div>

          {enviado ? (
            <div className="bg-white border border-[#2A6049] rounded-2xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 bg-[#2A6049]/10 text-[#2A6049] text-2xl flex items-center justify-center rounded-full mx-auto mb-4">✓</div>
              <h3 className="text-xl font-bold font-display mb-2">¡Solicitud recibida, {formData.nombre}!</h3>
              <p className="text-sm text-[#7A7670] mb-6">Nos pondremos en contacto al número {formData.telefono} para confirmar la fecha y horario de tu consulta.</p>
              
              {/* Botón Generar otra consulta */}
              <button 
                onClick={() => { setEnviado(false); setFormData({ nombre: "", telefono: "", mascota: "", servicio: "", fecha: "", mensaje: "" }); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 24px',
                  backgroundColor: 'rgba(42, 96, 73, 0.9)',
                  color: '#F8F6F1',
                  border: '1px solid rgba(42, 96, 73, 0.4)',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 14px rgba(42, 96, 73, 0.2)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#1f4d3a'
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(42, 96, 73, 0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(42, 96, 73, 0.9)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(42, 96, 73, 0.2)'
                }}
              >
                Generar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-[#E0DDD5] rounded-3xl p-8 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A35] uppercase mb-1.5">Tu Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Ana García"
                    className="w-full px-4 py-2.5 bg-[#F8F6F1] border border-[#E0DDD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A6049]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A35] uppercase mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    className="w-full px-4 py-2.5 bg-[#F8F6F1] border border-[#E0DDD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A6049]/40"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A35] uppercase mb-1.5">Nombre de la Mascota</label>
                  <input
                    type="text"
                    name="mascota"
                    required
                    value={formData.mascota}
                    onChange={handleChange}
                    placeholder="Ej. Pepe"
                    className="w-full px-4 py-2.5 bg-[#F8F6F1] border border-[#E0DDD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A6049]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A35] uppercase mb-1.5">Tipo de Consulta</label>
                  <select
                    name="servicio"
                    required
                    value={formData.servicio}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#F8F6F1] border border-[#E0DDD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A6049]/40"
                  >
                    <option value="">Seleccionar motivo...</option>
                    <option value="Consulta General">Consulta General</option>
                    <option value="Vacunación">Vacunación</option>
                    <option value="Laboratorio">Laboratorio Clínico</option>
                    <option value="Odontología">Odontología</option>
                    <option value="Cirugía">Cirugía</option>
                    <option value="Urgencia">Urgencia</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#3C3A35] uppercase mb-1.5">Fecha Preferida</label>
                <input
                  type="date"
                  name="fecha"
                  required
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#F8F6F1] border border-[#E0DDD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A6049]/40"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#3C3A35] uppercase mb-1.5">Detalles del motivo</label>
                <textarea
                  rows="3"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Describe brevemente los síntomas o motivo de la visita..."
                  className="w-full px-4 py-2.5 bg-[#F8F6F1] border border-[#E0DDD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A6049]/40 resize-none"
                ></textarea>
              </div>

              {/* Botón Submit del Formulario */}
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '14px 24px',
                  backgroundColor: 'rgba(42, 96, 73, 0.9)',
                  color: '#F8F6F1',
                  border: '1px solid rgba(42, 96, 73, 0.4)',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 15px rgba(42, 96, 73, 0.25)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#1f4d3a'
                  e.currentTarget.style.borderColor = 'rgba(168, 200, 180, 0.6)'
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.015)'
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(42, 96, 73, 0.35), 0 0 15px rgba(116, 180, 155, 0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(42, 96, 73, 0.9)'
                  e.currentTarget.style.borderColor = 'rgba(42, 96, 73, 0.4)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(42, 96, 73, 0.25)'
                }}
              >
                Solicitar Cita Médica
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1A17] text-white py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#2A6049] flex items-center justify-center text-lg">🐾</div>
                <span className="text-lg font-semibold font-display">San Marcos</span>
              </div>
              <p className="text-white/55 text-sm leading-relaxed max-w-xs">
                Clínica Veterinaria San Marcos. Atención médica de excelencia para tu mejor amigo desde 2009.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
                Servicios
              </h4>
              <ul className="space-y-2.5 text-sm text-white/65">
                {services.map((s) => (
                  <li key={s.title}>
                    <a href="#servicios" className="hover:text-white transition-colors">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm text-white/65">
                <li>Av. Libertador Gral. Bernardo O'Higgins, Rancagua</li>
                <li>+56 9 4798 8934</li>
                <li>contacto@sanmarcos.cl</li>
                <li className="text-[#74B49B] font-medium">Urgencias 24h disponibles</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
            <span>© 2026 Clínica Veterinaria San Marcos. Todos los derechos reservados.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white/70 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white/70 transition-colors">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;