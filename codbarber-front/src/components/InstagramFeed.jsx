import React, { useEffect } from 'react';

export default function InstagramFeed() {
  const posts = [
    "https://www.instagram.com/p/DXIjO_6DH0r/", 
    "https://www.instagram.com/p/DXIjhPKjLjZ/",
    "https://www.instagram.com/p/DXIjrFGjEfr/",
    "https://www.instagram.com/p/DXIjxUUDJ33/",
    "https://www.instagram.com/p/DXIj8IIDAzw/",
    "https://www.instagram.com/p/DXIkE9bjK-B/",
    "https://www.instagram.com/p/DXIkMs_jBUR/",
    "https://www.instagram.com/p/DXIkeEfDJAU/",
    "https://www.instagram.com/p/DXIkjFyDMTW/",
    "https://www.instagram.com/p/DXIkphGDA61/",
    "https://www.instagram.com/p/DXIk0P6DNpg/",
    "https://www.instagram.com/p/DXIk89SDLza/",
    "https://www.instagram.com/p/DXIlDLyjEIk/",
    "https://www.instagram.com/p/DXIlKuiDP6E/",
    "https://www.instagram.com/p/DXIlRq2DEUB/" 
  ];

  useEffect(() => {
    const processEmbeds = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    if (document.getElementById('instagram-script')) {
      processEmbeds();
    } else {
      const script = document.createElement('script');
      script.id = 'instagram-script';
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = processEmbeds;
    }

    const timer = setTimeout(processEmbeds, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full my-10 bg-[#0A1A2A] p-8 rounded-[40px] border border-white/5 shadow-2xl">
      <h2 className="text-[#1E90FF] text-center font-black italic uppercase mb-10 tracking-[0.3em] text-sm">
        Tendencias Recientes en @CodBarber
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((url, index) => (
          <div key={index} className="flex flex-col items-center bg-black/20 rounded-[30px] p-2 border border-white/5 overflow-hidden">
            <blockquote 
              className="instagram-media" 
              data-instgrm-permalink={url} 
              data-instgrm-version="14"
              style={{ 
                background: '#000', 
                border: 0, 
                borderRadius: '24px', 
                margin: '1px', 
                width: '100%',
                minWidth: '326px' 
              }}
            >
              <div className="p-8 text-center">
                <a href={url} target="_blank" rel="noreferrer" className="text-zinc-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Cargando Estilo...
                </a>
              </div>
            </blockquote>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a 
          href="https://www.instagram.com/codbarber_style/" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-black text-[#1E90FF] border border-[#1E90FF]/30 px-6 py-3 rounded-full hover:bg-[#1E90FF] hover:text-white transition-all tracking-widest uppercase"
        >
          Ver Perfil Completo
        </a>
      </div>
    </div>
  );
}